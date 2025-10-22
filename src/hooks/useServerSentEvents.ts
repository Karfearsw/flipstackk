import { useEffect, useRef, useState } from 'react';

interface UseServerSentEventsOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseServerSentEventsReturn {
  data: any;
  isConnected: boolean;
  error: string | null;
  reconnectCount: number;
  connect: () => void;
  disconnect: () => void;
}

export function useServerSentEvents({
  url,
  enabled = true,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
}: UseServerSentEventsOptions): UseServerSentEventsReturn {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = (event) => {
        setIsConnected(true);
        setError(null);
        setReconnectCount(0);
        shouldReconnectRef.current = true;
        onOpen?.(event);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          onMessage?.(parsedData);
        } catch (parseError) {
          console.error('Failed to parse SSE data:', parseError);
          setError('Failed to parse server data');
        }
      };

      eventSource.onerror = (event) => {
        setIsConnected(false);
        onError?.(event);

        // Only attempt reconnection if we should and haven't exceeded max attempts
        if (shouldReconnectRef.current && reconnectCount < maxReconnectAttempts) {
          setError(`Connection lost. Reconnecting... (${reconnectCount + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval);
        } else if (reconnectCount >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached. Please refresh the page.');
        } else {
          setError('Connection closed');
        }
      };

      eventSource.onclose = (event) => {
        setIsConnected(false);
        onClose?.(event);
      };

    } catch (err) {
      setError(`Failed to establish connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setReconnectCount(0);
  };

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [url, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    data,
    isConnected,
    error,
    reconnectCount,
    connect,
    disconnect,
  };
}