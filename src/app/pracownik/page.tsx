"use client"

import { Navbar } from "@/components/navbar";
import { ShoppingCart, ClipboardList, CalendarDays, Banknote, CreditCard, DollarSign, Package, TrendingUp, Store, Clock, CalendarIcon, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionStorageSafe, getLocalStorageSafe } from "@/lib/storage";

interface Action {
  id: string;
  type: string;
  description: string;
  employeeName: string;
  employeeId: string;
  shopName: string;
  shopId: string;
  timestamp: string;
  details: string;
}

export default function PracownikDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Jan Kowalski");
  const [userId, setUserId] = useState("");
  const [shopName, setShopName] = useState("Kaufland Włocławek");
  const [sales, setSales] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMounted(true);
    
    const userRole = getSessionStorageSafe("userRole", "");
    if (!userRole) {
      router.push("/login");
      return;
    }
    
    const name = getSessionStorageSafe("userName", "Jan Kowalski");
    const uid = getSessionStorageSafe("userId", "");
    const shop = getSessionStorageSafe("shopName", "Kaufland Włocławek");
    
    if (name) setUserName(name);
    if (uid) setUserId(uid);
    if (shop) setShopName(shop);
    
    const savedSales = getLocalStorageSafe('sprzedaz_sales', []);
    setSales(savedSales);
    
    const savedCosts = getLocalStorageSafe('sprzedaz_costs', []);
    setCosts(savedCosts);
    
    const allActions = getLocalStorageSafe('akcje_actions', []);
    const employeeActions = allActions.filter((a: Action) => a.employeeId === uid || a.employeeName === name);
    setActions(employeeActions.slice(0, 5));
  }, [router]);

  const today = new Date().toISOString().split('T')[0];
  
  // Pobierz sprzedaż tego pracownika dzisiaj
  const todaySales = sales.filter((s: any) => 
    s.date === today && 
    (s.employeeId === userId || s.employeeName === userName)
  );
  
  // Oblicz statystyki
  const cashSalesToday = todaySales
    .filter((s: any) => s.payment === 'gotówka')
    .reduce((sum: number, s: any) => sum + s.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0);
  
  const cardSalesToday = todaySales
    .filter((s: any) => s.payment === 'karta')
    .reduce((sum: number, s: any) => sum + s.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0);
  
  const totalSalesToday = cashSalesToday + cardSalesToday;
  
  // Koszty tego pracownika
  const todayCosts = costs.filter((c: any) => 
    c.date === today && 
    (c.employeeId === userId || c.employeeName === userName)
  );
  
  const totalCostsToday = todayCosts.reduce((sum: number, c: any) => sum + c.amount, 0);
  
  // Doładowania
  const doladowaniaToday = todayCosts
    .filter((c: any) => c.category === 'gotowka')
    .reduce((sum: number, c: any) => sum + c.amount, 0);
  
  // Stan kasy z poprzedniego dnia (mock - można potem rozwinąć)
  const stanKasyPoprzedniegoDnia = 2698;
  
  // Stan kasy dzisiaj (poprzedni dzień + gotówka + doładowania)
  const kasaDzis = stanKasyPoprzedniegoDnia + cashSalesToday + doladowaniaToday;
  const sumaTotal = kasaDzis + cardSalesToday;
  
  // Dzień (sprzedaż - koszty)
  const dzienTotal = totalSalesToday - totalCostsToday;
  
  // Zysk
  const zyskNetto = totalSalesToday - totalCostsToday + doladowaniaToday;

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-accent/20">
        <Navbar />
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-secondary/20 rounded-[2rem]" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-white/50 rounded-xl" />
              <div className="h-24 bg-white/50 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Premium Header Card */}
        <section>
          <div className="bg-secondary border-none shadow-xl text-white overflow-hidden relative rounded-[2rem]">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="p-6 space-y-6 relative z-10">
              
              {/* Top Row: Welcome & Shop Info */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60 leading-tight">Witaj ponownie,</p>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">{userName}</h1>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{shopName}</span>
                </div>
              </div>

              {/* Date Display */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 w-fit">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                  {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              
              {/* Bilans Dnia - Premium Design (identyczny jak u właściciela) */}
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

                {/* Dzień + Wpłwy - Split Cards */}
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
                      <TrendingUp className="h-3.5 w-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">Wpływy</span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums">{totalSalesToday.toFixed(0)}</p>
                  </div>
                </div>

                {/* Doładowania - Neutral */}
                <div className="relative overflow-hidden bg-white/[0.03] border border-white/8 rounded-xl px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-md bg-white/8 flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5 text-white/50" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Doładowania</span>
                    </div>
                    <span className="text-lg font-black text-white/80 tabular-nums">{doladowaniaToday > 0 ? `+${doladowaniaToday.toFixed(0)} zł` : '0 zł'}</span>
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
                      <p className="text-2xl font-black text-white tabular-nums">{kasaDzis.toFixed(0)}</p>
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
                  <div className={`relative overflow-hidden bg-gradient-to-r ${zyskNetto >= 0 ? 'from-emerald-600/20 via-green-500/15 to-emerald-500/20 border-emerald-500/30' : 'from-red-600/20 via-red-500/15 to-red-500/20 border-red-500/30'} border-2 rounded-2xl p-5 shadow-lg ${zyskNetto >= 0 ? 'shadow-emerald-900/20' : 'shadow-red-900/20'}`}>
                    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(${zyskNetto >= 0 ? '52,211,153' : '239,68,68'},0.1)_0%,_transparent_70%)]`} />
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${zyskNetto >= 0 ? 'via-emerald-400/50' : 'via-red-400/50'} to-transparent`} />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${zyskNetto >= 0 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'} border flex items-center justify-center`}>
                          <DollarSign className={`h-5 w-5 ${zyskNetto >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                        </div>
                        <span className={`text-base font-black uppercase tracking-[0.2em] ${zyskNetto >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>Zysk</span>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-4xl font-black tabular-nums drop-shadow-[0_0_25px_rgba(${zyskNetto >= 0 ? '52,211,153' : '239,68,68'},0.5)] ${zyskNetto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {zyskNetto >= 0 ? '+' : ''}{zyskNetto.toFixed(0)}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${zyskNetto >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'} mt-0.5`}>zysk netto</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Grid - Identyczny jak u właściciela */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Twoje Narzędzia</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/sprzedaz", label: "Sprzedaż", icon: ShoppingCart, color: "bg-primary", shadow: "shadow-primary/10" },
              { href: "/magazyn", label: "Magazyn", icon: ClipboardList, color: "bg-primary", shadow: "shadow-primary/10" },
              { href: "/grafik", label: "Grafik", icon: CalendarDays, color: "bg-primary", shadow: "shadow-primary/10" },
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

        {/* Ostatnie Akcje - Premium Style */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Twoje Ostatnie Akcje</h2>
            <span className="text-[10px] text-muted-foreground/50 font-medium bg-accent/50 px-2 py-1 rounded-md">{actions.length} pozycji</span>
          </div>
          
          <div className="space-y-3">
            {actions.length > 0 ? actions.map((action, i) => (
              <div key={i} className="group flex items-center justify-between py-3 px-4 rounded-xl bg-accent/30 hover:bg-accent/50 border border-transparent hover:border-primary/10 transition-all cursor-pointer">
                
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    action.type === 'sprzedaz' ? 'bg-primary/10' :
                    action.type === 'magazyn' ? 'bg-secondary/10' :
                    action.type === 'koszt' ? 'bg-red-500/10' :
                    'bg-accent/50'
                  }`}>
                    {action.type === 'sprzedaz' && <ShoppingCart className="h-5 w-5 text-primary" />}
                    {action.type === 'magazyn' && <ClipboardList className="h-5 w-5 text-secondary" />}
                    {action.type === 'koszt' && <DollarSign className="h-5 w-5 text-red-500" />}
                    {!['sprzedaz', 'magazyn', 'koszt'].includes(action.type) && <Package className="h-5 w-5 text-accent" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground/70">
                        {new Date(action.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {action.shopName && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-xs text-muted-foreground/70 truncate max-w-[120px]">{action.shopName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {action.details && (
                  <div className="ml-3 shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground bg-accent/50 px-2.5 py-1.5 rounded-lg">
                      {action.details}
                    </span>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-semibold text-muted-foreground/50 mb-1">Brak akcji dzisiaj</p>
                <p className="text-xs text-muted-foreground/30">Rozpocznij nową transakcję lub dodaj produkt do magazynu</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Spacing for Mobile */}
        <div className="h-4" />
        
      </main>
    </div>
  );
}
