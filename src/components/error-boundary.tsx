import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    // In a real app, send to Sentry or similar crash reporting service here
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page to clear any deeply corrupted state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-bg">
          <Card className="max-w-xl w-full border-danger/20 shadow-xl shadow-danger/10">
            <CardHeader className="bg-danger/5 border-b border-danger/10 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-danger">
                <IconAlertTriangle className="w-6 h-6" />
                CortexOS Encounted a Fatal Error
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-ink-2 mb-4">
                We apologize, but something went wrong. A crash report has been recorded locally.
              </p>
              
              {this.state.error && (
                <div className="bg-surface p-4 rounded-md overflow-auto max-h-48 border border-line mb-4 font-mono text-xs text-ink-2">
                  <span className="font-semibold text-danger block mb-1">
                    {this.state.error.name}: {this.state.error.message}
                  </span>
                  {this.state.errorInfo?.componentStack}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end bg-surface/30 rounded-b-xl border-t border-line">
              <Button onClick={this.handleReset} variant="outline" className="gap-2">
                <IconRefresh className="w-4 h-4" />
                Restart Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
