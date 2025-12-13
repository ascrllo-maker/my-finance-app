import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleClearCache = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backgroundColor: '#0F172A',
                    color: '#F1F5F9',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#EF4444' }}>
                        Something went wrong
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#94A3B8', maxWidth: '500px' }}>
                        The application encountered an unexpected error.
                    </p>

                    <div style={{
                        backgroundColor: '#1E293B',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '2rem',
                        textAlign: 'left',
                        overflow: 'auto',
                        maxWidth: '100%',
                        maxHeight: '200px',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button onClick={this.handleReload}>
                            Reload Page
                        </Button>
                        <Button variant="outline" onClick={this.handleClearCache}>
                            Reset App Data
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
