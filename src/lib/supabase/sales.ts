import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { toISODateString } from '../dateFormat';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleInsert = Database['public']['Tables']['sales']['Insert'];
type SaleUpdate = Database['public']['Tables']['sales']['Update'];

type SaleItem = Database['public']['Tables']['sale_items']['Row'];
type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert'];

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale_items(
          *,
          inventory:inventory(name, sku, imei)
        )
      `)
      .is('deleted_at', null)
      .order('sale_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(startDate: string, endDate: string, shopId?: string): Promise<Sale[]> {
    let queryBuilder = supabase
      .from('sales')
      .select(`
        *,
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale_items(
          *,
          inventory:inventory(name, sku, imei)
        )
      `)
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .is('deleted_at', null)
      .order('sale_date', { ascending: false });
    
    if (shopId) {
      queryBuilder = queryBuilder.eq('shop_id', shopId);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  },

  async getByShop(shopId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale_items(
          *,
          inventory:inventory(name, sku, imei)
        )
      `)
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('sale_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Sale | null> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale_items(
          *,
          inventory:inventory(name, sku, imei)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async generateSaleNumber(saleDate: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `FS-${year}${mm}${dd}-${hh}${min}${ss}${ms}`;
  },

  async create(sale: SaleInsert, items: SaleItemInsert[]): Promise<Sale> {
    console.log('📥 salesService.create - sale data:', JSON.stringify(sale, null, 2));
    console.log('📥 salesService.create - items count:', items.length);

    if (!sale.sale_number) {
      sale.sale_number = await this.generateSaleNumber(sale.sale_date);
    }

    let currentSale = { ...sale };
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data, error } = await supabase
        .from('sales')
        .insert(currentSale)
        .select()
        .single();

      console.log('📤 salesService.create - sale result:', { data: data?.id, error: error?.message });

      if (!error) {
        if (items.length > 0) {
          const itemsWithSaleId = items.map(item => ({
            ...item,
            tax_type: (item.tax_type as string) === 'marża' ? 'marza' : item.tax_type,
            sale_id: data.id
          }));

          console.log('📥 salesService.create - inserting items:', JSON.stringify(itemsWithSaleId, null, 2));

          const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(itemsWithSaleId);

          console.log('📤 salesService.create - items result:', itemsError);

          if (itemsError) {
            console.error('❌ Błąd dodawania pozycji:', JSON.stringify(itemsError, null, 2));
            throw itemsError;
          }
        }

        return this.getById(data.id) as Promise<Sale>;
      }

      if (error.code === '23505') {
        console.warn(`🔄 Duplikat numeru (próba ${attempt + 1}/${MAX_RETRIES}) - trigger DB nadpisał numer.`);
        
        if (attempt < MAX_RETRIES - 1) {
          currentSale = { ...currentSale, sale_number: undefined };
          await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
          continue;
        }

        console.error('❌ Trigger DB generuje zduplikowany numer. Uruchom fix_trigger_sale_number.sql w Supabase SQL Editor.');
        throw new Error('Duplikat numeru sprzedaży - trigger bazy danych wymaga naprawy (fix_trigger_sale_number.sql)');
      }

      console.error('❌ Błąd tworzenia sprzedaży:', JSON.stringify(error, null, 2));
      throw error;
    }

    throw new Error('Nie udało się utworzyć sprzedaży');
  },

  async update(id: string, updates: SaleUpdate): Promise<Sale> {
    const { data, error } = await supabase
      .from('sales')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async cancel(id: string): Promise<Sale> {
    return this.update(id, { status: 'cancelled' as const });
  },

  async getTodaySales(shopId: string): Promise<Sale[]> {
    const today = toISODateString();
    
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale_items(
          *,
          inventory:inventory(name, sku, imei)
        )
      `)
      .eq('sale_date', today)
      .eq('shop_id', shopId)
      .eq('status', 'completed')
      .is('deleted_at', null)
      .order('sale_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  async getTotalForToday(shopId: string): Promise<number> {
    const today = toISODateString();
    
    const { data, error } = await supabase
      .from('sales')
      .select('total_amount')
      .eq('sale_date', today)
      .eq('shop_id', shopId)
      .eq('status', 'completed')
      .is('deleted_at', null);
    
    if (error) throw error;
    
    return data?.reduce((sum: number, sale: any) => sum + Number(sale.total_amount), 0) || 0;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  }
};

export const saleItemsService = {
  async getBySaleId(saleId: string): Promise<SaleItem[]> {
    const { data, error } = await supabase
      .from('sale_items')
      .select(`
        *,
        inventory:inventory(name, sku, imei, brand, model)
      `)
      .eq('sale_id', saleId)
      .order('sort_order');
    
    if (error) throw error;
    return data || [];
  },

  async addItems(saleId: string, items: SaleItemInsert[]): Promise<void> {
    const itemsWithSaleId = items.map(item => ({
      ...item,
      tax_type: (item.tax_type as string) === 'marża' ? 'marza' : item.tax_type,
      sale_id: saleId
    }));
    
    const { error } = await supabase
      .from('sale_items')
      .insert(itemsWithSaleId);
    
    if (error) throw error;
  }
};
