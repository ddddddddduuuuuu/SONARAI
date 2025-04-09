import React from 'react';
import { formatDistance } from 'date-fns';

interface AlertData {
  id: string;
  title: string;
  description: string;
  type: 'whale' | 'price' | 'volatility' | 'custom' | string;
  severity: 'low' | 'medium' | 'high';
  relatedToken?: string;
  relatedAddress?: string;
  isActive: boolean;
  createdAt: Date;
  viewCount: number;
  actionCount: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
}

interface AlertCardProps {
  alert: AlertData;
  onViewDetails: (id: string) => void;
  onDismiss: (id: string) => void;
  onSubmitFeedback: (id: string, isPositive: boolean) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onViewDetails, onDismiss, onSubmitFeedback }) => {
  // Get styles based on severity
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bgColor: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200', icon: '🚨' };
      case 'medium':
        return { bgColor: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200', icon: '⚠️' };
      case 'low':
      default:
        return { bgColor: 'bg-blue-100 dark:bg-blue-900', textColor: 'text-blue-800 dark:text-blue-200', icon: 'ℹ️' };
    }
  };
  
  // Get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whale':
        return '🐳';
      case 'price':
        return '💰';
      case 'volatility':
        return '📊';
      case 'custom':
        return '🔔';
      default:
        return '📣';
    }
  };
  
  const severityStyles = getSeverityStyles(alert.severity);
  const typeIcon = getTypeIcon(alert.type);
  
  // Format time
  const formatTime = (date: Date) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };
  
  return (
    <div className={`rounded-xl shadow-md overflow-hidden transition-shadow duration-300 border-l-4 
                   ${alert.severity === 'high' ? 'border-red-500' : 
                     alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}`}>
      <div className="bg-white dark:bg-gray-800 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <span className={`${severityStyles.bgColor} ${severityStyles.textColor} text-xs font-medium me-2 px-2.5 py-0.5 rounded`}>
              {severityStyles.icon} {alert.severity.toUpperCase()}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {typeIcon} {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(alert.createdAt)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {alert.title}
        </h3>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {alert.description}
        </p>
        
        {alert.relatedToken && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-medium me-1">Token:</span>
            <span>{alert.relatedToken}</span>
          </div>
        )}
        
        {alert.relatedAddress && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="font-medium me-1">Address:</span>
            <span>{`${alert.relatedAddress.substring(0, 6)}...${alert.relatedAddress.substring(alert.relatedAddress.length - 4)}`}</span>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between mt-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
            <span title="Views">👁️ {alert.viewCount}</span>
            <span title="Actions">🖱️ {alert.actionCount}</span>
            <div className="flex items-center">
              <button 
                onClick={() => onSubmitFeedback(alert.id, true)}
                className="text-green-500 hover:text-green-600 dark:hover:text-green-400 mr-2"
                title="Helpful"
              >
                👍 {alert.positiveFeedbackCount}
              </button>
              <button 
                onClick={() => onSubmitFeedback(alert.id, false)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                title="Not Helpful"
              >
                👎 {alert.negativeFeedbackCount}
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onViewDetails(alert.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              View
            </button>
            <button 
              onClick={() => onDismiss(alert.id)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard; 