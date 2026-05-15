"use client"

import { Navbar } from "@/components/navbar";
import { ShoppingCart, Search, ClipboardList, Banknote, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionStorageSafe } from "@/lib/storage";

export default function PracownikDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Jan Kowalski");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userRole = getSessionStorageSafe("userRole", "");
    if (!userRole) {
      router.push("/login");
      return;
    }
    const name = getSessionStorageSafe("userName", "Jan Kowalski");
    if (name) setUserName(name);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-8">
        {/* Employee Welcome & Quick Stats */}
        <section className="bg-gradient-to-br from-secondary to-secondary/90 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-primary/60 text-xs font-bold uppercase tracking-widest">Witaj ponownie,</p>
              <h1 className="text-2xl font-black uppercase tracking-tight">{userName}</h1>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.2em]">Suma Dnia</p>
                <p className="text-3xl font-black mt-2 tracking-tighter">840 <span className="text-xs opacity-60">zł</span></p>
              </div>
              
              <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/20 flex items-center gap-3 group hover:bg-emerald-500/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <Banknote className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-emerald-200 text-[9px] font-black uppercase tracking-widest">Gotówka</p>
                  <p className="text-xl font-black">320 <span className="text-[10px] opacity-60">zł</span></p>
                </div>
              </div>

              <div className="bg-primary/20 backdrop-blur-md rounded-2xl p-4 border border-primary/20 flex items-center gap-3 group hover:bg-primary/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-primary/60 text-[9px] font-black uppercase tracking-widest">Karta</p>
                  <p className="text-xl font-black">520 <span className="text-[10px] opacity-60">zł</span></p>
                </div>
              </div>
            </div>
          </div>
          <ShoppingCart className="absolute top-0 right-0 h-40 w-40 -mr-10 -mt-10 opacity-10 text-white" />
        </section>

        {/* Action Grid for Employee */}
        <section>
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">Twoje Narzędzia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/sprzedaz" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 group-hover:border-primary/20 group-hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-foreground text-lg group-hover:text-primary transition-colors">Sprzedaż</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Nowa transakcja</p>
                </div>
              </div>
            </Link>

            <Link href="/magazyn" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 group-hover:border-primary/20 group-hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/10 group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-foreground text-lg group-hover:text-primary transition-colors">Magazyn</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Sprawdź stany</p>
                </div>
              </div>
            </Link>

            <Link href="/grafik" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 group-hover:border-primary/20 group-hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/10 group-hover:scale-110 transition-transform">
                   <CalendarDays className="h-8 w-8" />
                 </div>
                <div className="space-y-1">
                  <p className="font-black text-foreground text-lg group-hover:text-primary transition-colors">Grafik</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Plan pracy</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-primary/5">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Twoje ostatnie akcje</h2>
          <div className="space-y-4">
            {[
              { label: "Sprzedaż: Etui iPhone 13", time: "14:30", price: "89 zł", icon: ShoppingCart, color: "text-primary", bg: "bg-accent/50" },
              { label: "Sprzedaż: iPhone 15 Pro", time: "12:15", price: "5 450 zł", icon: ShoppingCart, color: "text-primary", bg: "bg-accent/50" },
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">{action.time} • Trzy Stawy</p>
                  </div>
                </div>
                <p className="text-sm font-black text-foreground">{action.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
