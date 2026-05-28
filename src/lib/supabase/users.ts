import { supabase } from '../supabase';
import type { Database } from '../supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByLogin(login: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('login', login)
      .is('deleted_at', null)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(user: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  async login(login: string, password: string): Promise<User | null> {
    const user = await this.getByLogin(login);
    
    if (!user || !user.is_active) return null;
    
    if (user.password_hash === password) {
      await this.update(user.id, { last_login_at: new Date().toISOString() });
      return user;
    }
    
    return null;
  },

  async getActiveUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('last_name');
    
    if (error) throw error;
    return data || [];
  },

  async getEmployees(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['employee', 'admin'])
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('last_name');
    
    if (error) throw error;
    return data || [];
  },

  async getUserShops(userId: string): Promise<{shop_id: string; shop_name: string; is_primary: boolean}[]> {
    const { data, error } = await supabase
      .from('user_shops')
      .select('shop_id, is_primary')
      .eq('user_id', userId)
      .is('unassigned_at', null);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    const shopIds = [...new Set(data.map((row: any) => row.shop_id))];

    const { data: shopsData } = await supabase
      .from('shops')
      .select('id, name')
      .in('id', shopIds);

    const shopMap = new Map();
    (shopsData || []).forEach((shop: any) => shopMap.set(shop.id, shop.name));

    const uniqueShops = new Map();
    data.forEach((row: any) => {
      if (!uniqueShops.has(row.shop_id)) {
        uniqueShops.set(row.shop_id, {
          shop_id: row.shop_id,
          shop_name: shopMap.get(row.shop_id) || 'Nieznany sklep',
          is_primary: row.is_primary
        });
      }
    });
    
    return Array.from(uniqueShops.values());
  },

  async getAllWithShops(): Promise<(User & {shops: {shop_id: string; shop_name: string; is_primary: boolean}[]})[]> {
    const users = await this.getAll();
    
    const usersWithShops = await Promise.all(
      users.map(async user => {
        const shops = await this.getUserShops(user.id);
        return { ...user, shops };
      })
    );
    
    return usersWithShops;
  }
};
