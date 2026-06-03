import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { toISODateString } from '../dateFormat';

type CashRegisterClosing = Database['public']['Tables']['cash_register_closings']['Row'];

type CashRegisterClosingInsert = Database['public']['Tables']['cash_register_closings']['Insert'];
type CashRegisterClosingUpdate = Database['public']['Tables']['cash_register_closings']['Update'];

export const cashRegisterService = {
  async getAll(shopId?: string): Promise<CashRegisterClosing[]> {
    const query = supabase
      .from('cash_register_closings')
      .select('*')
      .is('deleted_at', null)
      .order('closing_date', { ascending: false });
    
    if (shopId) {
      query.eq('shop_id', shopId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<CashRegisterClosing | null> {
    const { data, error } = await supabase
      .from('cash_register_closings')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLastClosing(shopId: string): Promise<CashRegisterClosing | null> {
    const { data, error } = await supabase
      .from('cash_register_closings')
      .select('*')
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('closing_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getPreviousDayState(shopId: string): Promise<number> {
    const today = toISODateString();
    
    const { data } = await supabase
      .from('cash_register_closings')
      .select('closing_cash_amount')
      .eq('shop_id', shopId)
      .lt('closing_date', today)
      .is('deleted_at', null)
      .order('closing_date', { ascending: false })
      .limit(1)
      .single();
    
    return data?.closing_cash_amount || 0;
  },

  async getTotalPreviousDayStateForAllShops(): Promise<number> {
    const today = toISODateString();
    
    // Step 1: Get all unique shops that have closings
    const { data: allClosings, error } = await supabase
      .from('cash_register_closings')
      .select('shop_id, closing_cash_amount, closing_date')
      .lt('closing_date', today)
      .is('deleted_at', null)
      .order('closing_date', { ascending: false });
    
    if (error || !allClosings) return 0;
    
    // Step 2: For each shop, get the last closing's cash amount
    const lastClosingPerShop = new Map<string, number>();
    for (const closing of allClosings) {
      if (!lastClosingPerShop.has(closing.shop_id)) {
        lastClosingPerShop.set(closing.shop_id, closing.closing_cash_amount || 0);
      }
    }
    
    // Step 3: Sum them all up
    let total = 0;
    for (const amount of lastClosingPerShop.values()) {
      total += amount;
    }
    
    return total;
  },

  async getByDateRange(
    shopId: string,
    startDate: string,
    endDate: string
  ): Promise<CashRegisterClosing[]> {
    const { data, error } = await supabase
      .from('cash_register_closings')
      .select('*')
      .eq('shop_id', shopId)
      .gte('closing_date', startDate)
      .lte('closing_date', endDate)
      .is('deleted_at', null)
      .order('closing_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(closing: CashRegisterClosingInsert): Promise<CashRegisterClosing> {
    const { data, error } = await supabase
      .from('cash_register_closings')
      .insert([{
        ...closing,
        closed_at: new Date().toISOString()
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async closeDay(params: {
    shopId: string;
    employeeId: string;
    closingCashAmount?: number;
    closingCardAmount?: number;
    totalCashSales?: number;
    totalCardSales?: number;
    totalCosts?: number;
    totalCashCosts?: number; // Nowe: tylko koszty zapłacone gotówką!
    totalDoladowania?: number;
    notes?: string;
    createdBy?: string;
  }): Promise<CashRegisterClosing> {
    const today = toISODateString();
    
    const lastClosing = await this.getLastClosing(params.shopId);
    const openingCash = lastClosing?.closing_cash_amount || 0;
    
    // Obliczamy expectedAmount tylko odejmując KOSZTY GOTÓWKOWE!
    const expectedAmount = openingCash + 
      (params.totalCashSales || 0) + 
      (params.totalDoladowania || 0) - 
      (params.totalCashCosts || params.totalCosts || 0); // Jeśli nie ma totalCashCosts, użyj totalCosts dla wstecznej zgodności
    
    const closingCashAmount = params.closingCashAmount || expectedAmount;
    const difference = closingCashAmount - expectedAmount;
    
    const closingData: CashRegisterClosingInsert = {
      shop_id: params.shopId,
      employee_id: params.employeeId,
      closing_date: today,
      opening_cash_amount: openingCash,
      closing_cash_amount: closingCashAmount,
      closing_card_amount: params.closingCardAmount || 0,
      total_cash_sales: params.totalCashSales || 0,
      total_card_sales: params.totalCardSales || 0,
      total_costs: params.totalCosts || 0,
      total_doladowania: params.totalDoladowania || 0,
      expected_amount: expectedAmount,
      difference: difference,
      notes: params.notes || 'Automatyczne zamknięcie dnia',
      created_by: params.createdBy
    };
    
    return this.create(closingData);
  },

  async update(id: string, updates: CashRegisterClosingUpdate): Promise<CashRegisterClosing> {
    const { data, error } = await supabase
      .from('cash_register_closings')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cash_register_closings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('cash_register_closings')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  },

  async getTodayClosing(shopId: string): Promise<CashRegisterClosing | null> {
    const today = toISODateString();
    
    const { data, error } = await supabase
      .from('cash_register_closings')
      .select('*')
      .eq('shop_id', shopId)
      .eq('closing_date', today)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async isTodayClosed(shopId: string): Promise<boolean> {
    const todayClosing = await this.getTodayClosing(shopId);
    return !!todayClosing;
  },

  async getClosingSummary(shopId: string, days: number = 30): Promise<{
    totalClosings: number;
    averageDailySales: number;
    totalCash: number;
    totalCard: number;
    averageDifference: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const dateStr = toISODateString(startDate);
    
    const closings = await this.getByDateRange(shopId, dateStr, toISODateString());
    
    const totalCash = closings.reduce((sum, c) => sum + (c.closing_cash_amount || 0), 0);
    const totalCard = closings.reduce((sum, c) => sum + (c.closing_card_amount || 0), 0);
    const totalDiff = closings.reduce((sum, c) => sum + (c.difference || 0), 0);
    const avgSales = closings.length > 0 
      ? closings.reduce((sum, c) => sum + (c.total_cash_sales || 0) + (c.total_card_sales || 0), 0) / closings.length 
      : 0;
    const avgDiff = closings.length > 0 ? totalDiff / closings.length : 0;
    
    return {
      totalClosings: closings.length,
      averageDailySales: Math.round(avgSales * 100) / 100,
      totalCash: Math.round(totalCash * 100) / 100,
      totalCard: Math.round(totalCard * 100) / 100,
      averageDifference: Math.round(avgDiff * 100) / 100
    };
  }
};
