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

  useEffect(() => {
    const handleShopsUpdated = () => {
      loadShops();
    };
    
    window.addEventListener('shops_updated', handleShopsUpdated);
      return () => window.removeEventListener('shops_updated', handleShopsUpdated);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadData = () => {
      const savedCosts = getLocalStorageSafe('sprzedaz_costs', []);
      setCosts(savedCosts);
      
      const savedSales = getLocalStorageSafe('sprzedaz_sales', []);
      setSales(savedSales);
      
      console.log('🔄 Odświeżono dane z localStorage');
      console.log('Sales:', savedSales.length, 'pozycji');
      console.log('Costs:', savedCosts.length, 'pozycji');
    };
    
    // Ładuj dane na start
    loadData();
    
    // Odświeżaj przy zmianach w localStorage (synchronizacja między zakładkami)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sprzedaz_sales' || e.key === 'sprzedaz_costs') {
        console.log('📡 Wykryto zmianę w localStorage:', e.key);
        loadData();
      }
    };
    
    // Custom event dla zmian w tej samej karcie przeglądarki
    const handleDataUpdate = () => {
      console.log('📡 Otrzymano sygnał aktualizacji danych');
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sales_data_updated', handleDataUpdate);
    window.addEventListener('costs_data_updated', handleDataUpdate);
    
    // Odświeżaj co 5 sekundy (fallback)
    const interval = setInterval(loadData, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sales_data_updated', handleDataUpdate);
      window.removeEventListener('costs_data_updated', handleDataUpdate);
      clearInterval(interval);
    };
  }, []);

  const today = toISODateString();
  
  const [isMounted, setIsMounted] = useState(false);
  const [routeKey, setRouteKey] = useState(0);  // Klucz do wymuszenia re-rendera
  
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
        
        const effectiveShopIdForLoad = currentUserRole === 'employee' 
          ? shopId 
          : (selectedShop === 'all' ? shopId : selectedShop);
          
        if (effectiveShopIdForLoad) {
          const previousDayState = await cashRegisterService.getPreviousDayState(effectiveShopIdForLoad);
          setStanKasyPoprzedniegoDnia(previousDayState);
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
  console.log('Total sales in localStorage:', sales.length);
  console.log('Total costs in localStorage:', costs.length);
  
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
  
  // ✅ ZYSK NETTO = Zysk ze sprzedaży (marże) - TAKO JAK W PANELU SPRZEDAŻ!
  const zyskNetto = totalProfitToday;
  
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
              
              {/* Bilans Dnia - Premium Design */}
              <div className="space-y-4 py-6">
                
                {/* Header Section: Main Balance + Costs */}
                <div className="grid grid-cols-1 gap-3">

                  {/* Stan Kasy z Poprzedniego Dnia - Hero Card (NAJWYŻEJ) */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="relative flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 leading-tight">Stan Kasy z</p>
                        <p className="text-base font-black text-white uppercase tracking-tight">Poprzedniego Dnia</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-emerald-400 tabular-nums drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">{stanKasyPoprzedniegoDnia.toFixed(0)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/50 mt-0.5">zł</p>
                      </div>
                    </div>
                  </div>

                  {/* Suma Kosztów - Red Alert */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-red-500/15 via-red-500/10 to-transparent border border-red-500/25 rounded-2xl px-5 py-3">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-2xl" />
                    <div className="flex items-center justify-between pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-red-300">Suma Kosztów</span>
                      </div>
                      <span className="text-xl font-black text-red-400 tabular-nums">{totalCostsToday > 0 ? `-${totalCostsToday.toFixed(0)} zł` : '0 zł'}</span>
                    </div>
                  </div>
                </div>

                {/* Dzień + Wpływy - Split Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.04] border border-white/8 hover:border-white/15 rounded-xl p-4 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">Dzień</span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums">{dzienTotal.toFixed(0)}</p>
                  </div>

                  <div className="bg-white/[0.04] border border-white/8 hover:border-white/15 rounded-xl p-4 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">Wpływy</span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums">{(cardSalesToday + doladowaniaToday).toFixed(0)}</p>
                  </div>
                </div>

                {/* Kasa + Karty - Payment Methods */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/15 rounded-xl p-4 group hover:border-emerald-500/25 transition-all">
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                    
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Banknote className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400/70">Kasa</span>
                      </div>
                      <p className="text-2xl font-black text-white tabular-nums">{cashSalesToday.toFixed(0)}</p>
                      <div className="h-0.5 w-12 bg-emerald-500/20 rounded-full" />
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border border-blue-500/15 rounded-xl p-4 group hover:border-blue-500/25 transition-all">
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400/70">Karty</span>
                      </div>
                      <p className="text-2xl font-black text-white tabular-nums">{cardSalesToday.toFixed(0)}</p>
                      <div className="h-0.5 w-12 bg-blue-500/20 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                {/* SUMA + ZYSK - Final Results */}
                <div className="space-y-3">
                  
                  {/* Suma Sprzedaży (ile klient zapłacił) */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Suma Sprzedaży</span>
                      <span className="text-[9px] font-normal text-white/30 italic">(obrót)</span>
                    </div>
                    <span className="text-xl font-black text-white/90 tabular-nums">
                      {totalSalesToday.toFixed(0)}
                      <span className="text-sm font-normal text-white/40 ml-1">zł</span>
                    </span>
                  </div>

                  {/* Zysk Netto - Grand Finale */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600/20 via-green-500/15 to-emerald-500/20 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-900/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.1)_0%,_transparent_70%)]" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-base font-black uppercase tracking-[0.2em] text-emerald-300">Zysk</span>
                          <p className="text-[9px] font-normal text-emerald-400/50 mt-0.5">suma marż ze sprzedaży</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-4xl font-black tabular-nums drop-shadow-[0_0_25px_rgba(52,211,153,0.5)] ${zyskNetto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {zyskNetto >= 0 ? '+' : ''}{zyskNetto.toFixed(0)}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 mt-0.5">zysk netto</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Przycisk Zamknij Dzień - Pod Zyskiem Netto */}
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
        >
          <Clock className="h-5 w-5 mr-2" />
          Zamknij Dzień - Zapisz Stan Kasy
        </Button>

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
                  <span className="font-bold">{totalSalesToday.toFixed(2)} zł</span>
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
