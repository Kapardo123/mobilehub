import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale:sales!fk_invoices_sale(sale_number),
        invoice_items(
          *,
          sale_item:sale_items(product_name)
        )
      `)
      .is('deleted_at', null)
      .order('issue_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        shop:shops(*),
        employee:users(id, first_name, last_name, initials),
        sale:sales!fk_invoices_sale(sale_number),
        invoice_items(
          *,
          sale_item:sale_items(product_name)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(invoice: InvoiceInsert, items: InvoiceItemInsert[] = []): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select(`
        *,
        customer:customers(*),
        shop:shops(*),
        employee:users(id, first_name, last_name, initials)
      `)
      .single();
    
    if (error) throw error;
    
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: data.id
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
      
      if (itemsError) throw itemsError;
    }
    
    return this.getById(data.id) as Promise<Invoice>;
  },

  async update(id: string, updates: InvoiceUpdate): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async issue(id: string): Promise<Invoice> {
    return this.update(id, {
      status: 'wydana' as const,
      issued_at: new Date().toISOString()
    });
  },

  async markAsPaid(id: string): Promise<Invoice> {
    return this.update(id, { status: 'oplacona' as const });
  },

  async cancel(id: string): Promise<Invoice> {
    return this.update(id, { status: 'anulowana' as const });
  },

  async getByStatus(status: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        shop:shops(*),
        employee:users(id, first_name, last_name, initials)
      `)
      .eq('status', status)
      .is('deleted_at', null)
      .order('issue_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getDrafts(): Promise<Invoice[]> {
    return this.getByStatus('szkic');
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  }
};

export const invoiceItemsService = {
  async getByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    const { data, error } = await supabase
      .from('invoice_items')
      .select(`
        *,
        sale_item:sale_items(product_name, inventory:inventory(name))
      `)
      .eq('invoice_id', invoiceId)
      .order('sort_order');
    
    if (error) throw error;
    return data || [];
  },

  async addItems(invoiceId: string, items: InvoiceItemInsert[]): Promise<void> {
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: invoiceId
    }));
    
    const { error } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);
    
    if (error) throw error;
  }
};
