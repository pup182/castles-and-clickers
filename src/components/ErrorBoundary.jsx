import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndReload = () => {
    try {
      localStorage.removeItem('castles-and-clickers-save');
    } catch {
      // If localStorage is inaccessible, reload anyway
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1a1a2e',
          padding: '1rem',
        }}>
          <div className="pixel-panel" style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}>
            <h1 className="pixel-title" style={{ color: '#ef4444', marginBottom: '1rem' }}>
              Something Went Wrong
            </h1>
            <p className="pixel-text" style={{ marginBottom: '0.5rem', color: '#c4c4d4' }}>
              The game encountered an unexpected error.
            </p>
            <p className="pixel-text" style={{ marginBottom: '1.5rem', color: '#8888a0', fontSize: '0.75rem' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="pixel-btn pixel-btn-primary" onClick={this.handleReload}>
                Reload Game
              </button>
              <button className="pixel-btn pixel-btn-secondary" onClick={this.handleClearAndReload}>
                Clear Save &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
