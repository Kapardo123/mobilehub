import { supabase } from '../supabase';

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
};

export interface ShopAccessLog {
  id: string;
  shop_id: string;
  shop_name: string;
  user_id: string;
  user_name: string;
  user_role: 'owner' | 'employee' | 'admin';
  action: 'login' | 'logout' | 'block' | 'unblock';
  previous_status: 'available' | 'occupied';
  new_status: 'available' | 'occupied';
  timestamp: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

export interface ShopAccessStatus {
  shopId: string;
  shopName: string;
  isAvailable: boolean;
  occupiedBy?: {
    userId: string;
    userName: string;
    userRole: string;
    since: string;
  };
  lastChange?: string;
}

interface BlockedShop {
  shopId: string;
  shopName: string;
  blockedBy: string;
  blockedByName: string;
  blockedAt: string;
  sessionId: string;
}

const BLOCKED_SHOPS_KEY = 'blocked_shops';
const ACCESS_SESSION_ID = 'access_session_id';

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const shopAccessService = {
  async initializeShopAccess(
    userId: string,
    userName: string,
    userRole: 'owner' | 'employee' | 'admin',
    shopId: string,
    shopName: string
  ): Promise<ShopAccessStatus[]> {
    console.log('=== INICJALIZACJA DOSTĘPU DO SKLEPU ===');
    console.log('User:', userName, 'Role:', userRole);
    console.log('Shop:', shopName, 'ID:', shopId);

    if (userRole === 'owner' || userRole === 'admin') {
      console.log('Właściciel/Admin - pełny dostęp do wszystkich sklepów');
      const allShops = await this.getAllShopsStatus();
      return allShops.map(shop => ({
        ...shop,
        isAvailable: true
      }));
    }

    const sessionId = sessionStorage.getItem(ACCESS_SESSION_ID) || generateSessionId();
    sessionStorage.setItem(ACCESS_SESSION_ID, sessionId);

    await this.blockShopForUser(userId, userName, userRole, shopId, shopName, sessionId);

    const updatedStatus = await this.getAllShopsStatus();
    return updatedStatus;
  },

  async blockShopForUser(
    userId: string,
    userName: string,
    userRole: 'owner' | 'employee' | 'admin',
    shopId: string,
    shopName: string,
    sessionId: string
  ): Promise<void> {
    console.log('=== BLOKOWANIE SKLEPU ===');
    console.log('Shop:', shopName, 'przez:', userName);

    const currentBlocked = this.getBlockedShopsFromStorage();
    const existingBlock = currentBlocked.find(b => b.shopId === shopId);

    if (existingBlock && existingBlock.blockedBy !== userId) {
      throw new Error(`Sklep "${shopName}" jest obecnie zajęty przez użytkownika ${existingBlock.blockedByName}`);
    }

    if (!existingBlock) {
      const blockedShop: BlockedShop = {
        shopId,
        shopName,
        blockedBy: userId,
        blockedByName: userName,
        blockedAt: new Date().toISOString(),
        sessionId
      };

      currentBlocked.push(blockedShop);
      this.saveBlockedShopsToStorage(currentBlocked);

      await this.logAccessChange({
        shop_id: shopId,
        shop_name: shopName,
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        action: 'block',
        previous_status: 'available',
        new_status: 'occupied',
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        metadata: { reason: 'auto_block_on_login' }
      });

      console.log('✅ Sklep zablokowany:', shopName);
    } else {
      console.log('ℹ️ Sklep już zablokowany przez tego samego użytkownika');
    }
  },

  async unblockShopOnLogout(
    userId: string,
    shopId: string,
    sessionId?: string
  ): Promise<void> {
    console.log('=== ODBLOKOWANIE SKLEPU PRZY WYLOGOWANIU ===');

    const currentBlocked = this.getBlockedShopsFromStorage();
    const blockIndex = currentBlocked.findIndex(
      b => b.shopId === shopId && b.blockedBy === userId
    );

    if (blockIndex !== -1) {
      const removed = currentBlocked.splice(blockIndex, 1)[0];
      this.saveBlockedShopsToStorage(currentBlocked);

      await this.logAccessChange({
        shop_id: shopId,
        shop_name: removed.shopName,
        user_id: userId,
        user_name: removed.blockedByName,
        user_role: 'employee',
        action: 'unblock',
        previous_status: 'occupied',
        new_status: 'available',
        timestamp: new Date().toISOString(),
        session_id: sessionId || removed.sessionId,
        metadata: { reason: 'auto_unblock_on_logout' }
      });

      console.log('✅ Sklep odblokowany:', removed.shopName);
    }
  },

  async unblockAllShopsForUser(userId: string): Promise<void> {
    console.log('=== ODBLOKOWANIE WSZYSTKICH SKLEPÓW DLA UŻYTKOWNIKA ===');

    const currentBlocked = this.getBlockedShopsFromStorage();
    const userBlocks = currentBlocked.filter(b => b.blockedBy === userId);

    for (const block of userBlocks) {
      await this.unblockShopOnLogout(userId, block.shopId, block.sessionId);
    }
  },

  async getAllShopsStatus(): Promise<ShopAccessStatus[]> {
    try {
      const { data: shops, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;

      const blockedShops = this.getBlockedShopsFromStorage();

      const statusList: ShopAccessStatus[] = (shops || []).map(shop => {
        const blocked = blockedShops.find(b => b.shopId === shop.id);

        return {
          shopId: shop.id,
          shopName: shop.name,
          isAvailable: !blocked,
          occupiedBy: blocked ? {
            userId: blocked.blockedBy,
            userName: blocked.blockedByName,
            userRole: 'employee',
            since: blocked.blockedAt
          } : undefined,
          lastChange: blocked?.blockedAt
        };
      });

      return statusList;
    } catch (error) {
      console.error('Błąd pobierania statusu sklepów:', error);
      return [];
    }
  },

  async getAvailableShopsForUser(
    userRole: 'owner' | 'employee' | 'admin'
  ): Promise<ShopAccessStatus[]> {
    const allStatus = await this.getAllShopsStatus();

    if (userRole === 'owner' || userRole === 'admin') {
      return allStatus.map(s => ({ ...s, isAvailable: true }));
    }

    return allStatus.filter(s => s.isAvailable);
  },

  isShopAccessible(shopId: string, userRole: 'owner' | 'employee' | 'admin'): boolean {
    if (userRole === 'owner' || userRole === 'admin') {
      return true;
    }

    const blockedShops = this.getBlockedShopsFromStorage();
    const isBlocked = blockedShops.some(b => b.shopId === shopId);
    return !isBlocked;
  },

  getBlockedShopsCount(): number {
    return this.getBlockedShopsFromStorage().length;
  },

  getBlockedShopsInfo(): BlockedShop[] {
    return this.getBlockedShopsFromStorage();
  },

  async getAccessLogs(shopId?: string, limit: number = 50): Promise<ShopAccessLog[]> {
    try {
      let query = supabase
        .from('shop_access_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Tabela shop_access_logs może nie istnieć jeszcze:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Błąd pobierania logów dostępu:', error);
      return this.getAccessLogsFromFallback();
    }
  },

  async logAccessChange(logData: Omit<ShopAccessLog, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('shop_access_logs')
        .insert([{
          ...logData,
          id: generateId()
        }]);

      if (error) {
        console.warn('Błąd zapisu logu do bazy:', error.message);
        this.saveLogToFallback(logData);
      } else {
        console.log('✅ Zapisano log dostępu do bazy');
      }
    } catch (error) {
      console.error('Błąd logowania zmiany dostępu:', error);
      this.saveLogToFallback(logData);
    }
  },

  clearSession(): void {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.unblockAllShopsForUser(userId).catch(console.error);
    }
    sessionStorage.removeItem(ACCESS_SESSION_ID);
  },

