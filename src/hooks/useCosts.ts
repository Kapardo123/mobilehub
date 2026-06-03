import { useQuery, useQueryClient } from '@tanstack/react-query'
import { costsService } from '@/lib/supabase/costs'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function useCosts(shopId?: string, startDate?: string, endDate?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['costs', shopId, startDate, endDate],
    queryFn: async () => {
      if (shopId && startDate && endDate) {
        return costsService.getByDateRange(startDate, endDate, shopId)
      }
      return []
    },
    enabled: !!shopId && !!startDate && !!endDate,
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('costs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'costs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['costs'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}
