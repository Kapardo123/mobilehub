import { supabase } from '../supabase';
import type { Database } from '../supabase';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];
type InventoryInsert = Database['public']['Tables']['inventory']['Insert'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

export const inventoryService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        shops (name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByShop(shopId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(item: InventoryInsert): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: InventoryUpdate): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_low_stock', true)
      .is('deleted_at', null)
      .order('stock_quantity');
    
    if (error) throw error;
    return data || [];
  },

  async getByIMEI(imei: string, shopId?: string): Promise<InventoryItem | null> {
    let queryBuilder = supabase
      .from('inventory')
      .select('*')
      .is('deleted_at', null)
      .eq('imei', imei)
      .eq('is_sold', false);
    
    if (shopId) {
      queryBuilder = queryBuilder.eq('shop_id', shopId);
    }
    
    const { data, error } = await queryBuilder.maybeSingle();
    
    if (error) {
      console.warn('Błąd wyszukiwania po IMEI:', error);
      return null;
    }
    return data;
  },

  async markAsSold(id: string, saleId?: string, saleDate?: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        is_sold: true,
        sold_at: saleDate || new Date().toISOString(),
        related_sale_id: saleId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.warn('Błąd oznaczania telefonu jako sprzedanego:', error);
      return null;
    }
    return data;
  },

  async search(query: string, shopId?: string): Promise<InventoryItem[]> {
    let queryBuilder = supabase
      .from('inventory')
      .select('*')
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%,sku.ilike.%${query}%,imei.ilike.%${query}%`);
    
    if (shopId) {
      queryBuilder = queryBuilder.eq('shop_id', shopId);
    }
    
    const { data, error } = await queryBuilder.order('name');
    
    if (error) throw error;
    return data || [];
  }
};
