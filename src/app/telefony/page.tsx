"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Search, Smartphone, Info, ArrowUpDown, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export default function TelefonyPage() {
  const pathname = usePathname();
  const [view, setView] = useState<"brands" | "list">("brands");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("wszystkie");
  const [selectedShop, setSelectedShop] = useState("all");
  const [sortBy, setSortBy] = useState<"model" | "price-asc" | "price-desc" | "status">("model");
  
  // W rzeczywistej aplikacji te dane pochodziłyby z sesji/contextu
  const isEmployee = pathname === "/pracownik" || pathname.startsWith("/pracownik/") || (typeof window !== 'undefined' && sessionStorage.getItem('userRole') === 'employee');
  const userShop = "Trzy Stawy"; 
  const isOwner = !isEmployee;

  const brands = [
    { id: "wszystkie", label: "Wszystkie", icon: Smartphone, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "iphone", label: "iPhone", icon: Smartphone, color: "text-slate-900", bg: "bg-slate-50" },
    { id: "samsung", label: "Samsung", icon: Smartphone, color: "text-blue-700", bg: "bg-blue-50" },
    { id: "xiaomi", label: "Xiaomi", icon: Smartphone, color: "text-orange-600", bg: "bg-orange-50" },
    { id: "motorola", label: "Motorola", icon: Smartphone, color: "text-teal-600", bg: "bg-teal-50" },
    { id: "inne", label: "Inne", icon: Smartphone, color: "text-slate-400", bg: "bg-slate-50" },
  ];

  const phones = [
    { model: "iPhone 15 Pro 256GB Black", imei: "351234567890123", status: "Nowy", price: 4899, shop: "Trzy Stawy", brand: "iphone" },
    { model: "Samsung Galaxy S24 Ultra", imei: "359876543210987", status: "Używany", price: 3200, shop: "Galeria Katowicka", brand: "samsung" },
    { model: "iPhone 13 128GB Blue", imei: "355555666667777", status: "Nowy", price: 2499, shop: "Silesia City", brand: "iphone" },
    { model: "Xiaomi Redmi Note 13", imei: "350000111112222", status: "Używany", price: 750, shop: "Trzy Stawy", brand: "xiaomi" },
    { model: "Motorola Edge 40 Neo", imei: "351111222233334", status: "Nowy", price: 1599, shop: "Galeria Katowicka", brand: "motorola" },
  ];

  const filteredAndSortedPhones = useMemo(() => {
    let result = [...phones];

    // 1. Filtrowanie po punkcie
    if (!isOwner) {
      result = result.filter(phone => phone.shop === userShop);
    } else if (selectedShop !== "all") {
      result = result.filter(phone => phone.shop === selectedShop);
    }

    // 2. Filtrowanie po marce
    if (selectedBrand !== "wszystkie") {
      result = result.filter(phone => phone.brand === selectedBrand);
    }

    // 3. Wyszukiwanie
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(phone => 
        phone.model.toLowerCase().includes(query) || 
        phone.imei.includes(query)
      );
    }

    // 4. Sortowanie
    result.sort((a, b) => {
      switch (sortBy) {
        case "model":
          return a.model.localeCompare(b.model);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, sortBy, isOwner, userShop, selectedBrand, selectedShop]);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setView("list");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (view === "list") {
                  setView("brands");
                } else {
                  window.history.back();
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {view === "brands" ? "Wybierz Markę" : brands.find(b => b.id === selectedBrand)?.label}
              </h1>
              {!isOwner && (
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Punkt: {userShop}</p>
              )}
            </div>
          </div>
          <Button className="bg-blue-600 rounded-xl font-bold h-10 px-4 text-xs">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj telefon
          </Button>
        </div>

        {isOwner && (
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3 pl-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Filtruj Punkt</span>
            </div>
            
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="min-w-[140px] w-fit bg-slate-900 border-none h-12 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-white hover:bg-slate-800 transition-colors px-6 gap-4">
                <SelectValue placeholder="Zmień punkt">
                  {selectedShop === "all" ? "Wszystkie" : selectedShop}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                <SelectItem value="all" className="rounded-xl font-bold text-xs py-3">Wszystkie punkty</SelectItem>
                <SelectItem value="Trzy Stawy" className="rounded-xl font-bold text-xs py-3">Trzy Stawy</SelectItem>
                <SelectItem value="Galeria Katowicka" className="rounded-xl font-bold text-xs py-3">Galeria Katowicka</SelectItem>
                <SelectItem value="Silesia City Center" className="rounded-xl font-bold text-xs py-3">Silesia City Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {view === "brands" ? (
          <div className="grid grid-cols-2 gap-4">
            {brands.map((brand) => (
              <Card 
                key={brand.id}
                className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer rounded-2xl group overflow-hidden"
                onClick={() => handleBrandSelect(brand.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", brand.bg, brand.color)}>
                    <brand.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{brand.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {phones.filter(p => {
                        const matchesShop = !isOwner ? p.shop === userShop : (selectedShop === "all" || p.shop === selectedShop);
                        const matchesBrand = brand.id === "wszystkie" || p.brand === brand.id;
                        return matchesShop && matchesBrand;
                      }).length} sztuk
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  className="pl-10 bg-white border-none shadow-sm h-12 rounded-xl font-medium" 
                  placeholder="Szukaj modelu lub IMEI..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="h-12 w-12 rounded-xl bg-white border-none shadow-sm flex items-center justify-center p-0" />}>
                  <ArrowUpDown className="h-5 w-5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sortuj według</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy("model")} className="font-bold text-sm">Nazwa (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-asc")} className="font-bold text-sm">Cena: rosnąco</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-desc")} className="font-bold text-sm">Cena: malejąco</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("status")} className="font-bold text-sm">Status (Nowy/Używany)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid gap-4">
              {filteredAndSortedPhones.length > 0 ? (
                filteredAndSortedPhones.map((phone, idx) => (
                  <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-1.5 bg-blue-600" />
                        <div className="flex-1 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                              <Smartphone className="h-6 w-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{phone.model}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">IMEI: {phone.imei}</p>
                                <Badge variant={phone.status === "Nowy" ? "default" : "secondary"} className="text-[8px] h-4 px-1.5 uppercase font-black rounded-md">
                                  {phone.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-blue-600">{phone.price} <span className="text-[10px]">zł</span></p>
                            {isOwner && (
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center justify-end gap-1">
                                <Filter className="h-2 w-2" />
                                {phone.shop}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="self-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                          <Info className="h-4 w-4 text-slate-400" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">Nie znaleziono telefonów</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
