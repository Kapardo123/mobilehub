"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  List,
  Copy
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocalStorage, useSessionStorage, getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type InventoryItem = {
  name: string;
  category: "telefon" | "akcesoria" | "usluga" | "serwis";
  price: string;
  alert: boolean;
  stock: number;
  statusSprzedany?: boolean;
  dataSprzedazy?: string;
  brand?: string;
  model?: string;
  memory?: string;
  battery?: string;
  color?: string;
  condition?: string;
  imei?: string;
  taxType?: string;
  purchaseDate?: string;
  sellingDate?: string;
  warranty?: string;
  setIncludes?: string;
  notes?: string;
  purchasePrice?: string;
  addedBy?: string;
  addedDate?: string;
  shop?: string;
};

interface Cost {
  id: string;
  date: string;
  time: string;
  category: 'skup' | 'zaliczka' | 'paczki' | 'gotowka';
  amount: number;
  description: string;
  shop: string;
  employeeId: string;
  employeeName: string;
  paymentMethod: 'gotowka' | 'przelew';
}

export default function MagazynPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>("telefon");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddUslugaDialogOpen, setIsAddUslugaDialogOpen] = useState(false);
  const [isAddSerwisDialogOpen, setIsAddSerwisDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"alfanum-asc" | "alfanum-desc" | "cena-asc" | "cena-desc" | "stan-asc" | "stan-desc">("alfanum-asc");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState({
    name: "",
    category: "telefon",
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
    purchaseDate: "",
    sellingDate: "",
    statusSprzedany: false,
    dataSprzedazy: "",
  });
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
    purchaseDate: "",
    sellingDate: "",
    statusSprzedany: false,
    dataSprzedazy: "",
  });

  const getDefaultInventory = () => [
    { name: "iPhone 15 Pro", category: "telefon", stock: 1, price: "4500 zł", alert: false, imei: "351234567890123", battery: "100%", color: "Natural Titanium", condition: "Nowy", memory: "256GB", brand: "Apple", model: "15 Pro", purchasePrice: "3800", taxType: "marża", purchaseDate: "2024-01-15", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Bez rys, like new", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 13", category: "telefon", stock: 1, price: "2100 zł", alert: false, imei: "359876543210987", battery: "89%", color: "Midnight", condition: "Używany", memory: "128GB", brand: "Apple", model: "13", purchasePrice: "1700", taxType: "marża", purchaseDate: "2024-02-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Lekkie ryski na obudowie", statusSprzedany: true, dataSprzedazy: "2024-05-10", shop: "Kaufland Włocławek" },
    { name: "Samsung S23 Ultra", category: "telefon", stock: 1, price: "3200 zł", alert: false, imei: "354455667788990", battery: "95%", color: "Phantom Black", condition: "Używany", memory: "512GB", brand: "Samsung", model: "S23 Ultra", purchasePrice: "2600", taxType: "VAT", purchaseDate: "2024-03-05", warranty: "12 m-cy", setIncludes: "pudełko, kabel, rysik", notes: "Perfekcyjny stan", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 14 Pro Max", category: "telefon", stock: 1, price: "4200 zł", alert: false, imei: "356789012345678", battery: "97%", color: "Deep Purple", condition: "Używany", memory: "256GB", brand: "Apple", model: "14 Pro Max", purchasePrice: "3500", taxType: "marża", purchaseDate: "2024-04-01", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Zadbany", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "Xiaomi 13 Pro", category: "telefon", stock: 1, price: "2800 zł", alert: false, imei: "357890123456789", battery: "92%", color: "Ceramic Black", condition: "Używany", memory: "256GB", brand: "Xiaomi", model: "13 Pro", purchasePrice: "2200", taxType: "VAT", purchaseDate: "2024-03-20", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Stan idealny", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 12 Mini", category: "telefon", stock: 1, price: "1600 zł", alert: false, imei: "358901234567890", battery: "85%", color: "Blue", condition: "Używany", memory: "64GB", brand: "Apple", model: "12 Mini", purchasePrice: "1300", taxType: "marża", purchaseDate: "2024-02-25", warranty: "3 m-ce", setIncludes: "pudełko", notes: "Drobne ryski", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "Samsung S22", category: "telefon", stock: 1, price: "1900 zł", alert: false, imei: "359012345678901", battery: "90%", color: "Green", condition: "Używany", memory: "128GB", brand: "Samsung", model: "S22", purchasePrice: "1500", taxType: "VAT", purchaseDate: "2024-03-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Bardzo zadbany", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 11", category: "telefon", stock: 1, price: "1200 zł", alert: false, imei: "350123456789012", battery: "78%", color: "Purple", condition: "Używany", memory: "64GB", brand: "Apple", model: "11", purchasePrice: "900", taxType: "marża", purchaseDate: "2024-01-20", warranty: "3 m-ce", setIncludes: "kabel", notes: "Ślady użytkowania", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },

    { name: "iPhone 16 Pro Max", category: "telefon", stock: 1, price: "5200 zł", alert: false, imei: "350987654321098", battery: "99%", color: "Desert Titanium", condition: "Nowy", memory: "512GB", brand: "Apple", model: "16 Pro Max", purchasePrice: "4500", taxType: "VAT", purchaseDate: "2024-06-01", warranty: "24 m-cy", setIncludes: "pełne pudełko", notes: "Folia na ekranie", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "Samsung S24 Ultra", category: "telefon", stock: 1, price: "4800 zł", alert: false, imei: "351098765432109", battery: "96%", color: "Titanium Gray", condition: "Nowy", memory: "256GB", brand: "Samsung", model: "S24 Ultra", purchasePrice: "4200", taxType: "VAT", purchaseDate: "2024-05-20", warranty: "24 m-cy", setIncludes: "pudełko, kabel, ładowarka, rysik", notes: "Folia na ekranie, pełne pudełko", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "iPhone 15", category: "telefon", stock: 1, price: "3800 zł", alert: false, imei: "352109876543210", battery: "94%", color: "Blue", condition: "Używany", memory: "128GB", brand: "Apple", model: "15", purchasePrice: "3200", taxType: "marża", purchaseDate: "2024-04-15", warranty: "9 m-cy", setIncludes: "pudełko, kabel", notes: "Lekkie ślady", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "Xiaomi 14 Ultra", category: "telefon", stock: 1, price: "3600 zł", alert: false, imei: "353210987654321", battery: "91%", color: "White", condition: "Używany", memory: "512GB", brand: "Xiaomi", model: "14 Ultra", purchasePrice: "2900", taxType: "VAT", purchaseDate: "2024-03-25", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka, etui", notes: "Bardzo zadbany", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "Samsung A54", category: "telefon", stock: 1, price: "1400 zł", alert: false, imei: "354321098765432", battery: "88%", color: "Lavender", condition: "Używany", memory: "128GB", brand: "Samsung", model: "A54", purchasePrice: "1100", taxType: "VAT", purchaseDate: "2024-02-18", warranty: "6 m-cy", setIncludes: "kabel", notes: "Normalne ślady", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "iPhone SE (2nd gen)", category: "telefon", stock: 1, price: "950 zł", alert: false, imei: "355432109876543", battery: "82%", color: "Red", condition: "Używany", memory: "64GB", brand: "Apple", model: "SE (2nd gen)", purchasePrice: "750", taxType: "marża", purchaseDate: "2024-01-28", warranty: "3 m-ce", setIncludes: "kabel", notes: "Drobne ryski", statusSprzedany: true, dataSprzedazy: "2024-06-05", shop: "Riviera Gdynia" },

    { name: "iPhone 14 Plus", category: "telefon", stock: 1, price: "3400 zł", alert: false, imei: "356543210987654", battery: "93%", color: "Starlight", condition: "Używany", memory: "256GB", brand: "Apple", model: "14 Plus", purchasePrice: "2800", taxType: "marża", purchaseDate: "2024-04-08", warranty: "8 m-cy", setIncludes: "pudełko, kabel", notes: "Zadbany egzemplarz", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "Samsung S23 FE", category: "telefon", stock: 1, price: "2400 zł", alert: false, imei: "357654321098765", battery: "89%", color: "Cream", condition: "Używany", memory: "128GB", brand: "Samsung", model: "S23 FE", purchasePrice: "1900", taxType: "VAT", purchaseDate: "2024-03-30", warranty: "9 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Lekkie ślady na ramce", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "Xiaomi 13T Pro", category: "telefon", stock: 1, price: "2600 zł", alert: false, imei: "358765432109876", battery: "87%", color: "Black", condition: "Używany", memory: "256GB", brand: "Xiaomi", model: "13T Pro", purchasePrice: "2000", taxType: "VAT", purchaseDate: "2024-02-22", warranty: "10 m-cy", setIncludes: "pudełko, kabel, ładowarka 67W", notes: "Działa bez zarzutów", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "iPhone 12", category: "telefon", stock: 1, price: "1400 zł", alert: false, imei: "359876543210987", battery: "80%", color: "White", condition: "Używany", memory: "64GB", brand: "Apple", model: "12", purchasePrice: "1050", taxType: "marża", purchaseDate: "2024-01-15", warranty: "3 m-ce", setIncludes: "kabel", notes: "Widoczne ślady użytkowania", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "Samsung A34", category: "telefon", stock: 1, price: "1200 zł", alert: false, imei: "350111222333444", battery: "86%", color: "Graphite", condition: "Używany", memory: "128GB", brand: "Samsung", model: "A34", purchasePrice: "950", taxType: "VAT", purchaseDate: "2024-02-10", warranty: "6 m-cy", setIncludes: "kabel", notes: "Średni stan", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "Redmi Note 13 Pro+", category: "telefon", stock: 1, price: "1800 zł", alert: false, imei: "351222333444555", battery: "92%", color: "Black", condition: "Nowy", memory: "256GB", brand: "Xiaomi", model: "Note 13 Pro+", purchasePrice: "1600", taxType: "VAT", purchaseDate: "2024-05-15", warranty: "24 m-cy", setIncludes: "pełne pudełko, ładowarka 120W", notes: "Odblokowany, folia na ekranie", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },

    { name: "Etui guma", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Etui book", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Szkło", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Folia", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Kabel", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Słuchawki", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Adapter", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Karta pamięci", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Inne", category: "akcesoria", stock: 0, price: "", alert: false },
    { name: "Dane", category: "usluga", stock: 0, price: "", alert: false },
    { name: "Ustawienia", category: "usluga", stock: 0, price: "", alert: false },
    { name: "Montaż szkła", category: "usluga", stock: 0, price: "", alert: false },
    { name: "Inne", category: "usluga", stock: 0, price: "", alert: false },
    { name: "Wyświetlacz", category: "serwis", stock: 0, price: "", alert: false },
    { name: "Bateria", category: "serwis", stock: 0, price: "", alert: false },
    { name: "Złącze ładowania", category: "serwis", stock: 0, price: "", alert: false },
    { name: "Diagnoza", category: "serwis", stock: 0, price: "", alert: false },
    { name: "naprawa Po zalaniu", category: "serwis", stock: 0, price: "", alert: false },
    { name: "Klapka", category: "serwis", stock: 0, price: "", alert: false },
    { name: "Inne", category: "serwis", stock: 0, price: "", alert: false },
  ];

  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('magazyn_inventory', getDefaultInventory() as InventoryItem[]);

  const categories = useMemo(() => [
    { id: "telefon", label: "Telefony", count: inventory.filter((i: typeof inventory[0]) => i.category === "telefon").length, icon: Smartphone, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "akcesoria", label: "Akcesoria", count: inventory.filter((i: typeof inventory[0]) => i.category === "akcesoria").length, icon: Package, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "usluga", label: "Usługa", count: inventory.filter((i: typeof inventory[0]) => i.category === "usluga").length, icon: Settings, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "serwis", label: "Serwis", count: inventory.filter((i: typeof inventory[0]) => i.category === "serwis").length, icon: Wrench, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
  ], [inventory]);

  const [userRole] = useSessionStorage<string | null>("userRole", null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setNewItem(prev => ({
        ...prev,
        purchaseDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const defaultItems = getDefaultInventory();
    const existingNames = inventory.map(item => item.name);
    const missingItems = defaultItems.filter(
      item => !existingNames.includes(item.name)
    );
    if (missingItems.length > 0) {
      setInventory([...inventory, ...missingItems] as InventoryItem[]);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    
    const currentShop = getSessionStorageSafe("shopName", "Kaufland Włocławek");
    const needsMigration = inventory.some(item => item.category === "telefon" && !item.shop);
    if (needsMigration) {
      const updatedInventory = inventory.map(item => {
        if (item.category === "telefon" && !item.shop) {
          return { ...item, shop: currentShop };
        }
        return item;
      });
      setInventory(updatedInventory);
    }
  }, [isMounted, inventory]);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    if (!userRole) {
      router.push("/login");
    }
  }, [userRole, router, isMounted]);

  const filteredItems = useMemo(() => {
    let items = [...inventory];
    
    const currentShop = getSessionStorageSafe("shopName", "Kaufland Włocławek");
    
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

    if (selectedCategory === "telefon") {
      items.sort((a, b) => {
        if (a.statusSprzedany !== b.statusSprzedany) {
          return a.statusSprzedany ? 1 : -1;
        }

        const aIsCurrentShop = (a.shop || "") === currentShop;
        const bIsCurrentShop = (b.shop || "") === currentShop;

        if (aIsCurrentShop !== bIsCurrentShop) {
          return aIsCurrentShop ? -1 : 1;
        }

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
    } else {
      items.sort((a, b) => {
        if (a.statusSprzedany !== b.statusSprzedany) {
          return a.statusSprzedany ? 1 : -1;
        }

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
    }

    return items;
  }, [inventory, selectedCategory, searchQuery, sortBy]);

  const handleAddItem = () => {
    if (!newItem.category) return;
    
    const phoneName = newItem.category === "telefon" 
      ? `${newItem.brand} ${newItem.model}`.trim()
      : newItem.name;
      
    if (!phoneName) return;

    const baseItem = {
      name: phoneName,
      category: newItem.category,
      price: newItem.sellingPrice ? `${newItem.sellingPrice} zł` : "0 zł",
      alert: false,
      stock: newItem.category === "telefon" ? 1 : (newItem.stock ? parseInt(newItem.stock) : 0),
      purchasePrice: newItem.purchasePrice || "",
      sellingDate: newItem.sellingDate || "",
      statusSprzedany: false,
      dataSprzedazy: "",
      addedBy: userRole === "owner" ? "Właściciel" : (getSessionStorageSafe("userName", "") || "Pracownik"),
      addedDate: new Date().toISOString().split('T')[0],
      shop: getSessionStorageSafe("shopName", "Kaufland Włocławek"),
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
    
    if (newItem.category === "telefon" && newItem.purchasePrice && parseFloat(newItem.purchasePrice) > 0) {
      const employeeName = getSessionStorageSafe("userName", "Pracownik");
      const employeeId = getSessionStorageSafe("userId", "unknown");
      const shopName = getSessionStorageSafe("shopName", "Kaufland Włocławek");
      
      const cost: Cost = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'skup',
        amount: parseFloat(newItem.purchasePrice),
        description: `Skup: ${phoneName}`,
        shop: shopName,
        employeeId,
        employeeName,
        paymentMethod: 'gotowka'
      };
      
      const existingCosts = getLocalStorageSafe('sprzedaz_costs', []);
      localStorage.setItem('sprzedaz_costs', JSON.stringify([cost, ...existingCosts]));
      
      addToast({ message: `Koszt skupu dodany: ${newItem.purchasePrice} zł`, variant: "success" });
    }
    
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

  const handleDeleteItem = (itemIndex: number) => {
    const item = filteredItems[itemIndex];
    const itemName = item.name;
    
    const newInventory = inventory.filter((invItem) => {
      if (item.imei && invItem.imei === item.imei) return false;
      if (item.name === invItem.name && item.category === invItem.category && item.price === invItem.price) return false;
      return true;
    });
    
    setInventory(newInventory);
    addToast({
      title: "Usunięto przedmiot",
      description: `${itemName} został usunięty z magazynu`,
      variant: "error"
    });
  };

  const handleEditItem = (itemIndex: number) => {
    const item = filteredItems[itemIndex];
    const originalIndex = inventory.findIndex((invItem) => {
      if (item.imei && invItem.imei === item.imei) return true;
      if (item.name === invItem.name && item.category === invItem.category && item.price === invItem.price) return true;
      return false;
    });
    
    if (originalIndex === -1) return;
    
    setEditingIndex(originalIndex);
    setEditItem({
      name: item.name || "",
      category: item.category || "telefon",
      stock: item.stock?.toString() || "",
      purchasePrice: item.purchasePrice || "",
      sellingPrice: parseInt(item.price)?.toString() || "",
      brand: item.brand || "",
      model: item.model || "",
      memory: item.memory || "",
      batteryHealth: item.battery ? item.battery.replace("%", "") : "",
      condition: item.condition || "używany",
      color: item.color || "",
      setIncludes: item.setIncludes || "",
      notes: item.notes || "",
      warranty: item.warranty || "",
      imei: item.imei || "",
      taxType: item.taxType || "marża",
      purchaseDate: item.purchaseDate || "",
      sellingDate: item.sellingDate || "",
      statusSprzedany: item.statusSprzedany || false,
      dataSprzedazy: item.dataSprzedazy || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editItem.name) return;

    const baseItem = {
      name: editItem.name,
      category: editItem.category,
      price: editItem.sellingPrice ? `${editItem.sellingPrice} zł` : "0 zł",
      alert: false,
      stock: editItem.stock ? parseInt(editItem.stock) : 0,
      purchasePrice: editItem.purchasePrice || "",
      sellingDate: editItem.sellingDate || "",
      statusSprzedany: editItem.statusSprzedany,
      dataSprzedazy: editItem.dataSprzedazy || "",
    };

    const updatedItem = editItem.category === "telefon"
      ? {
          ...baseItem,
          brand: editItem.brand,
          model: editItem.model,
          memory: editItem.memory,
          battery: editItem.batteryHealth ? `${editItem.batteryHealth}%` : "",
          color: editItem.color,
          condition: editItem.condition,
          imei: editItem.imei,
          taxType: editItem.taxType,
          purchaseDate: editItem.purchaseDate,
          warranty: editItem.warranty,
          setIncludes: editItem.setIncludes,
          notes: editItem.notes,
        }
      : baseItem;

    const newInventory = [...inventory];
    newInventory[editingIndex] = updatedItem as any;
    setInventory(newInventory);
    setIsEditDialogOpen(false);
    setEditingIndex(null);
    addToast({
      title: "Zapisano zmiany",
      description: `${updatedItem.name} został zaktualizowany`,
      variant: "success"
    });
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
            <h1 className="text-xl font-bold tracking-tight text-foreground">Magazyn</h1>
          </div>
          <div className="flex items-center gap-2">
            {isMounted && userRole && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger render={<Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-xs font-semibold tracking-tight shadow-sm shadow-primary/20 transition-all duration-300">
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>} />
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
                  <DialogHeader className="p-8 bg-gradient-to-br from-primary to-primary/80 text-white relative shrink-0">
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-bold tracking-tight">Dodaj do Magazynu</DialogTitle>
                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Wprowadź dane nowego przedmiotu</p>
                    </div>
                    <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {newItem.category !== "telefon" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nazwa</Label>
                        <Input 
                          placeholder="Nazwa przedmiotu" 
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="h-12 bg-accent/30 border-none rounded-xl"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategoria</Label>
                      <Select value={newItem.category} onValueChange={(val) => val && setNewItem({...newItem, category: val})} items={[
                        { value: "telefon", label: "Telefon" },
                        { value: "akcesoria", label: "Akcesoria" }
                      ]}>
                        <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                          <SelectValue placeholder="Wybierz..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telefon">Telefon</SelectItem>
                          <SelectItem value="akcesoria">Akcesoria</SelectItem>
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
                          <Select value={newItem.condition} onValueChange={(val) => val && setNewItem({...newItem, condition: val})} items={[
                            { value: "nowy", label: "Nowy" },
                            { value: "używany", label: "Używany" }
                          ]}>
                            <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                              <SelectValue placeholder="Wybierz..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nowy">Nowy</SelectItem>
                              <SelectItem value="używany">Używany</SelectItem>
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

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gwarancja</Label>
                          <Input 
                            placeholder="12 miesięcy" 
                            value={newItem.warranty}
                            onChange={(e) => setNewItem({...newItem, warranty: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cena zakupu</Label>
                          <Input 
                            placeholder="1499" 
                            type="number"
                            value={newItem.purchasePrice}
                            onChange={(e) => setNewItem({...newItem, purchasePrice: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>
                      </>
                    )}

                    {newItem.category === "telefon" && (
                      <div className="grid grid-cols-2 gap-4">
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
                    )}
                  </div>
                  <DialogFooter className="p-8 pt-0 shrink-0">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl border-primary/10">Anuluj</Button>
                    <Button onClick={handleAddItem} className="rounded-xl bg-primary hover:bg-primary/90 text-white">Dodaj</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {isMounted && userRole === "owner" && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
                  <DialogHeader className="p-8 bg-gradient-to-br from-primary to-primary/80 text-white relative shrink-0">
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-bold tracking-tight">Edytuj przedmiot</DialogTitle>
                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Zmodyfikuj dane przedmiotu</p>
                    </div>
                    <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Edit2 className="h-6 w-6 text-white" />
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nazwa</Label>
                      <Input 
                        placeholder="Nazwa przedmiotu" 
                        value={editItem.name}
                        onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                        className="h-12 bg-accent/30 border-none rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategoria</Label>
                      <Select value={editItem.category} onValueChange={(val) => val && setEditItem({...editItem, category: val})} items={[
                        { value: "telefon", label: "Telefon" },
                        { value: "akcesoria", label: "Akcesoria" }
                      ]}>
                        <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                          <SelectValue placeholder="Wybierz..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telefon">Telefon</SelectItem>
                          <SelectItem value="akcesoria">Akcesoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editItem.category === "telefon" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marka</Label>
                            <Input 
                              placeholder="Apple" 
                              value={editItem.brand}
                              onChange={(e) => setEditItem({...editItem, brand: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Model</Label>
                            <Input 
                              placeholder="iPhone 15 Pro" 
                              value={editItem.model}
                              onChange={(e) => setEditItem({...editItem, model: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pamięć</Label>
                            <Input 
                              placeholder="256GB" 
                              value={editItem.memory}
                              onChange={(e) => setEditItem({...editItem, memory: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kolor</Label>
                            <Input 
                              placeholder="Czarny" 
                              value={editItem.color}
                              onChange={(e) => setEditItem({...editItem, color: e.target.value})}
                              className="h-12 bg-accent/30 border-none rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stan baterii %</Label>
                          <Input 
                            placeholder="95" 
                            type="number"
                            value={editItem.batteryHealth}
                            onChange={(e) => setEditItem({...editItem, batteryHealth: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stan</Label>
                          <Select value={editItem.condition} onValueChange={(val) => val && setEditItem({...editItem, condition: val})} items={[
                            { value: "nowy", label: "Nowy" },
                            { value: "używany", label: "Używany" }
                          ]}>
                            <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                              <SelectValue placeholder="Wybierz..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nowy">Nowy</SelectItem>
                              <SelectItem value="używany">Używany</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IMEI</Label>
                          <Input 
                            placeholder="123456789012345" 
                            value={editItem.imei}
                            onChange={(e) => setEditItem({...editItem, imei: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gwarancja</Label>
                          <Input 
                            placeholder="12 miesięcy" 
                            value={editItem.warranty}
                            onChange={(e) => setEditItem({...editItem, warranty: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cena zakupu</Label>
                          <Input 
                            placeholder="1499" 
                            type="number"
                            value={editItem.purchasePrice}
                            onChange={(e) => setEditItem({...editItem, purchasePrice: e.target.value})}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                          />
                        </div>
                      </>
                    )}

                    {editItem.category === "telefon" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cena sprzedaży</Label>
                        <Input 
                          placeholder="1999" 
                          type="number"
                          value={editItem.sellingPrice}
                          onChange={(e) => setEditItem({...editItem, sellingPrice: e.target.value})}
                          className="h-12 bg-accent/30 border-none rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter className="p-8 pt-0 shrink-0">
                    <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingIndex(null); }} className="rounded-xl border-primary/10">Anuluj</Button>
                    <Button onClick={handleSaveEdit} className="rounded-xl bg-primary hover:bg-primary/90 text-white">Zapisz zmiany</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
              <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
                <DialogHeader className="p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative shrink-0">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Podgląd sprzedanego przedmiotu</DialogTitle>
                    <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Dane sprzedaży</p>
                  </div>
                  <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <List className="h-6 w-6 text-white" />
                  </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {previewItem && (
                    <>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-foreground">{previewItem.name}</h3>
                        <p className="text-lg font-semibold text-emerald-600 mt-2">{previewItem.price}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {previewItem.brand && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marka</p>
                            <p className="font-medium">{previewItem.brand}</p>
                          </div>
                        )}
                        {previewItem.model && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Model</p>
                            <p className="font-medium">{previewItem.model}</p>
                          </div>
                        )}
                      </div>

                      {previewItem.category === "telefon" && (
                        <div className="grid grid-cols-2 gap-4">
                          {previewItem.memory && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pamięć</p>
                              <p className="font-medium">{previewItem.memory}</p>
                            </div>
                          )}
                          {previewItem.color && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kolor</p>
                              <p className="font-medium">{previewItem.color}</p>
                            </div>
                          )}
                          {previewItem.battery && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stan baterii</p>
                              <p className="font-medium">{previewItem.battery}</p>
                            </div>
                          )}
                          {previewItem.condition && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stan</p>
                              <p className="font-medium">{previewItem.condition}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {previewItem.imei && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IMEI</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-accent/30 px-3 py-1.5 rounded-lg">{previewItem.imei}</code>
                            <button 
                              onClick={() => previewItem.imei && copyToClipboard(previewItem.imei)}
                              className="p-1.5 rounded-lg hover:bg-accent/30 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 pt-2 border-t border-border">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data sprzedaży</p>
                          <p className="font-semibold">{previewItem.dataSprzedazy}</p>
                        </div>
                        {previewItem.purchaseDate && (
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data zakupu</p>
                            <p className="font-semibold">{previewItem.purchaseDate}</p>
                          </div>
                        )}
                        {previewItem.warranty && (
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gwarancja</p>
                            <p className="font-semibold">{previewItem.warranty}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter className="p-8 pt-0 shrink-0">
                  <Button onClick={() => setIsPreviewDialogOpen(false)} className="rounded-xl bg-gray-500 hover:bg-gray-600 text-white w-full">Zamknij</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddUslugaDialogOpen} onOpenChange={setIsAddUslugaDialogOpen}>
              <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-gradient-to-br from-secondary to-secondary/80 text-white relative shrink-0">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Dodaj nową usługę</DialogTitle>
                    <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Wprowadź nazwę usługi</p>
                  </div>
                </DialogHeader>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nazwa usługi</Label>
                    <Input 
                      placeholder="np. Montaż szkła, Dane, Ustawienia" 
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="h-12 bg-accent/30 border-none rounded-xl"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUslugaDialogOpen(false)} className="rounded-xl">Anuluj</Button>
                    <Button 
                      onClick={() => {
                        if (newItem.name.trim()) {
                          setInventory([...inventory, { name: newItem.name, category: "usluga", stock: 0, price: "", alert: false }]);
                          setNewItem({...newItem, name: ""});
                          setIsAddUslugaDialogOpen(false);
                          addToast({ message: "Dodano usługę", variant: "success" });
                        }
                      }}
                      className="rounded-xl bg-secondary hover:bg-secondary/90 text-white"
                    >
                      Dodaj usługę
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddSerwisDialogOpen} onOpenChange={setIsAddSerwisDialogOpen}>
              <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white relative shrink-0">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Dodaj nowy serwis</DialogTitle>
                    <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Wprowadź nazwę serwisu</p>
                  </div>
                </DialogHeader>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nazwa serwisu</Label>
                    <Input 
                      placeholder="np. Wyświetlacz, Bateria, Diagnoza" 
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="h-12 bg-accent/30 border-none rounded-xl"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddSerwisDialogOpen(false)} className="rounded-xl">Anuluj</Button>
                    <Button 
                      onClick={() => {
                        if (newItem.name.trim()) {
                          setInventory([...inventory, { name: newItem.name, category: "serwis", stock: 0, price: "", alert: false }]);
                          setNewItem({...newItem, name: ""});
                          setIsAddSerwisDialogOpen(false);
                          addToast({ message: "Dodano serwis", variant: "success" });
                        }
                      }}
                      className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Dodaj serwis
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Szukaj w magazynie..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 bg-white border-primary/5 rounded-xl shadow-sm focus:shadow-md transition-all"
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
          <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)} items={[
            { value: "alfanum-asc", label: "A-Z" },
            { value: "alfanum-desc", label: "Z-A" },
            { value: "cena-asc", label: "Cena ↑" },
            { value: "cena-desc", label: "Cena ↓" },
            { value: "stan-asc", label: "Stan ↑" },
            { value: "stan-desc", label: "Stan ↓" }
          ]}>
            <SelectTrigger className="h-12 w-[140px] bg-white border-primary/5 rounded-xl shadow-sm hover:shadow-md transition-all">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sortuj" />
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
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-300",
                selectedCategory === cat.id 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "bg-white border-primary/5 hover:border-primary/20 hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                  selectedCategory === cat.id ? "bg-white/20" : cat.bg
                )}>
                  <cat.icon className={cn("h-5 w-5", selectedCategory === cat.id ? "text-white" : cat.color)} />
                </div>
                <span className={cn("text-[11px] font-semibold tracking-tight", selectedCategory === cat.id ? "text-white/80" : "text-muted-foreground")}>
                  {cat.label}
                </span>
                <span className={cn("text-xl font-bold tracking-tight", selectedCategory === cat.id ? "text-white" : "text-foreground")}>
                  {isMounted ? cat.count : "-"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {isMounted && userRole === "owner" && selectedCategory === "usluga" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white text-xs font-semibold tracking-tight shadow-sm transition-all duration-300" onClick={() => setIsAddUslugaDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj usługę
            </Button>
          </div>
        )}

        {isMounted && userRole === "owner" && selectedCategory === "serwis" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white text-xs font-semibold tracking-tight shadow-sm transition-all duration-300" onClick={() => setIsAddSerwisDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj serwis
            </Button>
          </div>
        )}

        <div className="space-y-1">
          {isMounted ? (
            <>
              {filteredItems.map((item, index) => {
            const brandGradients: Record<string, string> = {
              "Apple": "from-slate-50 to-blue-50 border-l-blue-400",
              "Samsung": "from-slate-50 to-indigo-50 border-l-indigo-400",
              "Xiaomi": "from-slate-50 to-orange-50 border-l-orange-400",
            };
            const brandAccent = brandGradients[item.brand || ""] || "from-slate-50 to-slate-100 border-l-slate-300";

            return (
            <div key={index} className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border-l-4 bg-gradient-to-r hover:shadow-md transition-all duration-200 group",
              item.statusSprzedany ? "from-gray-50 to-gray-100 border-l-gray-300 opacity-70" : brandAccent
            )}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  item.category === "telefon" && "bg-gradient-to-br from-primary/10 to-primary/5",
                  item.category === "akcesoria" && "bg-gradient-to-br from-amber-100 to-amber-50",
                  item.category === "usluga" && "bg-gradient-to-br from-blue-100 to-blue-50",
                  item.category === "serwis" && "bg-gradient-to-br from-violet-100 to-violet-50"
                )}>
                  {item.category === "telefon" && <Smartphone className="h-4 w-4 text-primary" />}
                  {item.category === "akcesoria" && <Package className="h-4 w-4 text-amber-600" />}
                  {item.category === "usluga" && <Settings className="h-4 w-4 text-blue-600" />}
                  {item.category === "serwis" && <Wrench className="h-4 w-4 text-violet-600" />}
                </div>
                
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                  
                  {item.category === "telefon" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.condition && (
                        <span className={cn(
                          "text-[10px] font-bold px-1 py-0.5 rounded border",
                          item.condition.toLowerCase() === "nowy" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          item.condition.toLowerCase() === "używany" && "bg-amber-50 text-amber-700 border-amber-200",
                          !["nowy", "używany"].includes(item.condition.toLowerCase()) && "bg-gray-50 text-gray-700 border-gray-200"
                        )}>
                          {item.condition.toLowerCase() === "nowy" ? "✨" :
                           item.condition.toLowerCase() === "używany" ? "🔄" : "•"}
                        </span>
                      )}
                      {item.memory && (
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.memory}</span>
                      )}
                      {item.color && (
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded hidden sm:inline">{item.color}</span>
                      )}
                      {item.battery && (
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">🔋{item.battery}</span>
                      )}
                      {item.shop ? (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                          item.shop === getSessionStorageSafe("shopName", "")
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          📍{item.shop}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200">
                          📍Brak danych
                        </span>
                      )}
                    </div>
                  )}
                  
                  {item.statusSprzedany && (
                    <Badge variant="secondary" className="text-[8px] h-4 px-1.5 uppercase font-bold bg-emerald-100 text-emerald-700 border-none shrink-0">
                      Sprzedany
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.category === "telefon" && (
                  <span className="text-sm font-bold text-foreground tracking-tight min-w-[60px] text-right">{item.price}</span>
                )}
                
                {!item.statusSprzedany && userRole === "owner" && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditItem(index)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="Edytuj"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(index)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {item.statusSprzedany && (
                  <button 
                    onClick={() => { setPreviewItem(item); setIsPreviewDialogOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600 transition-colors"
                    title="Podgląd"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )})}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Brak przedmiotów w magazynie</p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">Dodaj pierwszy przedmiot, aby rozpocząć</p>
            </div>
          )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Package className="h-6 w-6 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground/60">Ładowanie magazynu...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
