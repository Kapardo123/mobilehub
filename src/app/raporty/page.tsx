"use client"

import { Navbar } from "@/components/navbar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  TrendingUp, 
  Download, 
  FileText, 
  Store, 
  Users,
  Calendar,
  MapPin,
  Smartphone,
  Package,
  Wrench,
  Settings
} from "lucide-react";

interface SaleItem {
  cat: string;
  name: string;
  price: number;
  profit: number;
  imei?: string;
}

interface Sale {
  id: string;
  ini: string;
  employeeId?: string;
  payment: string;
  date: string;
  time: string;
  items: SaleItem[];
  shop: string;
}
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { shopsService } from "@/lib/supabase/shops";
import { salesService } from "@/lib/supabase/sales";
import { formatDatePL, toISODateString } from "@/lib/dateFormat";
import { costsService } from "@/lib/supabase/costs";
import { inventoryService } from "@/lib/supabase/inventory";
import { usersService } from "@/lib/supabase/users";

export default function RaportyPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
      return;
    }
    setUserRole(role);
    setIsMounted(true);
  }, [router]);

  const currentUserRole = isMounted ? userRole : null;
  const currentShopId = isMounted ? getSessionStorageSafe("shopId", "") : "";
  const currentShopName = isMounted ? getSessionStorageSafe("shopName", "") : "";
  const currentUserId = isMounted ? getSessionStorageSafe("userId", "") : "";
  const isEmployee = currentUserRole === 'employee';

  const [activeTab, setActiveTab] = useState<'sklepy' | 'pracownicy'>(isEmployee ? 'pracownicy' : 'sklepy');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedShop, setSelectedShop] = useState<string>('all');
  
  // Zmienna pomocnicza dla UI (string ID)
  const shopIdForUI = isEmployee ? currentShopName : selectedShop;
  
  // Zmienna dla API (UUID - będzie ustawiona w useEffect)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [showPurchasedPhones, setShowPurchasedPhones] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [visiblePhoneCount, setVisiblePhoneCount] = useState(5);

  const months = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", 
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  const daysOfWeek = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

  const [shopsList, setShopsList] = useState<any[]>([]);
  
  const shops = [
    { id: "all", label: "Wszystkie sklepy", uuid: null },
    { id: "kaufland-wloclawek", label: "Kaufland Włocławek", uuid: null },
    { id: "riviera-gdynia", label: "Riviera Gdynia", uuid: null },
    { id: "dominikanska-wroclaw", label: "Dominikańska Wrocław", uuid: null }
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadReportData = async () => {
      try {
        console.log('📊 Ładowanie danych raportu z bazy...');
        
        // 0. Pobierz sklepy z bazy (dla mapowania ID na UUID)
        const shopsFromDB = await shopsService.getAll();
        console.log('🏪 Pobrano sklepy z bazy:', shopsFromDB.length, 'sztuk');
        console.log('🏪 Szczegóły sklepów:', shopsFromDB.map((s: any) => ({
          id: s.id,
          name: s.name,
          generatedKey: s.name?.toLowerCase()?.replace(/\s+/g, '-')
        })));
        setShopsList(shopsFromDB);
        
        // Stwórz mapę: string ID -> UUID
        const shopIdToUuidMap: Record<string, string> = {};
        
        // Funkcja do normalizacji tekstu (usuwa polskie znaki)
        const normalizeText = (text: string): string => {
          return text
            .toLowerCase()
            .replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ś/g, 's')
            .replace(/ć/g, 'c').replace(/ź/g, 'z').replace(/ż/g, 'z')
            .replace(/ó/g, 'o').replace(/ł/g, 'l').replace(/ń/g, 'n')
            .replace(/\s+/g, '-');
        };
        
        shopsFromDB.forEach((shop: any) => {
          // Generuj klucz BEZ polskich znaków
          const stringId = normalizeText(shop.name || '');
          if (stringId) {
            shopIdToUuidMap[stringId] = shop.id;
            console.log(`   📌 Mapuję: "${stringId}" (from "${shop.name}") -> ${shop.id}`);
          }
          
          // Dodaj też oryginalną nazwę jako alternatywę
          const originalKey = shop.name?.toLowerCase()?.replace(/\s+/g, '-') || '';
          if (originalKey && originalKey !== stringId) {
            shopIdToUuidMap[originalKey] = shop.id;
            console.log(`   📌 Mapuję alternatywnie: "${originalKey}" -> ${shop.id}`);
          }
        });
        
        console.log('🗺️ Mapa ID->UUID (finalna):', shopIdToUuidMap);
        
        // 1. Pobierz pracowników
        const employeesData = await usersService.getAllWithShops();
        
        // Pobierz nazwy aktywnych sklepów (tych, które istnieją w bazie)
        const activeShopNames = shopsFromDB.map((shop: any) => shop.name?.toLowerCase());
        console.log('🏪 Aktywne sklepy:', activeShopNames);
        
        // Filtruj pracowników:
        // - Ukryj właścicieli
        // - Pokaż tylko tych z aktywnymi sklepami
        // - Dla employee: pokaż tylko jego samego
        let filteredEmployeesData = employeesData.filter(emp => {
          // Ukryj właścicieli/adminów
          if (emp.role?.toLowerCase() === 'właściciel' || emp.role?.toLowerCase() === 'owner') {
            return false;
          }
          
          // Dla employee: pokaż tylko jego samego
          if (isEmployee && emp.id !== currentUserId) {
            return false;
          }
          
          // Sprawdź czy pracownik ma przynajmniej jeden AKTYWNY sklep
          const employeeShopNames = emp.shops?.map((s: any) => s.shop_name?.toLowerCase()) || [];
          
          console.log(`🔍 Pracownik ${emp.first_name} ${emp.last_name}: sklepy=${employeeShopNames}, aktywne=${activeShopNames}`);
          
          const hasActiveShop = employeeShopNames.some((shopName: string) => 
            activeShopNames.some(activeName => 
              activeName.includes(shopName) || shopName.includes(activeName)
            )
          );
          
          if (!hasActiveShop) {
            console.log(`❌ Pomijam pracownika ${emp.first_name} ${emp.last_name} - brak aktywnego sklepu`);
          }
          
          return hasActiveShop;
        });
        
        const activeEmployees = filteredEmployeesData.map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          initials: emp.initials || `${emp.first_name?.[0]}${emp.last_name?.[0]}`,
          role: emp.role === 'employee' ? 'Pracownik' : emp.role,
          shops: emp.shops?.map((s: any) => s.shop_name) || ['Brak danych']
        }));
        
        if (activeEmployees.length === 0 && !isEmployee) {
          setEmployees([
            { id: "mock1", name: "Brak pracowników w aktywnych sklepach", initials: "BP", role: "Pracownik", shops: ["-"] }
          ]);
        } else if (activeEmployees.length > 0) {
          setEmployees(activeEmployees);
        } else {
          setEmployees([]);
        }
        
        console.log('👥 Pobrano i odfiltrowano pracowników:', {
          total: employeesData.length,
          afterFilter: activeEmployees.length,
          currentUserId,
          isEmployee,
          sample: activeEmployees.slice(0, 3).map(e => ({
            id: e.id,
            name: e.name,
            shops: e.shops
          }))
        });
        
        // 2. Pobierz sprzedaż dla wybranego miesiąca/roku/sklepu
        const startDate = toISODateString(new Date(selectedYear, selectedMonth, 1));
        const endDate = toISODateString(new Date(selectedYear, selectedMonth + 1, 0));
        
        // Określ efektywny sklep (dla employee: zawsze jego sklep)
        let rawShopId = isEmployee ? currentShopId : selectedShop;
        let shopNameForMatch = isEmployee ? currentShopName : '';
        
        console.log('🔍 Przed konwersją:', {
          rawShopId,
          shopNameForMatch,
          isEmployee,
          currentShopId,
          currentShopName,
          selectedShop
        });
        
        // Konwertuj string ID/NAZWĘ na UUID - NAJPROSTSZA I NAJBARDZIEJ NIEZAWODNA METODA
        let effectiveShopUuid: string | undefined = undefined;
        
        if (rawShopId && rawShopId !== 'all') {
          // METODA 1: Jeśli to już UUID (zawiera myślniki)
          if (rawShopId.includes('-') && rawShopId.length > 30) {
            effectiveShopUuid = rawShopId;
            console.log(`✅ METODA 1: Używam UUID bezpośrednio: ${effectiveShopUuid}`);
          } 
          // METODA 2: Znajdź po dokładnej nazwie sklepu (dla employee)
          else if (shopNameForMatch) {
            const foundShop = shopsFromDB.find((s: any) => 
              s.name === shopNameForMatch || 
              s.name?.toLowerCase() === shopNameForMatch?.toLowerCase()
            );
            
            if (foundShop?.id) {
              effectiveShopUuid = foundShop.id;
              console.log(`✅ METODA 2: Znaleziono po nazwie "${shopNameForMatch}" -> ${effectiveShopUuid}`);
            } else {
              console.error(`❌ METODA 2: Nie znaleziono sklepu o nazwie: "${shopNameForMatch}"`);
            }
          }
          // METODA 3: Znajdź po string ID w mapie
          else if (shopIdToUuidMap[rawShopId]) {
            effectiveShopUuid = shopIdToUuidMap[rawShopId];
            console.log(`✅ METODA 3: Mapowanie po kluczu "${rawShopId}" -> ${effectiveShopUuid}`);
          }
          // METODA 4: Szukaj podobnego klucza (fuzzy match)
          else {
            const similarKey = Object.keys(shopIdToUuidMap).find(key => 
              key.includes(rawShopId.toLowerCase()) || rawShopId.toLowerCase().includes(key)
            );
            
            if (similarKey) {
              effectiveShopUuid = shopIdToUuidMap[similarKey];
              console.log(`✅ METODA 4: Podobny klucz "${similarKey}" -> ${effectiveShopUuid}`);
            } else {
              // METODA 5: OSTATNIA DESKA - szukaj w nazwach sklepów
              const foundByName = shopsFromDB.find((s: any) => 
                s.name?.toLowerCase()?.includes(rawShopId.toLowerCase()) ||
                rawShopId.toLowerCase().includes(s.name?.toLowerCase() || '')
              );
              
              if (foundByName?.id) {
                effectiveShopUuid = foundByName.id;
                console.log(`✅ METODA 5: Znaleziono w nazwie "${rawShopId}" -> ${effectiveShopUuid} (sklep: ${foundByName.name})`);
              } else {
                console.error(`❌ WSZYSTKIE METODY zawiodły dla: "${rawShopId}"`);
                console.error(`   Dostępne sklepy:`, shopsFromDB.map((s: any) => ({ id: s.id, name: s.name })));
              }
            }
          }
        }
        
        if (!effectiveShopUuid && rawShopId && rawShopId !== 'all') {
          console.error('🚨 KRYTYCZNY BŁĄD: Nie udało się znaleźć UUID dla sklepu! Będzie błąd 400!');
        }
        
        console.log(`🎯 Efektywny sklep FINALNY: ${effectiveShopUuid || 'BRAK/ALL'} (raw: "${rawShopId}")`);
        
        // Pobierz sprzedaż z opcjonalnym filtrowaniem po sklepie
        const dbSales = await salesService.getByDateRange(startDate, endDate, effectiveShopUuid);
        
        console.log(`📈 Pobrano ${dbSales.length} sprzedaży z bazy`);
        
        // Mapuj dane z bazy na format Sale interface
        const mappedSales: Sale[] = dbSales.map(sale => {
          // Znajdź pracownika po employee_id, żeby pobrać prawdziwe inicjały
          const saleEmployee = employees.find(e => e.id === sale.employee_id);
          
          return {
            id: sale.id,
            ini: saleEmployee?.initials || sale.employee_id?.slice(0, 2)?.toUpperCase() || '??',
            employeeId: sale.employee_id,
            payment: sale.payment_method || 'gotówka',
            date: sale.sale_date,
            time: sale.created_at?.split('T')[1]?.slice(0, 5) || '00:00',
          items: (sale.sale_items || []).map((item: any) => {
            let cat = 'usluga';
            
            // 1. Użyj kategorii z bazy jeśli istnieje
            if (item.category && item.category.trim() !== '') {
              cat = item.category.toLowerCase().trim();
            } else {
              // 2. Zgadnij po nazwie produktu
              const nameLower = (item.product_name || '').toLowerCase();
              
              if (nameLower.includes('iphone') || nameLower.includes('samsung') || 
                  nameLower.includes('xiaomi') || nameLower.includes('telefon') ||
                  nameLower.includes('phone') || nameLower.includes('motorola')) {
                cat = 'telefon';
              } else if (nameLower.includes('szkło') || nameLower.includes('etui') || 
                        nameLower.includes('kabel') || nameLower.includes('ładowarka') ||
                        nameLower.includes('etchui') || nameLower.includes('case') ||
                        nameLower.includes('słuchaw') || nameLower.includes('powerbank')) {
                cat = 'akcesoria';
              } else if (nameLower.includes('wymiana') || nameLower.includes('naprawa') || 
                        nameLower.includes('serwis') || nameLower.includes('wymienić')) {
                cat = 'serwis';
              }
            }
            
            console.log(`📦 Kategoria produktu: "${item.product_name}" -> ${cat} (z bazy: "${item.category}")`);
            
            return {
              cat,
              name: item.product_name || 'Produkt',
              price: Number(item.total_price) || Number(item.price) || 0,
              profit: Number(item.profit) || Math.round(Number(item.total_price || item.price || 0) * 0.15),
              imei: item.imei || undefined
            };
          }),
          shop: shops.find(s => s.id === sale.shop_id)?.label || 'Nieznany sklep'
          };
        });
        
        console.log('📦 Zmapowano sprzedaż:', {
          total: mappedSales.length,
          sample: mappedSales.slice(0, 2).map(s => ({
            id: s.id,
            ini: s.ini,
            employeeId: s.employeeId,
            shop: s.shop
          }))
        });
        
        setSales(mappedSales);
        
        // 3. Pobierz magazyn/inventory
        let inventoryQuery = inventoryService.getAll();
        if (effectiveShopUuid) {
          const allInventory = await inventoryQuery;
          const filteredInventory = allInventory.filter(item => item.shop_id === effectiveShopUuid);
          setInventory(filteredInventory);
        } else {
          const invData = await inventoryQuery;
          setInventory(invData);
        }
        
        // 4. Pobierz koszty dla wybranego miesiąca/roku/sklepu
        const costsStartDate = toISODateString(new Date(selectedYear, selectedMonth, 1));
        const costsEndDate = toISODateString(new Date(selectedYear, selectedMonth + 1, 0));
        
        // Pobierz koszty z opcjonalnym filtrowaniem po sklepie
        const dbCosts = await costsService.getByDateRange(costsStartDate, costsEndDate, effectiveShopUuid);
        
        console.log(`💰 Pobrano ${dbCosts.length} kosztów z bazy`);
        setCosts(dbCosts);
        
        console.log('📦 Pobrano magazyn:', inventory.length > 0 ? inventory.length : 0, 'pozycji');
        
        setIsMounted(true);
        console.log('✅ Dane raportu załadowane pomyślnie');
        
      } catch (error) {
        console.error('❌ Błąd ładowania danych raportu:', error);
        console.error('=== SZCZEGÓŁY BŁĘDU RAPORT ===');
        console.error('Type:', typeof error);
        console.error('Is null:', error === null);
        console.error('Is undefined:', error === undefined);
        console.error('Constructor:', error?.constructor?.name);
        if (error && typeof error === 'object') {
          console.error('Keys:', Object.keys(error));
          console.error('Properties:', Object.getOwnPropertyNames(error));
          console.error('Message:', (error as any).message || 'brak');
          console.error('Code:', (error as any).code || 'brak');
          console.error('Details:', (error as any).details || 'brak');
          console.error('Hint:', (error as any).hint || 'brak');
          try {
            console.error('Full serialized:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          } catch(e) {
            console.error('Cannot serialize error');
          }
        }
        setIsMounted(true);
      }
    };
    
    loadReportData();
  }, [selectedMonth, selectedYear, selectedShop]);

  // Filter sales by selected month and year, and optionally by shop
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();
      
      let shopMatch = true;
      if (shopIdForUI && shopIdForUI !== 'all' && shopIdForUI !== '') {
        const shopName = shopIdForUI === 'kaufland-wloclawek' ? 'Kaufland Włocławek' : 
                         shopIdForUI === 'riviera-gdynia' ? 'Riviera Gdynia' : 
                         shopIdForUI === 'dominikanska-wroclaw' ? 'Dominikańska Wrocław' : 
                         shopIdForUI; // Dla employee: użyj bezpośrednio nazwy
        shopMatch = sale.shop === shopName || sale.shop?.includes(shopName);
      }
      
      return saleMonth === selectedMonth && saleYear === selectedYear && shopMatch;
    });
  }, [sales, selectedMonth, selectedYear, shopIdForUI]);

  // Generate report data for shops tab
  const reportData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    let cumulativeSum = 0;
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(selectedYear, selectedMonth, day);
      const dayName = daysOfWeek[date.getDay()];
      
      // Get sales for this specific day
      const daySales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getDate() === day;
      });
      
      const profit = daySales.reduce((sum: number, sale: Sale) => sum + sale.items.reduce((s: number, item: SaleItem) => s + item.profit, 0), 0);
      const revenue = daySales.reduce((sum: number, sale: Sale) => sum + sale.items.reduce((s: number, item: SaleItem) => s + item.price, 0), 0);
      
      // Pobierz koszty dla tego konkretnego dnia
      const dayCosts = costs.filter(cost => {
        const costDate = new Date(cost.cost_date);
        return costDate.getDate() === day;
      });
      const dailyCosts = dayCosts.reduce((sum: number, cost: any) => sum + (Number(cost.amount) || 0), 0);
      
      cumulativeSum += profit;
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      return {
        dayName,
        fullDate: `${day}.${(selectedMonth + 1).toString().padStart(2, '0')}.${selectedYear}`,
        profit,
        revenue,
        costs: dailyCosts,
        cumulative: cumulativeSum,
        isWeekend
      };
    });
  }, [filteredSales, selectedMonth, selectedYear, costs]);

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };

  // Generate employee report data
  const employeeData = useMemo(() => {
    const employeeMap = new Map();
    
    console.log('👥 Generowanie raportu pracowników:', {
      isEmployee,
      currentUserId,
      shopIdForUI,
      totalEmployees: employees.length,
      totalSales: filteredSales.length
    });
    
    // First, initialize with all employees from employees list
    employees.forEach(emp => {
      if (emp.role.toLowerCase() !== 'właściciel') {
        // Dla employee: pokaż tylko jego własny raport
        if (isEmployee && emp.id !== currentUserId) {
          return;
        }
        
        let employeeShops = emp.shops || emp.shop;
        if (!employeeShops) {
          employeeShops = ['Brak danych'];
        } else if (typeof employeeShops === 'string') {
          employeeShops = [employeeShops];
        }
        
        let shopMatch = true;
        if (shopIdForUI && shopIdForUI !== 'all' && shopIdForUI !== '') {
          const shopName = shopIdForUI === 'kaufland-wloclawek' ? 'Kaufland Włocławek' : 
                           shopIdForUI === 'riviera-gdynia' ? 'Riviera Gdynia' : 
                           shopIdForUI === 'dominikanska-wroclaw' ? 'Dominikańska Wrocław' : 
                           shopIdForUI;
          shopMatch = employeeShops.includes(shopName) || employeeShops.some((s: string) => s.includes(shopName));
        }
        
        if (shopMatch) {
          employeeMap.set(emp.id, {
            id: emp.id,
            name: emp.name,
            initials: emp.initials,
            role: emp.role,
            shops: employeeShops,
            salesTotal: 0,
            profitTotal: 0,
            transactionsCount: 0,
            categoriesBreakdown: {
              telefon: 0,
              akcesoria: 0,
              serwis: 0,
              usluga: 0
            },
            categoryStats: {
              telefonyCount: 0,
              telefonyTotal: 0,
              akcesoriaCount: 0,
              akcesoriaTotal: 0,
              serwisCount: 0,
              serwisTotal: 0,
              uslugaCount: 0,
              uslugaTotal: 0
            },
            dailyBreakdown: [],
            weeklyBreakdown: [],
            monthlyBreakdown: { sales: 0, profit: 0, transactions: 0 },
            skupStats: {
              telefonySkupCount: 0,
              telefonySkupTotal: 0,
              telefonyNaStanie: 0
            }
          });
        }
      }
    });
    
    // Now calculate sales for each employee
    filteredSales.forEach(sale => {
      const employee = employees.find(e => e.initials === sale.ini || e.id === sale.employeeId);
      
      if (!employee) {
        if (filteredSales.indexOf(sale) < 3) {
          console.log('⚠️ Nie znaleziono pracownika dla sprzedaży:', {
            saleIni: sale.ini,
            saleEmployeeId: sale.employeeId,
            availableEmployees: employees.map(e => ({ id: e.id, initials: e.initials }))
          });
        }
        return;
      }
      
      const empData = employeeMap.get(employee.id);
      if (!empData) return;
      
      const saleTotal = sale.items.reduce((sum: number, item: SaleItem) => sum + item.price, 0);
      const saleProfit = sale.items.reduce((sum: number, item: SaleItem) => sum + item.profit, 0);
      
      empData.salesTotal += saleTotal;
      empData.profitTotal += saleProfit;
      empData.transactionsCount += 1;
      
      // Category breakdown
      sale.items.forEach(item => {
        console.log(`📊 Sumowanie kategorii: ${item.name} (${item.cat}) - cena: ${item.price}`);
        
        if (empData.categoriesBreakdown[item.cat] !== undefined) {
          empData.categoriesBreakdown[item.cat] += item.price;
          console.log(`   ✅ Dodano do ${item.cat}: teraz = ${empData.categoriesBreakdown[item.cat]}`);
        } else {
          console.log(`   ⚠️ Nieznana kategoria: "${item.cat}" (dostępne: ${Object.keys(empData.categoriesBreakdown).join(', ')})`);
        }
        
        // Category stats - count and total for each category
        if (item.cat === 'telefon') {
          empData.categoryStats.telefonyCount += 1;
          empData.categoryStats.telefonyTotal += item.price;
        } else if (item.cat === 'akcesoria') {
          empData.categoryStats.akcesoriaCount += 1;
          empData.categoryStats.akcesoriaTotal += item.price;
        } else if (item.cat === 'serwis') {
          empData.categoryStats.serwisCount += 1;
          empData.categoryStats.serwisTotal += item.price;
        } else if (item.cat === 'usluga') {
          empData.categoryStats.uslugaCount += 1;
          empData.categoryStats.uslugaTotal += item.price;
        }
      });
      
      // Daily breakdown
      const saleDate = new Date(sale.date);
      const existingDay = empData.dailyBreakdown.find((d: any) => 
        d.date === `${saleDate.getDate()}.${(saleDate.getMonth() + 1).toString().padStart(2, '0')}.${saleDate.getFullYear()}`
      );
      
      if (existingDay) {
        existingDay.sales += saleTotal;
        existingDay.profit += saleProfit;
        existingDay.transactions += 1;
      } else {
        empData.dailyBreakdown.push({
          date: `${saleDate.getDate()}.${(saleDate.getMonth() + 1).toString().padStart(2, '0')}.${saleDate.getFullYear()}`,
          sales: saleTotal,
          profit: saleProfit,
          transactions: 1
        });
      }
      
      // Weekly breakdown
      const weekNumber = getWeekNumber(saleDate);
      const existingWeek = empData.weeklyBreakdown.find((w: any) => w.week === weekNumber && w.year === saleDate.getFullYear());
      
      if (existingWeek) {
        existingWeek.sales += saleTotal;
        existingWeek.profit += saleProfit;
        existingWeek.transactions += 1;
      } else {
        empData.weeklyBreakdown.push({
          week: weekNumber,
          year: saleDate.getFullYear(),
          sales: saleTotal,
          profit: saleProfit,
          transactions: 1
        });
      }
      
      // Monthly breakdown update
      empData.monthlyBreakdown.sales += saleTotal;
      empData.monthlyBreakdown.profit += saleProfit;
      empData.monthlyBreakdown.transactions += 1;
    });
    
    // Calculate skup (purchase) stats from inventory
    if (inventory.length > 0) {
      inventory.forEach((item: any) => {
        if (item.category === "telefon" && item.addedBy) {
          // Find employee by name or initials
          const employee = employees.find((e: any) => 
            e.name === item.addedBy || 
            e.initials === item.addedBy ||
            `${e.name} (${e.initials})` === item.addedBy
          );
          
          if (employee) {
            const empData = employeeMap.get(employee.id);
            if (empData) {
              empData.skupStats.telefonySkupCount += 1;
              const purchasePrice = parseInt(item.purchasePrice) || 0;
              empData.skupStats.telefonySkupTotal += purchasePrice;
              
              // Count phones still in stock (not sold)
              if (!item.statusSprzedany) {
                empData.skupStats.telefonyNaStanie += 1;
              }
            }
          }
        }
      });
    }
    
    const result = Array.from(employeeMap.values());
    console.log('✅ Wygenerowano raport dla', result.length, 'pracowników:', result.map(e => ({ name: e.name, salesTotal: e.salesTotal })));
    
    return result;
  }, [employees, filteredSales, shopIdForUI, inventory, isEmployee, currentUserId]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      profit: acc.profit + curr.profit,
      revenue: acc.revenue + curr.revenue,
      costs: acc.costs + curr.costs
    }), { profit: 0, revenue: 0, costs: 0 });
  }, [reportData]);

  // Oblicz statystyki roczne
  const yearlyStats = useMemo(() => {
    const currentYearProfit = totals.profit;
    const yearProgress = ((selectedMonth + 1) / 12) * 100;
    
    return {
      currentYearProfit,
      yearProgress: Math.min(yearProgress, 100)
    };
  }, [totals.profit, selectedMonth]);

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-accent/20">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-primary/70 font-medium">Ładowanie danych raportu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 lg:p-8 w-full max-w-[1200px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={userRole === "employee" ? "/pracownik" : "/"}>
              <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm border border-primary/10 text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Raport Miesięczny</h1>
              <p className="text-primary/70 font-medium uppercase text-[10px] tracking-widest">Zestawienie wyników</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-primary/10">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "rounded-xl text-[10px] font-black uppercase px-4 h-9 transition-all",
                  activeTab === 'sklepy' ? "bg-secondary text-white" : "text-muted-foreground hover:text-primary"
                )}
                onClick={() => setActiveTab('sklepy')}
              >
                <Store className="h-3 w-3 mr-2" />
                Sklepy
              </Button>
              {!isEmployee && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "rounded-xl text-[10px] font-black uppercase px-4 h-9 transition-all",
                    activeTab === 'pracownicy' ? "bg-secondary text-white" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setActiveTab('pracownicy')}
                >
                  <Users className="h-3 w-3 mr-2" />
                  Pracownicy
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-primary/10">
              <MapPin className="h-4 w-4 text-primary ml-2" />
              {isEmployee ? (
                <div className="flex items-center gap-2 px-3 h-9">
                  <span className="text-[10px] font-black uppercase text-primary">{currentShopName || 'Twój sklep'}</span>
                  <Badge variant="secondary" className="text-[8px] px-1.5">Tylko Twój sklep</Badge>
                </div>
              ) : (
                <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || selectedShop)} items={shops.map(shop => ({ value: shop.id, label: shop.label }))}>
                  <SelectTrigger className="h-9 w-[180px] rounded-xl border-none shadow-none text-[10px] font-black uppercase">
                    <SelectValue placeholder="Wybierz sklep" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id} className="text-[10px] font-bold uppercase">
                        {shop.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-primary/10">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl text-primary hover:bg-accent"
                onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1 text-center min-w-[140px]">
                <p className="text-xs font-black uppercase tracking-tighter text-foreground">{months[selectedMonth]}</p>
                <p className="text-[10px] font-bold text-primary/60">{selectedYear}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl text-primary hover:bg-accent"
                onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {activeTab === 'sklepy' ? (
          /* SHOPS VIEW - EXCEL TABLE */
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border border-primary/5">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary border-none">
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 border-r border-white/5">Dzień</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest border-r border-white/5">L.P.</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-center bg-primary/20 border-r border-white/5">Zysk ({months[selectedMonth].toLowerCase()})</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right border-r border-white/5">Wpływ</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right border-r border-white/5">Koszta</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right">{selectedYear}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((day, i) => (
                      <TableRow 
                        key={i} 
                        className={cn(
                          "border-b border-primary/5 hover:bg-accent/30 transition-colors",
                          day.dayName === "niedziela" ? "bg-accent/10" : "",
                          day.costs < -1000 ? "bg-red-50/50" : "",
                          day.profit > 1500 ? "bg-primary/5" : ""
                        )}
                      >
                        <TableCell className="font-bold text-muted-foreground text-xs py-3 border-r border-primary/5">{day.dayName}</TableCell>
                        <TableCell className="font-black text-foreground text-xs border-r border-primary/5">{day.fullDate}</TableCell>
                        <TableCell className="text-center font-black text-primary bg-accent/30 border-r border-primary/5">
                          {isMounted ? (day.profit > 0 ? day.profit : 0) : 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground border-r border-primary/5">{isMounted ? day.revenue : 0}</TableCell>
                        <TableCell className={cn(
                          "text-right font-black border-r border-primary/5",
                          day.costs < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {isMounted ? (day.costs !== 0 ? day.costs : 0) : 0}
                        </TableCell>
                        <TableCell className="text-right font-black text-foreground bg-accent/10">
                          {isMounted ? day.cumulative : 0}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Summary Row */}
                    <TableRow className="bg-secondary hover:bg-secondary border-none">
                      <TableCell colSpan={2} className="text-white font-black uppercase text-[10px] tracking-widest py-6 text-right border-r border-white/5">Suma Miesiąca:</TableCell>
                      <TableCell className="text-center text-primary font-black text-lg bg-primary/10 border-r border-white/5">{isMounted ? totals.profit : 0}</TableCell>
                      <TableCell className="text-right text-white font-black text-lg border-r border-white/5">{isMounted ? totals.revenue : 0}</TableCell>
                      <TableCell className="text-right text-red-400 font-black text-lg border-r border-white/5">{isMounted ? totals.costs : 0}</TableCell>
                      <TableCell className="text-right text-primary font-black text-xl bg-white/5">
                        {isMounted ? (reportData[reportData.length - 1]?.cumulative || 0) : 0}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* EMPLOYEES VIEW */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeeData.map((emp, i) => (
                <Card 
                  key={i} 
                  className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-primary/5"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setIsEmployeeDetailsOpen(true);
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center font-black text-primary text-sm border border-primary/10 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        {emp.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-black text-foreground group-hover:text-primary transition-colors">{emp.name}</h3>
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/10 text-primary">
                            {emp.shops?.[0] || 'Brak danych'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Obrót</p>
                            <p className="text-sm font-black text-foreground">{emp.salesTotal.toLocaleString()} zł</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zysk</p>
                            <p className="text-sm font-black text-emerald-600">{emp.profitTotal.toLocaleString()} zł</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transakcje</p>
                            <p className="text-sm font-black text-foreground">{emp.transactionsCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Employee Details Modal */}
        <Dialog open={isEmployeeDetailsOpen} onOpenChange={setIsEmployeeDetailsOpen}>
          <DialogContent className="sm:max-w-[700px] rounded-3xl border-none p-0 overflow-hidden flex flex-col max-h-[90vh]">
            {selectedEmployee && (
              <>
                <DialogHeader className="p-8 bg-secondary text-white border-none">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center font-black text-xl text-white shadow-lg shadow-primary/20">
                      {selectedEmployee.initials}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-black mb-1">{selectedEmployee.name}</DialogTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white/10 text-white border-none px-2 py-0.5 font-black text-[9px] uppercase">
                          {selectedEmployee.shops?.[0] || 'Brak danych'}
                        </Badge>
                        <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                          {selectedEmployee.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-accent/50 rounded-2xl border border-primary/10">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Obrót</p>
                      <p className="text-2xl font-black text-foreground">{selectedEmployee.salesTotal.toLocaleString()} zł</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest mb-1">Zysk</p>
                      <p className="text-2xl font-black text-emerald-600">{selectedEmployee.profitTotal.toLocaleString()} zł</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] text-blue-600/60 font-bold uppercase tracking-widest mb-1">Transakcje</p>
                      <p className="text-2xl font-black text-blue-600">{selectedEmployee.transactionsCount}</p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-primary/10">
                    <CardContent className="p-5">
                      <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">Sprzedaż wg kategorii</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-bold text-muted-foreground w-24">Telefony</span>
                          <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${Math.min(100, (selectedEmployee.categoriesBreakdown.telefon / Math.max(selectedEmployee.salesTotal, 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-foreground min-w-[70px] text-right">{selectedEmployee.categoriesBreakdown.telefon.toLocaleString()} zł</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-bold text-muted-foreground w-24">Akcesoria</span>
                          <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, (selectedEmployee.categoriesBreakdown.akcesoria / Math.max(selectedEmployee.salesTotal, 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-foreground min-w-[70px] text-right">{selectedEmployee.categoriesBreakdown.akcesoria.toLocaleString()} zł</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Wrench className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-bold text-muted-foreground w-24">Serwisy</span>
                          <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${Math.min(100, (selectedEmployee.categoriesBreakdown.serwis / Math.max(selectedEmployee.salesTotal, 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-foreground min-w-[70px] text-right">{selectedEmployee.categoriesBreakdown.serwis.toLocaleString()} zł</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Settings className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-bold text-muted-foreground w-24">Usługi</span>
                          <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${Math.min(100, (selectedEmployee.categoriesBreakdown.usluga / Math.max(selectedEmployee.salesTotal, 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-foreground min-w-[70px] text-right">{selectedEmployee.categoriesBreakdown.usluga.toLocaleString()} zł</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Category Stats */}
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-primary/10">
                    <CardContent className="p-5">
                      <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">Szczegółowe statystyki</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Telefony */}
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="h-4 w-4 text-purple-500" />
                            <span className="text-xs font-black text-purple-700 uppercase">Telefony</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Sprzedane:</span>
                              <span className="text-sm font-black text-purple-700">{selectedEmployee.categoryStats?.telefonyCount || 0} szt.</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Suma:</span>
                              <span className="text-sm font-bold text-purple-700">{(selectedEmployee.categoryStats?.telefonyTotal || 0).toLocaleString()} zł</span>
                            </div>
                            {selectedEmployee.categoryStats?.telefonyCount > 0 && (
                              <div className="flex justify-between items-center pt-1 border-t border-purple-200">
                                <span className="text-[10px] text-muted-foreground">Średnia:</span>
                                <span className="text-xs font-black text-purple-600">
                                  {Math.round(selectedEmployee.categoryStats.telefonyTotal / selectedEmployee.categoryStats.telefonyCount).toLocaleString()} zł
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Akcesoria */}
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-black text-blue-700 uppercase">Akcesoria</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Sprzedane:</span>
                              <span className="text-sm font-black text-blue-700">{selectedEmployee.categoryStats?.akcesoriaCount || 0} szt.</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Suma:</span>
                              <span className="text-sm font-bold text-blue-700">{(selectedEmployee.categoryStats?.akcesoriaTotal || 0).toLocaleString()} zł</span>
                            </div>
                            {selectedEmployee.categoryStats?.akcesoriaCount > 0 && (
                              <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                                <span className="text-[10px] text-muted-foreground">Średnia:</span>
                                <span className="text-xs font-black text-blue-600">
                                  {Math.round(selectedEmployee.categoryStats.akcesoriaTotal / selectedEmployee.categoryStats.akcesoriaCount).toLocaleString()} zł
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Serwisy */}
                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="h-4 w-4 text-orange-500" />
                            <span className="text-xs font-black text-orange-700 uppercase">Serwisy</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Wykonane:</span>
                              <span className="text-sm font-black text-orange-700">{selectedEmployee.categoryStats?.serwisCount || 0} szt.</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Suma:</span>
                              <span className="text-sm font-bold text-orange-700">{(selectedEmployee.categoryStats?.serwisTotal || 0).toLocaleString()} zł</span>
                            </div>
                            {selectedEmployee.categoryStats?.serwisCount > 0 && (
                              <div className="flex justify-between items-center pt-1 border-t border-orange-200">
                                <span className="text-[10px] text-muted-foreground">Średnia:</span>
                                <span className="text-xs font-black text-orange-600">
                                  {Math.round(selectedEmployee.categoryStats.serwisTotal / selectedEmployee.categoryStats.serwisCount).toLocaleString()} zł
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Usługi */}
                        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-black text-green-700 uppercase">Usługi</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Wykonane:</span>
                              <span className="text-sm font-black text-green-700">{selectedEmployee.categoryStats?.uslugaCount || 0} szt.</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted-foreground">Suma:</span>
                              <span className="text-sm font-bold text-green-700">{(selectedEmployee.categoryStats?.uslugaTotal || 0).toLocaleString()} zł</span>
                            </div>
                            {selectedEmployee.categoryStats?.uslugaCount > 0 && (
                              <div className="flex justify-between items-center pt-1 border-t border-green-200">
                                <span className="text-[10px] text-muted-foreground">Średnia:</span>
                                <span className="text-xs font-black text-green-600">
                                  {Math.round(selectedEmployee.categoryStats.uslugaTotal / selectedEmployee.categoryStats.uslugaCount).toLocaleString()} zł
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skup (Purchase) Stats */}
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-primary/10 bg-gradient-to-br from-rose-50 to-orange-50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Skup telefonów</h4>
                        <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-none text-[9px] font-black ml-auto">
                          Na stan
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-center">
                          <p className="text-[9px] text-rose-600/60 font-bold uppercase mb-1">Przyjęte</p>
                          <p className="text-2xl font-black text-rose-700">{selectedEmployee.skupStats?.telefonySkupCount || 0}</p>
                          <p className="text-[10px] text-muted-foreground">telefonów</p>
                        </div>
                        
                        <div className="p-3 bg-white/80 rounded-xl border border-orange-200 text-center">
                          <p className="text-[9px] text-orange-600/60 font-bold uppercase mb-1">Wartość zakupu</p>
                          <p className="text-lg font-black text-orange-700">{(selectedEmployee.skupStats?.telefonySkupTotal || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">zł</p>
                        </div>
                        
                        <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-center">
                          <p className="text-[9px] text-emerald-600/60 font-bold uppercase mb-1">Na stanie</p>
                          <p className="text-2xl font-black text-emerald-600">{selectedEmployee.skupStats?.telefonyNaStanie || 0}</p>
                          <p className="text-[10px] text-muted-foreground">sztuk</p>
                        </div>
                      </div>
                      
                      {selectedEmployee.skupStats?.telefonySkupCount > 0 && (
                        <div className="mt-3 p-2 bg-white/60 rounded-lg border border-rose-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-muted-foreground">Średnia cena zakupu:</span>
                            <span className="font-black text-rose-700">
                              {Math.round(selectedEmployee.skupStats.telefonySkupTotal / selectedEmployee.skupStats.telefonySkupCount).toLocaleString()} zł
                            </span>
                          </div>
                          {selectedEmployee.skupStats.telefonyNaStanie > 0 && (
                            <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-rose-100">
                              <span className="font-bold text-muted-foreground">Zablokowany kapitał:</span>
                              <span className="font-black text-orange-600">
                                {(() => {
                                  // Calculate average purchase price * phones in stock
                                  const avgPrice = Math.round(selectedEmployee.skupStats.telefonySkupTotal / selectedEmployee.skupStats.telefonySkupCount);
                                  return (avgPrice * selectedEmployee.skupStats.telefonyNaStanie).toLocaleString();
                                })()} zł
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Purchased Phones List */}
                  {(() => {
                    const employeePhones = inventory.filter((item: any) => {
                      if (item.category !== "telefon" || !item.addedBy) return false;
                      
                      const employee = employees.find((e: any) => 
                        e.initials === item.addedBy ||
                        e.name === item.addedBy ||
                        `${e.name} (${e.initials})` === item.addedBy
                      );
                      return employee && employee.id === selectedEmployee.id;
                    });
                    
                    // Debug: show all phones if no employee match found
                    const allPhones = employeePhones.length > 0 ? employeePhones : 
                      (selectedEmployee?.id ? inventory.filter((item: any) => item.category === "telefon") : []);
                    
                    // Sort by date - newest first
                    const sortedPhones = [...allPhones].sort((a: any, b: any) => {
                      const dateA = new Date(a.addedDate || a.purchaseDate || '1970-01-01').getTime();
                      const dateB = new Date(b.addedDate || b.purchaseDate || '1970-01-01').getTime();
                      return dateB - dateA; // Newest first
                    });
                    
                    // Pagination - show only visiblePhoneCount items
                    const displayPhones = sortedPhones.slice(0, visiblePhoneCount);
                    const hasMore = sortedPhones.length > visiblePhoneCount;
                    
                    if (sortedPhones.length === 0) return null;
                    
                    return (
                      <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-primary/10">
                        <CardContent className="p-5">
                          <button
                            onClick={() => {
                              setShowPurchasedPhones(showPurchasedPhones === selectedEmployee.id ? null : selectedEmployee.id);
                              setVisiblePhoneCount(5); // Reset pagination when opening
                              setSelectedPhone(null); // Close any expanded phone
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 hover:from-rose-100 hover:to-orange-100 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-sm">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Zakupione telefony</h4>
                                <p className="text-[9px] text-muted-foreground/60 font-medium">Kliknij aby zobaczyć listę</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-none text-[9px] font-black px-2.5 py-1">
                                {sortedPhones.length} szt.
                              </Badge>
                              <div className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-300",
                                showPurchasedPhones === selectedEmployee.id 
                                  ? "bg-rose-500 rotate-180" 
                                  : "bg-rose-100 group-hover:bg-rose-200"
                              )}>
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-colors",
                                  showPurchasedPhones === selectedEmployee.id ? "text-white" : "text-rose-600"
                                )} />
                              </div>
                            </div>
                          </button>

                          {showPurchasedPhones === selectedEmployee.id && (
                            <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                              {displayPhones.map((phone: any, index: number) => (
                                <div key={index} className="space-y-0">
                                  {/* Compact row - only name and date */}
                                  <button
                                    onClick={() => setSelectedPhone(selectedPhone === `${selectedEmployee.id}-${index}` ? null : `${selectedEmployee.id}-${index}`)}
                                    className={cn(
                                      "w-full p-3 rounded-xl border transition-all hover:shadow-md text-left group",
                                      phone.statusSprzedany 
                                        ? "bg-gray-50 border-gray-200 opacity-60 hover:opacity-80" 
                                        : "bg-white border-rose-100 hover:border-rose-300 hover:bg-rose-50/30",
                                      selectedPhone === `${selectedEmployee.id}-${index}` && "border-rose-300 bg-rose-50/50"
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={cn(
                                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                          phone.statusSprzedany ? "bg-gray-200" : "bg-gradient-to-br from-rose-100 to-orange-100 group-hover:from-rose-200 group-hover:to-orange-200",
                                          selectedPhone === `${selectedEmployee.id}-${index}` && "bg-gradient-to-br from-rose-200 to-orange-200"
                                        )}>
                                          <Smartphone className={cn(
                                            "h-4 w-4 transition-colors",
                                            phone.statusSprzedany ? "text-gray-500" : "text-rose-600 group-hover:text-rose-700",
                                            selectedPhone === `${selectedEmployee.id}-${index}` && "text-rose-700"
                                          )} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <h5 className="font-bold text-sm text-foreground truncate">{phone.name}</h5>
                                            {phone.statusSprzedany && (
                                              <Badge variant="secondary" className="text-[7px] h-3.5 px-1 bg-emerald-100 text-emerald-700 border-none shrink-0">
                                                Sprzedany
                                              </Badge>
                                            )}
                                            {!phone.statusSprzedany && (
                                              <Badge variant="secondary" className="text-[7px] h-3.5 px-1 bg-blue-100 text-blue-700 border-none shrink-0">
                                                Na stanie
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {(phone.addedDate || phone.purchaseDate) 
                                              ? formatDatePL(phone.addedDate || phone.purchaseDate)
                                              : 'Brak daty'
                                            }
                                          </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="text-sm font-black text-orange-700">
                                            {(parseInt(phone.purchasePrice) || 0).toLocaleString()} zł
                                          </span>
                                          <ChevronDown className={cn(
                                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                            selectedPhone === `${selectedEmployee.id}-${index}` && "rotate-180 text-rose-600"
                                          )} />
                                        </div>
                                      </div>
                                    </div>
                                  </button>

                                  {/* Expanded details - show on click */}
                                  {selectedPhone === `${selectedEmployee.id}-${index}` && (
                                    <div className="ml-12 mt-2 p-4 bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-xl border border-rose-200 animate-in slide-in-from-top-2 duration-200 space-y-3">
                                      
                                      {/* Basic Info Grid */}
                                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Marka</p>
                                          <p className="font-semibold text-foreground">{phone.brand || '-'}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Model</p>
                                          <p className="font-semibold text-foreground">{phone.model || '-'}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Pamięć</p>
                                          <p className="font-semibold text-foreground">{phone.memory || '-'}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Kolor</p>
                                          <p className="font-semibold text-foreground">{phone.color || '-'}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Stan</p>
                                          <span className={cn(
                                            "font-bold px-2 py-0.5 rounded text-xs inline-block",
                                            !phone.condition ? "bg-gray-100 text-gray-600" :
                                            phone.condition.toLowerCase() === "nowy" ? "bg-emerald-100 text-emerald-700" :
                                            phone.condition.toLowerCase() === "używany" ? "bg-amber-100 text-amber-700" :
                                            "bg-sky-100 text-sky-700"
                                          )}>
                                            {phone.condition || '-'}
                                          </span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Bateria</p>
                                          <p className="font-semibold text-foreground">{phone.battery || '-'}</p>
                                        </div>
                                      </div>

                                      {/* IMEI */}
                                      {phone.imei && (
                                        <div className="pt-2 border-t border-rose-100">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">IMEI:</span>
                                            <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-lg font-bold">
                                              {phone.imei}
                                            </code>
                                          </div>
                                        </div>
                                      )}

                                      {/* Financial Details */}
                                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-rose-100">
                                        <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-center">
                                          <p className="text-[8px] font-bold text-orange-600/70 uppercase mb-1">Cena zakupu</p>
                                          <p className="text-base font-black text-orange-700">
                                            {(parseInt(phone.purchasePrice) || 0).toLocaleString()} zł
                                          </p>
                                        </div>
                                        
                                        <div className="bg-white p-2.5 rounded-lg border border-purple-200 text-center">
                                          <p className="text-[8px] font-bold text-purple-600/70 uppercase mb-1">Cena sprzedaży</p>
                                          <p className="text-base font-black text-purple-700">
                                            {phone.price || '0 zł'}
                                          </p>
                                        </div>

                                        {!phone.statusSprzedany && phone.purchasePrice && parseInt(phone.price) > 0 && (
                                          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
                                            <p className="text-[8px] font-bold text-emerald-600/70 uppercase mb-1">Potencjalny zysk</p>
                                            <p className="text-base font-black text-emerald-700">
                                              +{(parseInt(phone.price) - parseInt(phone.purchasePrice)).toLocaleString()} zł
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Additional Info */}
                                      {(phone.warranty || phone.taxType || phone.purchaseDate || phone.sellingDate) && (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pt-2 border-t border-rose-100">
                                          {phone.taxType && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground font-medium">Typ VAT:</span>
                                              <span className="font-bold text-foreground">{phone.taxType}</span>
                                            </div>
                                          )}
                                          {phone.warranty && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground font-medium">Gwarancja:</span>
                                              <span className="font-bold text-foreground">{phone.warranty}</span>
                                            </div>
                                          )}
                                          {phone.purchaseDate && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground font-medium">Data zakupu:</span>
                                              <span className="font-bold text-foreground">{phone.purchaseDate}</span>
                                            </div>
                                          )}
                                          {phone.sellingDate && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground font-medium">Data sprzedaży:</span>
                                              <span className="font-bold text-foreground">{phone.sellingDate}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              {/* Show More Button */}
                              {hasMore && (
                                <button
                                  onClick={() => setVisiblePhoneCount(prev => prev + 5)}
                                  className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-rose-100 to-orange-100 hover:from-rose-200 hover:to-orange-200 border border-rose-200 transition-all duration-200 group"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-bold text-rose-700 group-hover:text-rose-800">
                                      Pokaż więcej ({Math.min(5, sortedPhones.length - visiblePhoneCount)} z {sortedPhones.length - visiblePhoneCount} pozostałych)
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-rose-600 group-hover:text-rose-700 transition-transform group-hover:translate-y-0.5" />
                                  </div>
                                </button>
                              )}
                              
                              {/* Show total count if all phones are displayed */}
                              {!hasMore && sortedPhones.length > 5 && (
                                <div className="mt-3 text-center text-xs text-muted-foreground font-medium py-2">
                                  Wyświetlono wszystkie {sortedPhones.length} telefonów
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Time Period Stats */}
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-primary/10">
                    <CardContent className="p-5">
                      <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">Sprzedaż w okresach</h4>
                      <div className="space-y-4">
                        {/* Daily */}
                        <div className="p-3 bg-gradient-to-r from-accent/30 to-accent/10 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-xs font-black text-primary uppercase">Dzisiaj</span>
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black">
                              {new Date().getDate()}.{(new Date().getMonth() + 1).toString().padStart(2, '0')}
                            </Badge>
                          </div>
                          {selectedEmployee.dailyBreakdown.length > 0 ? (
                            (() => {
                              const today = selectedEmployee.dailyBreakdown.find((d: any) => 
                                d.date === `${new Date().getDate()}.${(new Date().getMonth() + 1).toString().padStart(2, '0')}.${new Date().getFullYear()}`
                              );
                              return today ? (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground uppercase">Trans.</p>
                                    <p className="text-sm font-black text-foreground">{today.transactions}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground uppercase">Obrót</p>
                                    <p className="text-sm font-black text-primary">{today.sales.toLocaleString()} zł</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground uppercase">Zysk</p>
                                    <p className="text-sm font-black text-emerald-600">{today.profit.toLocaleString()} zł</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic mt-2">Brak sprzedaży dzisiaj</p>
                              );
                            })()
                          ) : (
                            <p className="text-xs text-muted-foreground italic mt-2">Brak danych dziennych</p>
                          )}
                        </div>

                        {/* Weekly */}
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-black text-blue-700 uppercase">Ten tydzień</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none text-[9px] font-black">
                              Tydz. {getWeekNumber(new Date())}
                            </Badge>
                          </div>
                          {selectedEmployee.weeklyBreakdown.length > 0 ? (
                            (() => {
                              const currentWeek = selectedEmployee.weeklyBreakdown.find((w: any) => 
                                w.week === getWeekNumber(new Date()) && w.year === new Date().getFullYear()
                              );
                              return currentWeek ? (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="text-center">
                                    <p className="text-[9px] text-blue-600/60 uppercase">Trans.</p>
                                    <p className="text-sm font-black text-blue-700">{currentWeek.transactions}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-blue-600/60 uppercase">Obrót</p>
                                    <p className="text-sm font-black text-blue-700">{currentWeek.sales.toLocaleString()} zł</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-blue-600/60 uppercase">Zysk</p>
                                    <p className="text-sm font-black text-emerald-600">{currentWeek.profit.toLocaleString()} zł</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-blue-600/60 italic mt-2">Brak sprzedaży w tym tygodniu</p>
                              );
                            })()
                          ) : (
                            <p className="text-xs text-blue-600/60 italic mt-2">Brak danych tygodniowych</p>
                          )}
                        </div>

                        {/* Monthly */}
                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-600" />
                              <span className="text-xs font-black text-emerald-700 uppercase">Ten miesiąc</span>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black">
                              {months[selectedMonth]}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center">
                              <p className="text-[9px] text-emerald-600/60 uppercase">Trans.</p>
                              <p className="text-sm font-black text-emerald-700">{selectedEmployee.monthlyBreakdown?.transactions || 0}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-emerald-600/60 uppercase">Obrót</p>
                              <p className="text-sm font-black text-emerald-700">{(selectedEmployee.monthlyBreakdown?.sales || 0).toLocaleString()} zł</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-emerald-600/60 uppercase">Zysk</p>
                              <p className="text-sm font-black text-emerald-600">{(selectedEmployee.monthlyBreakdown?.profit || 0).toLocaleString()} zł</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Breakdown */}
                  {selectedEmployee.dailyBreakdown.length > 0 && (
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden border border-primary/10">
                      <CardContent className="p-5">
                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">Dzienna aktywność</h4>
                        <div className="space-y-2">
                          {selectedEmployee.dailyBreakdown.map((day: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 hover:bg-accent/30 rounded-xl transition-colors">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">{day.date}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transakcje</p>
                                  <p className="text-sm font-black text-foreground">{day.transactions}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Obrót</p>
                                  <p className="text-sm font-black text-primary">{day.sales.toLocaleString()} zł</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zysk</p>
                                  <p className="text-sm font-black text-emerald-600">{day.profit.toLocaleString()} zł</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter className="p-6 bg-accent/10 border-t border-primary/5">
                  <Button 
                    className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest"
                    onClick={() => setIsEmployeeDetailsOpen(false)}
                  >
                    Zamknij podgląd
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-white rounded-3xl p-6 border-l-4 border-primary">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Progres roczny 2026</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-foreground">{yearlyStats.yearProgress.toFixed(1)}%</h3>
              <TrendingUp className="h-8 w-8 text-emerald-500 mb-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{yearlyStats.currentYearProfit.toLocaleString('pl-PL')} zł</p>
          </Card>

          <Card className="border-none shadow-md bg-secondary rounded-3xl p-6 md:col-span-2 overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Średni zysk dzienny</p>
                <h3 className="text-3xl font-black text-white">{(totals.profit / reportData.length).toFixed(0)} <span className="text-sm opacity-40">zł / dzień</span></h3>
              </div>
              <div className="flex gap-2">
                <Button className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl font-bold text-xs gap-2">
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white border-none rounded-xl font-bold text-xs gap-2 shadow-lg shadow-primary/20">
                  <FileText className="h-4 w-4" /> Eksportuj CSV
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </Card>
        </div>
      </main>
    </div>
  );
}
