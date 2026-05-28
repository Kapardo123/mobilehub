import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Shop = Database['public']['Tables']['shops']['Row'];
type ShopInsert = Database['public']['Tables']['shops']['Insert'];
type ShopUpdate = Database['public']['Tables']['shops']['Update'];

export const shopsService = {
  async getAll(): Promise<Shop[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Shop | null> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(shop: ShopInsert): Promise<Shop> {
    const { data, error } = await supabase
      .from('shops')
      .insert(shop)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ShopUpdate): Promise<Shop> {
    const { data, error } = await supabase
      .from('shops')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shops')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  async getActiveShops(): Promise<Shop[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};
