import React, { Component, ReactNode } from 'react';
import { Button } from './Button';

interface NavigationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface NavigationErrorBoundaryProps {
  children: ReactNode;
  fallbackScreen?: string;
  onNavigate?: (screen: string) => void;
  screenName?: string;
}

export class NavigationErrorBoundary extends Component<NavigationErrorBoundaryProps, NavigationErrorBoundaryState> {
  constructor(props: NavigationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): NavigationErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: error.stack || 'No stack trace available'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation Error Boundary caught an error:', error, errorInfo);
    
    // Log error details for debugging
    console.error('Error occurred in screen:', this.props.screenName || 'Unknown');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Update state with error info
    this.setState({
      hasError: true,
      error,
      errorInfo: errorInfo.componentStack || 'No component stack available'
    });
  }

  handleGoHome = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Navigate to safe screen
    if (this.props.onNavigate) {
      this.props.onNavigate(this.props.fallbackScreen || 'dashboard');
    }
  };

  handleReload = () => {
    // Reset error state and try to reload current screen
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Force component re-render
    this.forceUpdate();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-900 rounded-lg p-6 border border-gray-700">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Navigation Error</h2>
              <p className="text-gray-400 text-sm">
                Something went wrong while navigating to {this.props.screenName || 'this screen'}
              </p>
            </div>

            {/* Error Details (collapsible) */}
            <details className="mb-6 bg-gray-800 rounded p-3">
              <summary className="cursor-pointer text-sm text-gray-300 hover:text-white">
                Error Details
              </summary>
              <div className="mt-2 text-xs text-gray-400 font-mono">
                <p className="mb-2">
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                </p>
                <p className="mb-2">
                  <strong>Screen:</strong> {this.props.screenName || 'Unknown'}
                </p>
                <div className="max-h-32 overflow-y-auto">
                  <strong>Stack Trace:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {this.state.errorInfo}
                  </pre>
                </div>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={this.handleGoHome}
                fullWidth
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                🏠 Go to Dashboard
              </Button>
              
              <Button
                onClick={this.handleReload}
                fullWidth
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                🔄 Try Again
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              If this error persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}