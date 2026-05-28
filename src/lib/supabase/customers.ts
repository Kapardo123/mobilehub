import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('last_name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async search(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,company_name.ilike.%${query}%,nip.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('last_name');
    
    if (error) throw error;
    return data || [];
  },

  async create(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }
};
