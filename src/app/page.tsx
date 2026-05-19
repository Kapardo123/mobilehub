"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Users, Search, ClipboardList, Calendar as CalendarIcon, MapPin } from "lucide-react";
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
  DialogFooter
} from "@/components/ui/dialog";
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
import { CreditCard, Banknote, ArrowRight, DollarSign, Package, Wrench, Settings, User, Clock, Zap } from "lucide-react";
import { addAction, getActions, Action } from "./akcje/page";

export default function Home() {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [recentActions, setRecentActions] = useState<Action[]>([]);
  const [actionFilterShop, setActionFilterShop] = useState<string>("all");
  const [actionFilterEmployee, setActionFilterEmployee] = useState<string>("all");
  const [employees, setEmployees] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = getLocalStorageSafe('pracownicy_employees', []);
    setEmployees(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCosts = getLocalStorageSafe('sprzedaz_costs', []);
    setCosts(savedCosts);
    
    const savedSales = getLocalStorageSafe('sprzedaz_sales', []);
    setSales(savedSales);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  
  // Koszty dzisiaj
  const todayCosts = costs.filter(c => c.date === today);
  const totalCostsToday = todayCosts.reduce((sum: number, c) => sum + c.amount, 0);

  // Doładowania (zasilanie gotówką)
  const doladowaniaToday = todayCosts
    .filter(c => c.category === 'gotowka')
    .reduce((sum: number, c) => sum + c.amount, 0);
  
  // Sprzedaż dzisiaj
  const todaySales = sales.filter(s => s.date === today);
  const cashSalesToday = todaySales
    .filter(s => s.payment === 'gotówka')
    .reduce((sum: number, s) => sum + s.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0);
  const cardSalesToday = todaySales
    .filter(s => s.payment === 'karta')
    .reduce((sum: number, s) => sum + s.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0);
  const totalSalesToday = cashSalesToday + cardSalesToday;
  
  // Stan kasy z poprzedniego dnia (mock - można potem rozwinąć)
  const stanKasyPoprzedniegoDnia = 2698; // Można pobrać z localStorage
  
  // Prawdziwe obliczenia
  const kasaDzis = stanKasyPoprzedniegoDnia + cashSalesToday + doladowaniaToday;
  const sumaTotal = kasaDzis + cardSalesToday;
  const dzienTotal = totalSalesToday - totalCostsToday;
  const zyskNetto = totalSalesToday - totalCostsToday + doladowaniaToday;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userRole = getSessionStorageSafe("userRole", "");
    if (!userRole) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const allActions = getActions();
    let filtered = allActions;
    
    if (actionFilterShop !== "all") {
      filtered = filtered.filter(a => a.shopId === actionFilterShop);
    }
    if (actionFilterEmployee !== "all") {
      filtered = filtered.filter(a => a.employeeId === actionFilterEmployee);
    }
    
    setRecentActions(filtered.slice(0, 5));
  }, [actionFilterShop, actionFilterEmployee]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleActionAdded = (e: CustomEvent<Action>) => {
      setRecentActions(prev => [e.detail, ...prev].slice(0, 5));
    };
    window.addEventListener('action_added', handleActionAdded as EventListener);
    return () => window.removeEventListener('action_added', handleActionAdded as EventListener);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
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
                    defaultValue="2025-03-12"
                    className="bg-transparent border-none h-6 text-white text-[10px] font-bold focus-visible:ring-0 [color-scheme:dark] w-full sm:w-28 p-0"
                  />
                </div>
                
                <div className="w-full sm:w-auto flex-1 max-w-[200px]">
                  <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || "all")} items={[
                    { value: "all", label: "Wszystkie punkty" },
                    { value: "kaufland-wloclawek", label: "Kaufland Włocławek" },
                    { value: "riviera-gdynia", label: "Riviera Gdynia" },
                    { value: "dominikanska-wroclaw", label: "Dominikańska Wrocław" }
                  ]}>
                    <SelectTrigger className="bg-white/5 border-white/5 h-10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {selectedShop === "all" ? "Wszystkie punkty" : 
                           selectedShop === "kaufland-wloclawek" ? "Kaufland Włocławek" :
                           selectedShop === "riviera-gdynia" ? "Riviera Gdynia" :
                           selectedShop === "dominikanska-wroclaw" ? "Dominikańska Wrocław" : selectedShop}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-white/10 text-white rounded-xl">
                      <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">Wszystkie punkty</SelectItem>
                      <SelectItem value="kaufland-wloclawek" className="font-bold text-[10px] uppercase tracking-widest">Kaufland Włocławek</SelectItem>
                      <SelectItem value="riviera-gdynia" className="font-bold text-[10px] uppercase tracking-widest">Riviera Gdynia</SelectItem>
                      <SelectItem value="dominikanska-wroclaw" className="font-bold text-[10px] uppercase tracking-widest">Dominikańska Wrocław</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <p className="text-2xl font-bold text-white tabular-nums">{cardSalesToday.toFixed(0)}</p>
                  </div>
                </div>

                {/* Doładowania - Neutral */}
                {doladowaniaToday > 0 && (
                  <div className="relative overflow-hidden bg-white/[0.03] border border-white/8 rounded-xl px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-md bg-white/8 flex items-center justify-center">
                          <Zap className="h-3.5 w-3.5 text-white/50" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Doładowania</span>
                      </div>
                      <span className="text-lg font-black text-white/80 tabular-nums">+{doladowaniaToday.toFixed(0)} zł</span>
                    </div>
                  </div>
                )}

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
                  
                  {/* Suma */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-bold uppercase tracking-widest text-white/60">Suma</span>
                    <span className="text-xl font-black text-white/90 tabular-nums">
                      {sumaTotal.toFixed(0)}
                      <span className="text-sm font-normal text-white/40 ml-1">zł</span>
                    </span>
                  </div>

                  {/* Zysk - Grand Finale */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600/20 via-green-500/15 to-emerald-500/20 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-900/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.1)_0%,_transparent_70%)]" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-emerald-400" />
                        </div>
                        <span className="text-base font-black uppercase tracking-[0.2em] text-emerald-300">Zysk</span>
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

        {/* Navigation Grid - Premium Look */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Panel Zarządzania</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/sprzedaz", label: "Sprzedaż", icon: ShoppingCart, color: "bg-primary", shadow: "shadow-primary/10" },
              { href: "/magazyn", label: "Magazyn", icon: ClipboardList, color: "bg-primary", shadow: "shadow-primary/10" },
              { href: "/pracownicy", label: "Pracownicy", icon: Users, color: "bg-primary", shadow: "shadow-primary/10" },
              { href: "/raporty", label: "Raporty", icon: Search, color: "bg-primary", shadow: "shadow-primary/10" },
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
            <Select value={actionFilterShop} onValueChange={(val) => setActionFilterShop(val || "all")} items={[
              { value: "all", label: "Wszystkie sklepy" },
              { value: "1", label: "Kaufland Włocławek" },
              { value: "2", label: "Riviera Gdynia" },
              { value: "3", label: "Dominikańska Wrocław" }
            ]}>
              <SelectTrigger className="bg-accent/30 border-none h-10 text-[10px] font-bold uppercase rounded-xl flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="truncate">
                    {actionFilterShop === "all" ? "Wszystkie sklepy" : 
                     actionFilterShop === "1" ? "Kaufland Włocławek" :
                     actionFilterShop === "2" ? "Riviera Gdynia" :
                     actionFilterShop === "3" ? "Dominikańska Wrocław" : actionFilterShop}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="font-bold text-[10px] uppercase">Wszystkie sklepy</SelectItem>
                <SelectItem value="1" className="font-bold text-[10px] uppercase">Kaufland Włocławek</SelectItem>
                <SelectItem value="2" className="font-bold text-[10px] uppercase">Riviera Gdynia</SelectItem>
                <SelectItem value="3" className="font-bold text-[10px] uppercase">Dominikańska Wrocław</SelectItem>
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
          </div>
          
          <div className="space-y-6">
            {recentActions.length > 0 ? recentActions.map((action) => {
              const actionIcons: Record<string, any> = {
                sprzedaz: ShoppingCart,
                przyjecie: Package,
                serwis: Wrench,
                edycja: Settings,
                logowanie: User,
                inna: Clock,
              };
              const Icon = actionIcons[action.type] || Clock;
              return (
                <div key={action.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{action.description}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{action.employeeName} • {action.shopName}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-muted-foreground">{action.timestamp.split(" ")[1]}</p>
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
