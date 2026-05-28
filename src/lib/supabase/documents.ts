import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export const documentsService = {
  async getAll(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByShop(shopId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(doc: DocumentInsert): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(doc)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: DocumentUpdate): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async permanentDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  }
};