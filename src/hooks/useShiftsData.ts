"use client";

import { useState, useEffect, useCallback } from 'react';
import { shiftsService } from '@/lib/supabase/shifts';
import type { Database } from '@/lib/supabase';

type Shift = Database['public']['Tables']['shifts']['Row'];

interface UseShiftsDataOptions {
  shopId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  autoLoad?: boolean;
}

export function useShiftsData(options: UseShiftsDataOptions = {}) {
  const { shopId, employeeId, startDate, endDate, autoLoad = true } = options;
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShiftsFromLocalStorage = useCallback((): Shift[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem('grafik_shifts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (shopId) {
          return parsed.filter((shift: any) => shift.shop_id === shopId);
        }
        if (employeeId) {
          return parsed.filter((shift: any) => shift.employee_id === employeeId);
        }
        return parsed;
      }
    } catch (err) {
      // Silent fail
    }
    
    return [];
  }, [shopId, employeeId]);

  const saveShiftToLocalStorage = useCallback((shift: Shift) => {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = JSON.parse(localStorage.getItem('grafik_shifts') || '[]');
      const index = existing.findIndex((s: any) => s.id === shift.id);
      
      if (index >= 0) {
        existing[index] = shift;
      } else {
        existing.push(shift);
      }
      
      localStorage.setItem('grafik_shifts', JSON.stringify(existing));
    } catch (err) {
      // Silent fail
    }
  }, []);

  const removeShiftFromLocalStorage = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = JSON.parse(localStorage.getItem('grafik_shifts') || '[]');
      const filtered = existing.filter((s: any) => s.id !== id);
      localStorage.setItem('grafik_shifts', JSON.stringify(filtered));
    } catch (err) {
      // Silent fail
    }
  }, []);

  const loadShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data: Shift[];
      
      if (startDate && endDate) {
        data = await shiftsService.getByDateRange(startDate, endDate, shopId);
      } else if (employeeId) {
        data = await shiftsService.getByEmployee(employeeId);
      } else if (shopId) {
        data = await shiftsService.getByShop(shopId);
      } else {
        data = await shiftsService.getAll();
      }
      
      setShifts(data);
    } catch (err) {
      const localShifts = loadShiftsFromLocalStorage();
      setShifts(localShifts as Shift[]);
    } finally {
      setIsLoading(false);
    }
  }, [shopId, employeeId, startDate, endDate, loadShiftsFromLocalStorage]);

  useEffect(() => {
    if (autoLoad) {
      loadShifts();
    }
  }, [autoLoad, loadShifts]);

  const addShift = useCallback(async (shiftData: Database['public']['Tables']['shifts']['Insert']): Promise<Shift> => {
    try {
      const newShift = await shiftsService.create(shiftData);
      setShifts(prev => [newShift, ...prev]);
      return newShift;
    } catch (err) {
      const localShift: Shift = {
        ...shiftData,
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Shift;
      
      setShifts(prev => [localShift, ...prev]);
      saveShiftToLocalStorage(localShift);
      
      return localShift;
    }
  }, [saveShiftToLocalStorage]);

  const updateShift = useCallback(async (id: string, updates: Database['public']['Tables']['shifts']['Update']): Promise<Shift> => {
    try {
      const updatedShift = await shiftsService.update(id, updates);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? updatedShift : shift
      ));
      return updatedShift;
    } catch (err) {
      const localShift = shifts.find(s => s.id === id);
      if (localShift) {
        const updated = { ...localShift, ...updates };
        setShifts(prev => prev.map(shift => 
          shift.id === id ? updated : shift
        ));
        saveShiftToLocalStorage(updated);
        return updated;
      }
      throw err;
    }
  }, [shifts, saveShiftToLocalStorage]);

  const deleteShift = useCallback(async (id: string): Promise<void> => {
    try {
      await shiftsService.delete(id);
      setShifts(prev => prev.filter(shift => shift.id !== id));
    } catch (err) {
      setShifts(prev => prev.filter(shift => shift.id !== id));
      removeShiftFromLocalStorage(id);
    }
  }, [removeShiftFromLocalStorage]);

  const confirmShift = useCallback(async (id: string, confirmedBy: string): Promise<Shift> => {
    try {
      const confirmedShift = await shiftsService.confirm(id, confirmedBy);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? confirmedShift : shift
      ));
      return confirmedShift;
    } catch (err) {
      const localShift = shifts.find(s => s.id === id);
      if (localShift) {
        const confirmed = { ...localShift, status: 'potwierdzony' as const, confirmed_by: confirmedBy };
        setShifts(prev => prev.map(shift => 
          shift.id === id ? confirmed : shift
        ));
        saveShiftToLocalStorage(confirmed);
        return confirmed;
      }
      throw err;
    }
  }, [shifts, saveShiftToLocalStorage]);

  const realizeShift = useCallback(async (id: string): Promise<Shift> => {
    try {
      const realizedShift = await shiftsService.realize(id);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? realizedShift : shift
      ));
      return realizedShift;
    } catch (err) {
      const localShift = shifts.find(s => s.id === id);
      if (localShift) {
        const realized = { ...localShift, status: 'zrealizowany' as const };
        setShifts(prev => prev.map(shift => 
          shift.id === id ? realized : shift
        ));
        saveShiftToLocalStorage(realized);
        return realized;
      }
      throw err;
    }
  }, [shifts, saveShiftToLocalStorage]);

  const cancelShift = useCallback(async (id: string): Promise<Shift> => {
    try {
      const cancelledShift = await shiftsService.cancel(id);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? cancelledShift : shift
      ));
      return cancelledShift;
    } catch (err) {
      const localShift = shifts.find(s => s.id === id);
      if (localShift) {
        const cancelled = { ...localShift, status: 'anulowany' as const };
        setShifts(prev => prev.map(shift => 
          shift.id === id ? cancelled : shift
        ));
        saveShiftToLocalStorage(cancelled);
        return cancelled;
      }
      throw err;
    }
  }, [shifts, saveShiftToLocalStorage]);

  const refresh = useCallback(() => {
    return loadShifts();
  }, [loadShifts]);

  return {
    shifts,
    isLoading,
    error,
    loadShifts,
    addShift,
    updateShift,
    deleteShift,
    confirmShift,
    realizeShift,
    cancelShift,
    refresh
  };
}