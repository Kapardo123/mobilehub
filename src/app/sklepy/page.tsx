"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MapPin, 
  Store, 
  Phone, 
  Mail, 
  Trash2, 
  Edit2,
  ArrowLeft,
  Building2,
  Users
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  employees: number;
}

export default function SklepyPage() {
  const [shops, setShops] = useState<Shop[]>([
    { id: "1", name: "Trzy Stawy", address: "ul. Pułaskiego 60, Katowice", phone: "123 456 789", employees: 4 },
    { id: "2", name: "Galeria Katowicka", address: "ul. 3 Maja 30, Katowice", phone: "987 654 321", employees: 3 },
    { id: "3", name: "Silesia City Center", address: "ul. Chorzowska 107, Katowice", phone: "555 666 777", employees: 5 },
  ]);

  const [newShop, setNewShop] = useState({
    name: "",
    address: "",
    phone: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const handleAddShop = () => {
    if (!newShop.name || !newShop.address) return;
    
    const shop: Shop = {
      id: Math.random().toString(36).substr(2, 9),
      ...newShop,
      employees: 0
    };

    setShops([...shops, shop]);
    setNewShop({ name: "", address: "", phone: "" });
    setIsDialogOpen(false);
  };

  const handleEditClick = (shop: Shop) => {
    setEditingShop(shop);
    setIsEditDialogOpen(true);
  };

  const handleUpdateShop = () => {
    if (!editingShop || !editingShop.name || !editingShop.address) return;
    
    setShops(prev => prev.map(s => s.id === editingShop.id ? editingShop : s));
    setEditingShop(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteShop = (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm(`CZY NA PEWNO CHCESZ USUNĄĆ SKLEP: ${name.toUpperCase()}?\n\nUsunięcie sklepu spowoduje utratę powiązanych danych. Tej operacji nie można cofnąć.`)) {
      setShops(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">Zarządzanie Sklepami</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Twoje punkty sprzedaży</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-10 gap-2 shadow-lg shadow-blue-100">
                <Plus className="h-4 w-4" />
                Dodaj Sklep
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-blue-600 text-white text-left">
                <DialogTitle className="text-2xl font-black mb-1">Nowy Sklep</DialogTitle>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Dodaj nowy punkt sprzedaży do systemu</p>
              </DialogHeader>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Store className="h-3 w-3" /> Nazwa Sklepu
                    </Label>
                    <Input 
                      value={newShop.name}
                      onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                      placeholder="np. Galeria Katowicka"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Adres
                    </Label>
                    <Input 
                      value={newShop.address}
                      onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                      placeholder="ul. Kolorowa 1, 00-000 Miasto"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Telefon (opcjonalnie)
                    </Label>
                    <Input 
                      value={newShop.phone}
                      onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                      placeholder="123 456 789"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-slate-400"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleAddShop}
                    disabled={!newShop.name || !newShop.address}
                    className="flex-[2] h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100"
                  >
                    Dodaj Punkt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Shop Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-amber-500 text-white text-left">
                <DialogTitle className="text-2xl font-black mb-1">Edytuj Sklep</DialogTitle>
                <p className="text-amber-50 text-xs font-bold uppercase tracking-widest">Zmień dane punktu sprzedaży</p>
              </DialogHeader>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Store className="h-3 w-3" /> Nazwa Sklepu
                    </Label>
                    <Input 
                      value={editingShop?.name || ""}
                      onChange={(e) => setEditingShop(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="np. Galeria Katowicka"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Adres
                    </Label>
                    <Input 
                      value={editingShop?.address || ""}
                      onChange={(e) => setEditingShop(prev => prev ? { ...prev, address: e.target.value } : null)}
                      placeholder="ul. Kolorowa 1, 00-000 Miasto"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Telefon (opcjonalnie)
                    </Label>
                    <Input 
                      value={editingShop?.phone || ""}
                      onChange={(e) => setEditingShop(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      placeholder="123 456 789"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-slate-400"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleUpdateShop}
                    disabled={!editingShop?.name || !editingShop?.address}
                    className="flex-[2] h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-100"
                  >
                    Zapisz Zmiany
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shops List */}
        <div className="grid gap-4">
          {shops.map((shop) => (
            <Card key={shop.id} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl group hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Store className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900">{shop.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span className="text-[11px] font-bold">{shop.address}</span>
                      </div>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-500 uppercase">{shop.employees} Pracowników</span>
                        </div>
                        {shop.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">{shop.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(shop)}
                      className="text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteShop(shop.id, shop.name)}
                      className="text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
