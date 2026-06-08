"use client"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Users, Search, ClipboardList, Calendar as CalendarIcon, MapPin, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import { CreditCard, Banknote, ArrowRight, DollarSign, Package, Wrench, Settings, User, Clock, Zap, TrendingUp } from "lucide-react";
import { addAction, getActions, Action } from "./akcje/page";
import { cashRegisterService } from "@/lib/supabase/cashRegister";
import { shopsService } from "@/lib/supabase/shops";
import { salesService } from "@/lib/supabase/sales";
import { costsService } from "@/lib/supabase/costs";
import { formatDatePL, formatTimePL, toISODateString, getCurrentTimePL } from "@/lib/dateFormat";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedShop, setSelectedShop] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCloseDayDialogOpen, setIsCloseDayDialogOpen] = useState(false);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [isTodayClosed, setIsTodayClosed] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [recentActions, setRecentActions] = useState<Action[]>([]);
  const [actionFilterShop, setActionFilterShop] = useState<string>("all");
  const [actionFilterEmployee, setActionFilterEmployee] = useState<string>("all");
  const [employees, setEmployees] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [stanKasyPoprzedniegoDnia, setStanKasyPoprzedniegoDnia] = useState<number>(0);
  const [shops, setShops] = useState<{id: string; name: string}[]>([]);
  const { addToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [routeKey, setRouteKey] = useState(0);
  const today = toISODateString();
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Zasilanie gotówką state
  const [isCashTopUpDialogOpen, setIsCashTopUpDialogOpen] = useState(false);
  const [cashTopUpAmount, setCashTopUpAmount] = useState<string>('');
  const [cashTopUpDescription, setCashTopUpDescription] = useState<string>('');
  const [cashTopUpShopId, setCashTopUpShopId] = useState<string>('');

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const shopsData = await shopsService.getAll();
      setShops(shopsData.map(shop => ({
        id: shop.id,
        name: shop.name
      })));
      console.log('Pobrano sklepy na głównej stronie:', shopsData.length);
    } catch (error) {
      console.error('Błąd podczas pobierania sklepów:', error);
    }
  };
  
  const handleAddCashTopUp = async () => {
    if (!cashTopUpAmount || !cashTopUpDescription || !cashTopUpShopId) {
      addToast({ message: "Wypełnij wszystkie pola (kwota, opis, sklep)", variant: "error" });
      return;
    }
    
    const employeeId = getSessionStorageSafe("userId", "");
    const employeeName = getSessionStorageSafe("userName", "Pracownik");
    
    // Używamy sklepu wybranego w formularzu dialogowym
    const effectiveShopId = cashTopUpShopId;
    const effectiveShopName = shops.find(s => s.id === cashTopUpShopId)?.name || "Nieznany sklep";
    
    if (!effectiveShopId) {
      addToast({ message: "❌ Błąd: Brak ID sklepu", variant: "error" });
      return;
    }
    
    if (!employeeId) {
      addToast({ message: "❌ Błąd: Brak ID pracownika", variant: "error" });
      return;
    }
    
    try {
      const costData = {
        cost_date: toISODateString(),
        cost_time: getCurrentTimePL(),
        category: 'gotowka',
        amount: parseFloat(cashTopUpAmount),
        description: cashTopUpDescription,
        payment_method: 'gotowka',
        shop_id: effectiveShopId,
        employee_id: employeeId
      };
      
      console.log('📤 Dane do zapisu zasilania gotówką:', costData);
      
      const savedCost = await costsService.create(costData);
      console.log('✅ Zasilanie zapisane pomyślnie:', savedCost);
      
      // Aktualizuj stan lokalny
      const newCostForState: any = {
        id: savedCost.id,
        dbId: savedCost.id,
        date: savedCost.cost_date,
        time: savedCost.cost_time || new Date(savedCost.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
        category: savedCost.category,
        amount: savedCost.amount,
        description: savedCost.description,
        shop: effectiveShopName,
        employeeId,
        employeeName,
        paymentMethod: savedCost.payment_method
      };
      
      setCosts(prev => [newCostForState, ...prev]);
      
      // Dodaj akcję
      addAction({
        action_type: 'koszt',
        description: `Zasilanie gotówką: ${cashTopUpDescription}`,
        actor_id: employeeId,
        actor_name: employeeName,
        shop_id: effectiveShopId,
        shop_name: effectiveShopName,
        details: `${cashTopUpAmount} zł`,
        target_table: 'costs',
        target_id: savedCost.id,
        target_type: 'cost'
      });
      
      addToast({ message: `✅ Zasilanie dodane: ${cashTopUpAmount} zł`, variant: "success" });
      
      // Reset formularza
      setCashTopUpAmount('');
      setCashTopUpDescription('');
      setIsCashTopUpDialogOpen(false);
      
      // Odśwież dane (wywołaj zdarzenie)
      window.dispatchEvent(new CustomEvent('costs_updated'));
      
    } catch (dbError: any) {
      console.error('❌ Błąd zapisu zasilania:', dbError);
      console.error('❌ Błąd (JSON):', JSON.stringify(dbError));
      
      let errorMessage = 'Nieznany błąd';
      if (dbError?.code === '42501') errorMessage = 'Brak uprawnień (RLS)';
      else if (dbError?.code === '23502') errorMessage = 'Brak wymaganych pól';
      else if (dbError?.message && typeof dbError.message === 'string') errorMessage = dbError.message;
      else if (dbError?.details && typeof dbError.details === 'string') errorMessage = dbError.details;
      else if (Object.keys(dbError).length > 0) errorMessage = JSON.stringify(dbError);
      
      addToast({
        message: `❌ Błąd zapisu zasilania: ${errorMessage}`,
        variant: "error"
      });
    }
  };

  useEffect(() => {
    const handleShopsUpdated = () => {
      loadShops();
    };
    
    window.addEventListener('shops_updated', handleShopsUpdated);
      return () => window.removeEventListener('shops_updated', handleShopsUpdated);
  }, []);

  // Nasłuchuj zmian w sprzedaży i kosztach, aby odświeżyć dane
  useEffect(() => {
    const handleSalesUpdated = () => {
      // Trigger re‑load of sales
      setIsMounted(false);
      setTimeout(() => setIsMounted(true), 50);
    };

    const handleCostsUpdated = () => {
      // Trigger re‑load of costs
      setIsMounted(false);
      setTimeout(() => setIsMounted(true), 50);
    };

    window.addEventListener('sales_updated', handleSalesUpdated);
    window.addEventListener('costs_updated', handleCostsUpdated);
    
    return () => {
      window.removeEventListener('sales_updated', handleSalesUpdated);
      window.removeEventListener('costs_updated', handleCostsUpdated);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = getLocalStorageSafe('pracownicy_employees', []);
    setEmployees(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
    const userName = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');
    const userInitials = sessionStorage.getItem('userInitials');
    const shopName = sessionStorage.getItem('shopName');
    const shopId = sessionStorage.getItem('shopId');

    const cleanString = (val: string | null) => {
      if (!val) return val;
      let cleaned = val;
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      return cleaned;
    };

    if (userName && userId && (!activeEmployees || activeEmployees.length === 0)) {
      console.log('⚠️ Brak activeEmployees - tworzę automatycznie z danych sesji!');
      const autoEmployee = {
        id: cleanString(userId),
        name: cleanString(userName),
        initials: cleanString(userInitials) || `${(cleanString(userName) || '?')[0] || '?'}${((cleanString(userName) || '').split(' ')[1] || '')[0] || '?'}`,
        shop: cleanString(shopName) || 'Nieznany sklep',
        shopId: cleanString(shopId) || 'unknown',
        role: cleanString(sessionStorage.getItem('userRole')) || 'owner'
      };
      sessionStorage.setItem('activeEmployees', JSON.stringify([autoEmployee]));
      if (userId) {
        sessionStorage.setItem('selectedEmployeeId', userId.replace(/^"|"$/g, '') || userId);
      }
      console.log('Utworzono activeEmployees:', autoEmployee);
    }

    const finalActiveEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
    const valid = finalActiveEmployees.length > 0 && !!userName && !!userId;
    setHasValidSession(valid);
    setIsSessionChecked(true);
  }, []);

  // Load sales from Supabase
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const loadSalesFromSupabase = async () => {
      try {
        const shopId = getSessionStorageSafe("shopId", "");
        
        // Dla właściciela: używaj wybranego sklepu zamiast sessionStorage
        const userRole = getSessionStorageSafe("userRole", "");
        const effectiveShopId = userRole === 'employee' 
          ? shopId 
          : (selectedShop === 'all' ? '' : selectedShop);

        console.log('Strona główna: Ładowanie sprzedaży z Supabase, effectiveShopId:', effectiveShopId, ', selectedDate:', selectedDate);

        let salesData: any[] = [];
        if (effectiveShopId) {
          const allSales = await salesService.getByShop(effectiveShopId);
          salesData = allSales.filter(sale => sale.sale_date === selectedDate);
        } else {
          const selectedDateObj = new Date(selectedDate);
          const tomorrow = new Date(selectedDateObj);
          tomorrow.setDate(tomorrow.getDate() + 1);
          salesData = await salesService.getByDateRange(
            selectedDate,
            toISODateString(tomorrow)
          );
        }

        const mappedSales = salesData.map((dbSale: any) => ({
          id: dbSale.id,
          dbId: dbSale.id,
          ini: dbSale.employee?.initials || '???',
          employeeName: dbSale.employee?.first_name + ' ' + dbSale.employee?.last_name || '',
          employeeId: dbSale.employee_id,
          shopName: dbSale.shop?.name || '',
          shopId: dbSale.shop_id,
          payment: dbSale.payment_method === 'gotowka' ? 'gotówka' : 'karta',
          date: dbSale.sale_date,
          time: dbSale.sale_time,
          totalPrice: parseFloat(dbSale.total_amount) || 0,
          totalProfit: parseFloat(dbSale.total_profit) || 0,
          items: (dbSale.sale_items || []).map((item: any) => ({
            id: item.id,
            cat: item.category,
            name: item.product_name,
            price: parseFloat(item.unit_price) || 0,
            profit: (parseFloat(item.unit_price) || 0) - (parseFloat(item.purchase_cost) || 0),
            imei: item.imei || '',
            taxType: item.tax_type,
            comment: item.comment || ''
          }))
        }));

        setSales(mappedSales);
        console.log('✅ Strona główna: Załadowano', mappedSales.length, 'sprzedaży z Supabase');
      } catch (error) {
        console.error('Strona główna: Błąd ładowania sprzedaży:', error);
      }
    };

    loadSalesFromSupabase();
  }, [isMounted, selectedShop, selectedDate]);

  // Load costs from Supabase
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const loadCostsFromSupabase = async () => {
      try {
        const shopId = getSessionStorageSafe("shopId", "");
        
        // Dla właściciela: używaj wybranego sklepu zamiast sessionStorage
        const userRole = getSessionStorageSafe("userRole", "");
        const effectiveShopId = userRole === 'employee' 
          ? shopId 
          : (selectedShop === 'all' ? '' : selectedShop);

        console.log('Strona główna: Ładowanie kosztów z Supabase, effectiveShopId:', effectiveShopId, ', selectedDate:', selectedDate);

        let costsData: any[] = [];
        if (effectiveShopId) {
          const allCosts = await costsService.getByShop(effectiveShopId);
          costsData = allCosts.filter(cost => cost.cost_date === selectedDate);
        } else {
          const selectedDateObj = new Date(selectedDate);
          const tomorrow = new Date(selectedDateObj);
          tomorrow.setDate(tomorrow.getDate() + 1);
          costsData = await costsService.getByDateRange(
            selectedDate,
            toISODateString(tomorrow)
          );
        }

        const mappedCosts = costsData.map((dbCost: any) => ({
          id: dbCost.id,
          dbId: dbCost.id,
          date: dbCost.cost_date,
          time: dbCost.cost_time || new Date(dbCost.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          category: dbCost.category,
          amount: parseFloat(dbCost.amount) || 0,
          description: dbCost.description,
          shop: dbCost.shop?.name || '',
          shopId: dbCost.shop_id, // DODANO shopId!
          employeeId: dbCost.employee_id,
          employeeName: dbCost.employee?.first_name + ' ' + dbCost.employee?.last_name || '',
          paymentMethod: dbCost.payment_method
        }));

        setCosts(mappedCosts);
        console.log('✅ Strona główna: Załadowano', mappedCosts.length, 'kosztów z Supabase');
      } catch (error) {
        console.error('Strona główna: Błąd ładowania kosztów:', error);
      }
    };

    loadCostsFromSupabase();
  }, [isMounted, selectedShop, selectedDate]);


  
  useEffect(() => {
    setIsMounted(true);
    
    // Nasłuchuj na cofanie w przeglądarce (Back/Forward buttons)
    const handlePopState = () => {
      console.log('🔄 POPSTATE - Cofanie się! Resetuję stan...');
      setIsMounted(false);
      setTimeout(() => setIsMounted(true), 50);  // Małe opóźnienie dla pewności
      setRouteKey(prev => prev + 1);  // Wymuś pełny re-render!
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);  // Reset przy każdej zmianie trasy
  
  // Pobierz rolę i sklep z sesji (tylko po mount, aby uniknąć błędu hydratacji)
  const currentUserRole = isMounted ? getSessionStorageSafe("userRole", "") : "";
  const currentShopId = isMounted ? getSessionStorageSafe("shopId", "") : "";
  const currentShopName = isMounted ? getSessionStorageSafe("shopName", "") : "";
  const isEmployee = currentUserRole === 'employee';
  
  useEffect(() => {
    const loadCashState = async () => {
      try {
        if (typeof window === "undefined" || !isMounted) return;
        const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
        const shopId = activeEmployees[0]?.shopId || '';
        
        if (currentUserRole === 'employee') {
          const previousDayState = await cashRegisterService.getPreviousDayState(shopId, selectedDate);
          setStanKasyPoprzedniegoDnia(previousDayState);
        } else {
          if (selectedShop === 'all') {
            const totalPreviousDayState = await cashRegisterService.getTotalPreviousDayStateForAllShops(selectedDate);
            setStanKasyPoprzedniegoDnia(totalPreviousDayState);
          } else {
            const previousDayState = await cashRegisterService.getPreviousDayState(selectedShop, selectedDate);
            setStanKasyPoprzedniegoDnia(previousDayState);
          }
        }
      } catch (error) {
        console.error('Błąd pobierania stanu kasy:', error);
      }
    };
    
    loadCashState();
  }, [selectedShop, currentUserRole, isMounted, selectedDate]);
  
  console.log('=== OBLICZANIE ZYSKU - GŁÓWNA STRONA ===');
  console.log('User Role:', currentUserRole);
  console.log('Shop ID:', currentShopId);
  console.log('Shop Name:', currentShopName);
  console.log('Total sales in Supabase:', sales.length);
  console.log('Total costs in Supabase:', costs.length);
  
  // Określ który sklep filtrować (zależnie od roli i wyboru w UI)
  const effectiveShopId = currentUserRole === 'employee' 
    ? currentShopId  // Employee: zawsze jego sklep
    : (selectedShop === 'all' ? null : selectedShop);  // Owner: wybrany w select
  
  const effectiveShopName = effectiveShopId 
    ? shops.find(s => s.id === effectiveShopId)?.name || currentShopName
    : currentShopName;
  
  console.log('🔍 Filtrowanie po sklepie:', {
    selectedShop,
    effectiveShopId,
    effectiveShopName,
    currentUserRole
  });
  
  // Filtrowanie sprzedaży po sklepie
  const filteredSales = effectiveShopId
    ? sales.filter((s: any) => {
        if (s.shopId && s.shopId !== effectiveShopId) return false;
        if (!s.shopId && s.shopName && s.shopName !== effectiveShopName) return false;
        return true;
      })
    : sales;
  
  // Filtrowanie kosztów po sklepie
  const filteredCosts = effectiveShopId
    ? costs.filter((c: any) => {
        if (c.shopId && c.shopId !== effectiveShopId) return false;
        if (c.shop && c.shop !== effectiveShopName) return false;
        return true;
      })
    : costs;
  
  console.log('Filtered sales (po sklepie):', filteredSales.length);
  console.log('Filtered costs (po sklepie):', filteredCosts.length);
  
  // Koszty wybranego dnia (BEZ doładowań gotówki!)
  const todayCosts = filteredCosts.filter((c: any) => c.date === selectedDate);
  const totalCostsToday = todayCosts
    .filter((c: any) => c.category !== 'gotowka')  // ← Wykluczamy doładowania!
    .reduce((sum: number, c: any) => {
      const amount = typeof c.amount === 'number' ? c.amount : parseFloat(c.amount) || 0;
      return sum + amount;
    }, 0);

  // Koszty zapłacone gotówką (np. skup telefonów) - do odejmowania od kasy!
  const cashCostsToday = todayCosts
    .filter((c: any) => c.paymentMethod === 'gotowka' && c.category !== 'gotowka')
    .reduce((sum: number, c: any) => {
      const amount = typeof c.amount === 'number' ? c.amount : parseFloat(c.amount) || 0;
      return sum + amount;
    }, 0);

  // Doładowania (zasilanie gotówką) - osobno, nie wliczane do kosztów!
  const doladowaniaToday = todayCosts
    .filter((c: any) => c.category === 'gotowka')
    .reduce((sum: number, c: any) => {
      const amount = typeof c.amount === 'number' ? c.amount : parseFloat(c.amount) || 0;
      return sum + amount;
    }, 0);
  
  // Sprzedaż dzisiaj
  const todaySales = filteredSales.filter((s: any) => s.date === today);
  
  // ✅ IDENTYCZNIE JAK W sprzedaz/page.tsx (lines 525-531)!
  // Flatten sales - dodaj totalPrice i totalProfit do każdej sprzedaży
  const flattenedTodaySales = todaySales.map((sale: any) => ({
    ...sale,
    totalPrice: sale.items?.reduce((sum: number, item: any) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      return sum + price;
    }, 0) || 0,
    totalProfit: sale.items?.reduce((sum: number, item: any) => {
      const profit = typeof item.profit === 'number' ? item.profit : parseFloat(item.profit) || 0;
      return sum + profit;
    }, 0) || 0
  }));
  
  console.log('Today sales count:', todaySales.length);
  console.log('Flattened sales (z totalPrice/totalProfit):', flattenedTodaySales.length);
  
  // 🔍 DEBUG: Pokaż każdy item
  flattenedTodaySales.forEach((s: any, idx: number) => {
    console.log(`\n📦 Sprzedaż #${idx + 1} (${s.ini}, ${s.payment}):`);
    console.log(`   💵 totalPrice: ${s.totalPrice.toFixed(2)} zł`);
    console.log(`   💰 totalProfit: ${s.totalProfit.toFixed(2)} zł`);
    
    if (s.totalPrice === s.totalProfit && s.totalPrice > 0) {
      console.error(`   ❌ BŁĄD: totalPrice === totalProfit! To jest wpływ!`);
    }
    
    s.items?.forEach((item: any, itemIdx: number) => {
      console.log(`   Item ${itemIdx + 1}: ${item.name}`);
      console.log(`      price: ${item.price} | profit: ${item.profit}`);
    });
  });
  
  // ✅ IDENTYCZNIE JAK W sprzedaz/page.tsx (line 597)!
  // SUMA ZYSKÓW = suma wszystkich totalProfit ze sprzedaży dzisiaj
  const totalProfitToday = flattenedTodaySales.reduce((sum: number, sale: any) => sum + sale.totalProfit, 0);
  
  // Suma sprzedaży (ceny - wpływy)
  const totalSalesToday = flattenedTodaySales.reduce((sum: number, sale: any) => sum + sale.totalPrice, 0);
  
  // Podział na gotówka/karta (do wyświetlania Kasy/Kart)
  const cashSalesToday = flattenedTodaySales
    .filter((s: any) => s.payment === 'gotówka')
    .reduce((sum: number, s: any) => sum + s.totalPrice, 0);
  const cardSalesToday = flattenedTodaySales
    .filter((s: any) => s.payment === 'karta')
    .reduce((sum: number, s: any) => sum + s.totalPrice, 0);
  
  console.log('=== WYNIKI OBLICZEŃ ===');
  console.log('💵 SUMA SPRZEDAŻY (ceny):');
  console.log('   Cash Sales:', cashSalesToday.toFixed(2));
  console.log('   Card Sales:', cardSalesToday.toFixed(2));
  console.log('   Total Sales:', totalSalesToday.toFixed(2));
  console.log('');
  console.log('💰 ZYSK ZE SPRZEDAŻY (marże):');
  console.log('   Total Profit:', totalProfitToday.toFixed(2));
  console.log('');
  console.log('📊 KOSZTY I DOŁADOWANIA:');
  console.log('   Total Costs:', totalCostsToday.toFixed(2));
  console.log('   Cash Costs:', cashCostsToday.toFixed(2));
  console.log('   Doładowania:', doladowaniaToday.toFixed(2));
  
  // Stan kasy z poprzedniego dnia (pobierany z bazy danych)
  // const stanKasyPoprzedniegoDnia = 2698; // Stara wersja - teraz z bazy
  
  // Prawdziwe obliczenia - odejmujemy koszty gotówkowe (np. skup telefonów)!
  const kasaDzis = stanKasyPoprzedniegoDnia + cashSalesToday + doladowaniaToday - cashCostsToday;
  const sumaTotal = kasaDzis + cardSalesToday;
  const dzienTotal = totalSalesToday - totalCostsToday;
  
  // ✅ ZYSK NETTO = Wpływy (sprzedaż) - Wydatki (wszystkie koszty)
  const zyskNetto = totalSalesToday - totalCostsToday;
  
  console.log('');
  console.log('=== KOŃCOWY WYNIK ===');
  console.log('💰 ZYSK (jak w panelu Sprzedaż):', zyskNetto.toFixed(2));
  console.log('   = Total Profit (suma marż ze sprzedaży)');
  console.log('   (tak samo jak w zakładce "Sprzedaż")');

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userRole = getSessionStorageSafe("userRole", "");
    if (!userRole) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadActions = async () => {
      try {
        const userRole = getSessionStorageSafe("userRole", "");
        const userShopId = getSessionStorageSafe("shopId", "");
        
        let allActions = await getActions();
        let filtered = allActions || [];
        
        if (userRole === 'employee' && userShopId) {
          filtered = filtered.filter(a => a.shop_id === userShopId || a.shopId === userShopId);
        } else {
          if (actionFilterShop !== "all") {
            filtered = filtered.filter(a => a.shop_id === actionFilterShop || a.shopId === actionFilterShop);
          }
          if (actionFilterEmployee !== "all") {
            filtered = filtered.filter(a => a.actor_id === actionFilterEmployee || a.employeeId === actionFilterEmployee);
          }
        }
        
        setRecentActions(filtered.slice(0, 5));
      } catch (error) {
        console.error('Error loading actions:', error);
        setRecentActions([]);
      }
    };
    
    loadActions();
  }, [actionFilterShop, actionFilterEmployee]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleActionAdded = (e: CustomEvent<Action>) => {
      setRecentActions(prev => [e.detail, ...prev].slice(0, 5));
    };
    window.addEventListener('action_added', handleActionAdded as EventListener);
    return () => window.removeEventListener('action_added', handleActionAdded as EventListener);
  }, []);

  // Reset Zasilanie form when dialog opens
  useEffect(() => {
    if (isCashTopUpDialogOpen) {
      // Default to currently selected shop (or first shop if all selected)
      if (selectedShop !== 'all') {
        setCashTopUpShopId(selectedShop);
      } else if (shops.length > 0) {
        setCashTopUpShopId(shops[0].id);
      }
      setCashTopUpAmount('');
      setCashTopUpDescription('');
    }
  }, [isCashTopUpDialogOpen, selectedShop, shops]);

  if (isSessionChecked && !hasValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md mx-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Brak aktywnej sesji</h1>
          <p className="text-gray-600 mb-6">Musisz się zalogować aby uzyskać dostęp do panelu.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Przejdź do logowania →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div key={routeKey} className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        {/* Header Stats - Simple & Clear */}
        <section>
          <Card className="bg-white shadow-xl border-none rounded-3xl">
            <CardContent className="p-6 space-y-6">
              {/* Top Row: Date & Shop Selectors */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <Input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                    }}
                    className="h-12 bg-accent/30 border-none rounded-xl text-foreground"
                  />
                  <Button
                    onClick={() => setSelectedDate(today)}
                    className="h-12 bg-primary hover:bg-primary/90 text-white font-bold px-4 rounded-xl"
                  >
                    Dzisiaj
                  </Button>
                </div>
                
                <div className="w-full sm:w-auto flex-1 max-w-[200px]">
                  {currentUserRole === 'employee' ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{currentShopName || 'Brak sklepu'}</span>
                    </div>
                  ) : (
                    <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || "all")} items={[
                      { value: "all", label: "Wszystkie punkty" },
                      ...shops.map(shop => ({ value: shop.id, label: shop.name }))
                    ]}>
                      <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl text-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>
                            {selectedShop === "all" ? "Wszystkie punkty" : 
                             (shops.find(s => s.id === selectedShop)?.name || selectedShop)}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-none rounded-2xl">
                        <SelectItem value="all" className="text-sm">Wszystkie punkty</SelectItem>
                        {shops.map(shop => (
                          <SelectItem key={shop.id} value={shop.id} className="text-sm">{shop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              {/* Main Stats */}
              <div className="space-y-4 py-4">
                {/* Stan Kasy z Poprzedniego Dnia */}
                <div className="border border-primary/10 rounded-2xl p-4 bg-accent/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground">Stan Kasy</p>
                      <p className="text-sm font-bold text-foreground">z Poprzedniego Dnia</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-foreground">{stanKasyPoprzedniegoDnia.toFixed(0)}<span className="text-xs ml-1 text-foreground/80">zł</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Zasilanie Gotówką - Button (Only Owner) */}
                {currentUserRole === 'owner' && (
                  <Button
                    onClick={() => setIsCashTopUpDialogOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>Zasilanie Gotówką</span>
                    </div>
                  </Button>
                )}

                {/* Wpływy + Koszty */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Wpływy */}
                  <div className="border border-primary/10 rounded-2xl p-4 bg-accent/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-foreground">Wpływy</p>
                      </div>
                      <p className="text-xl font-black text-primary">{(totalSalesToday + doladowaniaToday).toFixed(0)}<span className="text-xs ml-1 text-foreground/80">zł</span></p>
                    </div>
                  </div>

                  {/* Suma Kosztów */}
                  <div className="border border-primary/10 rounded-2xl p-4 bg-accent/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-foreground">Koszty</p>
                      </div>
                      <p className={`text-xl font-black ${totalCostsToday > 0 ? 'text-red-600' : 'text-foreground/80'}`}>{totalCostsToday > 0 ? `-${totalCostsToday.toFixed(0)}` : '0'}<span className="text-xs ml-1 text-foreground/80">zł</span></p>
                    </div>
                  </div>
                </div>

                {/* Kasa + Karty */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Kasa - Gotówka */}
                  <div className="border border-primary/10 rounded-2xl p-4 bg-accent/50">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold uppercase tracking-wide text-foreground">Kasa</p>
                      </div>
                      <p className="text-xl font-black text-primary">{cashSalesToday.toFixed(0)}<span className="text-xs ml-1 text-foreground/80">zł</span></p>
                    </div>
                  </div>

                  {/* Karty */}
                  <div className="border border-primary/10 rounded-2xl p-4 bg-accent/50">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold uppercase tracking-wide text-foreground">Karty</p>
                      </div>
                      <p className="text-xl font-black text-primary">{cardSalesToday.toFixed(0)}<span className="text-xs ml-1 text-foreground/80">zł</span></p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-primary/10 my-2" />

                {/* Suma Sprzedaży + Zysk Netto */}
                <div className="space-y-3">
                  
                  {/* Suma Sprzedaży (obrót) */}
                  <div className="flex items-center justify-between p-3 border border-primary/10 rounded-2xl bg-accent/50">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-sm font-bold text-foreground">Suma Sprzedaży</span>
                        <span className="text-xs text-foreground/80 block">(obrót)</span>
                      </div>
                    </div>
                    <span className="text-lg font-black text-primary">
                      {totalSalesToday.toFixed(0)}<span className="text-xs font-normal text-foreground/80 ml-1">zł</span>
                    </span>
                  </div>

                  {/* Zysk Netto */}
                  <div className="border-2 border-primary rounded-2xl p-4 bg-primary text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase tracking-wide">Zysk Netto</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${zyskNetto >= 0 ? 'text-white' : 'text-red-200'}`}>
                          {zyskNetto >= 0 ? '+' : ''}{zyskNetto.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przycisk Zamknij Dzień - tylko gdy wybrany konkretny sklep (nie "all") */}
                {(currentUserRole !== 'employee' ? selectedShop !== 'all' : true) && (
                  <Button
                    onClick={async () => {
                      try {
                        const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
                        const userId = getSessionStorageSafe('userId', '');
                        
                        // Dla właściciela używaj wybranego sklepu, dla pracownika jego sklep
                        const shopId = currentUserRole === 'employee' 
                          ? activeEmployees[0]?.shopId || '' 
                          : selectedShop;

                        if (!shopId) {
                          addToast({ title: "Brak sklepu", message: "Wybierz sklep, aby zamknąć dzień.", variant: "error" });
                          return;
                        }

                        const closed = await cashRegisterService.isTodayClosed(shopId);
                        setIsTodayClosed(closed);

                        if (closed) {
                          addToast({ title: "Dzień już zamknięty", message: "Dzisiejszy dzień został już rozliczony dla tego sklepu.", variant: "info" });
                          return;
                        }

                        setIsCloseDayDialogOpen(true);
                      } catch {
                        addToast({ title: "Błąd", message: "Nie udało się sprawdzić stanu kasy. Spróbuj ponownie.", variant: "error" });
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="h-5 w-5" />
                      <span>Zamknij Dzień</span>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dialog potwierdzenia zamknięcia dnia */}
        <Dialog open={isCloseDayDialogOpen} onOpenChange={setIsCloseDayDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl border-none p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Zamknąć dzień?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 p-6">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-3 bg-accent/30 rounded-xl">
                  <span className="text-muted-foreground font-bold">Stan kasy</span>
                  <span className="font-black text-foreground">{kasaDzis.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-3 bg-accent/30 rounded-xl">
                  <span className="text-muted-foreground font-bold">Wpływy</span>
                  <span className="font-black text-foreground">{(totalSalesToday + doladowaniaToday).toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-3 bg-accent/30 rounded-xl">
                  <span className="text-muted-foreground font-bold">Gotówka</span>
                  <span className="font-black text-foreground">{cashSalesToday.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-3 bg-accent/30 rounded-xl">
                  <span className="text-muted-foreground font-bold">Karty</span>
                  <span className="font-black text-foreground">{cardSalesToday.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-xl">
                  <span className="text-red-600 font-bold">Koszty</span>
                  <span className="font-black text-red-600">{totalCostsToday.toFixed(2)} zł</span>
                </div>
                <div className={`flex justify-between p-3 rounded-xl ${zyskNetto >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <span className={`font-bold ${zyskNetto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Zysk</span>
                  <span className={`font-black ${zyskNetto >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{zyskNetto >= 0 ? '+' : ''}{zyskNetto.toFixed(2)} zł</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center font-bold">
                Stan kasy zostanie zapisany i będzie dostępny następnego dnia.
              </p>
            </div>
            <DialogFooter className="p-6 gap-3">
              <DialogClose className="flex-1 px-4 py-3 text-sm font-black rounded-xl border border-primary/10 hover:bg-accent/30 text-foreground">Anuluj</DialogClose>
              <Button
                onClick={async () => {
                  setIsClosingDay(true);
                  try {
                    const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
                    const userId = getSessionStorageSafe('userId', '');
                    
                    // Dla właściciela używaj wybranego sklepu, dla pracownika jego sklep
                    const shopId = currentUserRole === 'employee' 
                      ? activeEmployees[0]?.shopId || '' 
                      : selectedShop;

                    await cashRegisterService.closeDay({
                      shopId,
                      employeeId: userId,
                      totalCashSales: cashSalesToday,
                      totalCardSales: cardSalesToday,
                      totalCosts: totalCostsToday,
                      totalCashCosts: cashCostsToday, // Przekazujemy tylko koszty gotówkowe!
                      totalDoladowania: doladowaniaToday,
                      createdBy: userId
                    });

                    addToast({
                      title: "Dzień zamknięty",
                      message: `Stan kasy ${kasaDzis.toFixed(2)} zł zapisany pomyślnie dla ${shops.find(s => s.id === shopId)?.name || 'sklepu'}.`,
                      variant: "success"
                    });
                    setIsTodayClosed(true);
                    setIsCloseDayDialogOpen(false);
                  } catch (error: any) {
                    console.error('❌ Błąd zamknięcia dnia:', error?.message || error);
                    console.warn('💡 RLS w Supabase blokuje INSERT - uruchom fix_cash_register_rls.sql w SQL Editor');

                    const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
                    const userId = getSessionStorageSafe('userId', '');
                    
                    // Dla właściciela używaj wybranego sklepu, dla pracownika jego sklep
                    const shopId = currentUserRole === 'employee' 
                      ? activeEmployees[0]?.shopId || '' 
                      : selectedShop;

                    const closingData = {
                      id: `local_${Date.now()}`,
                      shopId,
                      employeeId: userId,
                      date: today,
                      closedAt: new Date().toISOString(),
                      kasaDzis,
                      cashSalesToday,
                      cardSalesToday,
                      totalCostsToday,
                      doladowaniaToday,
                      zyskNetto,
                      syncedToServer: false
                    };

                    const existingClosings = JSON.parse(localStorage.getItem('cash_register_closings_local') || '[]');
                    localStorage.setItem('cash_register_closings_local', JSON.stringify([closingData, ...existingClosings]));

                    addToast({
                      title: "Zapisano lokalnie",
                      message: `Dzień zamknięty w pamięci przeglądarki dla ${shops.find(s => s.id === shopId)?.name || 'sklepu'}. Dane zostaną zsynchronizowane później.`,
                      variant: "info"
                    });
                    setIsCloseDayDialogOpen(false);
                  } finally {
                    setIsClosingDay(false);
                  }
                }}
                disabled={isClosingDay}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-xl"
              >
                {isClosingDay ? "Zamykanie..." : "Zamknij dzień"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog Zasilania Gotówką */}
        <Dialog open={isCashTopUpDialogOpen} onOpenChange={setIsCashTopUpDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl border-none p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                <Banknote className="h-5 w-5" />
                Zasilanie Gotówką
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground">Sklep</label>
                <Select 
                  value={cashTopUpShopId}
                  onValueChange={(val) => setCashTopUpShopId(val || '')}
                  items={shops.map(shop => ({ value: shop.id, label: shop.name }))}
                >
                  <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl text-foreground">
                    <SelectValue placeholder="Wybierz sklep" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-none rounded-2xl">
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground">Kwota (zł)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={cashTopUpAmount}
                  onChange={(e) => setCashTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12 bg-accent/30 border-none rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground">Opis</label>
                <textarea
                  value={cashTopUpDescription}
                  onChange={(e) => setCashTopUpDescription(e.target.value)}
                  placeholder="np. Wpłata z banku..."
                  className="w-full h-24 px-4 py-3 bg-accent/30 border-none rounded-xl resize-none text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <DialogFooter className="p-6 gap-3">
              <DialogClose className="flex-1 px-4 py-3 text-sm font-black rounded-xl border border-primary/10 hover:bg-accent/30 text-foreground">Anuluj</DialogClose>
              <Button
                onClick={handleAddCashTopUp}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-xl"
              >
                Dodaj zasilanie
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Navigation Grid - Simple */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Panel Zarządzania</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/sprzedaz", label: "Sprzedaż", icon: ShoppingCart },
              { href: "/magazyn", label: "Magazyn", icon: ClipboardList },
              ...(!isEmployee ? [
                { href: "/pracownicy", label: "Pracownicy", icon: Users },
                { href: "/raporty", label: "Raporty", icon: Search },
              ] : [
                { href: "/dokumenty", label: "Dokumenty", icon: BookOpen },
                { href: "/faktury", label: "Faktury", icon: FileText },
              ])
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <div className="bg-white p-4 rounded-2xl shadow-xl border-none hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="font-black text-sm text-foreground">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Access List - Simple */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Ostatnie Akcje</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            {isEmployee ? (
              <div className="bg-accent/30 h-12 text-sm rounded-xl flex items-center gap-2 px-4">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate font-black text-foreground">{currentShopName || 'Twój sklep'}</span>
              </div>
            ) : (
              <>
                <Select value={actionFilterShop} onValueChange={(val) => setActionFilterShop(val || "all")} items={[
                  { value: "all", label: "Wszystkie sklepy" },
                  ...shops.map(shop => ({ value: shop.id, label: shop.name }))
                ]}>
                  <SelectTrigger className="bg-accent/30 border-none h-12 text-sm rounded-xl flex-1 text-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate font-black">
                        {actionFilterShop === "all" ? "Wszystkie sklepy" : 
                         (shops.find(s => s.id === actionFilterShop)?.name || actionFilterShop)}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-none rounded-2xl">
                    <SelectItem value="all" className="text-sm">Wszystkie sklepy</SelectItem>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id} className="text-sm">{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={actionFilterEmployee} onValueChange={(val) => setActionFilterEmployee(val || "all")} items={[
                  { value: "all", label: "Wszyscy pracownicy" },
                  ...employees.map(emp => ({ value: emp.id, label: emp.name }))
                ]}>
                  <SelectTrigger className="bg-accent/30 border-none h-12 text-sm rounded-xl flex-1 text-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="truncate font-black">
                        {actionFilterEmployee === "all" ? "Wszyscy pracownicy" : 
                         employees.find(e => e.id === actionFilterEmployee)?.name || actionFilterEmployee}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-none rounded-2xl">
                    <SelectItem value="all" className="text-sm">Wszyscy pracownicy</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-sm">
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            {recentActions.length > 0 ? recentActions.map((action, idx) => {
              const actionIcons: Record<string, any> = {
                sprzedaz: ShoppingCart,
                przyjecie: Package,
                serwis: Wrench,
                edycja: Settings,
                logowanie: User,
                inna: Clock,
              };
              const Icon = actionIcons[action.type || 'inna'] || Clock;
              
              const displayName = action.employeeName || action.actor_name || 'Nieznany użytkownik';
              const displayShop = action.shopName || action.shop_name || 'Nieznany sklep';
              
              let timeStr = '';
              if (action.timestamp) {
                try {
                  timeStr = formatTimePL(action.timestamp);
                } catch (e) {
                  timeStr = '';
                }
              }
              
              return (
                <div key={action.id || idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{action.description || ''}</p>
                      <p className="text-xs text-gray-500">{displayName} • {displayShop}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{timeStr}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-500 text-center py-4">Brak ostatnich akcji</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
