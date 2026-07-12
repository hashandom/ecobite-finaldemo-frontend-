import { useEffect, useRef, useCallback } from 'react';
import { useAlertStore } from '@/store/alert.store';
import { AlertService } from '@/services/alert.service';
import { APP_CONFIG } from '@/constants/app.constants';
import toast from 'react-hot-toast';

export const useAlertsWebSocket = () => {
  const addAlert = useAlertStore((state) => state.addAlert);
  const resolveAlertInStore = useAlertStore((state) => state.resolveAlert);
  const wsRef = useRef<WebSocket | null>(null);

  // Expose API methods to resolve alerts via REST
  const resolveAlert = useCallback(async (id: string) => {
    try {
      await AlertService.resolve(id);
      resolveAlertInStore(id); // Update local store immediately
      toast.success('Alert marked as resolved');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resolve alert');
      return false;
    }
  }, [resolveAlertInStore]);

  useEffect(() => {
    // Prevent multiple connections
    if (wsRef.current) return;

    const connect = () => {
      const ws = new WebSocket(APP_CONFIG.WS_URL);

      ws.onopen = () => {
        console.log('Connected to Alerts WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);
          addAlert(alert);
          
          if (alert.severity === 'CRITICAL') {
            toast.error(`CRITICAL: ${alert.productName} is out of stock!`);
          } else {
            toast('New Alert Received', { icon: '🔔' });
          }
        } catch (err) {
          console.error('Failed to parse websocket message', err);
        }
      };

      ws.onclose = () => {
        console.log('Alerts WebSocket disconnected. Reconnecting in 5s...');
        wsRef.current = null;
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        ws.close();
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [addAlert]);

  return { resolveAlert };
};
