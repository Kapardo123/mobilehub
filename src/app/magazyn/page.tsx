"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Package,
  Smartphone,
  Settings,
  Wrench,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  Edit2,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  List,
  Save,
  RotateCcw,
  Copy
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getLocalStorageSafe, useLocalStorage, useSessionStorage } from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function MagazynPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddUslugaDialogOpen, setIsAddUslugaDialogOpen] = useState(false);
  const [isAddSerwisDialogOpen, setIsAddSerwisDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"alfanum-asc" | "alfanum-desc" | "cena-asc" | "cena-desc" | "stan-asc" | "stan-desc">("alfanum-asc");
  const [selectedPhone, setSelectedPhone] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "akcesoria",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
    brand: "",
    model: "",
    memory: "",
    batteryHealth: "",
    condition: "używany",
    color: "",
    setIncludes: "",
    notes: "",
    warranty: "",
    imei: "",
    taxType: "marża",
    purchaseDate: new Date().toISOString().split('T')[0],
    sellingDate: "",
    statusSprzedany: false,
    dataSprzedazy: "",
  });

  const getDefaultInventory = () => [
    { name: "iPhone 15 Pro", category: "telefon", stock: 1, price: "4500 zł", alert: false, imei: "351234567890123", battery: "100%", color: "Natural Titanium", condition: "Nowy", memory: "256GB", brand: "Apple", model: "15 Pro", purchasePrice: "3800", taxType: "marża", purchaseDate: "2024-01-15", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Bez rys, like new", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 13", category: "telefon", stock: 1, price: "2100 zł", alert: false, imei: "359876543210987", battery: "89%", color: "Midnight", condition: "Używany", memory: "128GB", brand: "Apple", model: "13", purchasePrice: "1700", taxType: "marża", purchaseDate: "2024-02-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Lekkie ryski na obudowie", statusSprzedany: true, dataSprzedazy: "2024-05-10" },
    { name: "Samsung S23 Ultra", category: "telefon", stock: 1, price: "3200 zł", alert: false, imei: "354455667788990", battery: "95%", color: "Phantom Black", condition: "Używany", memory: "512GB", brand: "Samsung", model: "S23 Ultra", purchasePrice: "2600", taxType: "VAT", purchaseDate: "2024-03-05", warranty: "12 m-cy", setIncludes: "pudełko, kabel, rysik", notes: "Perfekcyjny stan", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 14 Pro Max", category: "telefon", stock: 1, price: "4200 zł", alert: false, imei: "356789012345678", battery: "97%", color: "Deep Purple", condition: "Używany", memory: "256GB", brand: "Apple", model: "14 Pro Max", purchasePrice: "3500", taxType: "marża", purchaseDate: "2024-04-01", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Zadbany", statusSprzedany: false, dataSprzedazy: "" },
    { name: "Xiaomi 13 Pro", category: "telefon", stock: 1, price: "2800 zł", alert: false, imei: "357890123456789", battery: "92%", color: "Ceramic Black", condition: "Używany", memory: "256GB", brand: "Xiaomi", model: "13 Pro", purchasePrice: "2200", taxType: "VAT", purchaseDate: "2024-03-20", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Stan idealny", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 12 Mini", category: "telefon", stock: 1, price: "1600 zł", alert: false, imei: "358901234567890", battery: "85%", color: "Blue", condition: "Używany", memory: "64GB", brand: "Apple", model: "12 Mini", purchasePrice: "1300", taxType: "marża", purchaseDate: "2024-02-25", warranty: "3 m-ce", setIncludes: "pudełko", notes: "Drobne ryski", statusSprzedany: false, dataSprzedazy: "" },
    { name: "Samsung S22", category: "telefon", stock: 1, price: "1900 zł", alert: false, imei: "359012345678901", battery: "90%", color: "Green", condition: "Używany", memory: "128GB", brand: "Samsung", model: "S22", purchasePrice: "1500", taxType: "VAT", purchaseDate: "2024-03-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Bardzo zadbany", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 11", category: "telefon", stock: 1, price: "1200 zł", alert: false, imei: "350123456789012", battery: "78%", color: "Purple", condition: "Używany", memory: "64GB", brand: "Apple", model: "11", purchasePrice: "900", taxType: "marża", purchaseDate: "2024-01-20", warranty: "3 m-ce", setIncludes: "kabel", notes: "Ślady użytkowania", statusSprzedany: false, dataSprzedazy: "" },
    { name: "Szkło hartowane iPhone 15", category: "akcesoria", stock: 12, price: "49 zł", alert: false },
    { name: "Etui MagSafe iPhone 14", category: "akcesoria", stock: 3, price: "129 zł", alert: true },
    { name: "Kabel USB-C Lightning", category: "akcesoria", stock: 25, price: "79 zł", alert: false },
    { name: "Ładowarka 20W", category: "akcesoria", stock: 15, price: "99 zł", alert: false },
    { name: "Etui Samsung S23", category: "akcesoria", stock: 8, price: "89 zł", alert: false },
    { name: "Słuchawki Bluetooth Sony", category: "akcesoria", stock: 5, price: "299 zł", alert: false },
    { name: "Powerbank 10000mAh", category: "akcesoria", stock: 10, price: "89 zł", alert: false },
    { name: "Wymiana szybki iPhone", category: "usluga", stock: 0, price: "250 zł", alert: false },
    { name: "Wymiana baterii Samsung", category: "usluga", stock: 0, price: "180 zł", alert: false },
    { name: "Konfiguracja telefonu", category: "usluga", stock: 0, price: "50 zł", alert: false },
    { name: "Naprawa gniazda ładowania", category: "serwis", stock: 0, price: "150 zł", alert: false },
    { name: "Wymiana wyświetlacza", category: "serwis", stock: 0, price: "350 zł", alert: false },
    { name: "Odzyskiwanie danych", category: "serwis", stock: 0, price: "200 zł", alert: false },
  ];

  const [inventory, setInventory] = useLocalStorage('magazyn_inventory', getDefaultInventory());

  const categories = useMemo(() => [
    { id: "telefon", label: "Telefony", count: inventory.filter((i: typeof inventory[0]) => i.category === "telefon").length, icon: Smartphone, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "akcesoria", label: "Akcesoria", count: inventory.filter((i: typeof inventory[0]) => i.category === "akcesoria").length, icon: Package, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "usluga", label: "Usługa", count: inventory.filter((i: typeof inventory[0]) => i.category === "usluga").length, icon: Settings, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "serwis", label: "Serwis", count: inventory.filter((i: typeof inventory[0]) => i.category === "serwis").length, icon: Wrench, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
  ], [inventory]);

  const [userRole, setUserRole] = useSessionStorage<string | null>("userRole", null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userRole) {
      router.push("/login");
    }
  }, [userRole, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent('magazyn_updated', { detail: inventory }));
  }, [inventory]);

  useEffect(() => {
    const loadInventory = () => {
      if (typeof window === "undefined") return;
      const saved = getLocalStorageSafe('magazyn_inventory', null);
      if (saved && saved.length > 0) {
        setInventory(saved);
      }
    };
    loadInventory();
    window.addEventListener('magazyn_updated', loadInventory as EventListener);
    return () => window.removeEventListener('magazyn_updated', loadInventory as EventListener);
  }, [setInventory]);

  const filteredItems = useMemo(() => {
    let items = [...inventory];
    
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.imei && item.imei.toLowerCase().includes(query)) ||
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.model && item.model.toLowerCase().includes(query))
      );
    }
    
    items.sort((a, b) => {
      switch (sortBy) {
        case "alfanum-asc":
          return a.name.localeCompare(b.name);
        case "alfanum-desc":
          return b.name.localeCompare(a.name);
        case "cena-asc":
          return (parseInt(a.price) || 0) - (parseInt(b.price) || 0);
        case "cena-desc":
          return (parseInt(b.price) || 0) - (parseInt(a.price) || 0);
        case "stan-asc":
          return (a.stock || 0) - (b.stock || 0);
        case "stan-desc":
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
      }
    });
    
    return items;
  }, [inventory, selectedCategory, searchQuery, sortBy]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) return;

    const baseItem = {
      name: newItem.name,
      category: newItem.category,
      price: newItem.sellingPrice ? `${newItem.sellingPrice} zł` : "0 zł",
      alert: false,
      stock: newItem.stock ? parseInt(newItem.stock) : 0,
      purchasePrice: newItem.purchasePrice || "",
      sellingDate: newItem.sellingDate || "",
      statusSprzedany: false,
      dataSprzedazy: "",
    };

    const item = newItem.category === "telefon"
      ? {
          ...baseItem,
          brand: newItem.brand,
          model: newItem.model,
          memory: newItem.memory,
          battery: newItem.batteryHealth ? `${newItem.batteryHealth}%` : "",
          color: newItem.color,
          condition: newItem.condition,
          imei: newItem.imei,
          taxType: newItem.taxType,
          purchaseDate: newItem.purchaseDate,
          warranty: newItem.warranty,
          setIncludes: newItem.setIncludes,
          notes: newItem.notes,
        }
      : baseItem;

    setInventory([...inventory, item as any]);
    setNewItem({
      name: "",
      category: "akcesoria",
      stock: "",
      purchasePrice: "",
      sellingPrice: "",
      brand: "",
      model: "",
      memory: "",
      batteryHealth: "",
      condition: "używany",
      color: "",
      setIncludes: "",
      notes: "",
      warranty: "",
      imei: "",
      taxType: "marża",
      purchaseDate: new Date().toISOString().split('T')[0],
      sellingDate: "",
      statusSprzedany: false,
      dataSprzedazy: "",
    });
    setIsAddDialogOpen(false);
    addToast({
      title: "Dodano przedmiot",
      description: `${item.name} został dodany do magazynu`,
      variant: "success"
    });
  };

  const handleDeleteItem = (index: number) => {
    const itemName = inventory[index].name;
    const newInventory = inventory.filter((_, i) => i !== index);
    setInventory(newInventory);
    addToast({
      title: "Usunięto przedmiot",
      description: `${itemName} został usunięty z magazynu`,
      variant: "destructive"
    });
  };

  const handleResetInventory = () => {
    if (confirm("Czy na pewno chcesz przywrócić domyślny stan magazynu? Wszystkie wprowadzone zmiany zostaną utracone.")) {
      setInventory(getDefaultInventory());
      addToast({
        title: "Przywrócono domyślny stan",
        description: "Magazyn został przywrócony do stanu początkowego",
        variant: "success"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: "Skopiowano",
      description: "Tekst został skopiowany do schowka",
      variant: "success"
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent text-primary" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Magazyn</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-xl border-primary/10 text-primary hover:bg-accent text-xs font-bold uppercase tracking-tight" onClick={handleResetInventory}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {userRole === "owner" && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-tight">
                    <Plus className="h-4 w-4 mr-1" />
                    Dodaj
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
                  <DialogHeader className="p-8 bg-primary text-white relative shrink-0">
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-black uppercase tracking-tight">Dodaj do Magazynu</DialogTitle>
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Wprowadź dane nowego przedmiotu</p>
                    </div>
                    <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nazwa</Label>
                      <Input 
                        placeholder="Nazwa przedmiotu" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="h-12 bg-accent/30 border-none rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategoria</Label>
                      <Select value={newItem.category} onValueChange={(val) => setNewItem({...newItem, category: val})}>
                        <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telefon">Telefon</SelectItem>
                          <SelectItem value="akcesoria">Akcesoria</SelectItem>
                          <SelectItem value="usluga">Usługa</SelectItem>
                          <SelectItem value="serwis">Serwis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newItem.category === "telefon" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marka</Label>
                            <Input 
                              placeholder="Apple" 
                              value={newItem.brand}
                              onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Model</Label>
                            <Input 
                              placeholder="iPhone 15 Pro" 
                              value={newItem.model}
                              onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pamięć</Label>
                            <Input 
                              placeholder="256GB" 
                              value={newItem.memory}
                              onChange={(e) => setNewItem({...newItem, memory: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kolor</Label>
                            <Input 
                              placeholder="Czarny" 
                              value={newItem.color}
                              onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stan baterii %</Label>
                          <Input 
                            placeholder="95" 
                            type="number"
                            value={newItem.batteryHealth}
                            onChange={(e) => setNewItem({...newItem, batteryHealth: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stan</Label>
                          <Select value={newItem.condition} onValueChange={(val) => setNewItem({...newItem, condition: val})}>
                            <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nowy">Nowy</SelectItem>
                              <SelectItem value="używany">Używany</SelectItem>
                              <SelectItem value="powystawowy">Powystawowy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IMEI</Label>
                          <Input 
                            placeholder="123456789012345" 
                            value={newItem.imei}
                            onChange={(e) => setNewItem({...newItem, imei: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ilość</Label>
                        <Input 
                          placeholder="1" 
                          type="number"
                          value={newItem.stock}
                          onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                          className="h-12 bg-accent/30 border-none rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cena sprzedaży</Label>
                        <Input 
                          placeholder="1999" 
                          type="number"
                          value={newItem.sellingPrice}
                          onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})}
                          className="h-12 bg-accent/30 border-none rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="p-8 pt-0 shrink-0">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl border-primary/10">Anuluj</Button>
                    <Button onClick={handleAddItem} className="rounded-xl bg-primary hover:bg-primary/90 text-white">Dodaj</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Szukaj w magazynie..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 bg-white border-primary/5 rounded-xl"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={sortBy} onValueChange={(val: typeof sortBy) => setSortBy(val)}>
            <SelectTrigger className="h-12 w-[140px] bg-white border-primary/5 rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alfanum-asc">A-Z</SelectItem>
              <SelectItem value="alfanum-desc">Z-A</SelectItem>
              <SelectItem value="cena-asc">Cena ↑</SelectItem>
              <SelectItem value="cena-desc">Cena ↓</SelectItem>
              <SelectItem value="stan-asc">Stan ↑</SelectItem>
              <SelectItem value="stan-desc">Stan ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "p-4 rounded-2xl border transition-all",
              !selectedCategory 
                ? "bg-primary text-white border-primary shadow-lg" 
                : "bg-white border-primary/5 hover:border-primary/20"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <LayoutGrid className="h-6 w-6" />
              <span className={cn("text-[10px] font-black uppercase tracking-tight", !selectedCategory ? "text-white/80" : "text-muted-foreground")}>
                Wszystkie
              </span>
              <span className={cn("text-lg font-black", !selectedCategory ? "text-white" : "text-foreground")}>
                {inventory.length}
              </span>
            </div>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all",
                selectedCategory === cat.id 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white border-primary/5 hover:border-primary/20"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <cat.icon className={cn("h-6 w-6", selectedCategory === cat.id ? "text-white" : cat.color)} />
                <span className={cn("text-[10px] font-black uppercase tracking-tight", selectedCategory === cat.id ? "text-white/80" : "text-muted-foreground")}>
                  {cat.label}
                </span>
                <span className={cn("text-lg font-black", selectedCategory === cat.id ? "text-white" : "text-foreground")}>
                  {cat.count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {userRole === "owner" && selectedCategory === "usluga" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-black uppercase tracking-tight" onClick={() => setIsAddUslugaDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj usługę
            </Button>
          </div>
        )}

        {userRole === "owner" && selectedCategory === "serwis" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-black uppercase tracking-tight" onClick={() => setIsAddSerwisDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj serwis
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <Card key={index} className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-sm truncate">{item.name}</h3>
                      {item.alert && (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      {item.statusSprzedany && (
                        <Badge variant="secondary" className="text-[8px] h-4 px-1 uppercase font-black bg-emerald-100 text-emerald-700 border-none">
                          Sprzedany
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                      {item.category === "telefon" && (
                        <>
                          {item.brand && <span className="font-bold">{item.brand}</span>}
                          {item.model && <span>{item.model}</span>}
                          {item.memory && <span>{item.memory}</span>}
                          {item.color && <span>{item.color}</span>}
                          {item.batteryHealth && <span>{item.batteryHealth}%</span>}
                          {item.condition && <span className="capitalize">{item.condition}</span>}
                        </>
                      )}
                      {item.category === "akcesoria" && (
                        <span className="font-bold uppercase tracking-tight">Akcesoria</span>
                      )}
                      {item.category === "usluga" && (
                        <span className="font-bold uppercase tracking-tight">Usługa</span>
                      )}
                      {item.category === "serwis" && (
                        <span className="font-bold uppercase tracking-tight">Serwis</span>
                      )}
                      <span className="font-bold">{item.price}</span>
                      {item.stock > 0 && <span>Stan: {item.stock}</span>}
                    </div>
                    
                    {item.imei && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">IMEI:</span>
                        <button 
                          onClick={() => copyToClipboard(item.imei)}
                          className="text-[10px] font-mono text-primary hover:underline"
                        >
                          {item.imei}
                        </button>
                        <Copy 
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => copyToClipboard(item.imei)} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {item.statusSprzedany ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">{item.dataSprzedazy}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Badge variant={item.stock > 0 ? "default" : "destructive"} className="text-[10px] font-black uppercase">
                          {item.stock > 0 ? `${item.stock} szt.` : "Brak"}
                        </Badge>
                      </div>
                    )}
                    
                    {!item.statusSprzedany && (
                      <div className="flex items-center gap-1">
                        {userRole === "owner" && (
                          <button 
                            onClick={() => handleDeleteItem(index)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm font-bold text-muted-foreground">Brak przedmiotów w magazynie</p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Dodaj pierwszy przedmiot</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}