/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 * 
 * @created Phase 2 - Error handling infrastructure
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default Fallback UI
 */
const DefaultFallback = ({ error, resetError }: { error: Error | null; resetError: () => void }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '2rem',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        maxWidth: '600px',
        padding: '2rem',
        backgroundColor: '#fee',
        borderRadius: '8px',
        border: '1px solid #fcc',
      }}
    >
      <h2 style={{ color: '#c33', marginBottom: '1rem' }}>Ops! Algo deu errado</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Encontramos um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.
      </p>
      
      {(import.meta as any)?.env?.DEV && error && (
        <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Detalhes do erro (apenas em desenvolvimento)
          </summary>
          <pre
            style={{
              fontSize: '12px',
              color: '#c33',
              backgroundColor: '#fff',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px',
            }}
          >
            {error.toString()}
          </pre>
        </details>
      )}
      
      <button
        onClick={resetError}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#c33',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#a22')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#c33')}
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

/**
 * Error Boundary Class Component
 * 
 * Note: Error boundaries must be class components as React doesn't
 * provide a hook-based alternative yet
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Log error details
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    if ((import.meta as any)?.env?.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    Sentry.captureException(error, { extra: { errorInfo } });
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default fallback
      return <DefaultFallback error={this.state.error} resetError={this.resetError} />;
    }

    // Render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
