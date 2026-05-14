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

export default function RaportyPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (!role) {
      router.push("/login");
    }
    setUserRole(role);
  }, [router]);

  const [activeTab, setActiveTab] = useState<'sklepy' | 'pracownicy'>('sklepy');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const months = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", 
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  const daysOfWeek = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

  const shops = [
    { id: "all", label: "Wszystkie sklepy" },
    { id: "trzy-stawy", label: "Trzy Stawy" },
    { id: "galeria-katowicka", label: "Galeria Katowicka" },
    { id: "silesia-city", label: "Silesia City Center" }
  ];

  useEffect(() => {
    const savedEmployees = localStorage.getItem('pracownicy_employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
    
    const savedSales = localStorage.getItem('sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      // Mock sales data if none exists
      const mockSales = [
        { id: "s1", ini: "JK", payment: "gotówka", date: "2026-05-13", time: "10:30", items: [ { cat: "telefon", name: "iPhone 15 Pro", price: 4500, profit: 700, imei: "351234567890123" }, { cat: "akcesoria", name: "Szkło hartowane iPhone 15", price: 49, profit: 20 }, { cat: "akcesoria", name: "Etui MagSafe iPhone 14", price: 129, profit: 50 } ], shop: "Trzy Stawy" },
        { id: "s2", ini: "AN", payment: "karta", date: "2026-05-13", time: "11:15", items: [ { cat: "telefon", name: "Samsung S23 Ultra", price: 3200, profit: 600, imei: "354455667788990" }, { cat: "akcesoria", name: "Kabel USB-C", price: 49, profit: 15 } ], shop: "Galeria Katowicka" },
        { id: "s3", ini: "PZ", payment: "gotówka", date: "2026-05-12", time: "12:00", items: [ { cat: "serwis", name: "Wymiana szybki", price: 150, profit: 80 }, { cat: "serwis", name: "Diagnostyka", price: 50, profit: 40 } ], shop: "Silesia City Center" },
        { id: "s4", ini: "JK", payment: "karta", date: "2026-05-11", time: "13:30", items: [ { cat: "telefon", name: "iPhone 14 Pro Max", price: 4200, profit: 700, imei: "356789012345678" }, { cat: "akcesoria", name: "Ładowarka 20W", price: 99, profit: 30 }, { cat: "akcesoria", name: "Kabel USB-C Lightning", price: 79, profit: 25 }, { cat: "usluga", name: "Konfiguracja telefonu", price: 50, profit: 40 } ], shop: "Trzy Stawy" },
        { id: "s5", ini: "MW", payment: "gotówka", date: "2026-05-10", time: "14:20", items: [ { cat: "telefon", name: "Xiaomi 13 Pro", price: 2800, profit: 600, imei: "357890123456789" } ], shop: "Trzy Stawy" },
        { id: "s6", ini: "MK", payment: "karta", date: "2026-05-09", time: "15:45", items: [ { cat: "akcesoria", name: "Powerbank 10000mAh", price: 149, profit: 50 }, { cat: "akcesoria", name: "Słuchawki Bluetooth", price: 199, profit: 70 }, { cat: "akcesoria", name: "Uchwyt samochodowy", price: 59, profit: 20 } ], shop: "Galeria Katowicka" },
        { id: "s7", ini: "KN", payment: "gotówka", date: "2026-05-08", time: "16:10", items: [ { cat: "serwis", name: "Wymiana baterii", price: 120, profit: 60 }, { cat: "serwis", name: "Polerowanie obudowy", price: 80, profit: 50 } ], shop: "Trzy Stawy" },
        { id: "s8", ini: "KZ", payment: "karta", date: "2026-05-07", time: "10:00", items: [ { cat: "telefon", name: "iPhone 12 Mini", price: 1600, profit: 300, imei: "358901234567890" }, { cat: "akcesoria", name: "Etui iPhone 13 Pro", price: 99, profit: 35 } ], shop: "Galeria Katowicka" },
        { id: "s9", ini: "TS", payment: "gotówka", date: "2026-05-06", time: "11:30", items: [ { cat: "serwis", name: "Naprawa gniazda ładowania", price: 180, profit: 100 }, { cat: "serwis", name: "Wymiana wyświetlacza OLED", price: 350, profit: 180 } ], shop: "Silesia City Center" },
        { id: "s10", ini: "BD", payment: "karta", date: "2026-05-05", time: "13:00", items: [ { cat: "telefon", name: "Samsung S22", price: 1900, profit: 400, imei: "359012345678901" }, { cat: "akcesoria", name: "Szkło Samsung S22", price: 39, profit: 15 }, { cat: "usluga", name: "Transfer danych", price: 80, profit: 60 } ], shop: "Silesia City Center" }
      ];
      setSales(mockSales);
    }
  }, []);

  // Filter sales by selected month and year, and optionally by shop
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();
      
      let shopMatch = true;
      if (selectedShop !== 'all') {
        const shopName = selectedShop === 'trzy-stawy' ? 'Trzy Stawy' : 
                         selectedShop === 'galeria-katowicka' ? 'Galeria Katowicka' : 
                         selectedShop === 'silesia-city' ? 'Silesia City Center' : '';
        shopMatch = sale.shop === shopName;
      }
      
      return saleMonth === selectedMonth && saleYear === selectedYear && shopMatch;
    });
  }, [sales, selectedMonth, selectedYear, selectedShop]);

  // Generate report data for shops tab
  const reportData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Simulating profit from previous months (e.g., 5000 PLN per month)
    const previousMonthsProfit = selectedMonth * 5000;
    let cumulativeSum = previousMonthsProfit;
    
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
      const costs = Math.random() > 0.7 ? -Math.floor(Math.random() * 2000) : 0;
      
      cumulativeSum += profit;
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      return {
        dayName,
        fullDate: `${day}.${(selectedMonth + 1).toString().padStart(2, '0')}.${selectedYear}`,
        profit,
        revenue,
        costs,
        cumulative: cumulativeSum,
        isWeekend
      };
    });
  }, [filteredSales, selectedMonth, selectedYear]);

  // Generate employee report data
  const employeeData = useMemo(() => {
    const employeeMap = new Map();
    
    // First, initialize with all employees from employees list
    employees.forEach(emp => {
      if (emp.role.toLowerCase() !== 'właściciel') {
        let employeeShops = emp.shops;
        if (typeof employeeShops === 'string') {
          employeeShops = [employeeShops];
        }
        
        let shopMatch = true;
        if (selectedShop !== 'all') {
          const shopName = selectedShop === 'trzy-stawy' ? 'Trzy Stawy' : 
                           selectedShop === 'galeria-katowicka' ? 'Galeria Katowicka' : 
                           selectedShop === 'silesia-city' ? 'Silesia City Center' : '';
          shopMatch = employeeShops.includes(shopName);
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
            dailyBreakdown: []
          });
        }
      }
    });
    
    // Now calculate sales for each employee
    filteredSales.forEach(sale => {
      const employee = employees.find(e => e.initials === sale.ini);
      if (!employee) return;
      
      const empData = employeeMap.get(employee.id);
      if (!empData) return;
      
      const saleTotal = sale.items.reduce((sum: number, item: SaleItem) => sum + item.price, 0);
      const saleProfit = sale.items.reduce((sum: number, item: SaleItem) => sum + item.profit, 0);
      
      empData.salesTotal += saleTotal;
      empData.profitTotal += saleProfit;
      empData.transactionsCount += 1;
      
      // Category breakdown
      sale.items.forEach(item => {
        if (empData.categoriesBreakdown[item.cat] !== undefined) {
          empData.categoriesBreakdown[item.cat] += item.price;
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
    });
    
    return Array.from(employeeMap.values());
  }, [employees, filteredSales, selectedShop]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      profit: acc.profit + curr.profit,
      revenue: acc.revenue + curr.revenue,
      costs: acc.costs + curr.costs
    }), { profit: 0, revenue: 0, costs: 0 });
  }, [reportData]);

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
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-primary/10">
              <MapPin className="h-4 w-4 text-primary ml-2" />
              <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || selectedShop)}>
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
                          {day.profit > 0 ? day.profit : 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground border-r border-primary/5">{day.revenue}</TableCell>
                        <TableCell className={cn(
                          "text-right font-black border-r border-primary/5",
                          day.costs < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {day.costs !== 0 ? day.costs : 0}
                        </TableCell>
                        <TableCell className="text-right font-black text-foreground bg-accent/10">
                          {day.cumulative}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Summary Row */}
                    <TableRow className="bg-secondary hover:bg-secondary border-none">
                      <TableCell colSpan={2} className="text-white font-black uppercase text-[10px] tracking-widest py-6 text-right border-r border-white/5">Suma Miesiąca:</TableCell>
                      <TableCell className="text-center text-primary font-black text-lg bg-primary/10 border-r border-white/5">{totals.profit}</TableCell>
                      <TableCell className="text-right text-white font-black text-lg border-r border-white/5">{totals.revenue}</TableCell>
                      <TableCell className="text-right text-red-400 font-black text-lg border-r border-white/5">{totals.costs}</TableCell>
                      <TableCell className="text-right text-primary font-black text-xl bg-white/5">
                        {reportData[reportData.length - 1]?.cumulative}
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
                            {emp.shops[0]}
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
                          {selectedEmployee.shops[0]}
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
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Progres roczny</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-foreground">254,4%</h3>
              <TrendingUp className="h-8 w-8 text-emerald-500 mb-1" />
            </div>
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
