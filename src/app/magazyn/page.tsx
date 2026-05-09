"use client"

import { Navbar } from "@/components/navbar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Search, Filter, ChevronRight, Smartphone, Package, Settings } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue 
} from "@/components/ui/select";
import { useState } from "react";

export default function MagazynPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "akcesoria",
    stock: "",
    price: "",
  });

  const categories = [
    { id: "akcesoria", label: "Magazyn", count: 124, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "telefony", label: "Telefony", count: 15, icon: Smartphone, color: "text-purple-600", bg: "bg-purple-50" },
    { id: "czesci", label: "Części", count: 56, icon: Settings, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const [inventory, setInventory] = useState([
    { name: "Szkło hartowane iPhone 15", category: "Magazyn", stock: 12, price: "49 zł", alert: false },
    { name: "Etui MagSafe iPhone 14", category: "Magazyn", stock: 3, price: "129 zł", alert: true },
    { name: "Bateria Samsung S21", category: "czesci", stock: 5, price: "89 zł", alert: false },
    { name: "iPhone 13 128GB Blue", category: "telefony", stock: 1, price: "2499 zł", alert: false },
  ]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.stock || !newItem.price) return;

    const item = {
      name: newItem.name,
      category: newItem.category,
      stock: parseInt(newItem.stock),
      price: `${newItem.price} zł`,
      alert: parseInt(newItem.stock) < 5
    };

    setInventory([item, ...inventory]);
    setNewItem({ name: "", category: "akcesoria", stock: "", price: "" });
    setIsAddDialogOpen(false);
  };

  const filteredItems = selectedCategory 
    ? inventory.filter(item => item.category === selectedCategory)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => selectedCategory ? setSelectedCategory(null) : window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : "Magazyn"}
            </h1>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger 
              render={
                <div className={cn(buttonVariants({ variant: "default", size: "default" }), "bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-100 h-10 px-4 text-xs cursor-pointer text-white")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj
                </div>
              }
            />
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-slate-900">Nowy Przedmiot</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nazwa Przedmiotu</Label>
                  <Input 
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="np. Etui iPhone 15 Pro" 
                    className="h-12 bg-slate-50 border-none rounded-xl font-bold" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategoria</Label>
                  <UISelect 
                    value={newItem.category}
                    onValueChange={(val) => val && setNewItem({ ...newItem, category: val })}
                  >
                    <UISelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-700">
                      <UISelectValue placeholder="Wybierz kategorię" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-2xl">
                      {categories.map(cat => (
                        <UISelectItem key={cat.id} value={cat.id}>{cat.label}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stan (ilość)</Label>
                    <Input 
                      type="number"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                      placeholder="0" 
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cena (zł)</Label>
                    <Input 
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="0.00" 
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold" 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddItem}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm uppercase tracking-widest"
                >
                  Dodaj do Magazynu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!selectedCategory ? (
          /* Category Selection View */
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-10 bg-white border-none shadow-sm h-12 rounded-2xl" placeholder="Szukaj w magazynie..." />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => (
                <Card 
                  key={cat.id} 
                  className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all cursor-pointer rounded-2xl"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <cat.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{cat.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {cat.count} pozycji
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Products List View for Selected Category */
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className="pl-10 bg-white border-none shadow-sm h-10 rounded-xl text-sm" placeholder={`Szukaj w ${selectedCategory}...`} />
              </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden rounded-2xl bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-none">
                      <TableHead className="text-[10px] font-bold uppercase text-slate-400 pl-6">Produkt</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Stan</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right pr-6">Cena</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item, idx) => (
                        <TableRow key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                          <TableCell className="py-4 pl-6">
                            <p className="font-bold text-sm text-slate-800">{item.name}</p>
                            {item.alert && (
                              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Niski stan!</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <span className={`text-sm font-black ${item.alert ? 'text-red-500 bg-red-50' : 'text-slate-900 bg-slate-50'} px-2 py-1 rounded-lg`}>
                              {item.stock}
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-4 pr-6">
                            <p className="text-sm font-black text-slate-800">{item.price}</p>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="py-12 text-center">
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Brak produktów w tej kategorii</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
