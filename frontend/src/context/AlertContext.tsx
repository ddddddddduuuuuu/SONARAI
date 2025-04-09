import React, { createContext, useContext, useState, useCallback } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface Alert {
  id: string;
  message: string;
  type: AlertType;
  autoClose?: boolean;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (message: string, type: AlertType, autoClose?: boolean) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback(
    (message: string, type: AlertType = 'info', autoClose = true) => {
      const id = Date.now().toString();
      const newAlert = { id, message, type, autoClose };
      
      setAlerts((prev) => [...prev, newAlert]);

      if (autoClose) {
        setTimeout(() => {
          removeAlert(id);
        }, 5000);
      }
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
} 