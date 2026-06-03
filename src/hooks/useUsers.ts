import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/lib/supabase/users'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function useUsers() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAllWithShops(),
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['users'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}
