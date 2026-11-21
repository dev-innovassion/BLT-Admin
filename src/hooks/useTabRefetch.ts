import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useTabRefetch(initialTab: string, queryKeys: string[] = []) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const queryClient = useQueryClient();

  const handleTabChange = useCallback((newTab: string) => {
    console.log(`Tab changed from ${activeTab} to ${newTab}`);
    setActiveTab(newTab);
    
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ 
        queryKey: [queryKey],
      });
    });
    
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && queryKeys.some(qk => key.includes(qk))
        );
      }
    });
  }, [activeTab, queryKeys, queryClient]);

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
  };
}