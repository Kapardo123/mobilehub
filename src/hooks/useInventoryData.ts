"use client";

import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/lib/supabase/inventory';
import type { Database } from '@/lib/supabase';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];

interface UseInventoryDataOptions {
  shopId?: string;
  autoLoad?: boolean;
}

export function useInventoryData(options: UseInventoryDataOptions = {}) {
  const { shopId, autoLoad = true } = options;
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data: InventoryItem[];
      
      if (shopId) {
        data = await inventoryService.getByShop(shopId);
      } else {
        data = await inventoryService.getAll();
      }
      
      setInventory(data);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    if (autoLoad) {
      loadInventory();
    }
  }, [autoLoad, loadInventory]);

  const addItem = useCallback(async (itemData: Omit<Database['public']['Tables']['inventory']['Insert'], 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
    try {
      const newItem = await inventoryService.create(itemData as Database['public']['Tables']['inventory']['Insert']);
      setInventory(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('Error adding item:', err);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Database['public']['Tables']['inventory']['Update']): Promise<InventoryItem> => {
    try {
      const updatedItem = await inventoryService.update(id, updates);
      setInventory(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      await inventoryService.softDelete(id);
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }, []);

  const searchItems = useCallback(async (query: string): Promise<InventoryItem[]> => {
    try {
      return await inventoryService.search(query, shopId);
    } catch (err) {
      console.error('Error searching items:', err);
      throw err;
    }
  }, [shopId]);

  const refresh = useCallback(() => {
    return loadInventory();
  }, [loadInventory]);

  return {
    inventory,
    isLoading,
    error,
    loadInventory,
    addItem,
    updateItem,
    deleteItem,
    searchItems,
    refresh
  };
}