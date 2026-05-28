import { supabase } from '../supabase';

interface Document {
  id: string;
  shop_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface DocumentInsert {
  id?: string;
  shop_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface DocumentUpdate {
  shop_id?: string;
  file_name?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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