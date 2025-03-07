import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

/**
 * Props interface for the ErrorBoundary component
 * @property children - React components to be wrapped by the error boundary
 * @property onError - Optional callback function to handle errors
 * @property onRetry - Optional callback function to handle retry attempts
 */
interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}

/**
 * State interface for the ErrorBoundary component
 * @property hasError - Boolean indicating if an error has been caught
 * @property error - The error object that was caught, if any
 */
interface State {
  hasError: boolean;
  error: Error | null;
}

// Constants for web iframe communication
const IFRAME_ID = 'rork-web-preview';

// List of allowed origins for postMessage communication
const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
] as const;

type WebTargetOrigin = typeof webTargetOrigins[number];

interface ErrorMessage {
  type: 'ERROR';
  error: {
    message: string;
    stack?: string;
    componentStack?: string;
    timestamp: string;
  };
  iframeId: string;
}

/**
 * Sends error information to the parent iframe in web environments
 * @param error - The error object to send
 * @param errorInfo - Additional error information from React
 */
function sendErrorToIframeParent(error: unknown, errorInfo?: React.ErrorInfo): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.debug('Sending error to parent:', {
      error,
      errorInfo,
      referrer: document.referrer
    });

    // Prepare error message for parent window
    const errorMessage: ErrorMessage = {
      type: 'ERROR',
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack ?? undefined : undefined,
        componentStack: errorInfo?.componentStack ?? undefined,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      // Send error message to parent window
      const targetOrigin = webTargetOrigins.includes(document.referrer as WebTargetOrigin)
        ? document.referrer
        : '*';
      
      window.parent.postMessage(errorMessage, targetOrigin);
    } catch (postMessageError) {
      console.error('Failed to send error to parent:', postMessageError);
    }
  }
}

// Set up global error handlers for web environment
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    sendErrorToIframeParent(event.error || event);
  }, true);

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    sendErrorToIframeParent(event.reason);
  }, true);

  // Override console.error to capture errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    sendErrorToIframeParent(args.join(' '));
    originalConsoleError.apply(console, args);
  };
}

/**
 * ErrorBoundary Component
 * A React component that catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Updates the component state when an error is caught
   * @param error - The error that was caught
   * @returns New state object
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs the error and calls the onError callback if provided
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    sendErrorToIframeParent(error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Handles retry attempts
   */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  /**
   * Renders either the error UI or the children components
   */
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>{this.state.error?.message}</Text>
            {Platform.OS !== 'web' && (
              <Text style={styles.description}>
                Please check your device logs for more details.
              </Text>
            )}
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={this.handleRetry}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Styles for the ErrorBoundary component
 * Defines the visual appearance of the error UI
 */
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Content styles
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // Text styles
  title: {
    fontSize: 36,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;