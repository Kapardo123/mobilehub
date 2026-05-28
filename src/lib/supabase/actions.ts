import { supabase } from '../supabase';
import type { Database } from '../supabase';

type AuditLog = Database['public']['Tables']['audit_log']['Row'];
type AuditLogInsert = Database['public']['Tables']['audit_log']['Insert'];

export interface Action extends AuditLog {
  type?: string;
  employeeName?: string;
  shopName?: string;
  employeeId?: string;
  shopId?: string;
  timestamp?: string;
}

export const auditService = {
  async getAll(limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select(`
        *,
        actor_user:actor_id(id, first_name, last_name, initials),
        shop_data:shop_id(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ Błąd pobierania akcji:', error);
      throw error;
    }
    
    console.log('📊 Pobrano akcje:', data?.length, 'sztuk');
    
    const result = [];
    
    for (const log of (data || [])) {
      let finalActorName = log.actor_name;
      let finalShopName = log.shop_name;
      
      console.log(`🔄 Przetwarzanie akcji ${log.id}:`);
      console.log(`   actor_name (z bazy): "${log.actor_name}"`);
      console.log(`   shop_name (z bazy): "${log.shop_name}"`);
      
      if (!finalActorName && log.actor_user?.first_name && log.actor_user?.last_name) {
        finalActorName = `${log.actor_user.first_name} ${log.actor_user.last_name}`;
        console.log(`   ✅ Uzupełniono imię z JOIN: "${finalActorName}"`);
      }
      
      if (!finalShopName && log.shop_data?.name) {
        finalShopName = log.shop_data.name;
        console.log(`   ✅ Uzupełniono sklep z JOIN: "${finalShopName}"`);
      }
      
      if (!finalShopName && log.actor_id) {
        try {
          const { data: userShops } = await supabase
            .from('user_shops')
            .select(`
              shop:shop_id(name)
            `)
            .eq('user_id', log.actor_id)
            .eq('is_primary', true)
            .limit(1);
          
          if (userShops && Array.isArray(userShops) && userShops.length > 0 && userShops[0]?.shop && typeof userShops[0].shop === 'object' && !Array.isArray(userShops[0].shop) && 'name' in userShops[0].shop) {
            finalShopName = (userShops[0].shop as any).name;
            console.log(`   ✅ Uzupełniono sklep z user_shops: "${finalShopName}"`);
          }
        } catch (e) {
          console.warn(`   ⚠️ Nie udało się pobrać sklepu dla użytkownika:`, log.actor_id);
        }
      }
      
      const processedLog = {
        ...log,
        actor_name: finalActorName,
        shop_name: finalShopName
      };
      
      console.log(`   🎯 WYNIK KOŃCOWY:`);
      console.log(`      actor_name: "${processedLog.actor_name}"`);
      console.log(`      shop_name: "${processedLog.shop_name}"`);
      
      result.push(processedLog);
    }
    
    return result;
  },

  async getByActor(actorId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('actor_id', actorId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getByShop(shopId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async addAction(action: Omit<AuditLogInsert, 'id' | 'created_at'>): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_log')
      .insert({
        ...action,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async logSale(saleData: {
    actorId: string;
    actorName: string;
    shopId: string;
    shopName: string;
    description: string;
    details?: string;
    targetId: string;
  }): Promise<void> {
    await this.addAction({
      action_type: 'sprzedaz',
      description: saleData.description,
      details: saleData.details,
      actor_id: saleData.actorId,
      actor_name: saleData.actorName,
      shop_id: saleData.shopId,
      shop_name: saleData.shopName,
      target_table: 'sales',
      target_id: saleData.targetId,
      target_type: 'sale'
    });
  },

  async logCost(costData: {
    actorId: string;
    actorName: string;
    shopId: string;
    shopName: string;
    description: string;
    amount: number;
    targetId: string;
  }): Promise<void> {
    await this.addAction({
      action_type: 'koszt',
      description: costData.description,
      details: `Kwota: ${costData.amount} PLN`,
      actor_id: costData.actorId,
      actor_name: costData.actorName,
      shop_id: costData.shopId,
      shop_name: costData.shopName,
      target_table: 'costs',
      target_id: costData.targetId,
      target_type: 'cost'
    });
  },

  async logLogin(userData: {
    userId: string;
    userName: string;
    shopId?: string;
    shopName?: string;
  }): Promise<void> {
    await this.addAction({
      action_type: 'logowanie',
      description: `${userData.userName} zalogował się`,
      actor_id: userData.userId,
      actor_name: userData.userName,
      shop_id: userData.shopId,
      shop_name: userData.shopName
    });
  },

  async filterActions(filters?: {
    type?: string;
    shopId?: string;
    employeeId?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    let queryBuilder = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 100);
    
    if (filters?.type && filters.type !== 'all') {
      queryBuilder = queryBuilder.eq('action_type', filters.type);
    }
    
    if (filters?.shopId && filters.shopId !== 'all') {
      queryBuilder = queryBuilder.eq('shop_id', filters.shopId);
    }
    
    if (filters?.actorId && filters.employeeId !== 'all') {
      queryBuilder = queryBuilder.eq('actor_id', filters.employeeId);
    }
    
    if (filters?.startDate) {
      queryBuilder = queryBuilder.gte('created_at', filters.startDate);
    }
    
    if (filters?.endDate) {
      queryBuilder = queryBuilder.lte('created_at', filters.endDate + 'T23:59:59');
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const { error } = await supabase
      .from('audit_log')
      .delete()
      .eq('shop_id', shopId);
    
    if (error) throw error;
  }
};
