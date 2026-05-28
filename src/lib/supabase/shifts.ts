import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Shift = Database['public']['Tables']['shifts']['Row'];
type ShiftInsert = Database['public']['Tables']['shifts']['Insert'];
type ShiftUpdate = Database['public']['Tables']['shifts']['Update'];

export const shiftsService = {
  async getAll(): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        shop:shops(name, code),
        employee:users(id, first_name, last_name, initials)
      `)
      .is('deleted_at', null)
      .order('shift_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByEmployee(employeeId: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        shop:shops(name, code),
        employee:users(id, first_name, last_name, initials)
      `)
      .eq('employee_id', employeeId)
      .is('deleted_at', null)
      .order('shift_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByShop(shopId: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        shop:shops(name, code),
        employee:users(id, first_name, last_name, initials)
      `)
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('shift_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(startDate: string, endDate: string, shopId?: string): Promise<Shift[]> {
    let queryBuilder = supabase
      .from('shifts')
      .select(`
        *,
        shop:shops(name, code),
        employee:users(id, first_name, last_name, initials)
      `)
      .gte('shift_date', startDate)
      .lte('shift_date', endDate)
      .is('deleted_at', null)
      .order('shift_date');
    
    if (shopId) {
      queryBuilder = queryBuilder.eq('shop_id', shopId);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  },

  async create(shift: ShiftInsert): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert(shift)
      .select(`
        *,
        shop:shops(name, code),
        employee:users(id, first_name, last_name, initials)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ShiftUpdate): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        shop:shops(name, code),
        employee:users(id, first_name, last_name, initials)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async confirm(id: string, confirmedBy: string): Promise<Shift> {
    return this.update(id, {
      status: 'potwierdzony' as const,
      confirmed_by: confirmedBy,
      confirmed_at: new Date().toISOString()
    });
  },

  async realize(id: string): Promise<Shift> {
    return this.update(id, { status: 'zrealizowany' as const });
  },

  async cancel(id: string): Promise<Shift> {
    return this.update(id, { status: 'anulowany' as const });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  },

  async getWeekSchedule(weekStart: string, weekEnd: string, shopId?: string): Promise<Shift[]> {
    return this.getByDateRange(weekStart, weekEnd, shopId);
  }
};
