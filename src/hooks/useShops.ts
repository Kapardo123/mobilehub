import { useQuery, useQueryClient } from '@tanstack/react-query'
import { shopsService } from '@/lib/supabase/shops'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function useShops() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['shops'],
    queryFn: () => shopsService.getAll(),
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('shops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shops',
        },
        () => {
          // Invalidate cache to refresh data
          queryClient.invalidateQueries({ queryKey: ['shops'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}
