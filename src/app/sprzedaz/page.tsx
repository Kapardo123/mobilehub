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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  ArrowLeft, 
  Search, 
  Trash2, 
  ShoppingBag, 
  ChevronRight, 
  FileText, 
  Printer, 
  Download, 
  User, 
  MapPin, 
  Building2, 
  CreditCard, 
  Banknote, 
  Pencil,
  Menu,
  X,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Filter,
  FileDown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { DollarSign, Package, RefreshCcw, Send, Wallet, Smartphone, Headphones, Wrench } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { getLocalStorageSafe, useLocalStorage, getSessionStorageSafe, useSessionStorage } from "@/lib/storage";

export default function SprzedazPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userShop, setUserShop] = useState("Trzy Stawy");
  const [selectedShop, setSelectedShop] = useState("Trzy Stawy Katowice");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("today");
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");

  interface SaleItem {
    cat: string;
    name: string;
    price: number;
    profit: number;
    imei?: string;
  }
  
  interface SaleGroup {
    id: string;
    ini: string;
    payment: string;
    date: string;
    time: string;
    items: SaleItem[];
  }
  
  const [sales, setSales] = useState<SaleGroup[]>([
    {
      id: "s1",
      ini: "JK",
      payment: "gotówka",
      date: "2026-05-13",
      time: "10:30",
      items: [
        { cat: "telefon", name: "iPhone 15 Pro", price: 4500, profit: 700, imei: "351234567890123" },
        { cat: "akcesoria", name: "Szkło hartowane iPhone 15", price: 49, profit: 20 },
        { cat: "akcesoria", name: "Etui MagSafe iPhone 14", price: 129, profit: 50 }
      ]
    },
    {
      id: "s2",
      ini: "AN",
      payment: "karta",
      date: "2026-05-13",
      time: "11:15",
      items: [
        { cat: "telefon", name: "Samsung S23 Ultra", price: 3200, profit: 600, imei: "354455667788990" },
        { cat: "akcesoria", name: "Kabel USB-C", price: 49, profit: 15 }
      ]
    },
    {
      id: "s3",
      ini: "PZ",
      payment: "gotówka",
      date: "2026-05-13",
      time: "12:00",
      items: [
        { cat: "serwis", name: "Wymiana szybki", price: 150, profit: 80 },
        { cat: "serwis", name: "Diagnostyka", price: 50, profit: 40 }
      ]
    },
    {
      id: "s4",
      ini: "JK",
      payment: "karta",
      date: "2026-05-13",
      time: "13:30",
      items: [
        { cat: "telefon", name: "iPhone 14 Pro Max", price: 4200, profit: 700, imei: "356789012345678" },
        { cat: "akcesoria", name: "Ładowarka 20W", price: 99, profit: 30 },
        { cat: "akcesoria", name: "Kabel USB-C Lightning", price: 79, profit: 25 },
        { cat: "usluga", name: "Konfiguracja telefonu", price: 50, profit: 40 }
      ]
    },
    {
      id: "s5",
      ini: "AN",
      payment: "gotówka",
      date: "2026-05-12",
      time: "14:20",
      items: [
        { cat: "telefon", name: "Xiaomi 13 Pro", price: 2800, profit: 600, imei: "357890123456789" }
      ]
    },
    {
      id: "s6",
      ini: "PZ",
      payment: "karta",
      date: "2026-05-12",
      time: "15:45",
      items: [
        { cat: "akcesoria", name: "Powerbank 10000mAh", price: 149, profit: 50 },
        { cat: "akcesoria", name: "Słuchawki Bluetooth", price: 199, profit: 70 },
        { cat: "akcesoria", name: "Uchwyt samochodowy", price: 59, profit: 20 }
      ]
    },
    {
      id: "s7",
      ini: "JK",
      payment: "gotówka",
      date: "2026-05-12",
      time: "16:10",
      items: [
        { cat: "serwis", name: "Wymiana baterii", price: 120, profit: 60 },
        { cat: "serwis", name: "Polerowanie obudowy", price: 80, profit: 50 }
      ]
    },
    {
      id: "s8",
      ini: "AN",
      payment: "karta",
      date: "2026-05-11",
      time: "10:00",
      items: [
        { cat: "telefon", name: "iPhone 12 Mini", price: 1600, profit: 300, imei: "358901234567890" },
        { cat: "akcesoria", name: "Etui iPhone 13 Pro", price: 99, profit: 35 }
      ]
    },
    {
      id: "s9",
      ini: "PZ",
      payment: "gotówka",
      date: "2026-05-11",
      time: "11:30",
      items: [
        { cat: "serwis", name: "Naprawa gniazda ładowania", price: 180, profit: 100 },
        { cat: "serwis", name: "Wymiana wyświetlacza OLED", price: 350, profit: 180 }
      ]
    },
    {
      id: "s10",
      ini: "JK",
      payment: "karta",
      date: "2026-05-11",
      time: "13:00",
      items: [
        { cat: "telefon", name: "Samsung S22", price: 1900, profit: 400, imei: "359012345678901" },
        { cat: "akcesoria", name: "Szkło Samsung S22", price: 39, profit: 15 },
        { cat: "usluga", name: "Transfer danych", price: 80, profit: 60 }
      ]
    },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPhoneSelectOpen, setIsPhoneSelectOpen] = useState(false);
  const [warehousePhones, setWarehousePhones] = useState<any[]>([]);
  const [warehouseUslugi, setWarehouseUslugi] = useState<any[]>([]);
  const [warehouseSerwisy, setWarehouseSerwisy] = useState<any[]>([]);
  const [isUslugaSelectOpen, setIsUslugaSelectOpen] = useState(false);
  const [isSerwisSelectOpen, setIsSerwisSelectOpen] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState("");
  const [uslugaSearchQuery, setUslugaSearchQuery] = useState("");
  const [serwisSearchQuery, setSerwisSearchQuery] = useState("");
  const [purchasePriceFromWarehouse, setPurchasePriceFromWarehouse] = useState<number>(0);
  
  // New entry state
  const [newEntry, setNewEntry] = useState({
    category: "akcesoria",
    name: "",
    price: "",
    profit: "",
    payment: "gotówka",
    ini: "",
    imei: "",
    warehousePhoneId: null as number | null
  });
  
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleGroup | null>(null);
  const [selectedSaleForEdit, setSelectedSaleForEdit] = useState<SaleGroup | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceCustomer, setInvoiceCustomer] = useState({
    name: "",
    nip: "",
    address: "",
    email: ""
  });
  const [savedCustomers, setSavedCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
      return;
    }
    const userName = getSessionStorageSafe("userName", "Piotr Zakrzewski");
    setUserRole(role);
    
    if (role === "employee") {
      setSelectedShop("Trzy Stawy Katowice");
    } else {
      setSelectedShop("Trzy Stawy Katowice");
    }
    
    const initials = userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    
    setNewEntry(prev => ({ ...prev, ini: initials }));
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = getLocalStorageSafe('pracownicy_employees', []);
    setEmployees(saved);
  }, []);

  useEffect(() => {
    const loadWarehousePhones = () => {
      if (typeof window === "undefined") return;
      const inventory = getLocalStorageSafe('magazyn_inventory', []);
      try {
        const availablePhones = inventory.filter((item: any) => 
          item.category === "telefon" && !item.statusSold
        );
        const availableUslugi = inventory.filter((item: any) => 
          item.category === "usluga"
        );
        const availableSerwisy = inventory.filter((item: any) => 
          item.category === "serwis"
        );
        setWarehousePhones(availablePhones);
        setWarehouseUslugi(availableUslugi);
        setWarehouseSerwisy(availableSerwisy);
      } catch {
        setWarehousePhones([]);
        setWarehouseUslugi([]);
        setWarehouseSerwisy([]);
      }
    };
    
    if (typeof window !== "undefined") {
      loadWarehousePhones();
      window.addEventListener('magazyn_updated', loadWarehousePhones);
    }
    return () => {
      if (typeof window !== "undefined") window.removeEventListener('magazyn_updated', loadWarehousePhones);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadSavedCustomers = () => {
      const saved = getLocalStorageSafe('saved_customers', []);
      setSavedCustomers(saved);
    };
    loadSavedCustomers();
  }, []);

  useEffect(() => {
    if (editingId && selectedSaleForEdit) {
      setCartItems(selectedSaleForEdit.items);
      setNewEntry({
        category: selectedSaleForEdit.items[0]?.cat || "akcesoria",
        name: "",
        price: "",
        profit: "",
        payment: selectedSaleForEdit.payment,
        ini: selectedSaleForEdit.ini,
        imei: "",
        warehousePhoneId: null
      });
    }
  }, [editingId, selectedSaleForEdit]);

  const shops = [
    "Trzy Stawy Katowice",
    "Galeria Katowicka",
    "Silesia City Center"
  ];

  const categoryGroups = [
    {
      label: "Główne",
      items: [
        { id: "akcesoria", label: "Akcesoria", icon: Headphones, color: "text-primary" },
        { id: "telefon", label: "Telefon", icon: Smartphone, color: "text-primary" },
        { id: "usluga", label: "Usługa", icon: FileText, color: "text-primary" },
        { id: "serwis", label: "Serwis", icon: Wrench, color: "text-primary" },
      ]
    },
    {
      label: "Pozostałe",
      items: [
        { id: "paczka", label: "Paczka", icon: Package, color: "text-slate-500" },
        { id: "zwrot", label: "Zwrot", icon: RefreshCcw, color: "text-red-500" },
        { id: "skup", label: "Skup", icon: Smartphone, color: "text-amber-500" },
      ]
    }
  ];

  // Flatten categories for easier lookup
  const allCategories = categoryGroups.flatMap(group => group.items);

  // Get unique employees from sales
  const uniqueEmployees = useMemo(() => {
    return employees;
  }, [employees]);

  // Flatten sales for filtering
  const flattenedSales = useMemo(() => {
    return sales.map(sale => ({
      ...sale,
      totalPrice: sale.items.reduce((sum, item) => sum + item.price, 0),
      totalProfit: sale.items.reduce((sum, item) => sum + item.profit, 0)
    }));
  }, [sales]);

  // Filter sales based on filters
  const filteredSales = useMemo(() => {
    return flattenedSales.filter(sale => {
      // Filter by category (if any item matches)
      if (filterCategory && !sale.items.some(item => item.cat === filterCategory)) return false;

      // Filter by employee
      if (filterEmployee && sale.ini !== filterEmployee) return false;

      // Filter by date range
      const saleDate = new Date(sale.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === "today") {
        const saleDay = new Date(saleDate);
        saleDay.setHours(0, 0, 0, 0);
        if (saleDay.getTime() !== today.getTime()) return false;
      } else if (dateRange === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (saleDate < weekAgo) return false;
      } else if (dateRange === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (saleDate < monthAgo) return false;
      } else if (dateRange === "custom") {
        if (customDateFrom && new Date(sale.date) < new Date(customDateFrom)) return false;
        if (customDateTo && new Date(sale.date) > new Date(customDateTo)) return false;
      }

      return true;
    });
  }, [flattenedSales, filterCategory, filterEmployee, dateRange, customDateFrom, customDateTo]);

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0);

  const addPosition = () => {
    if (!newEntry.name || !newEntry.price) return;

    const isSkup = newEntry.category === "skup";
    const priceVal = parseFloat(newEntry.price);
    const profitVal = parseFloat(newEntry.profit || "0");

    const newItem: SaleItem = {
      cat: newEntry.category,
      name: newEntry.name,
      price: isSkup ? -Math.abs(priceVal) : priceVal,
      profit: isSkup ? -Math.abs(profitVal) : profitVal,
      imei: newEntry.imei
    };

    setCartItems(prev => [...prev, newItem]);
    
    if (newEntry.category === "telefon" && newEntry.imei) {
      window.dispatchEvent(new CustomEvent('phone_sold', { 
        detail: { 
          imei: newEntry.imei, 
          dataSprzedazy: new Date().toISOString().split('T')[0] 
        } 
      }));
    }
    
    setNewEntry({
      category: newEntry.category,
      name: "",
      price: "",
      profit: "",
      payment: newEntry.payment,
      ini: newEntry.ini,
      imei: "",
      warehousePhoneId: null
    });
  };

  const addCartToSales = () => {
    if (cartItems.length === 0) return;
    
    if (editingId) {
      // Edycja istniejącej sprzedaży
      setSales(prev => prev.map(sale => 
        sale.id === editingId 
          ? { 
              ...sale, 
              ini: cartItems[0].cat === "skup" ? "SKUP" : (newEntry.ini || sale.ini),
              payment: newEntry.payment,
              items: cartItems
            }
          : sale
      ));
      addToast({ message: "Sprzedaż zaktualizowana", variant: "success" });
    } else {
      // Nowa sprzedaż
      const newSale: SaleGroup = {
        id: Math.random().toString(36).substr(2, 9),
        ini: cartItems[0].cat === "skup" ? "SKUP" : (newEntry.ini || "PZ"),
        payment: newEntry.payment,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: cartItems
      };
      
      setSales(prev => [newSale, ...prev]);
      addToast({ message: `Sprzedaż dodana (${newSale.items.length} pozycji)`, variant: "success" });
    }
    
    setCartItems([]);
    setNewEntry({
      category: "akcesoria",
      name: "",
      price: "",
      profit: "",
      payment: "gotówka",
      ini: "",
      imei: "",
      warehousePhoneId: null
    });
    setEditingId(null);
    setSelectedSaleForEdit(null);
    setPurchasePriceFromWarehouse(0);
    setIsDialogOpen(false);
  };

  const finalizeSale = () => {
    if (cartItems.length === 0) return;
    addCartToSales();
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    setPurchasePriceFromWarehouse(0);
  };

  const removePosition = (id: string) => {
    const sale = sales.find(s => s.id === id);
    setSales(prev => prev.filter(s => s.id !== id));
    if (sale) addToast({ message: `Usunięto sprzedaż (${sale.items.length} pozycji)`, variant: "info" });
  };

  const generateCSV = (data: typeof flattenedSales) => {
    const headers = ["Data", "Godzina", "Inicjały", "Pozycje", "Suma", "Zysk", "Płatność"];
    const rows = data.map(sale => [
      sale.date,
      sale.time,
      sale.ini,
      sale.items.map(i => i.name).join("; "),
      sale.totalPrice.toString(),
      sale.totalProfit.toString(),
      sale.payment
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    return csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const printReport = (data: typeof flattenedSales) => {
    const printContent = `
      <html>
        <head>
          <title>Raport Sprzedaży</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Raport Sprzedaży</h1>
          <p>Data: ${selectedDate}</p>
          <p>Sklep: ${selectedShop}</p>
          <table>
            <tr>
              <th>Data</th>
              <th>Godzina</th>
              <th>Ini</th>
              <th>Pozycje</th>
              <th>Suma</th>
              <th>Zysk</th>
              <th>Płatność</th>
            </tr>
            ${data.map(sale => `
              <tr>
                <td>${sale.date}</td>
                <td>${sale.time}</td>
                <td>${sale.ini}</td>
                <td>${sale.items.map(i => i.name).join(", ")}</td>
                <td>${sale.totalPrice} zł</td>
                <td>${sale.totalProfit} zł</td>
                <td>${sale.payment}</td>
              </tr>
            `).join("")}
          </table>
          <div class="summary">
            <p>Suma: ${data.reduce((sum, sale) => sum + sale.totalPrice, 0)} zł</p>
            <p>Zysk: ${data.reduce((sum, sale) => sum + sale.totalProfit, 0)} zł</p>
            <p>Sprzedaży: ${data.length}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/30 relative overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 p-4 lg:p-8 w-full max-w-[1400px] mx-auto space-y-6">
        {/* Header with Title and Summary Boxes */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href={userRole === "employee" ? "/pracownik" : "/"}>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-primary/10 text-primary hover:bg-accent">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Sprzedaż</h1>
              <p className="text-primary/70 font-medium">Zeszyt dzienny</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 gap-3 border-none"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
              <span className="font-black text-sm uppercase tracking-widest">Nowa pozycja</span>
            </Button>
          </div>
        </div>

        {/* Main Table Card */}
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border border-primary/5">
          <CardHeader className="border-b border-primary/5 bg-accent/30 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-primary/10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl text-primary hover:bg-accent"
                    onClick={() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() - 1);
                      setSelectedDate(date.toISOString().split('T')[0]);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-4 py-1 text-center min-w-[140px]">
                    <p className="text-xs font-black uppercase tracking-tighter text-foreground">
                      {new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[10px] font-bold text-primary/60">{new Date(selectedDate).getFullYear()}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl text-primary hover:bg-accent"
                    onClick={() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() + 1);
                      setSelectedDate(date.toISOString().split('T')[0]);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="h-12 w-px bg-primary/10 hidden md:block" />

                <div className="w-[200px]">
                  <UISelect value="Trzy Stawy Katowice" onValueChange={(val) => setSelectedShop(val || "Trzy Stawy Katowice")}>
                    <UISelectTrigger className="h-12 rounded-2xl bg-white border-primary/10 font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{selectedShop}</span>
                      </div>
                    </UISelectTrigger>
                    <UISelectContent className="rounded-2xl">
                      {shops.map(shop => (
                        <UISelectItem key={shop} value={shop} className="font-bold text-xs">{shop}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Zysk</p>
                  <p className="text-xl font-black text-emerald-700">{totalProfit} <span className="text-xs font-bold opacity-60">PLN</span></p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Wpływ</p>
                  <p className="text-xl font-black text-foreground">{totalAmount} <span className="text-xs font-bold opacity-40">PLN</span></p>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="px-6 py-4 bg-accent/20 border-b border-primary/5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Filter className="h-4 w-4" />
                Filtry:
              </div>
              
              <div className="w-[150px]">
                <UISelect value={filterCategory || "all"} onValueChange={(val) => setFilterCategory(val === "all" ? null : val)}>
                  <UISelectTrigger className="h-10 rounded-xl bg-white border-primary/10 font-bold text-xs">
                    <UISelectValue placeholder="Kategoria" />
                  </UISelectTrigger>
                  <UISelectContent className="rounded-xl">
                    <UISelectItem value="all" className="font-bold text-xs">Wszystkie</UISelectItem>
                    {allCategories.map(cat => (
                      <UISelectItem key={cat.id} value={cat.id} className="font-bold text-xs">
                        <div className="flex items-center gap-2">
                          <cat.icon className={cn("h-4 w-4", cat.color)} />
                          {cat.label}
                        </div>
                      </UISelectItem>
                    ))}
                  </UISelectContent>
                </UISelect>
              </div>

              <div className="w-[120px]">
                <UISelect value={filterEmployee || "all"} onValueChange={(val) => setFilterEmployee(val === "all" ? null : val)}>
                  <UISelectTrigger className="h-10 rounded-xl bg-white border-primary/10 font-bold text-xs">
                    <UISelectValue placeholder="Pracownik" />
                  </UISelectTrigger>
                  <UISelectContent className="rounded-xl">
                    <UISelectItem value="all" className="font-bold text-xs">Wszyscy</UISelectItem>
                    {uniqueEmployees.map(emp => (
                      <UISelectItem key={emp.id} value={emp.initials} className="font-bold text-xs">
                        {emp.name}
                      </UISelectItem>
                    ))}
                  </UISelectContent>
                </UISelect>
              </div>

              <div className="w-[140px]">
                <UISelect value={dateRange} onValueChange={(val: any) => setDateRange(val)}>
                  <UISelectTrigger className="h-10 rounded-xl bg-white border-primary/10 font-bold text-xs">
                    <UISelectValue placeholder="Okres" />
                  </UISelectTrigger>
                  <UISelectContent className="rounded-xl">
                    <UISelectItem value="today" className="font-bold text-xs">Dzisiaj</UISelectItem>
                    <UISelectItem value="week" className="font-bold text-xs">Ostatni tydzień</UISelectItem>
                    <UISelectItem value="month" className="font-bold text-xs">Ostatni miesiąc</UISelectItem>
                    <UISelectItem value="custom" className="font-bold text-xs">Własny zakres</UISelectItem>
                  </UISelectContent>
                </UISelect>
              </div>

              {dateRange === "custom" && (
                <>
                  <Input 
                    type="date"
                    className="h-10 w-[140px] rounded-xl bg-white border-primary/10 font-bold text-xs"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                  />
                  <span className="text-muted-foreground font-bold text-xs">-</span>
                  <Input 
                    type="date"
                    className="h-10 w-[140px] rounded-xl bg-white border-primary/10 font-bold text-xs"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                  />
                </>
              )}

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl bg-white border-primary/10 font-black text-xs uppercase gap-2 hover:bg-accent"
                  onClick={() => {
                    const csv = generateCSV(filteredSales);
                    downloadCSV(csv, `sprzedaz-${selectedDate}.csv`);
                  }}
                >
                  <FileDown className="h-4 w-4" />
                  CSV
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl bg-white border-primary/10 font-black text-xs uppercase gap-2 hover:bg-accent"
                  onClick={() => {
                    printReport(filteredSales);
                  }}
                >
                  <Printer className="h-4 w-4" />
                  Drukuj
                </Button>
              </div>

              {(filterCategory || filterEmployee || dateRange !== "today") && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-10 rounded-xl font-black text-xs uppercase gap-2 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setFilterCategory(null);
                    setFilterEmployee(null);
                    setDateRange("today");
                    setCustomDateFrom("");
                    setCustomDateTo("");
                  }}
                >
                  <X className="h-4 w-4" />
                  Wyczyść
                </Button>
              )}
            </div>

            <div className="px-6 py-2 bg-primary/5 border-b border-primary/5 flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {filteredSales.length} sprzedaży
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary border-none">
                      <TableHead className="w-[60px] text-white font-black text-[10px] uppercase tracking-widest text-center h-14">Ini</TableHead>
                      <TableHead className="text-white font-black text-[10px] uppercase tracking-widest">Sprzedaż</TableHead>
                      <TableHead className="text-white font-black text-[10px] uppercase tracking-widest text-right">Suma</TableHead>
                      <TableHead className="text-white font-black text-[10px] uppercase tracking-widest text-right">Zysk</TableHead>
                      <TableHead className="text-white font-black text-[10px] uppercase tracking-widest text-center">Płatność</TableHead>
                      <TableHead className="text-white font-black text-[10px] uppercase tracking-widest text-right">Akcja</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const mostExpensive = sale.items.reduce((max, item) => item.price > max.price ? item : max, sale.items[0]);
                      const itemCount = sale.items.length;
                      return (
                      <TableRow key={sale.id} className="border-b border-primary/5 hover:bg-accent/30 transition-colors group cursor-pointer" onClick={() => setSelectedSale(sale)}>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="rounded-lg font-black text-[10px] border-primary/20 text-primary">
                            {sale.ini}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                {mostExpensive.name}
                                {itemCount > 1 && <span className="text-primary ml-1">+{itemCount - 1}</span>}
                              </p>
                              <p className="text-[9px] text-muted-foreground">{sale.date} {sale.time}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-black",
                          sale.totalPrice < 0 ? "text-red-500" : "text-foreground"
                        )}>
                          {sale.totalPrice < 0 ? `- ${Math.abs(sale.totalPrice)}` : sale.totalPrice} zł
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-black",
                          sale.totalProfit < 0 ? "text-red-500" : "text-primary"
                        )}>
                          {sale.totalProfit < 0 ? `- ${Math.abs(sale.totalProfit)}` : sale.totalProfit} zł
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {sale.payment === "gotówka" ? (
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-1.5 px-3">
                                <Banknote className="h-3 w-3" />
                                Gotówka
                              </Badge>
                            ) : (
                              <Badge className="bg-primary/5 text-primary border-primary/10 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-1.5 px-3">
                                <CreditCard className="h-3 w-3" />
                                Karta
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                setEditingId(sale.id);
                                setSelectedSaleForEdit(sale);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              onClick={() => setItemToDelete(sale.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                    })}
                  </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-primary text-white relative">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Szczegóły sprzedaży</DialogTitle>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{selectedSale?.date} {selectedSale?.time}</p>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="rounded-lg font-black text-sm border-white/20 text-white">
                {selectedSale?.ini}
              </Badge>
              <Badge className={selectedSale?.payment === "gotówka" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary/5 text-primary border-primary/10"}>
                {selectedSale?.payment === "gotówka" ? "Gotówka" : "Karta"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pozycje ({selectedSale?.items.length})</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedSale?.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{allCategories.find(c => c.id === item.cat)?.label || item.cat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">{item.price} zł</p>
                      <p className="text-[10px] text-primary">+{item.profit} zł</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Suma</p>
                <p className="text-2xl font-black text-primary">{selectedSale?.items.reduce((s, i) => s + i.price, 0)} zł</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Zysk</p>
                <p className="text-xl font-black text-emerald-500">+{selectedSale?.items.reduce((s, i) => s + i.profit, 0)} zł</p>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest h-12"
              onClick={() => setIsInvoiceDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generuj fakturę
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Customer Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-primary text-white">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Dane klienta</DialogTitle>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Wprowadź dane do faktury</p>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {savedCustomers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Zapisani klienci</Label>
                <UISelect
                  onValueChange={(val) => {
                    const customer = savedCustomers.find((c: any) => c.id === val);
                    if (customer) {
                      setInvoiceCustomer({
                        name: customer.name,
                        nip: customer.nip,
                        address: customer.address,
                        email: customer.email
                      });
                    }
                  }}
                >
                  <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                    <UISelectValue placeholder="Wybierz zapisanego klienta..." />
                  </UISelectTrigger>
                  <UISelectContent className="rounded-xl">
                    {savedCustomers.map((customer: any) => (
                      <UISelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </UISelectItem>
                    ))}
                  </UISelectContent>
                </UISelect>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nazwa</Label>
              <Input
                value={invoiceCustomer.name}
                onChange={(e) => setInvoiceCustomer({ ...invoiceCustomer, name: e.target.value })}
                placeholder="np. Jan Kowalski"
                className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">NIP</Label>
              <Input
                value={invoiceCustomer.nip}
                onChange={(e) => setInvoiceCustomer({ ...invoiceCustomer, nip: e.target.value })}
                placeholder="np. 123-456-78-90"
                className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Adres</Label>
              <Input
                value={invoiceCustomer.address}
                onChange={(e) => setInvoiceCustomer({ ...invoiceCustomer, address: e.target.value })}
                placeholder="np. ul. Marszałkowska 1, 00-001 Warszawa"
                className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email</Label>
              <Input
                type="email"
                value={invoiceCustomer.email}
                onChange={(e) => setInvoiceCustomer({ ...invoiceCustomer, email: e.target.value })}
                placeholder="np. jan.kowalski@example.com"
                className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-secondary hover:bg-secondary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest h-12"
                onClick={() => {
                  if (!invoiceCustomer.name) return;
                  const newCustomer = {
                    id: Date.now().toString(),
                    name: invoiceCustomer.name,
                    nip: invoiceCustomer.nip,
                    address: invoiceCustomer.address,
                    email: invoiceCustomer.email
                  };
                  const updatedCustomers = [...savedCustomers, newCustomer];
                  if (typeof window !== "undefined") {
                    localStorage.setItem('saved_customers', JSON.stringify(updatedCustomers));
                  }
                  setSavedCustomers(updatedCustomers);
                  addToast({
                    title: "Klient zapisany",
                    description: "Dane klienta zostały zapisane",
                    variant: "success"
                  });
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Zapisz klienta
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest h-12"
                onClick={() => {
                  if (!selectedSale) return;
                  const totalPrice = selectedSale.items.reduce((s, i) => s + i.price, 0);
                  const invoiceItems = selectedSale.items.map(item => ({
                    name: item.name,
                    category: allCategories.find(c => c.id === item.cat)?.label || item.cat,
                    price: item.price
                  }));

                  // Save invoice to localStorage
                  const newInvoice = {
                    id: selectedSale.id,
                    customerName: invoiceCustomer.name,
                    customerNip: invoiceCustomer.nip,
                    customerAddress: invoiceCustomer.address,
                    customerEmail: invoiceCustomer.email,
                    date: selectedSale.date,
                    time: selectedSale.time,
                    totalPrice: totalPrice,
                    items: invoiceItems,
                    createdAt: new Date().toISOString()
                  };
                  const savedInvoices = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('invoices') || '[]') : [];
                  const updatedInvoices = [...savedInvoices, newInvoice];
                  if (typeof window !== "undefined") {
                    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
                  }

                  const queryParams = new URLSearchParams({
                    id: selectedSale.id,
                    name: invoiceCustomer.name,
                    nip: invoiceCustomer.nip,
                    address: invoiceCustomer.address,
                    email: invoiceCustomer.email,
                    date: selectedSale.date,
                    time: selectedSale.time,
                    price: totalPrice.toString(),
                    items: JSON.stringify(invoiceItems)
                  });

                  window.open(`/faktura/${selectedSale.id}?${queryParams.toString()}`, "_blank");
                  setIsInvoiceDialogOpen(false);
                  setSelectedSale(null);
                  setInvoiceCustomer({ name: "", nip: "", address: "", email: "" });
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Otwórz fakturę
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar Handle Button (Visible when closed) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-secondary text-primary p-2 rounded-l-2xl shadow-2xl border-l border-t border-b border-primary/10 z-[90] hover:bg-secondary/90 hover:pl-4 transition-all group"
          title="Otwórz podsumowanie"
        >
          <div className="flex flex-col items-center gap-2">
            <ChevronLeft className="h-5 w-5 animate-pulse" />
            <div className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.2em] py-2">
              Podsumowanie
            </div>
          </div>
        </button>
      )}

      {/* Add Sale Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setEditingId(null); setPurchasePriceFromWarehouse(0); } setIsDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <DialogHeader className="p-8 bg-primary text-white relative shrink-0">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">{editingId ? "Edytuj Sprzedaż" : "Nowa Sprzedaż"}</DialogTitle>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{editingId ? "Wprowadź zmiany w pozycji" : "Dodaj nową pozycję do zeszytu"}</p>
            </div>
            <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              {editingId ? <Pencil className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 bg-white overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Kategoria</Label>
                <UISelect 
                  value={newEntry.category} 
                  onValueChange={(val) => {
                    setNewEntry({...newEntry, category: val || "akcesoria"});
                    if (val === "telefon") {
                      setIsPhoneSelectOpen(true);
                    }
                  }}
                >
                  <UISelectTrigger className="bg-accent/30 border-none h-12 rounded-xl font-bold">
                    <UISelectValue placeholder="Wybierz..." />
                  </UISelectTrigger>
                  <UISelectContent className="rounded-2xl">
                    {categoryGroups.map(group => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5">
                          {group.label}
                        </SelectLabel>
                        {group.items.map(cat => (
                          <UISelectItem key={cat.id} value={cat.id} className="font-bold">
                            <div className="flex items-center gap-2">
                              <cat.icon className={cn("h-4 w-4", cat.color)} />
                              {cat.label}
                            </div>
                          </UISelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </UISelectContent>
                </UISelect>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Inicjały</Label>
                <div className="bg-accent/30 border-none h-12 rounded-xl flex items-center px-4 font-black text-primary">
                  {newEntry.ini || "--"}
                </div>
              </div>
            </div>

            {newEntry.category === "telefon" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Telefon z magazynu</Label>
                {newEntry.imei ? (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-sm text-emerald-700 uppercase">{newEntry.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">IMEI: {newEntry.imei}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setNewEntry({...newEntry, name: "", imei: "", warehousePhoneId: null, price: "", profit: ""});
                          setPurchasePriceFromWarehouse(0);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg"
                      >
                        Zmień
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsPhoneSelectOpen(true)}
                    className="w-full h-12 border-primary/20 border-2 border-dashed rounded-xl font-bold text-xs uppercase hover:bg-accent/50 hover:border-primary/30"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Wybierz telefon z magazynu
                  </Button>
                )}
              </div>
            )}

            {newEntry.category === "usluga" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Usługa z magazynu</Label>
                {newEntry.name ? (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-sm text-emerald-700 uppercase">{newEntry.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Cena: {newEntry.price} zł | Zysk: {newEntry.profit} zł</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setNewEntry({...newEntry, name: "", price: "", profit: ""});
                        }}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg"
                      >
                        Zmień
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsUslugaSelectOpen(true)}
                    className="w-full h-12 border-primary/20 border-2 border-dashed rounded-xl font-bold text-xs uppercase hover:bg-accent/50 hover:border-primary/30"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Wybierz usługę z magazynu
                  </Button>
                )}
              </div>
            )}

            {newEntry.category === "serwis" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Serwis z magazynu</Label>
                {newEntry.name ? (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-sm text-emerald-700 uppercase">{newEntry.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Cena: {newEntry.price} zł | Zysk: {newEntry.profit} zł</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setNewEntry({...newEntry, name: "", price: "", profit: ""});
                        }}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg"
                      >
                        Zmień
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsSerwisSelectOpen(true)}
                    className="w-full h-12 border-primary/20 border-2 border-dashed rounded-xl font-bold text-xs uppercase hover:bg-accent/50 hover:border-primary/30"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Wybierz serwis z magazynu
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nazwa pozycji</Label>
              <Input 
                placeholder="Np. Etui iPhone 15 Pro..." 
                className="bg-accent/30 border-none h-12 rounded-xl font-medium uppercase"
                value={newEntry.name}
                disabled={newEntry.category === "telefon" && !!newEntry.imei}
                onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Cena (PLN)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="bg-accent/30 border-none h-12 rounded-xl font-black"
                  value={newEntry.price}
                  onChange={(e) => {
                    const newPrice = e.target.value;
                    if (newEntry.warehousePhoneId !== null) {
                      const sellingPrice = parseFloat(newPrice) || 0;
                      const profit = sellingPrice - purchasePriceFromWarehouse;
                      setNewEntry({...newEntry, price: newPrice, profit: profit.toString()});
                    } else {
                      setNewEntry({...newEntry, price: newPrice});
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Zysk (PLN)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="bg-accent/30 border-none h-12 rounded-xl font-black text-emerald-600"
                  value={newEntry.profit}
                  onChange={(e) => setNewEntry({...newEntry, profit: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Metoda Płatności</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewEntry({...newEntry, payment: "gotówka"})}
                  className={cn(
                    "h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest",
                    newEntry.payment === "gotówka" 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm" 
                      : "border-accent/30 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <Banknote className="h-5 w-5" />
                  Gotówka
                </button>
                <button
                  type="button"
                  onClick={() => setNewEntry({...newEntry, payment: "karta"})}
                  className={cn(
                    "h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest",
                    newEntry.payment === "karta" 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-accent/30 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                  Karta
                </button>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Koszyk ({cartItems.length})</p>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="h-6 text-[10px] text-muted-foreground hover:text-red-500">Wyczyść</Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl">
                      <div>
                        <p className="text-xs font-bold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.price} zł</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(idx)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-emerald-200">
                  <span className="text-xs font-black text-emerald-600">Suma:</span>
                  <span className="text-sm font-black text-emerald-600">{cartItems.reduce((s, i) => s + i.price, 0)} zł</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                className="flex-1 h-14 bg-primary/10 hover:bg-primary/20 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 text-primary"
                onClick={addPosition}
              >
                + Dodaj
              </Button>
              {cartItems.length > 0 && (
                <Button 
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95 text-white"
                  onClick={addCartToSales}
                >
                  Sprzedaj ({cartItems.length})
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

        {/* Side Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Phone Selection Dialog */}
      <Dialog open={isPhoneSelectOpen} onOpenChange={setIsPhoneSelectOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <DialogHeader className="p-6 bg-primary text-white relative shrink-0">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Wybierz telefon</DialogTitle>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Z magazynu</p>
            </div>
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <p className="text-white/80 text-[10px] font-bold uppercase">Dostępne: {warehousePhones.length}</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-4 border-b border-primary/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Szukaj telefonu..." 
                className="pl-10 bg-accent/30 border-none h-11 rounded-xl"
                value={phoneSearchQuery}
                onChange={(e) => setPhoneSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {warehousePhones.length === 0 ? (
              <div className="text-center py-12">
                <Smartphone className="h-12 w-12 text-primary/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold text-sm">Brak dostępnych telefonów</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Dodaj telefony w zakładce Magazyn</p>
              </div>
            ) : (
              warehousePhones
                .filter(phone => 
                  phone.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
                  phone.brand?.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
                  phone.model?.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
                  phone.imei?.includes(phoneSearchQuery)
                )
                .map((phone, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const purchasePrice = parseFloat(phone.purchasePrice) || 0;
                      setPurchasePriceFromWarehouse(purchasePrice);
                      
                      setNewEntry({
                        ...newEntry,
                        name: phone.name,
                        imei: phone.imei,
                        price: phone.price || "",
                        profit: phone.profit || "",
                        warehousePhoneId: idx
                      });
                      setIsPhoneSelectOpen(false);
                      setPhoneSearchQuery("");
                    }}
                    className="w-full p-4 bg-accent/30 rounded-2xl border border-primary/5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                          <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground uppercase tracking-tight">{phone.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {phone.color && (
                              <span className="text-[9px] text-muted-foreground font-bold uppercase">{phone.color}</span>
                            )}
                            {phone.memory && (
                              <span className="text-[9px] text-muted-foreground font-bold uppercase">• {phone.memory}</span>
                            )}
                          </div>
                          {phone.imei && (
                            <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">IMEI: {phone.imei}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{phone.price}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Cena sprzedaży</p>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Usługa Selection Dialog */}
      <Dialog open={isUslugaSelectOpen} onOpenChange={setIsUslugaSelectOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <DialogHeader className="p-6 bg-primary text-white relative shrink-0">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Wybierz usługę</DialogTitle>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Z magazynu</p>
            </div>
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <p className="text-white/80 text-[10px] font-bold uppercase">Dostępne: {warehouseUslugi.length}</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-4 border-b border-primary/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Szukaj usługi..." 
                className="pl-10 bg-accent/30 border-none h-11 rounded-xl"
                value={uslugaSearchQuery}
                onChange={(e) => setUslugaSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {warehouseUslugi.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-primary/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold text-sm">Brak dostępnych usług</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Dodaj usługi w zakładce Magazyn</p>
              </div>
            ) : (
              warehouseUslugi
                .filter(usluga => 
                  usluga.name.toLowerCase().includes(uslugaSearchQuery.toLowerCase())
                )
                .map((usluga, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewEntry({
                        ...newEntry,
                        name: usluga.name,
                        price: usluga.price || "",
                        profit: usluga.profit || ""
                      });
                      setIsUslugaSelectOpen(false);
                      setUslugaSearchQuery("");
                    }}
                    className="w-full p-4 bg-accent/30 rounded-2xl border border-primary/5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground uppercase tracking-tight">{usluga.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{usluga.price}</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">+{usluga.profit} zł zysku</p>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Serwis Selection Dialog */}
      <Dialog open={isSerwisSelectOpen} onOpenChange={setIsSerwisSelectOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-none p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <DialogHeader className="p-6 bg-primary text-white relative shrink-0">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Wybierz serwis</DialogTitle>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Z magazynu</p>
            </div>
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <p className="text-white/80 text-[10px] font-bold uppercase">Dostępne: {warehouseSerwisy.length}</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-4 border-b border-primary/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Szukaj serwisu..." 
                className="pl-10 bg-accent/30 border-none h-11 rounded-xl"
                value={serwisSearchQuery}
                onChange={(e) => setSerwisSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {warehouseSerwisy.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-primary/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold text-sm">Brak dostępnych serwisów</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Dodaj serwisy w zakładce Magazyn</p>
              </div>
            ) : (
              warehouseSerwisy
                .filter(serwis => 
                  serwis.name.toLowerCase().includes(serwisSearchQuery.toLowerCase())
                )
                .map((serwis, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewEntry({
                        ...newEntry,
                        name: serwis.name,
                        price: serwis.price || "",
                        profit: serwis.profit || ""
                      });
                      setIsSerwisSelectOpen(false);
                      setSerwisSearchQuery("");
                    }}
                    className="w-full p-4 bg-accent/30 rounded-2xl border border-primary/5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                          <Wrench className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground uppercase tracking-tight">{serwis.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{serwis.price}</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">+{serwis.profit} zł zysku</p>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Side Sidebar Content */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-[320px] bg-secondary text-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out p-6 flex flex-col gap-6",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">
              {newEntry.ini || "PZ"}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(false)}
              className="text-primary hover:text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Punkt Selection */}
        <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="space-y-2">
            <Label className="text-primary text-xs font-black uppercase tracking-widest">punkt</Label>
            {userRole === "owner" ? (
              <UISelect value={selectedShop} onValueChange={(val) => setSelectedShop(val || "Trzy Stawy Katowice")}>
                <UISelectTrigger className="bg-white/5 border-white/10 h-12 text-white font-bold rounded-xl focus:ring-primary">
                  <span>{selectedShop}</span>
                </UISelectTrigger>
                <UISelectContent className="bg-secondary border-white/10 text-white rounded-xl">
                  {shops.map(shop => (
                    <UISelectItem key={shop} value={shop} className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg">{shop}</UISelectItem>
                  ))}
                </UISelectContent>
              </UISelect>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl h-12 flex items-center px-3 text-white font-bold">
                {selectedShop}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-primary text-xs font-black uppercase tracking-widest">dzień</Label>
            <div className="relative">
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/5 border-white/10 h-12 text-white font-bold pr-10 rounded-xl focus:ring-primary"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        {/* Results Button - Only for owner */}
        {userRole === "owner" && (
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-primary/20 border-none">
            WSZYSTKIE WYNIKI DZISIAJ
          </Button>
        )}

        {/* Stats Summary */}
        <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest">gotówka na koniec dnia</p>
            <p className="text-xl font-black text-white">0 <span className="text-xs text-primary">zł</span></p>
          </div>

          <div className="space-y-1">
            <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest">karty na koniec dnia</p>
            <p className="text-xl font-black text-white">0 <span className="text-xs text-primary">zł</span></p>
          </div>

          <div className="space-y-1 pt-4 border-t border-white/10">
            <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest">bilans dnia</p>
            <p className={cn("text-2xl font-black", totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
              {totalProfit < 0 ? `- ${Math.abs(totalProfit)}` : totalProfit} <span className="text-xs text-primary">zł</span>
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-700">
            <div className="space-y-1">
              <p className="text-orange-400/60 text-[10px] font-black uppercase tracking-widest">wpływy brutto</p>
              <p className="text-xl font-black text-white">
                {totalAmount < 0 ? `- ${Math.abs(totalAmount)}` : totalAmount} <span className="text-xs text-orange-400">zł</span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-orange-400/60 text-[10px] font-black uppercase tracking-widest">suma zysków</p>
              <p className={cn(
                "text-xl font-black",
                totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {totalProfit < 0 ? `- ${Math.abs(totalProfit)}` : totalProfit} <span className="text-xs text-orange-400">zł</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none p-0 overflow-hidden">
          <div className="bg-red-500 p-6 text-white text-center">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-black mb-1">Potwierdź usunięcie</h2>
            <p className="text-red-100 text-xs font-medium uppercase tracking-widest">Czy na pewno chcesz usunąć tę pozycję?</p>
          </div>
          
          <div className="p-6 flex gap-3 bg-white">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl font-bold text-slate-500 border-slate-200"
              onClick={() => setItemToDelete(null)}
            >
              Anuluj
            </Button>
            <Button 
              className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-100"
              onClick={() => {
                if (itemToDelete) {
                  removePosition(itemToDelete);
                  setItemToDelete(null);
                }
              }}
            >
              Usuń pozycję
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

