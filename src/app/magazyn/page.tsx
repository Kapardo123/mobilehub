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
  Copy,
  Users
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocalStorage, useSessionStorage, getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import { formatDatePL, getCurrentDatePL, getCurrentTimePL, toISODateString } from "@/lib/dateFormat";
import { inventoryService } from "@/lib/supabase/inventory";
import { costsService } from "@/lib/supabase/costs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type InventoryItem = {
  id?: string;
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
  const [editItem, setEditItem] = useState<{
    name: string;
    category: "telefon" | "akcesoria" | "usluga" | "serwis";
    stock: string;
    purchasePrice: string;
    sellingPrice: string;
    brand: string;
    model: string;
    memory: string;
    batteryHealth: string;
    condition: "nowy" | "uzywany";
    color: string;
    setIncludes: string;
    notes: string;
    warranty: string;
    imei: string;
    taxType: "VAT" | "marza" | "zwolniony";
    purchaseDate: string;
    sellingDate: string;
    statusSprzedany: boolean;
    dataSprzedazy: string;
  }>({
    name: "",
    category: "telefon",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
    brand: "",
    model: "",
    memory: "",
    batteryHealth: "",
    condition: "uzywany",
    color: "",
    setIncludes: "",
    notes: "",
    warranty: "",
    imei: "",
    taxType: "marza",
    purchaseDate: "",
    sellingDate: "",
    statusSprzedany: false,
    dataSprzedazy: "",
  });

  const [activeEmployees, setActiveEmployees] = useState<any[]>([]);
  const [selectedEmployeeForItem, setSelectedEmployeeForItem] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const active = sessionStorage.getItem('activeEmployees');
    if (active) {
      const parsed = JSON.parse(active);
      setActiveEmployees(parsed);
      if (parsed.length > 0) {
        const currentId = sessionStorage.getItem('selectedEmployeeId');
        if (currentId) {
          setSelectedEmployeeForItem(currentId);
        } else {
          setSelectedEmployeeForItem(parsed[0].id);
        }
      }
    } else {
      const singleEmployee = {
        id: getSessionStorageSafe("userId", "unknown"),
        name: getSessionStorageSafe("userName", "Pracownik"),
        initials: getSessionStorageSafe("userInitials", "PR"),
        shop: getSessionStorageSafe("shopName", "Sklep")
      };
      setActiveEmployees([singleEmployee]);
      setSelectedEmployeeForItem(singleEmployee.id);
    }
  }, []);
  const [newItem, setNewItem] = useState<{
    name: string;
    category: "telefon" | "akcesoria" | "usluga" | "serwis";
    stock: string;
    purchasePrice: string;
    sellingPrice: string;
    brand: string;
    model: string;
    memory: string;
    batteryHealth: string;
    condition: "nowy" | "uzywany";
    color: string;
    setIncludes: string;
    notes: string;
    warranty: string;
    imei: string;
    taxType: "VAT" | "marza" | "zwolniony";
    purchaseDate: string;
    sellingDate: string;
    statusSprzedany: boolean;
    dataSprzedazy: string;
  }>({
    name: "",
    category: "akcesoria",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
    brand: "",
    model: "",
    memory: "",
    batteryHealth: "",
    condition: "uzywany",
    color: "",
    setIncludes: "",
    notes: "",
    warranty: "",
    imei: "",
    taxType: "marza",
    purchaseDate: "",
    sellingDate: "",
    statusSprzedany: false,
    dataSprzedazy: "",
  });

  const getDefaultInventory = () => [
    { name: "iPhone 15 Pro", category: "telefon", stock: 1, price: "4500 zł", alert: false, imei: "351234567890123", battery: "100%", color: "Natural Titanium", condition: "Nowy", memory: "256GB", brand: "Apple", model: "15 Pro", purchasePrice: "3800", taxType: "marza", purchaseDate: "2024-01-15", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Bez rys, like new", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 13", category: "telefon", stock: 1, price: "2100 zł", alert: false, imei: "359876543210987", battery: "89%", color: "Midnight", condition: "Używany", memory: "128GB", brand: "Apple", model: "13", purchasePrice: "1700", taxType: "marza", purchaseDate: "2024-02-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Lekkie ryski na obudowie", statusSprzedany: true, dataSprzedazy: "2024-05-10", shop: "Kaufland Włocławek" },
    { name: "Samsung S23 Ultra", category: "telefon", stock: 1, price: "3200 zł", alert: false, imei: "354455667788990", battery: "95%", color: "Phantom Black", condition: "Używany", memory: "512GB", brand: "Samsung", model: "S23 Ultra", purchasePrice: "2600", taxType: "VAT", purchaseDate: "2024-03-05", warranty: "12 m-cy", setIncludes: "pudełko, kabel, rysik", notes: "Perfekcyjny stan", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 14 Pro Max", category: "telefon", stock: 1, price: "4200 zł", alert: false, imei: "356789012345678", battery: "97%", color: "Deep Purple", condition: "Używany", memory: "256GB", brand: "Apple", model: "14 Pro Max", purchasePrice: "3500", taxType: "marza", purchaseDate: "2024-04-01", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Zadbany", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "Xiaomi 13 Pro", category: "telefon", stock: 1, price: "2800 zł", alert: false, imei: "357890123456789", battery: "92%", color: "Ceramic Black", condition: "Używany", memory: "256GB", brand: "Xiaomi", model: "13 Pro", purchasePrice: "2200", taxType: "VAT", purchaseDate: "2024-03-20", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Stan idealny", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 12 Mini", category: "telefon", stock: 1, price: "1600 zł", alert: false, imei: "358901234567890", battery: "85%", color: "Blue", condition: "Używany", memory: "64GB", brand: "Apple", model: "12 Mini", purchasePrice: "1300", taxType: "marza", purchaseDate: "2024-02-25", warranty: "3 m-ce", setIncludes: "pudełko", notes: "Drobne ryski", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "Samsung S22", category: "telefon", stock: 1, price: "1900 zł", alert: false, imei: "359012345678901", battery: "90%", color: "Green", condition: "Używany", memory: "128GB", brand: "Samsung", model: "S22", purchasePrice: "1500", taxType: "VAT", purchaseDate: "2024-03-10", warranty: "6 m-cy", setIncludes: "pudełko, kabel", notes: "Bardzo zadbany", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },
    { name: "iPhone 11", category: "telefon", stock: 1, price: "1200 zł", alert: false, imei: "350123456789012", battery: "78%", color: "Purple", condition: "Używany", memory: "64GB", brand: "Apple", model: "11", purchasePrice: "900", taxType: "marza", purchaseDate: "2024-01-20", warranty: "3 m-ce", setIncludes: "kabel", notes: "Ślady użytkowania", statusSprzedany: false, dataSprzedazy: "", shop: "Kaufland Włocławek" },

    { name: "iPhone 16 Pro Max", category: "telefon", stock: 1, price: "5200 zł", alert: false, imei: "350987654321098", battery: "99%", color: "Desert Titanium", condition: "Nowy", memory: "512GB", brand: "Apple", model: "16 Pro Max", purchasePrice: "4500", taxType: "VAT", purchaseDate: "2024-06-01", warranty: "24 m-cy", setIncludes: "pełne pudełko", notes: "Folia na ekranie", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "Samsung S24 Ultra", category: "telefon", stock: 1, price: "4800 zł", alert: false, imei: "351098765432109", battery: "96%", color: "Titanium Gray", condition: "Używany", memory: "256GB", brand: "Samsung", model: "S24 Ultra", purchasePrice: "4200", taxType: "VAT", purchaseDate: "2024-05-20", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka, rysik", notes: "Bardzo zadbany, folia na ekranie", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "iPhone 15", category: "telefon", stock: 1, price: "3800 zł", alert: false, imei: "352109876543210", battery: "94%", color: "Blue", condition: "Używany", memory: "128GB", brand: "Apple", model: "15", purchasePrice: "3200", taxType: "marza", purchaseDate: "2024-04-15", warranty: "9 m-cy", setIncludes: "pudełko, kabel", notes: "Lekkie ślady", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "Xiaomi 14 Ultra", category: "telefon", stock: 1, price: "3600 zł", alert: false, imei: "353210987654321", battery: "91%", color: "White", condition: "Używany", memory: "512GB", brand: "Xiaomi", model: "14 Ultra", purchasePrice: "2900", taxType: "VAT", purchaseDate: "2024-03-25", warranty: "12 m-cy", setIncludes: "pudełko, kabel, ładowarka, etui", notes: "Bardzo zadbany", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "Samsung A54", category: "telefon", stock: 1, price: "1400 zł", alert: false, imei: "354321098765432", battery: "88%", color: "Lavender", condition: "Używany", memory: "128GB", brand: "Samsung", model: "A54", purchasePrice: "1100", taxType: "VAT", purchaseDate: "2024-02-18", warranty: "6 m-cy", setIncludes: "kabel", notes: "Normalne ślady", statusSprzedany: false, dataSprzedazy: "", shop: "Riviera Gdynia" },
    { name: "iPhone SE (2nd gen)", category: "telefon", stock: 1, price: "950 zł", alert: false, imei: "355432109876543", battery: "82%", color: "Red", condition: "Używany", memory: "64GB", brand: "Apple", model: "SE (2nd gen)", purchasePrice: "750", taxType: "marza", purchaseDate: "2024-01-28", warranty: "3 m-ce", setIncludes: "kabel", notes: "Drobne ryski", statusSprzedany: true, dataSprzedazy: "2024-06-05", shop: "Riviera Gdynia" },

    { name: "iPhone 14 Plus", category: "telefon", stock: 1, price: "3400 zł", alert: false, imei: "356543210987654", battery: "93%", color: "Starlight", condition: "Używany", memory: "256GB", brand: "Apple", model: "14 Plus", purchasePrice: "2800", taxType: "marza", purchaseDate: "2024-04-08", warranty: "8 m-cy", setIncludes: "pudełko, kabel", notes: "Zadbany egzemplarz", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "Samsung S23 FE", category: "telefon", stock: 1, price: "2400 zł", alert: false, imei: "357654321098765", battery: "89%", color: "Cream", condition: "Używany", memory: "128GB", brand: "Samsung", model: "S23 FE", purchasePrice: "1900", taxType: "VAT", purchaseDate: "2024-03-30", warranty: "9 m-cy", setIncludes: "pudełko, kabel, ładowarka", notes: "Lekkie ślady na ramce", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "Xiaomi 13T Pro", category: "telefon", stock: 1, price: "2600 zł", alert: false, imei: "358765432109876", battery: "87%", color: "Black", condition: "Używany", memory: "256GB", brand: "Xiaomi", model: "13T Pro", purchasePrice: "2000", taxType: "VAT", purchaseDate: "2024-02-22", warranty: "10 m-cy", setIncludes: "pudełko, kabel, ładowarka 67W", notes: "Działa bez zarzutów", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
    { name: "iPhone 12", category: "telefon", stock: 1, price: "1400 zł", alert: false, imei: "359876543210987", battery: "80%", color: "White", condition: "Używany", memory: "64GB", brand: "Apple", model: "12", purchasePrice: "1050", taxType: "marza", purchaseDate: "2024-01-15", warranty: "3 m-ce", setIncludes: "kabel", notes: "Widoczne ślady użytkowania", statusSprzedany: false, dataSprzedazy: "", shop: "Dominikańska Wrocław" },
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

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = useMemo(() => [
    { id: "telefon", label: "Telefony", count: inventory.filter((i: typeof inventory[0]) => i.category === "telefon").length, icon: Smartphone, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "akcesoria", label: "Akcesoria", count: inventory.filter((i: typeof inventory[0]) => i.category === "akcesoria").length, icon: Package, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "usluga", label: "Usługa", count: inventory.filter((i: typeof inventory[0]) => i.category === "usluga").length, icon: Settings, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
    { id: "serwis", label: "Serwis", count: inventory.filter((i: typeof inventory[0]) => i.category === "serwis").length, icon: Wrench, color: "text-primary", bg: "bg-accent/50", isLink: false, href: undefined },
  ], [inventory]);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const role = sessionStorage.getItem("userRole");
        console.log('Magazyn: Pobrano rolę z sessionStorage:', role);
        setUserRole(role);
        setIsSessionChecked(true);
      }
    }, 200);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setNewItem(prev => ({
        ...prev,
        purchaseDate: toISODateString()
      }));
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !isSessionChecked || typeof window === "undefined") return;
    
    console.log('Magazyn: Sprawdzanie autentykacji - isMounted:', isMounted, 'isSessionChecked:', isSessionChecked, 'userRole:', userRole);
    
    if (!userRole) {
      console.log('Magazyn: Brak roli użytkownika, przekierowanie do login');
      router.push("/login");
    } else {
      console.log('Magazyn: ✅ Użytkownik zalogowany, rola:', userRole);
    }
  }, [userRole, router, isMounted, isSessionChecked]);

  useEffect(() => {
    if (!isMounted || !userRole || typeof window === "undefined") return;

    const loadInventoryFromSupabase = async () => {
      setIsLoading(true);
      try {
        const shopId = getSessionStorageSafe("shopId", "");
        console.log('Magazyn: Ładowanie wszystkich danych z Supabase (bez filtrowania po sklepie), shopId:', shopId);

        // Zawsze ładuj wszystkie dane z magazynu, niezależnie od sklepu
        const supabaseData = await inventoryService.getAll();

        console.log('Magazyn: Pobrano', supabaseData.length, 'pozycji z Supabase');

        const mappedItems = supabaseData.map(item => ({
          id: item.id,
          name: item.name || '',
          category: item.category || 'telefon',
          stock: item.stock_quantity || 1,
          price: item.selling_price ? `${item.selling_price} zł` : '',
          alert: item.is_low_stock || false,
          imei: item.imei || '',
          battery: item.battery_health || '',
          color: item.color || '',
          condition: item.condition === 'nowy' ? 'Nowy' : item.condition === 'uzywany' ? 'Używany' : 'Używany',
          memory: item.memory || '',
          brand: item.brand || '',
          model: item.model || '',
          purchasePrice: item.purchase_price?.toString() || '',
          taxType: item.tax_type === 'VAT' ? 'VAT' : 'marza',
          purchaseDate: item.purchase_date || '',
          warranty: item.warranty_months ? `${item.warranty_months} m-cy` : '',
          setIncludes: item.set_includes || '',
          notes: item.notes || '',
          statusSprzedany: item.is_sold || false,
          dataSprzedazy: item.sold_at || '',
          shop: item.shops?.name || ''
        }));

        setInventory(mappedItems as any);
        window.dispatchEvent(new CustomEvent('magazyn_updated'));
        console.log('Magazyn: ✅ Zaktualizowano magazyn danymi z Supabase');
      } catch (error) {
        console.error('Magazyn: Błąd ładowania z Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventoryFromSupabase();

    const onPhoneSold = (e: any) => {
      console.log('Magazyn: 🔔 Otrzymano phone_sold - IMEI:', e?.detail?.imei, '- odświeżam listę');
      loadInventoryFromSupabase();
    };
    window.addEventListener('phone_sold', onPhoneSold);

    return () => {
      window.removeEventListener('phone_sold', onPhoneSold);
    };
  }, [isMounted, userRole]);

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

  const handleAddItem = async () => {
    console.log('handleAddItem wywołane');
    console.log('newItem:', newItem);
    
    if (!newItem.category) {
      console.log('Brak category');
      return;
    }
    
    const phoneName = newItem.category === "telefon" 
      ? `${newItem.brand} ${newItem.model}`.trim()
      : newItem.name;
      
    console.log('phoneName:', phoneName);
    if (!phoneName) {
      console.log('Brak phoneName');
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedEmp = activeEmployees.find((e: any) => e.id === selectedEmployeeForItem);
      const shopId = getSessionStorageSafe("shopId", "");
      const employeeId = selectedEmp?.id || getSessionStorageSafe("userId", "00000000-0000-0000-0000-000000000000");
      
      console.log('shopId:', shopId);
      console.log('employeeId:', employeeId);
      
      const warrantyMonths = newItem.warranty ? parseInt(newItem.warranty) : null;
      
      const dbItem = {
        name: phoneName,
        category: newItem.category as 'telefon' | 'akcesoria' | 'usluga' | 'serwis',
        stock_quantity: newItem.category === "telefon" ? 1 : (newItem.stock ? parseInt(newItem.stock) : 0),
        purchase_price: newItem.purchasePrice ? parseFloat(newItem.purchasePrice) : null,
        selling_price: newItem.sellingPrice ? parseFloat(newItem.sellingPrice) : null,
        is_sold: false,
        brand: newItem.brand || null,
        model: newItem.model || null,
        memory: newItem.memory || null,
        color: newItem.color || null,
        condition: newItem.condition,
        battery_health: newItem.batteryHealth ? `${newItem.batteryHealth}%` : null,
        imei: newItem.imei || null,
        tax_type: newItem.taxType as 'VAT' | 'marza' | 'zwolniony',
        purchase_date: newItem.purchaseDate || null,
        warranty_months: warrantyMonths,
        set_includes: newItem.setIncludes || null,
        notes: newItem.notes || null,
        shop_id: shopId,
        added_by: employeeId
      };
      
      console.log('dbItem do zapisu w Supabase:', dbItem);

      const savedItem = await inventoryService.create(dbItem);
      
      // Automatically add cost entry if purchase price exists and category is telefon
      if (dbItem.category === 'telefon' && dbItem.purchase_price) {
        const costData = {
          cost_date: dbItem.purchase_date || toISODateString(),
          cost_time: getCurrentTimePL(),
          category: 'skup',
          amount: dbItem.purchase_price,
          description: `Skup: ${phoneName}${dbItem.imei ? ` (IMEI: ${dbItem.imei})` : ''}`,
          payment_method: 'gotowka',
          shop_id: shopId,
          employee_id: employeeId
        };
        await costsService.create(costData);
        window.dispatchEvent(new CustomEvent('costs_updated'));
      }
      
      const mappedItem = {
        id: savedItem.id,
        name: savedItem.name,
        category: savedItem.category,
        stock: savedItem.stock_quantity,
        price: savedItem.selling_price ? `${savedItem.selling_price} zł` : "",
        alert: savedItem.is_low_stock,
        imei: savedItem.imei || "",
        battery: savedItem.battery_health || "",
        color: savedItem.color || "",
        condition: savedItem.condition === "nowy" ? "Nowy" : "Używany",
        memory: savedItem.memory || "",
        brand: savedItem.brand || "",
        model: savedItem.model || "",
        purchasePrice: savedItem.purchase_price?.toString() || "",
        taxType: savedItem.tax_type === "VAT" ? "VAT" : "marza",
        purchaseDate: savedItem.purchase_date || "",
        warranty: savedItem.warranty_months ? `${savedItem.warranty_months} m-cy` : "",
        setIncludes: savedItem.set_includes || "",
        notes: savedItem.notes || "",
        statusSprzedany: savedItem.is_sold,
        dataSprzedazy: savedItem.sold_at || "",
        shop: ""
      };

      setInventory([mappedItem as any, ...inventory]);
      window.dispatchEvent(new CustomEvent('magazyn_updated'));
      
      addToast({
        title: "Dodano przedmiot",
        description: `${mappedItem.name} został dodany do magazynu`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Błąd dodawania przedmiotu:');
      console.error('error:', error);
      console.error('typeof error:', typeof error);
      console.error('JSON.stringify(error):', JSON.stringify(error));
      let errorMsg = "Nie udało się dodać przedmiotu do magazynu";
      if (error?.message) errorMsg += `: ${error.message}`;
      if (error?.code) errorMsg += ` (kod: ${error.code})`;
      if (error?.details) errorMsg += ` | Szczegóły: ${error.details}`;
      if (error?.hint) errorMsg += ` | Wskazówka: ${error.hint}`;
      addToast({
        title: "Błąd",
        description: errorMsg,
        variant: "error"
      });
    } finally {
      setIsLoading(false);
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
      condition: "uzywany",
      color: "",
      setIncludes: "",
      notes: "",
      warranty: "",
      imei: "",
      taxType: "marza",
      purchaseDate: toISODateString(),
      sellingDate: "",
      statusSprzedany: false,
      dataSprzedazy: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteItem = async (itemIndex: number) => {
    const item = filteredItems[itemIndex];
    const itemName = item.name;
    
    if (!item.id) {
      addToast({
        title: "Błąd",
        description: "Nie można usunąć przedmiotu bez identyfikatora",
        variant: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      await inventoryService.softDelete(item.id);
      
      const newInventory = inventory.filter((invItem) => invItem.id !== item.id);
      setInventory(newInventory);
      window.dispatchEvent(new CustomEvent('magazyn_updated'));

      addToast({
        title: "Usunięto przedmiot",
        description: `${itemName} został usunięty z magazynu`,
        variant: "success"
      });
    } catch (err) {
      console.error('Magazyn: ❌ Błąd usuwania z Supabase:', err);
      addToast({
        title: "Błąd",
        description: "Nie udało się usunąć przedmiotu z magazynu",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
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
      condition: (item.condition?.toLowerCase() === "nowy" ? "nowy" : "uzywany") as "nowy" | "uzywany",
      color: item.color || "",
      setIncludes: item.setIncludes || "",
      notes: item.notes || "",
      warranty: item.warranty || "",
      imei: item.imei || "",
      taxType: (item.taxType?.toLowerCase() === "vat" ? "VAT" : item.taxType?.toLowerCase() === "zwolniony" ? "zwolniony" : "marza") as "VAT" | "marza" | "zwolniony",
      purchaseDate: item.purchaseDate || "",
      sellingDate: item.sellingDate || "",
      statusSprzedany: item.statusSprzedany || false,
      dataSprzedazy: item.dataSprzedazy || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editItem.name) return;
    
    const originalItem = inventory[editingIndex];
    if (!originalItem.id) {
      addToast({
        title: "Błąd",
        description: "Nie można zaktualizować przedmiotu bez identyfikatora",
        variant: "error"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const warrantyMonths = editItem.warranty ? parseInt(editItem.warranty) : null;
      
      const updates = {
        name: editItem.name,
        category: editItem.category as 'telefon' | 'akcesoria' | 'usluga' | 'serwis',
        stock_quantity: editItem.stock ? parseInt(editItem.stock) : 0,
        purchase_price: editItem.purchasePrice ? parseFloat(editItem.purchasePrice) : null,
        selling_price: editItem.sellingPrice ? parseFloat(editItem.sellingPrice) : null,
        is_sold: editItem.statusSprzedany,
        sold_at: editItem.dataSprzedazy || null,
        brand: editItem.brand || null,
        model: editItem.model || null,
        memory: editItem.memory || null,
        color: editItem.color || null,
        condition: editItem.condition,
        battery_health: editItem.batteryHealth ? `${editItem.batteryHealth}%` : null,
        imei: editItem.imei || null,
        tax_type: editItem.taxType as 'VAT' | 'marza' | 'zwolniony',
        purchase_date: editItem.purchaseDate || null,
        warranty_months: warrantyMonths,
        set_includes: editItem.setIncludes || null,
        notes: editItem.notes || null
      };

      const savedItem = await inventoryService.update(originalItem.id, updates);
      
      const mappedItem = {
        ...originalItem,
        id: savedItem.id,
        name: savedItem.name,
        category: savedItem.category,
        stock: savedItem.stock_quantity,
        price: savedItem.selling_price ? `${savedItem.selling_price} zł` : "",
        alert: savedItem.is_low_stock,
        imei: savedItem.imei || "",
        battery: savedItem.battery_health || "",
        color: savedItem.color || "",
        condition: savedItem.condition === "nowy" ? "Nowy" : "Używany",
        memory: savedItem.memory || "",
        brand: savedItem.brand || "",
        model: savedItem.model || "",
        purchasePrice: savedItem.purchase_price?.toString() || "",
        taxType: savedItem.tax_type === "VAT" ? "VAT" : "marza",
        purchaseDate: savedItem.purchase_date || "",
        warranty: savedItem.warranty_months ? `${savedItem.warranty_months} m-cy` : "",
        setIncludes: savedItem.set_includes || "",
        notes: savedItem.notes || "",
        statusSprzedany: savedItem.is_sold,
        dataSprzedazy: savedItem.sold_at || ""
      };

      const newInventory = [...inventory];
      newInventory[editingIndex] = mappedItem as any;
      setInventory(newInventory);
      window.dispatchEvent(new CustomEvent('magazyn_updated'));
      
      addToast({
        title: "Zapisano zmiany",
        description: `${mappedItem.name} został zaktualizowany`,
        variant: "success"
      });
    } catch (error) {
      console.error('Błąd zapisywania zmian:', error);
      addToast({
        title: "Błąd",
        description: "Nie udało się zaktualizować przedmiotu",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
    
    setIsEditDialogOpen(false);
    setEditingIndex(null);
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

            {isMounted && userRole && (
              <>
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
                            { value: "uzywany", label: "Używany" }
                          ]}>
                            <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                              <SelectValue placeholder="Wybierz..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nowy">Nowy</SelectItem>
                              <SelectItem value="uzywany">Używany</SelectItem>
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
                      onClick={async () => {
                        if (!newItem.name.trim()) return;
                        
                        setIsLoading(true);
                        
                        try {
                          const shopId = getSessionStorageSafe("shopId", "");
                          const employeeId = getSessionStorageSafe("userId", "00000000-0000-0000-0000-000000000000");
                          
                          const dbItem = {
                            name: newItem.name.trim(),
                            category: "usluga" as const,
                            stock_quantity: 0,
                            is_sold: false,
                            shop_id: shopId,
                            added_by: employeeId,
                            is_low_stock: false,
                            stock_alert_threshold: 0,
                            tax_type: "zwolniony" as const
                          };
                          
                          const savedItem = await inventoryService.create(dbItem);
                          
                          const mappedItem = {
                            id: savedItem.id,
                            name: savedItem.name,
                            category: savedItem.category,
                            stock: savedItem.stock_quantity,
                            price: "",
                            alert: false,
                            statusSprzedany: false,
                            dataSprzedazy: "",
                            shop: ""
                          };
                          
                          setInventory([mappedItem as any, ...inventory]);
                          window.dispatchEvent(new CustomEvent('magazyn_updated'));
                          
                          addToast({ message: "Dodano usługę", variant: "success" });
                        } catch (error) {
                          console.error('Błąd dodawania usługi:', error);
                          addToast({ message: "Nie udało się dodać usługi", variant: "error" });
                        } finally {
                          setIsLoading(false);
                        }
                        
                        setNewItem({...newItem, name: ""});
                        setIsAddUslugaDialogOpen(false);
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
                      onClick={async () => {
                        if (!newItem.name.trim()) return;
                        
                        setIsLoading(true);
                        
                        try {
                          const shopId = getSessionStorageSafe("shopId", "");
                          const employeeId = getSessionStorageSafe("userId", "00000000-0000-0000-0000-000000000000");
                          
                          const dbItem = {
                            name: newItem.name.trim(),
                            category: "serwis" as const,
                            stock_quantity: 0,
                            is_sold: false,
                            shop_id: shopId,
                            added_by: employeeId,
                            is_low_stock: false,
                            stock_alert_threshold: 0,
                            tax_type: "zwolniony" as const
                          };
                          
                          const savedItem = await inventoryService.create(dbItem);
                          
                          const mappedItem = {
                            id: savedItem.id,
                            name: savedItem.name,
                            category: savedItem.category,
                            stock: savedItem.stock_quantity,
                            price: "",
                            alert: false,
                            statusSprzedany: false,
                            dataSprzedazy: "",
                            shop: ""
                          };
                          
                          setInventory([mappedItem as any, ...inventory]);
                          window.dispatchEvent(new CustomEvent('magazyn_updated'));
                          
                          addToast({ message: "Dodano serwis", variant: "success" });
                        } catch (error) {
                          console.error('Błąd dodawania serwisu:', error);
                          addToast({ message: "Nie udało się dodać serwisu", variant: "error" });
                        } finally {
                          setIsLoading(false);
                        }
                        
                        setNewItem({...newItem, name: ""});
                        setIsAddSerwisDialogOpen(false);
                      }}
                      className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Dodaj serwis
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[550px] rounded-3xl border-none p-0 overflow-hidden max-h-[85vh] flex flex-col">
              <DialogHeader className="p-8 bg-gradient-to-br from-primary to-primary/80 text-white relative shrink-0">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {selectedCategory === "telefon" ? "Dodaj nowy telefon" : "Dodaj nowe akcesoria"}
                  </DialogTitle>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">
                    {selectedCategory === "telefon" ? "Wprowadź dane telefonu" : "Wprowadź nazwę akcesoriów"}
                  </p>
                </div>
                <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  {selectedCategory === "telefon" ? (
                    <Smartphone className="h-6 w-6 text-white" />
                  ) : (
                    <Package className="h-6 w-6 text-white" />
                  )}
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {selectedCategory === "telefon" ? (
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

                    <div className="grid grid-cols-2 gap-4">
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
                          { value: "uzywany", label: "Używany" }
                        ]}>
                          <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                            <SelectValue placeholder="Wybierz..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nowy">Nowy</SelectItem>
                            <SelectItem value="uzywany">Używany</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Typ podatku</Label>
                        <Select value={newItem.taxType} onValueChange={(val) => val && setNewItem({...newItem, taxType: val})} items={[
                          { value: "marza", label: "Marża" },
                          { value: "VAT", label: "VAT" }
                        ]}>
                          <SelectTrigger className="h-12 bg-accent/30 border-none rounded-xl">
                            <SelectValue placeholder="Wybierz..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="marza">Marża</SelectItem>
                            <SelectItem value="VAT">VAT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zestaw zawiera</Label>
                      <Input
                        placeholder="pudełko, kabel, ładowarka"
                        value={newItem.setIncludes}
                        onChange={(e) => setNewItem({...newItem, setIncludes: e.target.value})}
                        className="h-12 bg-accent/30 border-none rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notatki</Label>
                      <Input
                        placeholder="Dodatkowe informacje"
                        value={newItem.notes}
                        onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                        className="h-12 bg-accent/30 border-none rounded-xl"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nazwa akcesoriów</Label>
                      <Input
                        placeholder="np. Etui guma, Szkło, Kabel"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="h-12 bg-accent/30 border-none rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ilość</Label>
                        <Input
                          placeholder="0"
                          type="number"
                          value={newItem.stock}
                          onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                          className="h-12 bg-accent/30 border-none rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cena sprzedaży</Label>
                        <Input
                          placeholder="49.99"
                          type="number"
                          value={newItem.sellingPrice}
                          onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})}
                          className="h-12 bg-accent/30 border-none rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notatki</Label>
                      <Input
                        placeholder="Dodatkowe informacje"
                        value={newItem.notes}
                        onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                        className="h-12 bg-accent/30 border-none rounded-xl"
                      />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="p-8 pt-0 shrink-0">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl border-primary/10">Anuluj</Button>
                <Button
                  onClick={() => {
                    if (selectedCategory === "telefon") {
                      if (newItem.brand && newItem.model) {
                        handleAddItem();
                      } else {
                        addToast({ message: "Wprowadź markę i model telefonu", variant: "error" });
                      }
                    } else {
                      if (newItem.name.trim()) {
                        const baseItem = {
                          name: newItem.name,
                          category: "akcesoria",
                          price: newItem.sellingPrice ? `${newItem.sellingPrice} zł` : "",
                          alert: false,
                          stock: newItem.stock ? parseInt(newItem.stock) : 0,
                          purchasePrice: newItem.purchasePrice || "",
                          notes: newItem.notes || "",
                          shop: (() => {
                            const selectedEmp = activeEmployees.find((e: any) => e.id === selectedEmployeeForItem);
                            return selectedEmp?.shop || getSessionStorageSafe("shopName", "Kaufland Włocławek");
                          })(),
                        };

                        setInventory([...inventory, baseItem as any]);
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
                          condition: "uzywany",
                          color: "",
                          setIncludes: "",
                          notes: "",
                          warranty: "",
                          imei: "",
                          taxType: "marza",
                          purchaseDate: toISODateString(),
                          sellingDate: "",
                          statusSprzedany: false,
                          dataSprzedazy: "",
                        });
                        setIsAddDialogOpen(false);
                        addToast({
                          title: "Dodano akcesoria",
                          description: `${baseItem.name} został dodany do magazynu`,
                          variant: "success"
                        });
                      } else {
                        addToast({ message: "Wprowadź nazwę akcesoriów", variant: "error" });
                      }
                    }
                  }}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
                >
                  {selectedCategory === "telefon" ? "Dodaj telefon" : "Dodaj akcesoria"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </>
          )}


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

        {isMounted && userRole && selectedCategory === "usluga" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white text-xs font-semibold tracking-tight shadow-sm transition-all duration-300" onClick={() => setIsAddUslugaDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj usługę
            </Button>
          </div>
        )}

        {isMounted && userRole && selectedCategory === "serwis" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white text-xs font-semibold tracking-tight shadow-sm transition-all duration-300" onClick={() => setIsAddSerwisDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj serwis
            </Button>
          </div>
        )}

        {isMounted && userRole && selectedCategory === "telefon" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-xs font-semibold tracking-tight shadow-sm shadow-primary/20 transition-all duration-300" onClick={() => {
              console.log('Przycisk Dodaj telefon kliknięty, selectedCategory:', selectedCategory);
              setNewItem({
                name: "",
                category: selectedCategory, // Ustawiamy kategorię na wybraną
                stock: "",
                purchasePrice: "",
                sellingPrice: "",
                brand: "",
                model: "",
                memory: "",
                batteryHealth: "",
                condition: "uzywany",
                color: "",
                setIncludes: "",
                notes: "",
                warranty: "",
                imei: "",
                taxType: "marza",
                purchaseDate: toISODateString(),
                sellingDate: "",
                statusSprzedany: false,
                dataSprzedazy: "",
              });
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj telefon
            </Button>
          </div>
        )}

        {isMounted && userRole && selectedCategory === "akcesoria" && (
          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-xs font-semibold tracking-tight shadow-sm shadow-primary/20 transition-all duration-300" onClick={() => {
              console.log('Przycisk Dodaj akcesoria kliknięty, selectedCategory:', selectedCategory);
              setNewItem({
                name: "",
                category: selectedCategory, // Ustawiamy kategorię na wybraną
                stock: "",
                purchasePrice: "",
                sellingPrice: "",
                brand: "",
                model: "",
                memory: "",
                batteryHealth: "",
                condition: "uzywany",
                color: "",
                setIncludes: "",
                notes: "",
                warranty: "",
                imei: "",
                taxType: "marza",
                purchaseDate: toISODateString(),
                sellingDate: "",
                statusSprzedany: false,
                dataSprzedazy: "",
              });
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj akcesoria
            </Button>
          </div>
        )}

        <div className="space-y-1">
          {isMounted ? (
            <>
              {filteredItems.map((item, index) => {
            const brandAccent = "from-slate-50 to-slate-100 border-l-primary";

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
                          item.condition.toLowerCase() === "uzywany" && "bg-amber-50 text-amber-700 border-amber-200",
                          !["nowy", "uzywany"].includes(item.condition.toLowerCase()) && "bg-gray-50 text-gray-700 border-gray-200"
                        )}>
                          {item.condition.toLowerCase() === "nowy" ? "✨" :
                           item.condition.toLowerCase() === "uzywany" ? "🔄" : "•"}
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
                
                {!item.statusSprzedany && userRole && (
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
