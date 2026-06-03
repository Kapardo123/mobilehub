import { useQuery, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/lib/supabase/sales'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function useSales(shopId?: string, startDate?: string, endDate?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['sales', shopId, startDate, endDate],
    queryFn: async () => {
      if (shopId && startDate && endDate) {
        return salesService.getByDateRange(startDate, endDate, shopId)
      }
      return []
    },
    enabled: !!shopId && !!startDate && !!endDate,
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sales'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}