  getBlockedShopsFromStorage(): BlockedShop[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(BLOCKED_SHOPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveBlockedShopsToStorage(shops: BlockedShop[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BLOCKED_SHOPS_KEY, JSON.stringify(shops));
  },

  saveLogToFallback(logData: Omit<ShopAccessLog, 'id'>): void {
    try {
      const fallbackKey = 'shop_access_logs_fallback';
      const existing = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
      existing.push({ ...logData, id: generateId() });

      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.setItem(fallbackKey, JSON.stringify(existing));
    } catch (error) {
      console.error('Błąd zapisu logu do fallback:', error);
    }
  },

  getAccessLogsFromFallback(): ShopAccessLog[] {
    try {
      const fallbackKey = 'shop_access_logs_fallback';
      const stored = localStorage.getItem(fallbackKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  syncFallbackLogsToDatabase(): void {
    const fallbackLogs = this.getAccessLogsFromFallback();
    if (fallbackLogs.length === 0) return;

    console.log(`🔄 Synchronizacja ${fallbackLogs.length} logów do bazy...`);

    fallbackLogs.forEach(async (log) => {
      try {
        const { error } = await supabase
          .from('shop_access_logs')
          .insert([log]);

        if (!error) {
          const fallbackKey = 'shop_access_logs_fallback';
          const remaining = this.getAccessLogsFromFallback().filter(l => l.id !== log.id);
          localStorage.setItem(fallbackKey, JSON.stringify(remaining));
        }
      } catch (error) {
        console.error('Błąd synchronizacji logu:', error);
      }
    });
  }
};
