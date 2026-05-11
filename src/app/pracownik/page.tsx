"use client"

import { Navbar } from "@/components/navbar";
import { ShoppingCart, Search, ClipboardList, Banknote, CreditCard } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function PracownikDashboard() {
  const [userName, setUserName] = useState("Jan Kowalski");

  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-8">
        {/* Employee Welcome & Quick Stats */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Witaj ponownie,</p>
              <h1 className="text-2xl font-black">{userName}</h1>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">Suma Dnia</p>
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

              <div className="bg-blue-400/20 backdrop-blur-md rounded-2xl p-4 border border-blue-300/20 flex items-center gap-3 group hover:bg-blue-400/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-blue-300/20 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-blue-100 text-[9px] font-black uppercase tracking-widest">Karta</p>
                  <p className="text-xl font-black">520 <span className="text-[10px] opacity-60">zł</span></p>
                </div>
              </div>
            </div>
          </div>
          <ShoppingCart className="absolute top-0 right-0 h-40 w-40 -mr-10 -mt-10 opacity-10 text-white" />
        </section>

        {/* Action Grid for Employee */}
        <section>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 px-1">Twoje Narzędzia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/sprzedaz" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">Sprzedaż</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Nowa transakcja</p>
                </div>
              </div>
            </Link>

            <Link href="/magazyn" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group-hover:border-emerald-200 group-hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">Magazyn</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sprawdź stany</p>
                </div>
              </div>
            </Link>

            <Link href="/telefony" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group-hover:border-purple-200 group-hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg group-hover:text-purple-600 transition-colors">Telefony</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Baza urządzeń</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Twoje ostatnie akcje</h2>
          <div className="space-y-4">
            {[
              { label: "Sprzedaż: Etui iPhone 13", time: "14:30", price: "89 zł", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Sprzedaż: iPhone 15 Pro", time: "12:15", price: "5 450 zł", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{action.label}</p>
                    <p className="text-[10px] text-slate-400">{action.time} • Trzy Stawy</p>
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
