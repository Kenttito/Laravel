import React from 'react';
import SimpleBTCChart from './SimpleBTCChart';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <SimpleBTCChart />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 