import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Search, Smartphone, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TelefonyPage() {
  const phones = [
    { model: "iPhone 15 Pro 256GB Black", imei: "351234567890123", status: "Nowy", price: "4899 zł", shop: "Trzy Stawy" },
    { model: "Samsung Galaxy S24 Ultra", imei: "359876543210987", status: "Używany", price: "3200 zł", shop: "Galeria Katowicka" },
    { model: "iPhone 13 128GB Blue", imei: "355555666667777", status: "Nowy", price: "2499 zł", shop: "Silesia City" },
    { model: "Xiaomi Redmi Note 13", imei: "350000111112222", status: "Używany", price: "750 zł", shop: "Trzy Stawy" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Telefony na stanie</h1>
          </div>
          <Button className="bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj telefon
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-10 bg-white border-none shadow-sm h-12 rounded-xl" placeholder="Szukaj po modelu lub IMEI..." />
        </div>

        <div className="grid gap-4">
          {phones.map((phone, idx) => (
            <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-1.5 bg-blue-600" />
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{phone.model}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">IMEI: {phone.imei}</p>
                          <Badge variant={phone.status === "Nowy" ? "default" : "secondary"} className="text-[8px] h-4 px-1.5 uppercase font-black">
                            {phone.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-blue-600">{phone.price}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{phone.shop}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="self-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
