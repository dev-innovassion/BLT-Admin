import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

export function RouteChangeDetector() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(`Route changed to: ${location}`);
    
    queryClient.refetchQueries({
      type: 'active',
      stale: true,
    });
    
    
  }, [location, queryClient]);

  return null;
}