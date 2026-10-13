import axios, { AxiosError, type AxiosInstance } from 'axios';
import { env } from '@/lib/env';
import {
  ServiceError,
  isApiErrorPayload,
  serviceErrorKindFromApiErrorCode,
  GENERIC_ERROR_MESSAGE,
  type ServiceErrorKind,
} from '../errors';

/**
 * Centralized Axios instance for the future Spring Boot REST API.
 *
 * Fully configured but intentionally NOT called by any feature in this
 * phase: `VITE_DATA_MODE` defaults to `mock`, so no request ever leaves the
 * browser. Endpoints are documented in docs/API_CONTRACT.md. When the backend
 * lands, the `src/services/http` placeholders are re-pointed at this client.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: the single place to attach a bearer token once a real
// auth service exists. No credentials are stored or fabricated here now.
apiClient.interceptors.request.use((config) => {
  // const token = authStorage.getAccessToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Maps an Axios failure onto a `ServiceError` so the UI handles mock and REST
 * failures through one type. Never surfaces a raw stack trace or backend
 * detail — only the safe, normalized message and category.
 */
function normalizeAxiosError(error: AxiosError): ServiceError {
  // No response reached the server (offline, DNS, timeout): a network failure.
  if (!error.response) {
    return new ServiceError(
      'NETWORK',
      'Unable to reach the MedShare service. Check your connection and try again.',
    );
  }

  const { status, data } = error.response;

  // A body that matches the documented ApiError envelope carries a stable code.
  if (isApiErrorPayload(data)) {
    const kind = serviceErrorKindFromApiErrorCode(data.code);
    return new ServiceError(kind, data.message, { status, details: data.details });
  }

  // Otherwise fall back to a status-derived category with a generic message.
  const kind: ServiceErrorKind =
    status === 401
      ? 'UNAUTHORIZED'
      : status === 403
        ? 'FORBIDDEN'
        : status === 404
          ? 'NOT_FOUND'
          : status === 409
            ? 'CONFLICT'
            : status >= 500
              ? 'UNKNOWN'
              : 'UNKNOWN';
  return new ServiceError(kind, GENERIC_ERROR_MESSAGE, { status });
}

// Response interceptor: normalize every failure into a `ServiceError`.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      return Promise.reject(normalizeAxiosError(error));
    }
    return Promise.reject(error);
  },
);
