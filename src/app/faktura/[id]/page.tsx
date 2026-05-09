"use client"

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download } from "lucide-react";
import { Suspense } from "react";

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
    <div className="min-h-screen bg-slate-100 p-4 sm:p-12 print:bg-white print:p-0">
      {/* Controls - Hidden on print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => window.close()} className="gap-2 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Powrót
        </Button>
        <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 rounded-xl font-bold">
          <Printer className="h-4 w-4" /> Drukuj Fakturę
        </Button>
      </div>

      {/* Invoice Page */}
      <div className="max-w-4xl mx-auto bg-white p-12 sm:p-20 print:p-0 shadow-[0_0_50px_rgba(0,0,0,0.05)] print:shadow-none">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-16">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-900 italic leading-none">MOBILE HUB</span>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-4xl font-light text-slate-900 tracking-tight">Faktura <span className="font-black">VAT</span></h1>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">NR {data.id}/{new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="text-right space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Data wystawienia</p>
              <p className="text-base font-bold text-slate-900">{data.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Miejsce wystawienia</p>
              <p className="text-base font-bold text-slate-900">Katowice</p>
            </div>
          </div>
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-2 gap-20 mb-20">
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-2 w-fit">Sprzedawca</h2>
            <div className="space-y-1.5">
              <p className="text-lg font-black text-slate-900">{seller.name}</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{seller.address}</p>
              <div className="pt-2">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">NIP</p>
                <p className="text-sm font-black text-slate-900">{seller.nip}</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-2 w-fit">Nabywca</h2>
            <div className="space-y-1.5">
              <p className="text-lg font-black text-slate-900">{data.name}</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{data.address}</p>
              <div className="pt-2">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">NIP</p>
                <p className="text-sm font-black text-slate-900">{data.nip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Lp.</th>
                <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">Opis towaru / usługi</th>
                <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">Ilość</th>
                <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">Cena netto</th>
                <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">VAT</th>
                <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">Brutto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="py-6 text-xs font-bold text-slate-300">{index + 1}</td>
                  <td className="py-6">
                    <p className="text-sm font-black text-slate-900">{item.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                  </td>
                  <td className="py-6 text-center text-sm font-bold text-slate-900">1</td>
                  <td className="py-6 text-right text-sm font-medium text-slate-600">{(item.price / 1.23).toFixed(2)} zł</td>
                  <td className="py-6 text-right text-sm font-medium text-slate-600">23%</td>
                  <td className="py-6 text-right text-sm font-black text-slate-900">{item.price.toFixed(2)} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-24">
          <div className="w-72 space-y-4">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Suma netto</span>
                <span>{(parseFloat(data.price || "0") / 1.23).toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>VAT 23%</span>
                <span>{(parseFloat(data.price || "0") - (parseFloat(data.price || "0") / 1.23)).toFixed(2)} zł</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Do zapłaty</span>
              <span className="text-3xl font-black text-slate-900">{data.price}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-2 gap-20 pt-12 border-t border-slate-100">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Płatność</h3>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500">Bank: <span className="text-slate-900">{seller.bank}</span></p>
              <p className="text-xs font-bold text-slate-500">Konto: <span className="text-slate-900">{seller.account}</span></p>
              <p className="text-xs font-bold text-slate-500 mt-2">Termin: <span className="text-slate-900">Zapłacono</span></p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-end">
            <div className="w-full border-t border-slate-900 pt-2 text-center">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Podpis osoby upoważnionej</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-blue-600">Ładowanie faktury...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
