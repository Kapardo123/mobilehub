"use client"

import { useState, useEffect, useCallback } from 'react';
import { salesService, costsService, customersService, invoicesService, auditService } from '@/lib/supabase/index';
import { toISODateString, getCurrentTimePL } from '@/lib/dateFormat';

export interface CartItem {
  cat: string;
  name: string;
  price: number;
  profit: number;
  imei?: string;
  taxType?: string;
  comment?: string;
  purchasePrice?: number;
}

export interface SaleGroup {
  id: string;
  ini: string;
  payment: string;
  date: string;
  time: string;
  items: CartItem[];
  employeeName?: string;
  employeeId?: string;
  shopName?: string;
  shopId?: string;
}

export function useSalesData(shopId?: string) {
  const [sales, setSales] = useState<SaleGroup[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [salesData, costsData, customersData, invoicesData] = await Promise.all([
        salesService.getByDateRange(
          toISODateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          toISODateString(),
          shopId
        ),
        costsService.getByDateRange(
          toISODateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          toISODateString(),
          shopId
        ),
        customersService.getAll(),
        invoicesService.getAll()
      ]);

      const formattedSales: SaleGroup[] = salesData.map(sale => ({
        id: sale.id,
        ini: sale.employee?.initials || '??',
        payment: sale.payment_method,
        date: sale.sale_date,
        time: sale.sale_time,
        items: sale.sale_items?.map(item => ({
          cat: item.category || 'inne',
          name: item.product_name,
          price: Number(item.unit_price),
          profit: Number(item.profit) || 0,
          imei: item.imei || undefined,
          taxType: item.tax_type,
          comment: item.comment,
          purchasePrice: Number(item.purchase_cost)
        })) || [],
        employeeName: `${sale.employee?.first_name} ${sale.employee?.last_name}`,
        employeeId: sale.employee_id,
        shopName: sale.shop?.name,
        shopId: sale.shop_id
      }));

      setSales(formattedSales);
      setCosts(costsData);
      setCustomers(customersData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const addSale = async (saleData: {
    items: CartItem[];
    payment: string;
    employeeId: string;
    employeeName: string;
    shopId: string;
    shopName: string;
  }) => {
    try {
      const today = toISODateString();
      const now = getCurrentTimePL();

      const newSale = await salesService.create({
        sale_date: today,
        sale_time: now,
        payment_method: saleData.payment as any,
        total_amount: saleData.items.reduce((sum, item) => sum + item.price, 0),
        total_profit: saleData.items.reduce((sum, item) => sum + (item.profit || 0), 0),
        shop_id: saleData.shopId,
        employee_id: saleData.employeeId,
      }, saleData.items.map(item => ({
        sale_id: '', // Will be set by the service
        product_name: item.name,
        category: item.cat as any,
        unit_price: item.price,
        quantity: 1,
        purchase_cost: item.purchasePrice || 0,
        imei: item.imei,
        tax_type: (item.taxType || 'marza') as any,
        comment: item.comment
      })));

      await auditService.logSale({
        actorId: saleData.employeeId,
        actorName: saleData.employeeName,
        shopId: saleData.shopId,
        shopName: saleData.shopName,
        description: `Sprzedaż: ${saleData.items.map(item => item.name).join(", ")}`,
        details: `${saleData.items.length} pozycji | ${saleData.payment} | Suma: ${saleData.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)} zł`,
        targetId: newSale.id
      });

      await loadSales();
      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const addCost = async (costData: {
    category: string;
    amount: number;
    description: string;
    paymentMethod: string;
    employeeId: string;
    employeeName: string;
    shopId: string;
    shopName: string;
  }) => {
    try {
      const newCost = await costsService.create({
        cost_date: toISODateString(),
        cost_time: getCurrentTimePL(),
        category: costData.category as any,
        amount: costData.amount,
        description: costData.description,
        payment_method: costData.paymentMethod as any,
        shop_id: costData.shopId,
        employee_id: costData.employeeId
      });

      await auditService.logCost({
        actorId: costData.employeeId,
        actorName: costData.employeeName,
        shopId: costData.shopId,
        shopName: costData.shopName,
        description: `Koszt (${costData.category}): ${costData.description}`,
        amount: costData.amount,
        targetId: newCost.id
      });

      await loadSales();
      return newCost;
    } catch (error) {
      console.error('Error adding cost:', error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await salesService.cancel(id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  };

  const deleteCost = async (id: string) => {
    try {
      await costsService.delete(id);
      setCosts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting cost:', error);
      throw error;
    }
  };

  const addCustomer = async (customerData: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
    email?: string;
    nip?: string;
  }) => {
    try {
      const newCustomer = await customersService.create({
        first_name: customerData.firstName || '',
        last_name: customerData.lastName || '',
        company_name: customerData.companyName,
        phone: customerData.phone,
        email: customerData.email,
        nip: customerData.nip,
        customer_type: customerData.companyName ? 'company' : 'individual'
      });
      
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  return {
    sales,
    costs,
    customers,
    invoices,
    isLoading,
    refresh: loadSales,
    addSale,
    addCost,
    deleteSale,
    deleteCost,
    addCustomer
  };
}
