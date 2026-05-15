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
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  ChevronRight, 
  Smartphone, 
  Package, 
  Settings, 
  Wrench, 
  ArrowUpDown, 
  Battery, 
  Hash, 
  Info,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue 
} from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getLocalStorageSafe, useLocalStorage, getSessionStorageSafe, useSessionStorage } from "@/lib/storage";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "akcesoria",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
    // Phone specific fields
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
    // Telefony
    { name: "iPhone 15 Pro", category: "telefon", stock: 1, price: "4500 zł", alert: false, imei: "351234567890123", battery: "100%", color: "Natural Titanium", condition: "Nowy", memory: "256GB", brand: "Apple", model: "15 Pro", purchasePrice: "3800", taxType: "marża", purchaseDate: "2024-01-15", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Bez rys, like new", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 13", category: "telefon", stock: 1, price: "2100 zł", alert: false, imei: "359876543210987", battery: "89%", color: "Midnight", condition: "Używany", memory: "128GB", brand: "Apple", model: "13", purchasePrice: "1700", taxType: "marża", purchaseDate: "2024-02-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Lekkie ryski na obudowie", statusSprzedany: true, dataSprzedazy: "2024-05-10" },
    { name: "Samsung S23 Ultra", category: "telefon", stock: 1, price: "3200 zł", alert: false, imei: "354455667788990", battery: "95%", color: "Phantom Black", condition: "Używany", memory: "512GB", brand: "Samsung", model: "S23 Ultra", purchasePrice: "2600", taxType: "VAT", purchaseDate: "2024-03-05", warranty: "12 m-cy", setIncludes: "pudełko, kabel, rysik", notes: "Perfekcyjny stan", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 14 Pro Max", category: "telefon", stock: 1, price: "4200 zł", alert: false, imei: "356789012345678", battery: "97%", color: "Deep Purple", condition: "Używany", memory: "256GB", brand: "Apple", model: "14 Pro Max", purchasePrice: "3500", taxType: "marża", purchaseDate: "2024-04-01", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Zadbany", statusSprzedany: false, dataSprzedazy: "" },
    { name: "Xiaomi 13 Pro", category: "telefon", stock: 1, price: "2800 zł", alert: false, imei: "357890123456789", battery: "92%", color: "Ceramic Black", condition: "Używany", memory: "256GB", brand: "Xiaomi", model: "13 Pro", purchasePrice: "2200", taxType: "VAT", purchaseDate: "2024-03-20", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Stan idealny", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 12 Mini", category: "telefon", stock: 1, price: "1600 zł", alert: false, imei: "358901234567890", battery: "85%", color: "Blue", condition: "Używany", memory: "64GB", brand: "Apple", model: "12 Mini", purchasePrice: "1300", taxType: "marża", purchaseDate: "2024-02-25", warranty: "3 m-ce", setIncludes: "pudełko", notes: "Drobne ryski", statusSprzedany: false, dataSprzedazy: "" },
    { name: "Samsung S22", category: "telefon", stock: 1, price: "1900 zł", alert: false, imei: "359012345678901", battery: "90%", color: "Green", condition: "Używany", memory: "128GB", brand: "Samsung", model: "S22", purchasePrice: "1500", taxType: "VAT", purchaseDate: "2024-03-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Bardzo zadbany", statusSprzedany: false, dataSprzedazy: "" },
    { name: "iPhone 11", category: "telefon", stock: 1, price: "1200 zł", alert: false, imei: "350123456789012", battery: "78%", color: "Purple", condition: "Używany", memory: "64GB", brand: "Apple", model: "11", purchasePrice: "900", taxType: "marża", purchaseDate: "2024-01-20", warranty: "3 m-ce", setIncludes: "kabel", notes: "Ślady użytkowania", statusSprzedany: false, dataSprzedazy: "" },
    
    // Akcesoria
    { name: "Szkło hartowane iPhone 15", category: "akcesoria", stock: 12, price: "49 zł", alert: false },
    { name: "Etui MagSafe iPhone 14", category: "akcesoria", stock: 3, price: "129 zł", alert: true },
    { name: "Kabel USB-C Lightning", category: "akcesoria", stock: 25, price: "79 zł", alert: false },
    { name: "Ładowarka 20W", category: "akcesoria", stock: 15, price: "99 zł", alert: false },
    { name: "Etui Samsung S23", category: "akcesoria", stock: 8, price: "89 zł", alert: false },
    { name: "Szkło Samsung S22", category: "akcesoria", stock: 10, price: "39 zł", alert: false },
    { name: "Kabel USB-C", category: "akcesoria", stock: 30, price: "49 zł", alert: false },
    { name: "Uchwyt samochodowy", category: "akcesoria", stock: 6, price: "59 zł", alert: false },
    { name: "Powerbank 10000mAh", category: "akcesoria", stock: 5, price: "149 zł", alert: false },
    { name: "Słuchawki Bluetooth", category: "akcesoria", stock: 4, price: "199 zł", alert: false },
    { name: "Etui iPhone 13 Pro", category: "akcesoria", stock: 7, price: "99 zł", alert: false },
    { name: "Szkło iPhone 14", category: "akcesoria", stock: 20, price: "45 zł", alert: false },
    
    // Serwis
    { name: "Bateria Samsung S21", category: "serwis", stock: 5, price: "89 zł", alert: false },
    { name: "Wymiana szybki", category: "serwis", stock: 1, price: "150 zł", alert: false },
    { name: "Wymiana baterii", category: "serwis", stock: 1, price: "120 zł", alert: false },
    { name: "Naprawa gniazda ładowania", category: "serwis", stock: 1, price: "180 zł", alert: false },
    { name: "Wymiana wyświetlacza OLED", category: "serwis", stock: 1, price: "350 zł", alert: false },
    { name: "Diagnostyka", category: "serwis", stock: 1, price: "50 zł", alert: false },
    { name: "Polerowanie obudowy", category: "serwis", stock: 1, price: "80 zł", alert: false },
    { name: "Wymiana aparatu", category: "serwis", stock: 1, price: "250 zł", alert: false },
    
    // Usługi
    { name: "Konfiguracja telefonu", category: "usluga", stock: 1, price: "50 zł", alert: false },
    { name: "Transfer danych", category: "usluga", stock: 1, price: "80 zł", alert: false },
    { name: "Instalacja aplikacji", category: "usluga", stock: 1, price: "30 zł", alert: false },
    { name: "Przygotowanie do sprzedaży", category: "usluga", stock: 1, price: "40 zł", alert: false },
    { name: "Konsultacja", category: "usluga", stock: 1, price: "60 zł", alert: false },
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
    const handlePhoneSold = (e: CustomEvent) => {
      const { imei, dataSprzedazy } = e.detail;
      setInventory((prev: typeof inventory) => prev.map((item: typeof inventory[0]) => 
        item.imei === imei 
          ? { ...item, statusSprzedany: true, dataSprzedazy: dataSprzedazy || new Date().toISOString().split('T')[0] }
          : item
      ));
    };
    window.addEventListener('phone_sold', handlePhoneSold as EventListener);
    return () => window.removeEventListener('phone_sold', handlePhoneSold as EventListener);
  }, []);

  const handleAddItem = () => {
    if (newItem.category === "telefon") {
      if (!newItem.brand || !newItem.model || !newItem.sellingPrice) return;
    } else {
      if (!newItem.name || !newItem.stock || !newItem.sellingPrice) return;
    }

    const item = {
      name: newItem.category === "telefon" ? `${newItem.brand} ${newItem.model}` : newItem.name,
      category: newItem.category,
      stock: newItem.category === "telefon" ? 1 : parseInt(newItem.stock),
      price: `${newItem.sellingPrice} zł`,
      alert: newItem.category !== "telefon" && parseInt(newItem.stock) < 5,
      // Phone specific
      ...(newItem.category === "telefon" && {
        brand: newItem.brand,
        model: newItem.model,
        memory: newItem.memory,
        battery: newItem.batteryHealth + "%",
        condition: newItem.condition === "nowy" ? "Nowy" : "Używany",
        color: newItem.color,
        imei: newItem.imei,
        taxType: newItem.taxType,
        purchasePrice: newItem.purchasePrice,
        purchaseDate: newItem.purchaseDate,
        warranty: newItem.warranty,
        notes: newItem.notes,
        setIncludes: newItem.setIncludes,
        statusSprzedany: newItem.statusSprzedany,
        dataSprzedazy: newItem.dataSprzedazy
      })
    };

    setInventory([item, ...inventory]);
    addToast({ message: `Dodano ${item.name} do magazynu`, variant: "success" });
    setNewItem({ 
      name: "", category: "akcesoria", stock: "", purchasePrice: "", sellingPrice: "",
      brand: "", model: "", memory: "", batteryHealth: "", condition: "używany",
      color: "", setIncludes: "", notes: "", warranty: "", imei: "",
      taxType: "marża", purchaseDate: new Date().toISOString().split('T')[0], sellingDate: "",
      statusSprzedany: false, dataSprzedazy: ""
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteItem = (index: number, itemName: string) => {
    if (confirm(`Czy na pewno chcesz usunąć "${itemName}" z magazynu?`)) {
      setInventory(inventory.filter((_: any, i: number) => i !== index));
      addToast({ message: `Usunięto ${itemName} z magazynu`, variant: "success" });
    }
  };

  const filteredItems = useMemo(() => {
    let result = inventory.filter((item: typeof inventory[0]) => 
      (!selectedCategory || item.category === selectedCategory) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    result.sort((a: any, b: any) => {
      const getPrice = (priceStr: string) => {
        if (!priceStr) return 0;
        return parseFloat(priceStr.toString().replace(/[^\d.-]/g, '')) || 0;
      };

      switch (sortBy) {
        case "alfanum-asc":
          return a.name.localeCompare(b.name);
        case "alfanum-desc":
          return b.name.localeCompare(a.name);
        case "stan-asc":
          return a.stock - b.stock;
        case "stan-desc":
          return b.stock - a.stock;
        case "cena-asc":
          return getPrice(a.price) - getPrice(b.price);
        case "cena-desc":
          return getPrice(b.price) - getPrice(a.price);
        default:
          return 0;
      }
    });

    return result;
  }, [inventory, selectedCategory, searchQuery, sortBy]);

  const { availablePhones, soldPhones } = useMemo(() => {
    if (selectedCategory !== "telefon") {
      return { availablePhones: [], soldPhones: [] };
    }
    return {
      availablePhones: filteredItems.filter((item: any) => !item.statusSprzedany),
      soldPhones: filteredItems.filter((item: any) => item.statusSprzedany),
    };
  }, [filteredItems, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-accent text-primary"
              onClick={() => selectedCategory ? setSelectedCategory(null) : window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : "Magazyn"}
            </h1>
          </div>
          
          <div className="flex gap-2">
            {userRole === "owner" && selectedCategory === "usluga" && (
              <Button 
                onClick={() => {
                  setNewItem({...newItem, category: "usluga", name: "", stock: "1", purchasePrice: "", sellingPrice: ""});
                  setIsAddUslugaDialogOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest h-10 px-4 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj usługę
              </Button>
            )}
            
            {userRole === "owner" && selectedCategory === "serwis" && (
              <Button 
                onClick={() => {
                  setNewItem({...newItem, category: "serwis", name: "", stock: "1", purchasePrice: "", sellingPrice: ""});
                  setIsAddSerwisDialogOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 rounded-xl font-black text-xs uppercase tracking-widest h-10 px-4 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj serwis
              </Button>
            )}
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest h-10 px-4 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Przyjmij towar
                </Button>} />

                <DialogContent className="sm:max-w-xl h-[95vh] flex flex-col rounded-[2rem] border-none p-0 overflow-hidden">
                  <div className="p-6 bg-primary text-white shadow-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tight">Przyjęcie na Stan</DialogTitle>
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Wprowadź dane towaru lub urządzenia</p>
                    </DialogHeader>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-accent/30">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Podstawowe</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Kategoria</Label>
                          <UISelect 
                            value={newItem.category}
                            onValueChange={(val) => val && setNewItem({ ...newItem, category: val })}
                          >
                            <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase text-foreground w-full">
                              <UISelectValue placeholder="Wybierz" />
                            </UISelectTrigger>
                            <UISelectContent className="rounded-2xl">
                              {categories.filter(cat => cat.id === "telefon" || cat.id === "akcesoria").map(cat => (
                                <UISelectItem key={cat.id} value={cat.id}>{cat.label}</UISelectItem>
                              ))}
                            </UISelectContent>
                          </UISelect>
                        </div>
                      </div>
                    </div>

                  {newItem.category === "telefon" ? (
                  /* PHONE SPECIFIC FORM */
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Dane Urządzenia</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Marka</Label>
                          <Input 
                            placeholder="np. Apple" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.brand}
                            onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Model</Label>
                          <Input 
                            placeholder="np. iPhone 15 Pro" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.model}
                            onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Pamięć</Label>
                          <Input 
                            placeholder="np. 128GB" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.memory}
                            onChange={(e) => setNewItem({...newItem, memory: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Bateria (%)</Label>
                          <Input 
                            type="number"
                            placeholder="np. 98" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.batteryHealth}
                            onChange={(e) => setNewItem({...newItem, batteryHealth: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Kolor</Label>
                          <Input 
                            placeholder="np. Black" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.color}
                            onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Stan</Label>
                          <UISelect value={newItem.condition} onValueChange={(val) => setNewItem({...newItem, condition: val || newItem.condition})}>
                            <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase text-foreground w-full">
                              <UISelectValue placeholder="Wybierz stan" />
                            </UISelectTrigger>
                            <UISelectContent className="rounded-xl">
                              <UISelectItem value="nowy" className="font-bold text-xs uppercase">Nowy</UISelectItem>
                              <UISelectItem value="używany" className="font-bold text-xs uppercase">Używany</UISelectItem>
                            </UISelectContent>
                          </UISelect>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Numer IMEI</Label>
                          <Input 
                            placeholder="15 cyfr" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.imei}
                            onChange={(e) => setNewItem({...newItem, imei: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Status sprzedaży</Label>
                        <UISelect 
                          value={newItem.statusSprzedany ? "sprzedany" : "dostepny"} 
                          onValueChange={(val) => setNewItem({...newItem, statusSprzedany: val === "sprzedany"})}
                        >
                          <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase text-foreground w-full">
                            <UISelectValue placeholder="Wybierz status" />
                          </UISelectTrigger>
                          <UISelectContent className="rounded-xl">
                            <UISelectItem value="dostepny" className="font-bold text-xs uppercase">Dostępny</UISelectItem>
                            <UISelectItem value="sprzedany" className="font-bold text-xs uppercase">Sprzedany</UISelectItem>
                          </UISelectContent>
                        </UISelect>
                      </div>
                      {newItem.statusSprzedany && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data sprzedaży</Label>
                          <Input 
                            type="date"
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.dataSprzedazy}
                            onChange={(e) => setNewItem({...newItem, dataSprzedazy: e.target.value})}
                          />
                        </div>
                      )}
                    </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Finanse i Dokumentacja</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Zakupu</Label>
                            <Input 
                              type="number"
                              placeholder="0.00" 
                              className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                              value={newItem.purchasePrice}
                              onChange={(e) => setNewItem({...newItem, purchasePrice: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Sprzedaży</Label>
                            <Input 
                              type="number"
                              placeholder="0.00" 
                              className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                              value={newItem.sellingPrice}
                              onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Typ Podatku</Label>
                            <UISelect value={newItem.taxType} onValueChange={(val) => setNewItem({...newItem, taxType: val || newItem.taxType})}>
                              <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase text-foreground w-full">
                                <UISelectValue placeholder="Wybierz typ" />
                              </UISelectTrigger>
                              <UISelectContent className="rounded-xl">
                                <UISelectItem value="marża">VAT-Marża</UISelectItem>
                                <UISelectItem value="VAT">Pełny VAT 23%</UISelectItem>
                              </UISelectContent>
                            </UISelect>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Gwarancja</Label>
                            <Input 
                              placeholder="np. 12 m-cy" 
                              className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                              value={newItem.warranty}
                              onChange={(e) => setNewItem({...newItem, warranty: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data Zakupu</Label>
                            <Input 
                              type="date"
                              className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                              value={newItem.purchaseDate}
                              onChange={(e) => setNewItem({...newItem, purchaseDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data Sprzedaży</Label>
                            <Input 
                              type="date"
                              className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                              value={newItem.sellingDate}
                              onChange={(e) => setNewItem({...newItem, sellingDate: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Dodatkowe</h3>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Co w zestawie?</Label>
                          <Input 
                            placeholder="np. pudełko, kabel, ładowarka" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                            value={newItem.setIncludes}
                            onChange={(e) => setNewItem({...newItem, setIncludes: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Uwagi</Label>
                          <textarea 
                            className="w-full min-h-[80px] bg-accent/30 border-none rounded-xl p-4 font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Dodatkowe informacje..."
                            value={newItem.notes}
                            onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD PRODUCT FORM */
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nazwa Przedmiotu</Label>
                        <Input 
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          placeholder="np. Etui iPhone 15 Pro" 
                          className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Zakupu</Label>
                          <Input 
                            type="number"
                            value={newItem.purchasePrice}
                            onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                            placeholder="0.00" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Sprzedaży</Label>
                          <Input 
                            type="number"
                            value={newItem.sellingPrice}
                            onChange={(e) => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                            placeholder="0.00" 
                            className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Ilość (szt)</Label>
                        <Input 
                          type="number"
                          value={newItem.stock}
                          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                          placeholder="1" 
                          className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-accent/10 border-t border-primary/5 sticky bottom-0 z-20">
                  <Button 
                    onClick={handleAddItem}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
                  >
                    Dodaj do Magazynu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Dialog dla usługi */}
            <Dialog open={isAddUslugaDialogOpen} onOpenChange={setIsAddUslugaDialogOpen}>
              <DialogContent className="sm:max-w-md h-[70vh] flex flex-col rounded-[2rem] border-none p-0 overflow-hidden">
                <div className="p-6 bg-emerald-500 text-white shadow-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Dodaj Usługę</DialogTitle>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Wprowadź dane usługi</p>
                  </DialogHeader>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nazwa Usługi</Label>
                    <Input 
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="np. Wymiana ekranu" 
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Zakupu</Label>
                      <Input 
                        type="number"
                        value={newItem.purchasePrice}
                        onChange={(e) => setNewItem({...newItem, purchasePrice: e.target.value})}
                        placeholder="0.00" 
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Sprzedaży</Label>
                      <Input 
                        type="number"
                        value={newItem.sellingPrice}
                        onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})}
                        placeholder="0.00" 
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Ilość (szt)</Label>
                    <Input 
                      type="number"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                      placeholder="1" 
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-accent/10 border-t border-primary/5 sticky bottom-0 z-20">
                  <Button 
                    onClick={() => {
                      if (!newItem.name || !newItem.sellingPrice) {
                        addToast({ message: "Wypełnij nazwę i cenę sprzedaży", variant: "error" });
                        return;
                      }
                      const item = {
                        name: newItem.name,
                        category: "usluga",
                        stock: parseInt(newItem.stock) || 1,
                        price: `${newItem.sellingPrice} zł`,
                        alert: false,
                      };
                      setInventory([item, ...inventory]);
                      addToast({ message: `Dodano ${item.name} do magazynu`, variant: "success" });
                      setNewItem({...newItem, name: "", stock: "1", purchasePrice: "", sellingPrice: ""});
                      setIsAddUslugaDialogOpen(false);
                    }}
                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95"
                  >
                    Dodaj do Magazynu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Dialog dla serwisu */}
            <Dialog open={isAddSerwisDialogOpen} onOpenChange={setIsAddSerwisDialogOpen}>
              <DialogContent className="sm:max-w-md h-[70vh] flex flex-col rounded-[2rem] border-none p-0 overflow-hidden">
                <div className="p-6 bg-amber-500 text-white shadow-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Dodaj Serwis</DialogTitle>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Wprowadź dane serwisu</p>
                  </DialogHeader>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nazwa Serwisu</Label>
                    <Input 
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="np. Naprawa głośnika" 
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Zakupu</Label>
                      <Input 
                        type="number"
                        value={newItem.purchasePrice}
                        onChange={(e) => setNewItem({...newItem, purchasePrice: e.target.value})}
                        placeholder="0.00" 
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cena Sprzedaży</Label>
                      <Input 
                        type="number"
                        value={newItem.sellingPrice}
                        onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})}
                        placeholder="0.00" 
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Ilość (szt)</Label>
                    <Input 
                      type="number"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                      placeholder="1" 
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-accent/10 border-t border-primary/5 sticky bottom-0 z-20">
                  <Button 
                    onClick={() => {
                      if (!newItem.name || !newItem.sellingPrice) {
                        addToast({ message: "Wypełnij nazwę i cenę sprzedaży", variant: "error" });
                        return;
                      }
                      const item = {
                        name: newItem.name,
                        category: "serwis",
                        stock: parseInt(newItem.stock) || 1,
                        price: `${newItem.sellingPrice} zł`,
                        alert: false,
                      };
                      setInventory([item, ...inventory]);
                      addToast({ message: `Dodano ${item.name} do magazynu`, variant: "success" });
                      setNewItem({...newItem, name: "", stock: "1", purchasePrice: "", sellingPrice: ""});
                      setIsAddSerwisDialogOpen(false);
                    }}
                    className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95"
                  >
                    Dodaj do Magazynu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search and Sort - Visible in Category View or when Category is selected */}
        {(selectedCategory || !selectedCategory) && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 bg-white border-none shadow-sm h-12 rounded-2xl font-bold text-xs uppercase tracking-tight" 
                placeholder={selectedCategory ? `Szukaj w ${selectedCategory}...` : "Szukaj w magazynie..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <UISelect value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <UISelectTrigger className="h-12 bg-white border-none rounded-2xl font-bold text-xs uppercase tracking-widest px-4 min-w-[160px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <span>{sortBy === "alfanum-asc" ? "A-Z" : sortBy === "alfanum-desc" ? "Z-A" : sortBy === "cena-desc" ? "Najdroższe" : sortBy === "cena-asc" ? "Najtańsze" : sortBy === "stan-asc" ? "Stan ↑" : "Stan ↓"}</span>
                </div>
              </UISelectTrigger>
              <UISelectContent className="rounded-2xl">
                <UISelectItem value="alfanum-asc" className="font-bold text-xs uppercase">Alfabetycznie A-Z</UISelectItem>
                <UISelectItem value="alfanum-desc" className="font-bold text-xs uppercase">Alfabetycznie Z-A</UISelectItem>
                <UISelectItem value="cena-desc" className="font-bold text-xs uppercase">Cena: Najdroższe</UISelectItem>
                <UISelectItem value="cena-asc" className="font-bold text-xs uppercase">Cena: Najtańsze</UISelectItem>
                <UISelectItem value="stan-asc" className="font-bold text-xs uppercase">Stan: Rosnąco</UISelectItem>
                <UISelectItem value="stan-desc" className="font-bold text-xs uppercase">Stan: Malejąco</UISelectItem>
              </UISelectContent>
            </UISelect>
          </div>
        )}

        {selectedCategory ? (
          /* Products List View for Selected Category */
          <div className="space-y-4">
            {selectedCategory === "telefon" ? (
              /* Special Aesthetic List for Phones */
              <div className="grid gap-4">
                {/* Available Phones */}
                {availablePhones.length > 0 ? (
                  availablePhones.map((phone: any, idx: number) => (
                    <Card 
                      key={idx} 
                      className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-[2rem] border border-primary/5 cursor-pointer"
                      onClick={() => setSelectedPhone(phone)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-accent/30 p-6 flex items-center justify-center sm:w-32">
                            <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Smartphone className="h-8 w-8" />
                            </div>
                          </div>
                          <div className="p-6 flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{phone.name}</h3>
                                <div className="flex gap-2 mt-1">
                                  <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">{phone.condition}</Badge>
                                  <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">{phone.color}</Badge>
                                  {phone.memory && (
                                    <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">{phone.memory}</Badge>
                                  )}
                                  <Badge className="bg-emerald-100 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">
                                    Dostępny
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-primary leading-none">{phone.price}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Cena Brutto</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-primary/5">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center text-primary/60">
                                  <Hash className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">IMEI</p>
                                  <p className="text-xs font-bold text-foreground font-mono">{phone.imei || "Brak"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center text-emerald-500/60">
                                  <Battery className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Kondycja</p>
                                  <p className="text-xs font-bold text-foreground">{phone.battery || "N/A"}</p>
                                </div>
                              </div>
                              <div className="hidden sm:flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center text-primary/60">
                                  <Info className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</p>
                                  <p className="text-xs font-bold uppercase text-emerald-500">Na stanie</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : soldPhones.length > 0 ? null : (
                  <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-primary/20">
                    <Smartphone className="h-16 w-16 text-primary/10 mx-auto mb-4" />
                    <p className="font-black text-foreground uppercase tracking-tight">Brak telefonów w tej kategorii</p>
                  </div>
                )}
                
                {/* Sold Phones Section */}
                {soldPhones.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-primary/10">
                      <div className="h-px flex-1 bg-primary/10" />
                      <h2 className="text-lg font-black uppercase text-muted-foreground tracking-tight">Sprzedane</h2>
                      <div className="h-px flex-1 bg-primary/10" />
                    </div>
                    {soldPhones.map((phone: any, idx: number) => (
                      <Card 
                        key={idx} 
                        className="border-none shadow-sm bg-white/50 overflow-hidden group hover:shadow-md transition-all rounded-[2rem] border border-red-100 cursor-pointer opacity-70"
                        onClick={() => setSelectedPhone(phone)}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="bg-red-50/50 p-6 flex items-center justify-center sm:w-32">
                              <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                <Smartphone className="h-8 w-8" />
                              </div>
                            </div>
                            <div className="p-6 flex-1 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-xl font-black text-foreground/80 uppercase tracking-tight">{phone.name}</h3>
                                  <div className="flex gap-2 mt-1">
                                    <Badge className="bg-red-100/50 text-red-500 border-none text-[9px] font-black uppercase tracking-widest">{phone.condition}</Badge>
                                    <Badge variant="outline" className="border-red-200/50 text-red-400 text-[9px] font-black uppercase tracking-widest">{phone.color}</Badge>
                                    {phone.memory && (
                                      <Badge variant="outline" className="border-red-200/50 text-red-400 text-[9px] font-black uppercase tracking-widest">{phone.memory}</Badge>
                                    )}
                                    <Badge className="bg-red-100 text-red-600 border-none text-[9px] font-black uppercase tracking-widest">
                                      Sprzedany
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-black text-red-400 leading-none">{phone.price}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Cena Sprzedaży</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-red-100/50">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-400/60">
                                    <Hash className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">IMEI</p>
                                    <p className="text-xs font-bold text-foreground/70 font-mono">{phone.imei || "Brak"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-400/60">
                                    <Battery className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Kondycja</p>
                                    <p className="text-xs font-bold text-foreground/70">{phone.battery || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-400/60">
                                    <Info className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Data sprzedaży</p>
                                    <p className="text-xs font-bold uppercase text-red-400">{phone.dataSprzedazy || "N/A"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            ) : (
              /* Standard Table View for other categories */
              <Card className="border-none shadow-sm overflow-hidden rounded-2xl bg-white border border-primary/5">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary hover:bg-secondary border-none">
                        <TableHead className="text-[10px] font-black uppercase text-white pl-6 h-12">Produkt</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-white text-center">Stan</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-white text-right pr-6">Cena</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-white text-center w-20">Akcja</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item: any, idx: number) => {
                          const originalIndex = inventory.indexOf(item);
                          return (
                          <TableRow key={idx} className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors group">
                            <TableCell className="py-4 pl-6">
                              <p className="font-black text-sm text-foreground uppercase tracking-tight">{item.name}</p>
                              {item.alert && (
                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Niski stan!</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <span className={cn(
                                "text-sm font-black px-2 py-1 rounded-lg",
                                item.alert ? 'text-red-500 bg-red-50' : 'text-foreground bg-accent/30'
                              )}>
                                {item.stock}
                              </span>
                            </TableCell>
                            <TableCell className="text-right py-4 pr-6">
                              <p className="text-sm font-black text-primary">{item.price}</p>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {!(item.category === "usluga" || item.category === "serwis") || userRole === "owner" ? (
                                <button
                                  onClick={() => handleDeleteItem(originalIndex, item.name)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        )})
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-12 text-center">
                            <div className="space-y-4">
                              <Package className="h-12 w-12 text-primary/20 mx-auto" />
                              <div>
                                <p className="font-black text-foreground uppercase tracking-tight">Brak produktów</p>
                                <p className="text-xs text-muted-foreground font-medium">W tej kategorii nie ma jeszcze żadnych pozycji</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => (
                <Card 
                  key={cat.id} 
                  className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all cursor-pointer rounded-2xl border border-primary/5 bg-white"
                  onClick={() => {
                    if (cat.isLink && cat.href) {
                      window.location.href = cat.href;
                    } else {
                      setSelectedCategory(cat.id);
                    }
                  }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                        cat.bg,
                        cat.color
                      )}>
                        <cat.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-base uppercase tracking-tight text-foreground">{cat.label}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {cat.count} pozycji
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary/30 group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Phone Preview Dialog */}
      <Dialog open={!!selectedPhone} onOpenChange={(open) => !open && setSelectedPhone(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col rounded-[2rem] border-none p-0 overflow-hidden">
          {selectedPhone && (
            <>
              <div className="p-6 bg-primary text-white shadow-md flex justify-between items-center">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">{selectedPhone.name}</DialogTitle>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Szczegóły urządzenia</p>
                </DialogHeader>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedPhone(null)}
                  className="rounded-full hover:bg-white/20 text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Header with price */}
                <div className="flex items-center gap-6 p-6 bg-accent/30 rounded-2xl">
                  <div className="h-24 w-24 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Smartphone className="h-12 w-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-primary">{selectedPhone.price}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cena Brutto</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">{selectedPhone.condition}</Badge>
                      <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">{selectedPhone.color}</Badge>
                      {selectedPhone.memory && (
                        <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">{selectedPhone.memory}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Dane Urządzenia</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Marka</p>
                      <p className="text-sm font-black text-foreground uppercase">{selectedPhone.brand || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Model</p>
                      <p className="text-sm font-black text-foreground uppercase">{selectedPhone.model || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Pamięć</p>
                      <p className="text-sm font-black text-foreground uppercase">{selectedPhone.memory || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Kondycja Baterii</p>
                      <p className="text-sm font-black text-emerald-500">{selectedPhone.battery || "N/A"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Kolor</p>
                      <p className="text-sm font-black text-foreground uppercase">{selectedPhone.color || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Stan</p>
                      <p className="text-sm font-black text-foreground uppercase">{selectedPhone.condition || "N/A"}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Numer IMEI</p>
                    <p className="text-sm font-black text-foreground font-mono">{selectedPhone.imei || "Brak"}</p>
                  </div>
                </div>

                {/* Finance Info */}
                {selectedPhone.purchasePrice && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Finanse</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Cena Zakupu</p>
                        <p className="text-sm font-black text-foreground">{selectedPhone.purchasePrice} zł</p>
                      </div>
                      <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Cena Sprzedaży</p>
                        <p className="text-sm font-black text-primary">{selectedPhone.price}</p>
                      </div>
                    </div>
                    {selectedPhone.taxType && (
                      <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Typ Podatku</p>
                        <p className="text-sm font-black text-foreground uppercase">{selectedPhone.taxType === "marża" ? "VAT-Marża" : "Pełny VAT 23%"}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Dodatkowe</h3>
                  {selectedPhone.purchaseDate && (
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Data Zakupu</p>
                      <p className="text-sm font-black text-foreground">{selectedPhone.purchaseDate}</p>
                    </div>
                  )}
                  <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Status sprzedaży</p>
                    <p className={cn(
                      "text-sm font-black uppercase",
                      selectedPhone.statusSprzedany ? "text-red-500" : "text-emerald-500"
                    )}>
                      {selectedPhone.statusSprzedany ? "Sprzedany" : "Dostępny"}
                    </p>
                  </div>
                  {selectedPhone.statusSprzedany && selectedPhone.dataSprzedazy && (
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Data sprzedaży</p>
                      <p className="text-sm font-black text-foreground">{selectedPhone.dataSprzedazy}</p>
                    </div>
                  )}
                  {selectedPhone.warranty && (
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Gwarancja</p>
                      <p className="text-sm font-black text-foreground uppercase">{selectedPhone.warranty}</p>
                    </div>
                  )}
                  {selectedPhone.setIncludes && (
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Co w zestawie?</p>
                      <p className="text-sm font-bold text-foreground uppercase">{selectedPhone.setIncludes}</p>
                    </div>
                  )}
                  {selectedPhone.notes && (
                    <div className="p-4 bg-accent/30 rounded-xl space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Uwagi</p>
                      <p className="text-sm font-bold text-foreground uppercase">{selectedPhone.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-accent/10 border-t border-primary/5 sticky bottom-0 z-20 flex gap-3">
                <Button 
                  onClick={() => {
                    if (confirm(`Czy na pewno chcesz usunąć "${selectedPhone.name}" z magazynu?`)) {
                      const idx = inventory.indexOf(selectedPhone);
                      setInventory(inventory.filter((_: any, i: number) => i !== idx));
                      addToast({ message: `Usunięto ${selectedPhone.name} z magazynu`, variant: "success" });
                      setSelectedPhone(null);
                    }
                  }}
                  className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
                <Button 
                  onClick={() => setSelectedPhone(null)}
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
                >
                  Zamknij
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
