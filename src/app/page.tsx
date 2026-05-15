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
import { CreditCard, Banknote, ArrowRight, DollarSign, Package, Wrench, Settings, User, Clock } from "lucide-react";
import { addAction, getActions, Action } from "./akcje/page";

export default function Home() {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [recentActions, setRecentActions] = useState<Action[]>([]);
  const [actionFilterShop, setActionFilterShop] = useState<string>("all");
  const [actionFilterEmployee, setActionFilterEmployee] = useState<string>("all");
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = getLocalStorageSafe('pracownicy_employees', []);
    setEmployees(saved);
  }, []);

  // Mock data for shops
  const shopData = {
    'all': { balance: "+3 650", cash: "1 700", card: "1 950", sales: [
      { id: "1", time: "14:30", user: "Jan Kowalski", price: "89 zł", type: "Karta", item: "Etui iPhone 13", shop: "Trzy Stawy" },
      { id: "2", time: "12:15", user: "Anna Nowak", price: "5 450 zł", type: "Karta", item: "iPhone 15 Pro", shop: "Galeria Katowicka" },
    ]},
    'trzy-stawy': { balance: "+2 090", cash: "1 250", card: "840", sales: [
      { id: "1", time: "14:30", user: "Jan Kowalski", price: "89 zł", type: "Karta", item: "Etui iPhone 13", shop: "Trzy Stawy" },
    ]},
    'galeria-katowicka': { balance: "+1 560", cash: "900", card: "660", sales: [
      { id: "2", time: "12:15", user: "Anna Nowak", price: "5 450 zł", type: "Karta", item: "iPhone 15 Pro", shop: "Galeria Katowicka" },
    ]},
    'silesia-city': { balance: "0", cash: "0", card: "0", sales: []},
  };

  const currentStats = shopData[selectedShop as keyof typeof shopData];

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
                  <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || "all")}>
                    <SelectTrigger className="bg-white/5 border-white/5 h-10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {selectedShop === "all" ? "Wszystkie punkty" : 
                           selectedShop === "trzy-stawy" ? "Trzy Stawy" :
                           selectedShop === "galeria-katowicka" ? "Galeria Katowicka" :
                           selectedShop === "silesia-city" ? "Silesia City Center" : selectedShop}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-white/10 text-white rounded-xl">
                      <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">Wszystkie punkty</SelectItem>
                      <SelectItem value="trzy-stawy" className="font-bold text-[10px] uppercase tracking-widest">Trzy Stawy</SelectItem>
                      <SelectItem value="galeria-katowicka" className="font-bold text-[10px] uppercase tracking-widest">Galeria Katowicka</SelectItem>
                      <SelectItem value="silesia-city" className="font-bold text-[10px] uppercase tracking-widest">Silesia City Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Middle Row: Main Balance and Sub-stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 py-4">
                <div className="space-y-1">
                  <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Bilans Dnia</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      {currentStats.balance}
                    </p>
                    <span className="text-sm font-bold text-emerald-400/60 uppercase">PLN</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 max-w-sm">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Banknote className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">Gotówka</p>
                      <p className="text-lg font-black text-white">{currentStats.cash} <span className="text-[10px] text-muted-foreground">zł</span></p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">Karta</p>
                      <p className="text-lg font-black text-white">{currentStats.card} <span className="text-[10px] text-muted-foreground">zł</span></p>
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
              { href: "/magazyn", label: "Magazyn", icon: ClipboardList, color: "bg-secondary", shadow: "shadow-secondary/10" },
              { href: "/pracownicy", label: "Pracownicy", icon: Users, color: "bg-secondary/80", shadow: "shadow-secondary/10" },
              { href: "/raporty", label: "Raporty", icon: Search, color: "bg-secondary/80", shadow: "shadow-secondary/10" },
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
            <Select value={actionFilterShop} onValueChange={(val) => setActionFilterShop(val || "all")}>
              <SelectTrigger className="bg-accent/30 border-none h-10 text-[10px] font-bold uppercase rounded-xl flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="truncate">
                    {actionFilterShop === "all" ? "Wszystkie sklepy" : 
                     actionFilterShop === "1" ? "Trzy Stawy" :
                     actionFilterShop === "2" ? "Galeria Katowicka" :
                     actionFilterShop === "3" ? "Silesia City Center" : actionFilterShop}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="font-bold text-[10px] uppercase">Wszystkie sklepy</SelectItem>
                <SelectItem value="1" className="font-bold text-[10px] uppercase">Trzy Stawy</SelectItem>
                <SelectItem value="2" className="font-bold text-[10px] uppercase">Galeria Katowicka</SelectItem>
                <SelectItem value="3" className="font-bold text-[10px] uppercase">Silesia City Center</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={actionFilterEmployee} onValueChange={(val) => setActionFilterEmployee(val || "all")}>
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
