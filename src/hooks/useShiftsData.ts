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
      console.error('Error loading shifts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shifts');
    } finally {
      setIsLoading(false);
    }
  }, [shopId, employeeId, startDate, endDate]);

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
      console.error('Error adding shift:', err);
      throw err;
    }
  }, []);

  const updateShift = useCallback(async (id: string, updates: Database['public']['Tables']['shifts']['Update']): Promise<Shift> => {
    try {
      const updatedShift = await shiftsService.update(id, updates);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? updatedShift : shift
      ));
      return updatedShift;
    } catch (err) {
      console.error('Error updating shift:', err);
      throw err;
    }
  }, []);

  const deleteShift = useCallback(async (id: string): Promise<void> => {
    try {
      await shiftsService.delete(id);
      setShifts(prev => prev.filter(shift => shift.id !== id));
    } catch (err) {
      console.error('Error deleting shift:', err);
      throw err;
    }
  }, []);

  const confirmShift = useCallback(async (id: string, confirmedBy: string): Promise<Shift> => {
    try {
      const confirmedShift = await shiftsService.confirm(id, confirmedBy);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? confirmedShift : shift
      ));
      return confirmedShift;
    } catch (err) {
      console.error('Error confirming shift:', err);
      throw err;
    }
  }, []);

  const realizeShift = useCallback(async (id: string): Promise<Shift> => {
    try {
      const realizedShift = await shiftsService.realize(id);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? realizedShift : shift
      ));
      return realizedShift;
    } catch (err) {
      console.error('Error realizing shift:', err);
      throw err;
    }
  }, []);

  const cancelShift = useCallback(async (id: string): Promise<Shift> => {
    try {
      const cancelledShift = await shiftsService.cancel(id);
      setShifts(prev => prev.map(shift => 
        shift.id === id ? cancelledShift : shift
      ));
      return cancelledShift;
    } catch (err) {
      console.error('Error cancelling shift:', err);
      throw err;
    }
  }, []);

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