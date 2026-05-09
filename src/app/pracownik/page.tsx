import { Navbar } from "@/components/navbar";
import { ShoppingCart, Search, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PracownikDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-8">
        {/* Employee Welcome & Quick Stats */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Witaj ponownie,</p>
              <h1 className="text-2xl font-black">Jan Kowalski</h1>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-2xl p-4 flex-1">
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Twoja sprzedaż dziś</p>
                <p className="text-3xl font-black mt-1">840 zł</p>
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
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Sprzedaż: Etui iPhone 13</p>
                    <p className="text-[10px] text-slate-400">14:30 • Trzy Stawy</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900">89 zł</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
