"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary with tiered fallback support.
 *
 * Placement (3 tiers):
 * 1. Top-level (page.tsx) — catches fatal errors, shows branded "Something went wrong"
 * 2. Tab-level (each main component) — if one tab crashes, others still work
 * 3. Section-level (within Dashboard) — if analyzer crashes, tracker still works
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.name ? `:${this.props.name}` : ""}]`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in min-h-[200px]">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-dm-sans font-bold text-base text-charcoal mb-1">
            {this.props.name ? `${this.props.name} encountered an issue` : "Something went wrong"}
          </h3>
          <p className="text-xs text-warm-gray max-w-sm mb-4 leading-relaxed">
            This section encountered an unexpected error. The rest of the app is still working.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-butter hover:bg-butter-dark text-charcoal text-xs font-bold rounded-2xl border border-butter-dark/50 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-white hover:bg-lavender-light text-charcoal text-xs font-bold rounded-2xl border border-lavender transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
