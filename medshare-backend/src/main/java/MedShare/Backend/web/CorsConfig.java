package MedShare.Backend.web;

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Narrow CORS surface for frontend integration.
 *
 * <p>Only {@code /api/**} is exposed, restricted to the HTTP methods actually
 * implemented by the current controllers ({@code GET}, {@code POST},
 * {@code PATCH}, {@code DELETE} — Spring's CORS handler answers the
 * {@code OPTIONS} preflight itself) and to the request headers the future
 * Axios client sends ({@code Authorization}, {@code Content-Type},
 * {@code Accept}). {@code Authorization} is allowed now so the day a real
 * bearer token lands nothing else has to be touched.</p>
 *
 * <p>Allowed origins are read from {@code medshare.cors.allowed-origins}
 * (comma-separated) so deployments can configure the exact frontend origins.
 * The default covers the local Vite dev server ({@code http://localhost:5173}).
 * Wildcard {@code *} origins are permitted only when credentials are
 * disabled; Spring already rejects wildcard + {@code allowCredentials(true)},
 * so we also fail fast at configuration load if that combination is set —
 * otherwise it would surface silently as browser CORS rejections.</p>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

	/** Comma-separated explicit origins; default is the local Vite dev server. */
	@Value("${medshare.cors.allowed-origins:http://localhost:5173}")
	private String allowedOriginsRaw;

	/**
	 * Whether to allow cookies / HTTP authentication on cross-origin requests.
	 * Defaults to {@code false} — no auth backend exists yet and there is no
	 * reason to widen the trust surface before it is needed.
	 */
	@Value("${medshare.cors.allow-credentials:false}")
	private boolean allowCredentials;

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		List<String> origins = parseOrigins(allowedOriginsRaw);
		if (origins.isEmpty()) {
			// Nothing to open up: leave CORS disabled and let the request fail closed.
			log.warn("medshare.cors.allowed-origins is empty — CORS remains disabled.");
			return;
		}
		boolean wildcard = origins.contains("*");
		if (wildcard && allowCredentials) {
			throw new IllegalStateException(
				"medshare.cors.allowed-origins contains '*' while medshare.cors.allow-credentials=true. "
					+ "Wildcard origins are not permitted with credentials; list explicit origins.");
		}
		registry.addMapping("/api/**")
			.allowedOrigins(origins.toArray(String[]::new))
			.allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD")
			.allowedHeaders("Authorization", "Content-Type", "Accept")
			.allowCredentials(allowCredentials)
			.maxAge(3600);
	}

	private static List<String> parseOrigins(String raw) {
		if (raw == null || raw.isBlank()) {
			return List.of();
		}
		return Arrays.stream(raw.split(","))
			.map(String::trim)
			.filter(s -> !s.isEmpty())
			.distinct()
			.toList();
	}
}
