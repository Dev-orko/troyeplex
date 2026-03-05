import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-gray-400 text-sm max-w-md text-center">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg px-6 py-3 text-sm font-bold text-white"
            style={{ background: '#e50914' }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
