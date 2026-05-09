"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench, ShoppingCart, Users, Search, ClipboardList, Calendar as CalendarIcon, MapPin } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const router = useRouter();

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
                
                <div className="w-full sm:w-auto flex-1 max-w-[180px]">
                  <Select defaultValue="trzy-stawy">
                    <SelectTrigger className="bg-white/5 border-white/5 h-9 text-white text-[11px] font-bold rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        <SelectValue placeholder="Punkt" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-white/10 text-white rounded-xl">
                      <SelectItem value="trzy-stawy">Trzy Stawy</SelectItem>
                      <SelectItem value="galeria-katowicka">Galeria Katowicka</SelectItem>
                      <SelectItem value="silesia-city">Silesia City Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Middle Row: Main Balance and Sub-stats */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Bilans Dnia</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-emerald-400 tracking-tighter">
                      +2 090
                    </p>
                    <span className="text-sm font-bold text-emerald-400/60 uppercase">PLN</span>
                  </div>
                </div>

                <div className="flex gap-6 border-l sm:border-l-0 sm:border-t border-white/5 pt-0 sm:pt-0 pl-4 sm:pl-0">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Gotówka</p>
                    <p className="text-lg font-black text-white/90">1 250 <span className="text-[10px] text-slate-500">zł</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Karta</p>
                    <p className="text-lg font-black text-white/90">840 <span className="text-[10px] text-slate-500">zł</span></p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-10 rounded-xl shadow-lg shadow-blue-900/20 transition-all text-[11px] uppercase tracking-widest">
                Szczegółowy Raport
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-2xl group cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ShoppingCart className="h-5 w-5 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sprzedaż</p>
                <p className="text-lg font-black text-slate-900">24</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-2xl group cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <Wrench className="h-5 w-5 text-orange-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Serwisy</p>
                <p className="text-lg font-black text-slate-900">8</p>
              </div>
            </CardContent>
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
              { label: "Serwis: Wymiana LCD S23", time: "12:15", user: "Anna Nowak", price: "450 zł", icon: Wrench, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Dostawa: Akcesoria", time: "09:45", user: "System", price: "1 200 zł", icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-50" },
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
