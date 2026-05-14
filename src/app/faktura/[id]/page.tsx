"use client"

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, ArrowLeft, Download } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

function InvoiceContent() {
  const searchParams = useSearchParams();
  
  const data = {
    id: searchParams.get("id"),
    name: searchParams.get("name"),
    nip: searchParams.get("nip"),
    address: searchParams.get("address"),
    email: searchParams.get("email"),
    date: searchParams.get("date"),
    time: searchParams.get("time"),
    price: searchParams.get("price"),
    items: JSON.parse(searchParams.get("items") || "[]")
  };

  const seller = {
    name: "ŚWIAT GSM - MOBILE HUB",
    address: "ul. Stawowa 1, 40-095 Katowice",
    nip: "123-456-78-90",
    bank: "Bank PKO BP",
    account: "12 3456 7890 0000 0000 1234 5678"
  };

  return (
    <div className="min-h-screen bg-accent/30 p-4 sm:p-12 print:bg-white print:p-0">
      {/* Controls - Hidden on print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => window.close()} className="gap-2 text-muted-foreground hover:text-primary hover:bg-white rounded-xl transition-all">
          <ArrowLeft className="h-4 w-4" /> Powrót
        </Button>
        <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-white gap-2 px-8 h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95">
          <Printer className="h-4 w-4" /> Drukuj Fakturę
        </Button>
      </div>

      {/* Invoice Page */}
      <div className="max-w-4xl mx-auto bg-white p-12 sm:p-20 print:p-0 shadow-[0_0_80px_rgba(0,0,0,0.03)] print:shadow-none rounded-[2rem] print:rounded-none">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-20">
          <div className="space-y-8">
            <img src="/logo.png" alt="Mobile Hub" className="h-20 w-auto object-contain" />
            <div className="space-y-1">
              <h1 className="text-5xl font-light text-foreground tracking-tight">Faktura <span className="font-black text-primary">VAT</span></h1>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em]">NR {data.id}/{new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="text-right space-y-6">
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Data wystawienia</p>
              <p className="text-lg font-black text-foreground tracking-tight">{data.date}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Miejsce wystawienia</p>
              <p className="text-lg font-black text-foreground tracking-tight">Katowice</p>
            </div>
          </div>
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-2 gap-24 mb-24">
          <div className="space-y-8">
            <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] border-b-2 border-primary pb-2 w-fit">Sprzedawca</h2>
            <div className="space-y-2">
              <p className="text-xl font-black text-foreground uppercase tracking-tight">{seller.name}</p>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[200px]">{seller.address}</p>
              <div className="pt-4 space-y-1">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">NIP</p>
                <p className="text-base font-black text-foreground">{seller.nip}</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] border-b-2 border-primary pb-2 w-fit">Nabywca</h2>
            <div className="space-y-2">
              <p className="text-xl font-black text-foreground uppercase tracking-tight">{data.name}</p>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[200px]">{data.address}</p>
              <div className="pt-4 space-y-1">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">NIP</p>
                <p className="text-base font-black text-foreground">{data.nip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-16">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-secondary">
                <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lp.</th>
                <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-foreground">Opis towaru / usługi</th>
                <th className="text-center py-6 text-[10px] font-black uppercase tracking-widest text-foreground">Ilość</th>
                <th className="text-right py-6 text-[10px] font-black uppercase tracking-widest text-foreground">Cena netto</th>
                <th className="text-right py-6 text-[10px] font-black uppercase tracking-widest text-foreground">VAT</th>
                <th className="text-right py-6 text-[10px] font-black uppercase tracking-widest text-foreground">Brutto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/30">
              {data.items.map((item: any, index: number) => (
                <tr key={index} className="group">
                  <td className="py-8 text-xs font-black text-primary/30">{index + 1}</td>
                  <td className="py-8">
                    <p className="text-base font-black text-foreground uppercase tracking-tight">{item.name}</p>
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1.5">{item.category}</p>
                  </td>
                  <td className="py-8 text-center text-sm font-black text-foreground">1</td>
                  <td className="py-8 text-right text-sm font-bold text-muted-foreground">{(item.price / 1.23).toFixed(2)} zł</td>
                  <td className="py-8 text-right text-sm font-bold text-muted-foreground">23%</td>
                  <td className="py-8 text-right text-base font-black text-foreground">{item.price.toFixed(2)} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-24">
          <div className="w-80 space-y-6 bg-accent/30 p-8 rounded-3xl border border-primary/5">
            <div className="space-y-3 border-b border-primary/10 pb-6">
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Suma netto</span>
                <span className="text-foreground">{(parseFloat(data.price || "0") / 1.23).toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>VAT 23%</span>
                <span className="text-foreground">{(parseFloat(data.price || "0") - (parseFloat(data.price || "0") / 1.23)).toFixed(2)} zł</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Do zapłaty</span>
              <div className="text-right">
                <span className="text-4xl font-black text-foreground tracking-tighter">{data.price}</span>
                <span className="text-xs font-black text-foreground ml-2 uppercase">pln</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-2 gap-24 pt-16 border-t-2 border-accent/30">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Szczegóły płatności</h3>
            <div className="space-y-2">
              <div className="flex gap-2 items-baseline">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Bank:</span>
                <span className="text-sm font-black text-foreground">{seller.bank}</span>
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Konto:</span>
                <span className="text-sm font-black text-foreground font-mono">{seller.account}</span>
              </div>
              <div className="flex gap-2 items-baseline pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Termin:</span>
                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">Zapłacono</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-end">
            <div className="w-full border-t-2 border-secondary pt-4 text-center">
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Podpis osoby upoważnionej</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-primary animate-pulse uppercase tracking-[0.5em]">Ładowanie faktury...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
