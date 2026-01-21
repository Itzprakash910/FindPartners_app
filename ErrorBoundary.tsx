
import React, { Component, ReactNode } from 'react';
import { getUsers } from '../utils/auth';
import { getNotifications, saveNotifications, getErrorLogs, saveErrorLogs } from '../utils/storage';
import { ErrorLog } from '../types';
import ErrorPage from './ErrorPage';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);

    try {
        const loggedInUserPhone = sessionStorage.getItem('loggedInUserPhone');
        if (loggedInUserPhone) {
            const allUsers = getUsers();
            const currentUser = allUsers.find(u => u.phone === loggedInUserPhone);
            const adminUser = allUsers.find(u => u.email === 'neelustlove@gmail.com');

            if (currentUser) {
                // Save explicit Error Log for Admin Panel
                const errorLogs = getErrorLogs();
                const newLog: ErrorLog = {
                    id: Date.now(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    errorName: error.name,
                    errorMessage: error.message,
                    timestamp: new Date().toISOString(),
                    stackTrace: errorInfo.componentStack
                };
                saveErrorLogs([newLog, ...errorLogs]);

                // Send notification if admin exists
                if (adminUser && currentUser.id !== adminUser.id) {
                    const notifications = getNotifications();
                    const newNotification = {
                        id: Date.now(),
                        recipientId: adminUser.id,
                        actorId: currentUser.id,
                        type: 'error_report' as const,
                        isRead: false,
                        timestamp: new Date().toISOString(),
                        message: `${error.name}: ${error.message}`,
                    };
                    
                    notifications.unshift(newNotification); // Add to the beginning of the list
                    saveNotifications(notifications);
                    console.log("Error notification sent to admin.");
                }
            }
        }
    } catch (e) {
        console.error("Failed to handle error reporting:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
