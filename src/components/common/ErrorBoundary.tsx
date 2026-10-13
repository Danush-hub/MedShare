import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level error boundary for the authenticated shell and public pages.
 *
 * Renders a calm, professional fallback instead of a blank screen when an
 * unexpected UI failure occurs, and offers a way back to a known-good state
 * without a hard browser reload. It intentionally does not swallow the error:
 * it is still logged to the console for debugging during the prototype phase.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep a console trace for developers; no data leaves the browser.
    console.error('MedShare UI error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.href = '/app';
  };

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-background px-6 py-12">
        <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-error-soft text-error-foreground">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-muted">
            An unexpected error interrupted this view. Your demo data is safe in this browser session —
            try returning to the workspace.
          </p>
          <p className="mt-3 break-words rounded-field bg-surface-muted px-3 py-2 text-left text-xs text-ink-subtle">
            {error.message || 'Unknown error'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={this.handleReset}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Dismiss
            </Button>
            <Button onClick={this.handleReload}>Return to workspace</Button>
          </div>
        </div>
      </div>
    );
  }
}
