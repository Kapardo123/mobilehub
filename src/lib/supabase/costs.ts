import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { toISODateString } from '../dateFormat';

type Cost = Database['public']['Tables']['costs']['Row'];
type CostInsert = Database['public']['Tables']['costs']['Insert'];
type CostUpdate = Database['public']['Tables']['costs']['Update'];

export const costsService = {
  async getAll(): Promise<Cost[]> {
    const { data, error } = await supabase
      .from('costs')
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .is('deleted_at', null)
      .order('cost_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(startDate: string, endDate: string, shopId?: string): Promise<Cost[]> {
    let queryBuilder = supabase
      .from('costs')
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .gte('cost_date', startDate)
      .lte('cost_date', endDate)
      .is('deleted_at', null)
      .order('cost_date', { ascending: false });
    
    if (shopId) {
      queryBuilder = queryBuilder.eq('shop_id', shopId);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  },

  async getByShop(shopId: string): Promise<Cost[]> {
    const { data, error } = await supabase
      .from('costs')
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('cost_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Cost | null> {
    const { data, error } = await supabase
      .from('costs')
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(cost: CostInsert): Promise<Cost> {
    const { data, error } = await supabase
      .from('costs')
      .insert(cost)
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: CostUpdate): Promise<Cost> {
    const { data, error } = await supabase
      .from('costs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('costs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('costs')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  },

  async verify(id: string, verifiedBy: string): Promise<Cost> {
    return this.update(id, {
      is_verified: true,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString()
    });
  },

  async getUnverified(): Promise<Cost[]> {
    const { data, error } = await supabase
      .from('costs')
      .select(`
        *,
        shop:shops(*),
        employee:users!costs_employee_id_fkey(id, first_name, last_name, initials)
      `)
      .eq('is_verified', false)
      .is('deleted_at', null)
      .order('cost_date');
    
    if (error) throw error;
    return data || [];
  },

  async getTotalForToday(shopId: string): Promise<number> {
    const today = toISODateString();
    
    const { data, error } = await supabase
      .from('costs')
      .select('amount')
      .eq('cost_date', today)
      .eq('shop_id', shopId)
      .is('deleted_at', null);
    
    if (error) throw error;
    
    return data?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;
  }
};
