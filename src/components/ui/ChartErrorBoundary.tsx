import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackHeight?: string;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className={`flex flex-col items-center justify-center bg-card/30 border border-border/30 rounded-lg ${this.props.fallbackHeight || 'h-[300px]'}`}
        >
          <AlertTriangle className="w-8 h-8 text-warning mb-2" />
          <p className="text-sm text-muted-foreground font-tech mb-1">
            {this.props.componentName || 'Component'} failed to load
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 mt-2 text-xs font-tech bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
