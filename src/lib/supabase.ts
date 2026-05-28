import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('❌ Brak konfiguracji Supabase! Sprawdź .env.local');
  }
}

let _client: ReturnType<typeof createClient> | null = null;

function createSupabaseClient() {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Brak konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export const supabase = new Proxy({} as any, {
  get(_, prop) {
    const client = createSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          first_name: string;
          last_name: string;
          initials: string;
          email: string | null;
          phone: string | null;
          login: string;
          password_hash: string | null;
          role: 'owner' | 'employee' | 'admin';
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          deleted_at: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          first_name: string;
          last_name: string;
          initials: string;
          email?: string | null;
          phone?: string | null;
          login: string;
          password_hash?: string | null;
          role?: 'owner' | 'employee' | 'admin';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          deleted_at?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          first_name?: string;
          last_name?: string;
          initials?: string;
          email?: string | null;
          phone?: string | null;
          login?: string;
          password_hash?: string | null;
          role?: 'owner' | 'employee' | 'admin';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          deleted_at?: string | null;
          metadata?: Record<string, unknown>;
        };
      };
      shops: {
        Row: {
          id: string;
          code: string;
          name: string;
          address: string;
          city: string | null;
          postal_code: string | null;
          phone: string | null;
          email: string | null;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          config?: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          address: string;
          city?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          config?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          address?: string;
          city?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          config?: Record<string, unknown>;
        };
      };
      inventory: {
        Row: {
          id: string;
          sku: string | null;
          name: string;
          category: 'telefon' | 'akcesoria' | 'usluga' | 'serwis';
          brand: string | null;
          model: string | null;
          memory: string | null;
          color: string | null;
          condition: 'nowy' | 'uzywany' | 'sprzedany' | 'zablokowany';
          battery_health: string | null;
          imei: string | null;
          purchase_price: number | null;
          selling_price: number | null;
          profit_margin: number | null;
          tax_type: 'VAT' | 'marza' | 'zwolniony';
          stock_quantity: number;
          stock_alert_threshold: number;
          is_low_stock: boolean;
          status: 'nowy' | 'uzywany' | 'sprzedany' | 'zablokowany';
          is_sold: boolean;
          sold_at: string | null;
          warranty_months: number | null;
          warranty_until: string | null;
          set_includes: string | null;
          purchase_date: string | null;
          selling_date: string | null;
          notes: string | null;
          shop_id: string;
          added_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          sku?: string | null;
          name: string;
          category?: 'telefon' | 'akcesoria' | 'usluga' | 'serwis';
          brand?: string | null;
          model?: string | null;
          memory?: string | null;
          color?: string | null;
          condition?: 'nowy' | 'uzywany' | 'sprzedany' | 'zablokowany';
          battery_health?: string | null;
          imei?: string | null;
          purchase_price?: number | null;
          selling_price?: number | null;
          profit_margin?: number | null;
          tax_type?: 'VAT' | 'marza' | 'zwolniony';
          stock_quantity?: number;
          stock_alert_threshold?: number;
          is_low_stock?: boolean;
          status?: 'nowy' | 'uzywany' | 'sprzedany' | 'zablokowany';
          is_sold?: boolean;
          sold_at?: string | null;
          warranty_months?: number | null;
          warranty_until?: string | null;
          set_includes?: string | null;
          purchase_date?: string | null;
          selling_date?: string | null;
          notes?: string | null;
          shop_id?: string;
          added_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          sku?: string | null;
          name?: string;
          category?: 'telefon' | 'akcesoria' | 'usluga' | 'serwis';
          brand?: string | null;
          model?: string | null;
          memory?: string | null;
          color?: string | null;
          condition?: 'nowy' | 'uzywany' | 'sprzedany' | 'zablokowany';
          battery_health?: string | null;
          imei?: string | null;
          purchase_price?: number | null;
          selling_price?: number | null;
          profit_margin?: number | null;
          tax_type?: 'VAT' | 'marza' | 'zwolniony';
          stock_quantity?: number;
          stock_alert_threshold?: number;
          is_low_stock?: boolean;
          status?: 'nowy' | 'uzywany' | 'sprzedany' | 'zablokowany';
          is_sold?: boolean;
          sold_at?: string | null;
          warranty_months?: number | null;
          warranty_until?: string | null;
          set_includes?: string | null;
          purchase_date?: string | null;
          selling_date?: string | null;
          notes?: string | null;
          shop_id?: string;
          added_by?: string;
          updated_at?: string;
          deleted_at?: string | null;
          metadata?: Record<string, unknown>;
        };
      };
      audit_log: {
        Row: {
          id: string;
          action_type: string;
          description: string;
          details: string | null;
          actor_id: string | null;
          actor_name: string | null;
          shop_id: string | null;
          shop_name: string | null;
          target_table: string | null;
          target_id: string | null;
          target_type: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action_type: string;
          description: string;
          details?: string | null;
          actor_id?: string | null;
          actor_name?: string | null;
          shop_id?: string | null;
          shop_name?: string | null;
          target_table?: string | null;
          target_id?: string | null;
          target_type?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          shiftId?: string;
          shift_date: string;
          start_time: string;
          end_time: string;
          status: 'planowany' | 'potwierdzony' | 'zrealizowany' | 'anulowany';
          shift_type: 'pełny' | 'pół' | 'nadgodziny';
          shop_id: string;
          employee_id: string;
          notes: string | null;
          preset_name: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          employee?: { id: string; first_name: string; last_name: string; initials: string };
          shop?: { id: string; code: string; name: string };
        };
        Insert: {
          id?: string;
          shift_date: string;
          start_time: string;
          end_time: string;
          status?: 'planowany' | 'potwierdzony' | 'zrealizowany' | 'anulowany';
          shift_type?: 'pełny' | 'pół' | 'nadgodziny';
          shop_id: string;
          employee_id: string;
          notes?: string | null;
          preset_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shift_date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'planowany' | 'potwierdzony' | 'zrealizowany' | 'anulowany';
          shift_type?: 'pełny' | 'pół' | 'nadgodziny';
          shop_id?: string;
          employee_id?: string;
          notes?: string | null;
          preset_name?: string | null;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_number: string;
          sale_date: string;
          sale_time: string;
          payment_method: string;
          total_amount: number;
          total_profit: number | null;
          status: string;
          shop_id: string;
          employee_id: string;
          customer_id: string | null;
          invoice_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          shop?: { id: string; code: string; name: string };
          employee?: { id: string; first_name: string; last_name: string; initials: string };
          sale_items?: any[];
        };
        Insert: {
          id?: string;
          sale_number?: string;
          sale_date: string;
          sale_time: string;
          payment_method: string;
          total_amount: number;
          total_profit?: number | null;
          status?: string;
          shop_id: string;
          employee_id: string;
          customer_id?: string | null;
          invoice_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sale_number?: string;
          sale_date?: string;
          sale_time?: string;
          payment_method?: string;
          total_amount?: number;
          total_profit?: number | null;
          status?: string;
          shop_id?: string;
          employee_id?: string;
          customer_id?: string | null;
          invoice_id?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_name: string;
          category: string;
          inventory_id: string | null;
          unit_price: number;
          quantity: number;
          purchase_cost: number | null;
          profit: number | null;
          imei: string | null;
          tax_type: string | null;
          comment: string | null;
          sort_order: number;
          created_at: string;
          inventory?: { id: string; name: string; sku: string | null; imei: string | null };
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_name: string;
          category: string;
          inventory_id?: string | null;
          unit_price: number;
          quantity: number;
          purchase_cost?: number | null;
          profit?: number | null;
          imei?: string | null;
          tax_type?: string | null;
          comment?: string | null;
          sort_order?: number;
        };
      };
      costs: {
        Row: {
          id: string;
          cost_date: string;
          cost_time: string;
          category: string;
          amount: number;
          description: string;
          payment_method: string;
          shop_id: string;
          employee_id: string;
          supplier: string | null;
          invoice_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          cost_date: string;
          cost_time: string;
          category: string;
          amount: number;
          description: string;
          payment_method: string;
          shop_id: string;
          employee_id: string;
          supplier?: string | null;
          invoice_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cost_date?: string;
          cost_time?: string;
          category?: string;
          amount?: number;
          description?: string;
          payment_method?: string;
          shop_id?: string;
          employee_id?: string;
          supplier?: string | null;
          invoice_number?: string | null;
          notes?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          company_name: string | null;
          nip: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          customer_type: 'individual' | 'company';
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          nip?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          customer_type?: 'individual' | 'company';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          nip?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          customer_type?: 'individual' | 'company';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          sale_date: string;
          sale_time: string;
          status: string;
          total_amount: number;
          net_amount: number;
          vat_amount: number;
          customer_id: string | null;
          shop_id: string;
          employee_id: string;
          sale_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          customer?: { id: string; first_name: string; last_name: string; company_name: string; nip: string; address?: string | null; email?: string | null; phone?: string | null };
          invoice_items?: any[];
        };
        Insert: {
          id?: string;
          invoice_number?: string;
          issue_date: string;
          due_date: string;
          sale_date: string;
          sale_time: string;
          status?: string;
          total_amount: number;
          net_amount: number;
          vat_amount: number;
          customer_id?: string | null;
          shop_id: string;
          employee_id: string;
          sale_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          issue_date?: string;
          due_date?: string;
          sale_date?: string;
          sale_time?: string;
          status?: string;
          total_amount?: number;
          net_amount?: number;
          vat_amount?: number;
          customer_id?: string | null;
          shop_id?: string;
          employee_id?: string;
          sale_id?: string | null;
          notes?: string | null;
          issued_at?: string | null;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          item_name: string;
          unit_price: number;
          quantity: number;
          vat_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          item_name: string;
          unit_price: number;
          quantity: number;
          vat_rate: number;
        };
      };
      cash_register_closings: {
        Row: {
          id: string;
          shop_id: string;
          employee_id: string | null;
          closing_date: string;
          closed_at: string;
          opening_cash_amount: number;
          closing_cash_amount: number;
          closing_card_amount: number;
          total_cash_sales: number;
          total_card_sales: number;
          total_costs: number;
          total_doladowania: number;
          expected_amount: number | null;
          difference: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          shop_id: string;
          employee_id?: string | null;
          closing_date: string;
          closed_at?: string;
          opening_cash_amount?: number;
          closing_cash_amount: number;
          closing_card_amount?: number;
          total_cash_sales?: number;
          total_card_sales?: number;
          total_costs?: number;
          total_doladowania?: number;
          expected_amount?: number | null;
          difference?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          employee_id?: string | null;
          closing_date?: string;
          closed_at?: string;
          opening_cash_amount?: number;
          closing_cash_amount?: number;
          closing_card_amount?: number;
          total_cash_sales?: number;
          total_card_sales?: number;
          total_costs?: number;
          total_doladowania?: number;
          expected_amount?: number | null;
          difference?: number | null;
          notes?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_shops: {
        Row: {
          id: string;
          user_id: string;
          shop_id: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shop_id: string;
          is_primary?: boolean;
          created_at?: string;
        };
      };
    };
  };
};