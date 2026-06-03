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
        const today = toISODateString();
        
        // Dla właściciela: używaj wybranego sklepu zamiast sessionStorage
        const userRole = getSessionStorageSafe("userRole", "");
        const effectiveShopId = userRole === 'employee' 
          ? shopId 
          : (selectedShop === 'all' ? '' : selectedShop);

        console.log('Strona główna: Ładowanie sprzedaży z Supabase, effectiveShopId:', effectiveShopId, ', today:', today);

        let salesData: any[] = [];
        if (effectiveShopId) {
          const allSales = await salesService.getByShop(effectiveShopId);
          salesData = allSales.filter(sale => sale.sale_date === today);
        } else {
          const todayDate = new Date(today);
          const tomorrow = new Date(todayDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          salesData = await salesService.getByDateRange(
            today,
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
  }, [isMounted, selectedShop]);

  // Load costs from Supabase
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const loadCostsFromSupabase = async () => {
      try {
        const shopId = getSessionStorageSafe("shopId", "");
        const today = toISODateString();
        
        // Dla właściciela: używaj wybranego sklepu zamiast sessionStorage
        const userRole = getSessionStorageSafe("userRole", "");
        const effectiveShopId = userRole === 'employee' 
          ? shopId 
          : (selectedShop === 'all' ? '' : selectedShop);

        console.log('Strona główna: Ładowanie kosztów z Supabase, effectiveShopId:', effectiveShopId, ', today:', today);

        let costsData: any[] = [];
        if (effectiveShopId) {
          const allCosts = await costsService.getByShop(effectiveShopId);
          costsData = allCosts.filter(cost => cost.cost_date === today);
        } else {
          const todayDate = new Date(today);
          const tomorrow = new Date(todayDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          costsData = await costsService.getByDateRange(
            today,
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
  }, [isMounted, selectedShop]);


  
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
          const previousDayState = await cashRegisterService.getPreviousDayState(shopId);
          setStanKasyPoprzedniegoDnia(previousDayState);
        } else {
          if (selectedShop === 'all') {
            const totalPreviousDayState = await cashRegisterService.getTotalPreviousDayStateForAllShops();
            setStanKasyPoprzedniegoDnia(totalPreviousDayState);
          } else {
            const previousDayState = await cashRegisterService.getPreviousDayState(selectedShop);
            setStanKasyPoprzedniegoDnia(previousDayState);
          }
        }
      } catch (error) {
        console.error('Błąd pobierania stanu kasy:', error);
      }
    };
    
    loadCashState();
  }, [selectedShop, currentUserRole, isMounted]);
  
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
  
  // Koszty dzisiaj (BEZ doładowań gotówki!)
  const todayCosts = filteredCosts.filter((c: any) => c.date === today);
  const totalCostsToday = todayCosts
    .filter((c: any) => c.category !== 'gotowka')  // ← Wykluczamy doładowania!
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
  console.log('   Doładowania:', doladowaniaToday.toFixed(2));
  
  // Stan kasy z poprzedniego dnia (pobierany z bazy danych)
  // const stanKasyPoprzedniegoDnia = 2698; // Stara wersja - teraz z bazy
  
  // Prawdziwe obliczenia
  const kasaDzis = stanKasyPoprzedniegoDnia + cashSalesToday + doladowaniaToday;
  const sumaTotal = kasaDzis + cardSalesToday;
  const dzienTotal = totalSalesToday - totalCostsToday;
  
  // ✅ ZYSK NETTO = Zysk ze sprzedaży (marże) - Koszty
  const zyskNetto = totalProfitToday - totalCostsToday;
  
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
        {/* Compact & Premium Header Stats */}
        <section>
          <Card className="bg-secondary border-none shadow-xl text-white overflow-hidden relative rounded-[2rem]">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Top Row: Date & Shop Selectors (More Compact) */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 transition-all w-full sm:w-auto">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  <Input 
                    type="date"
                    value={today}
                    onChange={(e) => {
                      console.log('Zmieniono datę na:', e.target.value);
                    }}
                    className="bg-transparent border-none h-6 text-white text-[10px] font-bold focus-visible:ring-0 [color-scheme:dark] w-full sm:w-28 p-0"
                  />
                </div>
                
                <div className="w-full sm:w-auto flex-1 max-w-[200px]">
                  {currentUserRole === 'employee' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 h-10 rounded-xl">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        {currentShopName || 'Brak sklepu'}
                      </span>
                    </div>
                  ) : (
                    <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || "all")} items={[
                      { value: "all", label: "Wszystkie punkty" },
                      ...shops.map(shop => ({ value: shop.id, label: shop.name }))
                    ]}>
                      <SelectTrigger className="bg-white/5 border-white/5 h-10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {selectedShop === "all" ? "Wszystkie punkty" : 
                             (shops.find(s => s.id === selectedShop)?.name || selectedShop)}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-white/10 text-white rounded-xl">
                        <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">Wszystkie punkty</SelectItem>
                        {shops.map(shop => (
                          <SelectItem key={shop.id} value={shop.id} className="font-bold text-[10px] uppercase tracking-widest">{shop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              {/* Bilans Dnia - Nowy, bardziej czytelny design z tooltipami */}
              <div className="space-y-5 py-6">
                
                {/* Stan Kasy z Poprzedniego Dnia - Hero Card */}
                <div 
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 via-slate-800/80 to-slate-900/90 border border-emerald-500/20 rounded-2xl p-6 shadow-lg shadow-black/20 cursor-help"
                  title="Stan Kasy z Poprzedniego Dnia to kwota, która została zapisana podczas zamknięcia dnia wczoraj. To jest twój punkt wyjścia na dzisiejsze obliczenia."
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />

                  <div className="relative flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Stan Kasy</p>
                      </div>
                      <p className="text-lg font-black text-white uppercase tracking-tight">z Poprzedniego Dnia</p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black text-emerald-400 tabular-nums drop-shadow-[0_0_25px_rgba(52,211,153,0.4)]">{stanKasyPoprzedniegoDnia.toFixed(0)}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400/60 mt-1">zł</p>
                    </div>
                  </div>
                </div>
                
                {/* Zasilanie Gotówką - Button (Only Owner) */}
                {currentUserRole === 'owner' && (
                  <Button
                    onClick={() => setIsCashTopUpDialogOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Banknote className="h-5 w-5" />
                      <span className="tracking-widest uppercase">Zasilanie Gotówką</span>
                    </div>
                  </Button>
                )}

                {/* Wpływy + Koszty - w jednym wierszu */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Wpływy */}
                  <div 
                    className="relative overflow-hidden bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl p-5 shadow-md hover:border-blue-500/30 transition-all cursor-help"
                    title="Wpływy to suma wszystkich pieniędzy, które wpłynęły do sklepu dzisiaj: sprzedaż kartą oraz zasilanie gotówką."
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                    <div className="relative flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-400" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Wpływy</p>
                        </div>
                      </div>
                      <p className="text-3xl font-black text-blue-300 tabular-nums">{(totalSalesToday + doladowaniaToday).toFixed(0)}<span className="text-xs ml-1 text-blue-400/60">zł</span></p>
                    </div>
                  </div>

                  {/* Suma Kosztów */}
                  <div 
                    className="relative overflow-hidden bg-gradient-to-br from-red-500/15 via-red-600/10 to-transparent border border-red-500/20 rounded-2xl p-5 shadow-md hover:border-red-500/30 transition-all cursor-help"
                    title="Suma Kosztów to wszystkie wydatki dzisiaj, bez zasilania gotówką. Należą do nich m.in. skupy, zaliczki i paczki."
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
                    <div className="relative flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-red-400" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Koszty</p>
                        </div>
                      </div>
                      <p className={`text-3xl font-black tabular-nums ${totalCostsToday > 0 ? 'text-red-400' : 'text-red-300/60'}`}>{totalCostsToday > 0 ? `-${totalCostsToday.toFixed(0)}` : '0'}<span className="text-xs ml-1 text-red-400/60">zł</span></p>
                    </div>
                  </div>
                </div>

                {/* Kasa + Karty - Sposoby płatności */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Kasa - Gotówka */}
                  <div 
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-500/15 via-emerald-600/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 shadow-md hover:border-emerald-500/30 transition-all cursor-help"
                    title="Kasa to suma sprzedaży gotówkowej dzisiaj. To kwota, którą powinieneś mieć w kasie (plus stan z wczoraj i zasilania)."
                  >
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="relative space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <Banknote className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Kasa</p>
                      </div>
                      <p className="text-3xl font-black text-white tabular-nums">{cashSalesToday.toFixed(0)}<span className="text-xs ml-1 text-emerald-400/60">zł</span></p>
                      <div className="h-1 w-24 bg-gradient-to-r from-emerald-500/40 to-transparent rounded-full" />
                    </div>
                  </div>

                  {/* Karty */}
                  <div 
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-500/15 via-indigo-600/10 to-transparent border border-indigo-500/20 rounded-2xl p-5 shadow-md hover:border-indigo-500/30 transition-all cursor-help"
                    title="Karty to suma sprzedaży kartą dzisiaj. Ta kwota trafi na twoje konto bankowe."
                  >
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
                    <div className="relative space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-indigo-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Karty</p>
                      </div>
                      <p className="text-3xl font-black text-white tabular-nums">{cardSalesToday.toFixed(0)}<span className="text-xs ml-1 text-indigo-400/60">zł</span></p>
                      <div className="h-1 w-24 bg-gradient-to-r from-indigo-500/40 to-transparent rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-3" />

                {/* Suma Sprzedaży + Zysk Netto */}
                <div className="space-y-4">
                  
                  {/* Suma Sprzedaży (obrót) */}
                  <div 
                    className="flex items-center justify-between px-2 py-4 bg-white/5 rounded-xl border border-white/10 cursor-help"
                    title="Suma Sprzedaży (obrót) to całkowita wartość wszystkich sprzedaży dzisiaj, zarówno gotówkowej jak i kartą."
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-black uppercase tracking-widest text-white/80">Suma Sprzedaży</span>
                        <span className="text-[10px] font-normal text-white/40 block italic mt-0.5">(obrót)</span>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-white tabular-nums">
                      {totalSalesToday.toFixed(0)}
                      <span className="text-sm font-normal text-white/50 ml-1.5">zł</span>
                    </span>
                  </div>

                  {/* Zysk Netto - Najważniejszy wskaźnik */}
                  <div 
                    className="relative overflow-hidden bg-gradient-to-r from-emerald-600/30 via-green-500/25 to-emerald-500/30 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl shadow-emerald-900/30 cursor-help"
                    title="Zysk Netto to suma marż ze wszystkich sprzedaży dzisiaj. To jest to, co faktycznie zarabiasz po odjęciu kosztów zakupu towarów."
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.15)_0%,_transparent_70%)]" />
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                          <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-lg font-black uppercase tracking-[0.25em] text-emerald-200">Zysk</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-5xl font-black tabular-nums drop-shadow-[0_0_30px_rgba(52,211,153,0.5)] ${zyskNetto >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                          {zyskNetto >= 0 ? '+' : ''}{zyskNetto.toFixed(0)}
                        </p>
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300/70 mt-1.5">zysk netto</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider przed przyciskiem */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

                {/* Przycisk Zamknij Dzień - teraz w środku panelu */}
                <Button
                  onClick={async () => {
                    try {
                      const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
                      const shopId = activeEmployees[0]?.shopId || '';
                      const userId = getSessionStorageSafe('userId', '');

                      if (!shopId) {
                        addToast({ title: "Brak sklepu", message: "Zaloguj się ponownie, aby zamknąć dzień.", variant: "error" });
                        return;
                      }

                      const closed = await cashRegisterService.isTodayClosed(shopId);
                      setIsTodayClosed(closed);

                      if (closed) {
                        addToast({ title: "Dzień już zamknięty", message: "Dzisiejszy dzień został już rozliczony.", variant: "info" });
                        return;
                      }

                      setIsCloseDayDialogOpen(true);
                    } catch {
                      addToast({ title: "Błąd", message: "Nie udało się sprawdzić stanu kasy. Spróbuj ponownie.", variant: "error" });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-white font-black text-lg py-5 rounded-3xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-4">
                    <Clock className="h-7 w-7" />
                    <span className="tracking-widest uppercase">Zamknij Dzień</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dialog potwierdzenia zamknięcia dnia */}
        <Dialog open={isCloseDayDialogOpen} onOpenChange={setIsCloseDayDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Zamknąć dzień?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Stan kasy</span>
                  <span className="font-bold">{kasaDzis.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Wpływy</span>
                  <span className="font-bold">{(totalSalesToday + doladowaniaToday).toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Gotówka</span>
                  <span className="font-bold">{cashSalesToday.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Karty</span>
                  <span className="font-bold">{cardSalesToday.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-red-500">Koszty</span>
                  <span className="font-bold text-red-600">{totalCostsToday.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between p-2 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-600">Zysk</span>
                  <span className="font-bold text-emerald-700">{zyskNetto >= 0 ? '+' : ''}{zyskNetto.toFixed(2)} zł</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Stan kasy zostanie zapisany i będzie dostępny następnego dnia.
              </p>
            </div>
            <DialogFooter>
              <DialogClose className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50">Anuluj</DialogClose>
              <Button
                onClick={async () => {
                  setIsClosingDay(true);
                  try {
                    const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
                    const shopId = activeEmployees[0]?.shopId || '';
                    const userId = getSessionStorageSafe('userId', '');

                    await cashRegisterService.closeDay({
                      shopId,
                      employeeId: userId,
                      totalCashSales: cashSalesToday,
                      totalCardSales: cardSalesToday,
                      totalCosts: totalCostsToday,
                      totalDoladowania: doladowaniaToday,
                      createdBy: userId
                    });

                    addToast({
                      title: "Dzień zamknięty",
                      message: `Stan kasy ${kasaDzis.toFixed(2)} zł zapisany pomyślnie.`,
                      variant: "success"
                    });
                    setIsTodayClosed(true);
                    setIsCloseDayDialogOpen(false);
                  } catch (error: any) {
                    console.error('❌ Błąd zamknięcia dnia:', error?.message || error);
                    console.warn('💡 RLS w Supabase blokuje INSERT - uruchom fix_cash_register_rls.sql w SQL Editor');

                    const activeEmployees = JSON.parse(sessionStorage.getItem('activeEmployees') || '[]');
                    const shopId = activeEmployees[0]?.shopId || '';
                    const userId = getSessionStorageSafe('userId', '');

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
                      message: `Dzień zamknięty w pamięci przeglądarki. Dane zostaną zsynchronizowane później.`,
                      variant: "info"
                    });
                    setIsCloseDayDialogOpen(false);
                  } finally {
                    setIsClosingDay(false);
                  }
                }}
                disabled={isClosingDay}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isClosingDay ? "Zamykanie..." : "Zamknij dzień"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog Zasilania Gotówką */}
        <Dialog open={isCashTopUpDialogOpen} onOpenChange={setIsCashTopUpDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <Banknote className="h-6 w-6 text-purple-600" />
                Zasilanie Gotówką
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sklep</label>
                <Select 
                  value={cashTopUpShopId}
                  onValueChange={(val) => setCashTopUpShopId(val || '')}
                  items={shops.map(shop => ({ value: shop.id, label: shop.name }))}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none font-bold text-sm">
                    <SelectValue placeholder="Wybierz sklep" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kwota (zł)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={cashTopUpAmount}
                  onChange={(e) => setCashTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12 rounded-xl bg-accent/30 border-none font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Opis</label>
                <textarea
                  value={cashTopUpDescription}
                  onChange={(e) => setCashTopUpDescription(e.target.value)}
                  placeholder="np. Wpłata z banku..."
                  className="w-full h-24 px-4 py-3 rounded-xl bg-accent/30 border-none resize-none font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-3 mt-6">
              <DialogClose className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50">Anuluj</DialogClose>
              <Button
                onClick={handleAddCashTopUp}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all active:scale-95"
              >
                Dodaj zasilanie
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Navigation Grid - Premium Look */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Panel Zarządzania</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/sprzedaz", label: "Sprzedaż", icon: ShoppingCart, color: "bg-primary", shadow: "shadow-primary/10" },
              { href: "/magazyn", label: "Magazyn", icon: ClipboardList, color: "bg-primary", shadow: "shadow-primary/10" },
              ...(!isEmployee ? [
                { href: "/pracownicy", label: "Pracownicy", icon: Users, color: "bg-primary", shadow: "shadow-primary/10" },
                { href: "/raporty", label: "Raporty", icon: Search, color: "bg-primary", shadow: "shadow-primary/10" },
              ] : [
                { href: "/dokumenty", label: "Dokumenty", icon: BookOpen, color: "bg-primary", shadow: "shadow-primary/10" },
                { href: "/faktury", label: "Faktury", icon: FileText, color: "bg-primary", shadow: "shadow-primary/10" },
              ])
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary/5 group-hover:border-primary/20 group-hover:shadow-md transition-all flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${item.color} text-white flex items-center justify-center shadow-lg ${item.shadow} group-hover:scale-105 transition-transform`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>



        {/* Quick Access List - More Refined */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ostatnie Akcje</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            {isEmployee ? (
              <div className="bg-accent/30 border-none h-10 text-[10px] font-bold uppercase rounded-xl flex-1 flex items-center gap-2 px-4">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="truncate">{currentShopName || 'Twój sklep'}</span>
              </div>
            ) : (
              <>
                <Select value={actionFilterShop} onValueChange={(val) => setActionFilterShop(val || "all")} items={[
                  { value: "all", label: "Wszystkie sklepy" },
                  ...shops.map(shop => ({ value: shop.id, label: shop.name }))
                ]}>
                  <SelectTrigger className="bg-accent/30 border-none h-10 text-[10px] font-bold uppercase rounded-xl flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="truncate">
                        {actionFilterShop === "all" ? "Wszystkie sklepy" : 
                         (shops.find(s => s.id === actionFilterShop)?.name || actionFilterShop)}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="font-bold text-[10px] uppercase">Wszystkie sklepy</SelectItem>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id} className="font-bold text-[10px] uppercase">{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={actionFilterEmployee} onValueChange={(val) => setActionFilterEmployee(val || "all")} items={[
                  { value: "all", label: "Wszyscy pracownicy" },
                  ...employees.map(emp => ({ value: emp.id, label: emp.name }))
                ]}>
                  <SelectTrigger className="bg-accent/30 border-none h-10 text-[10px] font-bold uppercase rounded-xl flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="truncate">
                        {actionFilterEmployee === "all" ? "Wszyscy pracownicy" : 
                         employees.find(e => e.id === actionFilterEmployee)?.name || actionFilterEmployee}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="font-bold text-[10px] uppercase">Wszyscy pracownicy</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="font-bold text-[10px] uppercase">
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          
          <div className="space-y-6">
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
              
              if (idx === 0) {
                console.log('🖥️ WYŚWIETLANIE akcji #0:', {
                  actionKeys: Object.keys(action),
                  employeeName: action.employeeName,
                  actor_name: action.actor_name,
                  shopName: action.shopName,
                  shop_name: action.shop_name,
                  displayName,
                  displayShop
                });
              }
              
              let timeStr = '';
              if (action.timestamp) {
                try {
                  timeStr = formatTimePL(action.timestamp);
                } catch (e) {
                  timeStr = '';
                }
              }
              
              return (
                <div key={action.id || idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{action.description || ''}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{displayName} • {displayShop}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-muted-foreground">{timeStr}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-4">Brak ostatnich akcji</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
