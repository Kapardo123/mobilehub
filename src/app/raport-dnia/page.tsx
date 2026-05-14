"use client"

import { Navbar } from "@/components/navbar";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Banknote, 
  FileText, 
  ArrowLeft, 
  ShoppingCart, 
  MapPin,
  Calendar as CalendarIcon,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function RaportDniaPage() {
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (!role) {
      router.push("/login");
    }
  }, [router]);

  const [selectedShop, setSelectedShop] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2025-03-12");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Mock data (spójne z głównym pulpitem)
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

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex items-center gap-6 relative z-10">
            <Link href={userRole === "employee" ? "/pracownik" : "/"}>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-accent hover:bg-primary/10 transition-all text-primary">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary/40">
                <FileText className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Panel Analityczny</span>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Raport Dzienny</h1>
              <p className="text-muted-foreground text-xs font-bold">Pełne zestawienie operacji finansowych</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-2xl border border-primary/5 w-full sm:w-auto">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none h-8 text-foreground text-xs font-black focus-visible:ring-0 p-0 w-32"
              />
            </div>

            <Select value={selectedShop} onValueChange={(val) => setSelectedShop(val || "all")}>
              <SelectTrigger className="w-full sm:w-[220px] bg-secondary border-none h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white hover:bg-secondary/90 transition-colors px-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-xs">
                    {selectedShop === "all" ? "Wszystkie punkty" : 
                     selectedShop === "trzy-stawy" ? "Trzy Stawy" :
                     selectedShop === "galeria-katowicka" ? "Galeria Katowicka" :
                     selectedShop === "silesia-city" ? "Silesia City Center" : selectedShop}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-primary/5 shadow-2xl p-1">
                <SelectItem value="all" className="rounded-xl font-bold text-xs py-3">Wszystkie punkty</SelectItem>
                <SelectItem value="trzy-stawy" className="rounded-xl font-bold text-xs py-3">Trzy Stawy</SelectItem>
                <SelectItem value="galeria-katowicka" className="rounded-xl font-bold text-xs py-3">Galeria Katowicka</SelectItem>
                <SelectItem value="silesia-city" className="rounded-xl font-bold text-xs py-3">Silesia City Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 flex flex-col gap-6 group hover:shadow-md transition-all">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Gotówka</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{currentStats.cash} <span className="text-xs text-muted-foreground">zł</span></p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 flex flex-col gap-6 group hover:shadow-md transition-all">
            <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Karta</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{currentStats.card} <span className="text-xs text-muted-foreground">zł</span></p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 flex flex-col gap-6 group hover:shadow-md transition-all">
            <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Transakcje</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{currentStats.sales.length} <span className="text-xs text-muted-foreground">szt</span></p>
            </div>
          </div>

          <div className="bg-secondary p-8 rounded-[2.5rem] shadow-xl shadow-secondary/20 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
              <Filter className="h-7 w-7 text-primary" />
            </div>
            <div className="relative z-10">
              <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-1">Bilans Razem</p>
              <p className="text-3xl font-black text-white tracking-tighter">{currentStats.balance} <span className="text-xs opacity-40 text-white">zł</span></p>
            </div>
          </div>
        </div>

        {/* Main Content Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-primary/5 overflow-hidden">
          <div className="p-8 border-b border-primary/5 flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Historia Transakcji</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-4 h-9 border-primary/10 text-primary">
                <FileText className="h-3.5 w-3.5 mr-2" />
                Pobierz PDF
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30 hover:bg-accent/30 border-none">
                  <TableHead className="py-6 pl-10 text-[10px] font-black uppercase text-muted-foreground tracking-wider">Czas</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground tracking-wider">Produkt i Sprzedawca</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground tracking-wider">Metoda</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground tracking-wider">Punkt</TableHead>
                  <TableHead className="py-6 pr-10 text-right text-[10px] font-black uppercase text-muted-foreground tracking-wider">Kwota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStats.sales.map((sale, idx) => (
                  <TableRow key={sale.id} className={cn(
                    "group transition-colors border-primary/5",
                    idx % 2 === 0 ? "bg-white" : "bg-accent/10"
                  )}>
                    <TableCell className="py-6 pl-10">
                      <span className="text-[11px] font-black text-muted-foreground group-hover:text-foreground transition-colors">{sale.time}</span>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="space-y-1.5">
                        <p className="text-[15px] font-black text-foreground tracking-tight leading-none uppercase">{sale.item}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{sale.user}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter",
                        sale.type === 'Karta' ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {sale.type === 'Karta' ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                        {sale.type}
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/5 text-muted-foreground px-4 py-1.5 rounded-full bg-accent/30">
                        {sale.shop}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 pr-10 text-right">
                      <p className="text-lg font-black text-foreground tracking-tighter">{sale.price}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-8 bg-accent/20 border-t border-primary/5 flex justify-center">
            <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em]">Koniec Raportu Dziennego</p>
          </div>
        </div>
      </main>
    </div>
  );
}
