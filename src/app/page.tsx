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
import { CreditCard, Banknote, FileText, ArrowRight, DollarSign } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);

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
    // Sprawdzamy czy użytkownik jest zalogowany (wersja uproszczona - zawsze przekieruj na login jeśli wejdzie na /)
    // W przyszłości można tu dodać sprawdzanie sesji/localStorage
    const isFirstVisit = !sessionStorage.getItem("visited");
    if (isFirstVisit) {
      sessionStorage.setItem("visited", "true");
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        {/* Compact & Premium Header Stats */}
        <section>
          <Card className="bg-[#0F172A] border-none shadow-xl text-white overflow-hidden relative rounded-[2rem]">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            
            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Top Row: Date & Shop Selectors (More Compact) */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-all w-full sm:w-auto">
                  <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
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
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        <SelectValue placeholder="Punkt">
                          {selectedShop === "all" ? "Wszystkie punkty" : selectedShop.replace('-', ' ').toUpperCase()}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-white/10 text-white rounded-xl">
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
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Bilans Dnia</p>
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
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Gotówka</p>
                      <p className="text-lg font-black text-white">{currentStats.cash} <span className="text-[10px] text-slate-500">zł</span></p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Karta</p>
                      <p className="text-lg font-black text-white">{currentStats.card} <span className="text-[10px] text-slate-500">zł</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <Link href="/raport-dnia" className="block w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-14 rounded-none rounded-b-[2rem] shadow-none transition-all text-[11px] uppercase tracking-[0.2em] gap-3">
                <FileText className="h-4 w-4" />
                Szczegółowy Raport Dnia
              </Button>
            </Link>
          </Card>
        </section>

        {/* Navigation Grid - Premium Look */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Panel Zarządzania</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/sprzedaz", label: "Sprzedaż", icon: ShoppingCart, color: "bg-blue-600", shadow: "shadow-blue-100" },
              { href: "/magazyn", label: "Magazyn", icon: ClipboardList, color: "bg-slate-800", shadow: "shadow-slate-100" },
              { href: "/pracownicy", label: "Pracownicy", icon: Users, color: "bg-purple-600", shadow: "shadow-purple-100" },
              { href: "/raporty", label: "Raporty", icon: Search, color: "bg-emerald-600", shadow: "shadow-emerald-100" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 group-hover:border-blue-100 group-hover:shadow-md transition-all flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${item.color} text-white flex items-center justify-center shadow-lg ${item.shadow} group-hover:scale-105 transition-transform`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>



        {/* Quick Access List - More Refined */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Ostatnie Akcje</h2>
          <div className="space-y-6">
            {[
              { label: "Sprzedaż: Etui iPhone 13", time: "14:30", user: "Jan Kowalski", price: "89 zł", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Sprzedaż: iPhone 15 Pro", time: "12:15", user: "Anna Nowak", price: "5 450 zł", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{action.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{action.time} • {action.user}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900">{action.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
