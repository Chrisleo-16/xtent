
import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
  onRefresh?: () => void;
}

export const useAutoRefresh = ({
  interval = 300000, // Default 5 minutes
  enabled = true,
  onRefresh
}: UseAutoRefreshOptions = {}) => {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      } else {
        // Default behavior: refresh the page
        window.location.reload();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, onRefresh]);

  const manualRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return { manualRefresh };
};
