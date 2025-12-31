import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if ((import.meta as any)?.env?.DEV) {
      console.error('ErrorBoundary', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '16px',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              padding: 16,
              color: '#1f2937',
            }}
          >
            <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Ocorreu um erro</h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
              Tente novamente. Se persistir, atualize a página.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#3b82f6',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#e5e7eb',
                  color: '#1f2937',
                  fontWeight: 600,
                }}
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

