"use client";

import { useState, useEffect, useCallback } from 'react';
import { invoicesService, invoiceItemsService } from '@/lib/supabase/invoices';
import type { Database } from '@/lib/supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  customer?: any;
  shop?: any;
  employee?: {
    id: string;
    first_name?: string;
    last_name?: string;
    initials?: string;
  };
  sale?: any;
  invoice_items?: any[];
};
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];

interface UseInvoicesDataOptions {
  autoLoad?: boolean;
}

export function useInvoicesData(options: UseInvoicesDataOptions = {}) {
  const { autoLoad = true } = options;
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await invoicesService.getAll();
      
      setInvoices(data);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadInvoices();
    }
  }, [autoLoad, loadInvoices]);

  const addInvoice = useCallback(async (
    invoiceData: Database['public']['Tables']['invoices']['Insert'],
    items?: Database['public']['Tables']['invoice_items']['Insert'][]
  ): Promise<Invoice> => {
    try {
      const newInvoice = await invoicesService.create(invoiceData, items || []);
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      console.error('Error adding invoice:', err);
      throw err;
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, updates: Database['public']['Tables']['invoices']['Update']): Promise<Invoice> => {
    try {
      const updatedInvoice = await invoicesService.update(id, updates);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? updatedInvoice : invoice
      ));
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice:', err);
      throw err;
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string): Promise<void> => {
    try {
      await invoicesService.delete(id);
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw err;
    }
  }, []);

  const issueInvoice = useCallback(async (id: string): Promise<Invoice> => {
    try {
      const issuedInvoice = await invoicesService.issue(id);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? issuedInvoice : invoice
      ));
      return issuedInvoice;
    } catch (err) {
      console.error('Error issuing invoice:', err);
      throw err;
    }
  }, []);

  const markAsPaid = useCallback(async (id: string): Promise<Invoice> => {
    try {
      const paidInvoice = await invoicesService.markAsPaid(id);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? paidInvoice : invoice
      ));
      return paidInvoice;
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      throw err;
    }
  }, []);

  const cancelInvoice = useCallback(async (id: string): Promise<Invoice> => {
    try {
      const cancelledInvoice = await invoicesService.cancel(id);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? cancelledInvoice : invoice
      ));
      return cancelledInvoice;
    } catch (err) {
      console.error('Error cancelling invoice:', err);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    return loadInvoices();
  }, [loadInvoices]);

  return {
    invoices,
    isLoading,
    error,
    loadInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    issueInvoice,
    markAsPaid,
    cancelInvoice,
    refresh
  };
}