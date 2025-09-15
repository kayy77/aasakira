import React, { Component, ErrorInfo, ReactNode } from 'react';
import HMRFallback from './HMRFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isHMRError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isHMRError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    
    // Check if this is the React HMR dispatcher error
    const isHMRError = error.message?.includes('dispatcher') || 
                       error.message?.includes('useState') ||
                       error.stack?.includes('dispatcher.useState');
    
    return { hasError: true, error, isHMRError };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    
    // If this is an HMR error, automatically reload after a short delay
    if (this.state.isHMRError) {
      console.log('HMR error detected, will auto-reload in 3 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isHMRError: false });
    // Force a full page reload to reset React state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // If this is specifically an HMR error, show the HMR fallback
      if (this.state.isHMRError) {
        return <HMRFallback />;
      }

      // For other errors, show custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">
              A React error occurred. Please reload the page to continue.
            </p>
            <button
              onClick={this.handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Reload Application
            </button>
            {this.state.error && (
              <details className="mt-4 text-left bg-zinc-900 p-4 rounded">
                <summary className="cursor-pointer text-red-400">Error Details</summary>
                <pre className="text-xs mt-2 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;