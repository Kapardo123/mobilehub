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
  ChevronLeft
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
import { useState, useEffect } from "react";

export default function SprzedazPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userShop, setUserShop] = useState("Trzy Stawy");
  const [selectedShop, setSelectedShop] = useState("Trzy Stawy Katowice");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [positions, setPositions] = useState([
    { 
      id: "s1",
      ini: "PZ",
      cat: "akcesoria",
      name: "ff 16 pro",
      price: 130,
      profit: 110,
      payment: "gotówka",
      date: "2026-05-11",
      time: "10:30"
    },
    { 
      id: "s2",
      ini: "PZ",
      cat: "akcesoria",
      name: "guma 12 pm",
      price: 60,
      profit: 50,
      payment: "karta",
      date: "2026-05-11",
      time: "10:35"
    },
    { 
      id: "s3",
      ini: "PZ",
      cat: "serwis",
      name: "wymiana szybki",
      price: 150,
      profit: 80,
      payment: "gotówka",
      date: "2026-05-11",
      time: "10:40"
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New entry state
  const [newEntry, setNewEntry] = useState({
    category: "akcesoria",
    name: "",
    price: "",
    profit: "",
    payment: "gotówka",
    ini: ""
  });

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    const userName = sessionStorage.getItem("userName") || "Piotr Zakrzewski";
    setUserRole(role);
    
    if (role === "employee") {
      setSelectedShop("Trzy Stawy Katowice");
    } else {
      setSelectedShop("Trzy Stawy Katowice"); // Default for owner too, but they can change it
    }
    
    const initials = userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    
    setNewEntry(prev => ({ ...prev, ini: initials }));
  }, []);

  const shops = [
    "Trzy Stawy Katowice",
    "Galeria Katowicka",
    "Silesia City Center"
  ];

  const categoryGroups = [
    {
      label: "Z dokumentem",
      items: [
        { id: "paczka", label: "Paczka", icon: Package, color: "text-blue-500" },
        { id: "zwrot", label: "Zwrot", icon: RefreshCcw, color: "text-red-500" },
        { id: "inne_dok", label: "Inne", icon: FileText, color: "text-slate-500" },
      ]
    },
    {
      label: "Bez dokumentu",
      items: [
        { id: "transfer", label: "Transfer", icon: Send, color: "text-purple-500" },
        { id: "zaliczka", label: "Zaliczka", icon: Wallet, color: "text-emerald-500" },
      ]
    },
    {
      label: "Urządzenia",
      items: [
        { id: "skup", label: "Skup", icon: Smartphone, color: "text-amber-500" },
      ]
    },
    {
      label: "Usługi",
      items: [
        { id: "akcesoria", label: "Akcesoria", icon: Headphones, color: "text-orange-500" },
        { id: "serwis", label: "Serwis", icon: Wrench, color: "text-blue-600" },
      ]
    }
  ];

  // Flatten categories for easier lookup
  const allCategories = categoryGroups.flatMap(group => group.items);

  // Filter positions based on selected shop and date (mocking shop for now as positions don't have shop field)
  const filteredPositions = positions.filter(pos => {
    // In a real app, we would filter by shop and date
    // For now, we'll just show all since we don't have shop/date fields in the initial mock positions
    return true; 
  });

  const totalAmount = filteredPositions.reduce((sum, pos) => sum + pos.price, 0);
  const totalProfit = filteredPositions.reduce((sum, pos) => sum + pos.profit, 0);

  const addPosition = () => {
    if (!newEntry.name || !newEntry.price) return;

    const isSkup = newEntry.category === "skup";
    const priceVal = parseFloat(newEntry.price);
    const profitVal = parseFloat(newEntry.profit || "0");

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      ini: newEntry.ini,
      cat: newEntry.category,
      name: newEntry.name,
      price: isSkup ? -Math.abs(priceVal) : priceVal,
      profit: isSkup ? -Math.abs(profitVal) : profitVal,
      payment: newEntry.payment,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPositions([newItem, ...positions]);
    setNewEntry({
      ...newEntry,
      name: "",
      price: "",
      profit: "",
      payment: "gotówka"
    });
    setIsDialogOpen(false);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(pos => pos.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F9] relative overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 p-4 lg:p-8 w-full max-w-[1400px] mx-auto space-y-6">
        {/* Header with Title and Summary Boxes */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sprzedaż</h1>
              <p className="text-slate-500 font-medium">Zeszyt dzienny</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 gap-3"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
              <span className="font-black text-sm uppercase tracking-widest">Nowa pozycja</span>
            </Button>

            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 min-w-[160px] flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suma wpłat</span>
                <span className="text-2xl font-black text-slate-900">{totalAmount < 0 ? `- ${Math.abs(totalAmount)}` : totalAmount} zł</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl shadow-lg min-w-[160px] flex flex-col items-end border-b-4 border-emerald-500">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zysk netto</span>
                <span className="text-2xl font-black text-white">{totalProfit < 0 ? `- ${Math.abs(totalProfit)}` : totalProfit} zł</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Bar removed and replaced with Button + Dialog */}
        
        <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="w-16 text-center text-[10px] font-bold uppercase text-slate-400 py-4">ini.</TableHead>
                  <TableHead className="w-16 text-center text-[10px] font-bold uppercase text-slate-400">kat.</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-400">nazwa pozycji</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase text-slate-400">cena</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase text-slate-400">zysk</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase text-slate-400 pr-4">płatność</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400 font-medium">
                      Brak pozycji w dzisiejszym zeszycie.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPositions.map((pos) => {
                    const category = allCategories.find(c => c.id === pos.cat) || allCategories[allCategories.length - 1];
                    const Icon = category.icon;
                    
                    return (
                      <TableRow 
                        key={pos.id} 
                        className="group border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="text-center py-4">
                          <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {pos.ini}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={cn("inline-flex p-2 rounded-lg bg-white shadow-sm border border-slate-100", category.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{pos.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{pos.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900">
                          {pos.price < 0 ? `- ${Math.abs(pos.price)}` : pos.price} zł
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-black",
                            pos.profit >= 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                            {pos.profit < 0 ? `- ${Math.abs(pos.profit)}` : pos.profit} zł
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(
                            "font-black text-[9px] uppercase px-2 py-0.5 border-none",
                            pos.payment === "karta" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {pos.payment}
                          </Badge>
                        </TableCell>
                        <TableCell className="opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => setItemToDelete(pos.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                
                {/* Total Row at bottom of table */}
                {filteredPositions.length > 0 && (
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t-2 border-slate-100">
                    <TableCell colSpan={3} className="py-4 text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SUMA</span>
                    </TableCell>
                    <TableCell className="text-right p-0">
                      <div className="bg-red-600 text-white font-black h-12 flex items-center justify-end px-4">
                        {totalAmount < 0 ? `- ${Math.abs(totalAmount)}` : totalAmount} zł
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black">
                      <span className={cn(
                        totalProfit >= 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {totalProfit < 0 ? `- ${Math.abs(totalProfit)}` : totalProfit} zł
                      </span>
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Sidebar Handle Button (Visible when closed) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#1a1f2e] text-blue-400 p-2 rounded-l-2xl shadow-2xl border-l border-t border-b border-slate-700 z-[90] hover:bg-[#252b3d] hover:pl-4 transition-all group"
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-blue-600 text-white relative">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Nowa Sprzedaż</DialogTitle>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Dodaj nową pozycję do zeszytu</p>
            </div>
            <div className="absolute right-8 top-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoria</Label>
                <UISelect 
                  value={newEntry.category} 
                  onValueChange={(val) => setNewEntry({...newEntry, category: val || "akcesoria"})}
                >
                  <UISelectTrigger className="bg-slate-50 border-none h-12 rounded-xl font-bold">
                    <UISelectValue placeholder="Wybierz..." />
                  </UISelectTrigger>
                  <UISelectContent>
                    {categoryGroups.map(group => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1.5">
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
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inicjały</Label>
                <div className="bg-slate-100 border-none h-12 rounded-xl flex items-center px-4 font-black text-slate-400">
                  {newEntry.ini || "--"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa pozycji</Label>
              <Input 
                placeholder="Np. Etui iPhone 15 Pro..." 
                className="bg-slate-50 border-none h-12 rounded-xl font-medium"
                value={newEntry.name}
                onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cena (PLN)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="bg-slate-50 border-none h-12 rounded-xl font-black"
                  value={newEntry.price}
                  onChange={(e) => setNewEntry({...newEntry, price: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zysk (PLN)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="bg-slate-50 border-none h-12 rounded-xl font-black text-emerald-600"
                  value={newEntry.profit}
                  onChange={(e) => setNewEntry({...newEntry, profit: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Metoda Płatności</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewEntry({...newEntry, payment: "gotówka"})}
                  className={cn(
                    "h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest",
                    newEntry.payment === "gotówka" 
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100"
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
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                  Karta
                </button>
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 mt-4"
              onClick={addPosition}
            >
              Dodaj do zeszytu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Side Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Side Sidebar Content */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-[320px] bg-[#1a1f2e] text-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out p-6 flex flex-col gap-6",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
              {newEntry.ini || "PZ"}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Punkt Selection */}
        <div className="space-y-4 bg-[#252b3d] p-4 rounded-2xl border border-slate-800">
          <div className="space-y-2">
            <Label className="text-blue-400 text-xs font-black uppercase tracking-widest">punkt</Label>
            {userRole === "owner" ? (
              <UISelect value={selectedShop} onValueChange={setSelectedShop}>
                <UISelectTrigger className="bg-[#1a1f2e] border-slate-700 h-12 text-white font-bold">
                  <UISelectValue placeholder="Wybierz sklep" />
                </UISelectTrigger>
                <UISelectContent className="bg-[#252b3d] border-slate-700 text-white">
                  {shops.map(shop => (
                    <UISelectItem key={shop} value={shop} className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white">{shop}</UISelectItem>
                  ))}
                </UISelectContent>
              </UISelect>
            ) : (
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-lg h-12 flex items-center px-3 text-white font-bold">
                {selectedShop}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-blue-400 text-xs font-black uppercase tracking-widest">dzień</Label>
            <div className="relative">
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#1a1f2e] border-slate-700 h-12 text-white font-bold pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Results Button - Only for owner */}
        {userRole === "owner" && (
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-blue-900/20">
            WSZYSTKIE WYNIKI DZISIAJ
          </Button>
        )}

        {/* Stats Summary */}
        <div className="space-y-6 bg-[#252b3d] p-6 rounded-2xl border border-slate-800 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">gotówka na koniec dnia</p>
            <p className="text-xl font-black">0 <span className="text-xs text-slate-500">zł</span></p>
          </div>

          <div className="space-y-1">
            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">karty na koniec dnia</p>
            <p className="text-xl font-black">0 <span className="text-xs text-slate-500">zł</span></p>
          </div>

          <div className="space-y-1 pt-4 border-t border-slate-800">
            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">bilans dnia</p>
            <p className={cn("text-2xl font-black", totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
              {totalProfit < 0 ? `- ${Math.abs(totalProfit)}` : totalProfit} <span className="text-xs text-slate-500">zł</span>
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">wpływy brutto</p>
              <p className="text-xl font-black">
                {totalAmount < 0 ? `- ${Math.abs(totalAmount)}` : totalAmount} <span className="text-xs text-slate-500">zł</span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">suma zysków</p>
              <p className={cn(
                "text-xl font-black",
                totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {totalProfit < 0 ? `- ${Math.abs(totalProfit)}` : totalProfit} <span className="text-xs text-slate-500">zł</span>
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

