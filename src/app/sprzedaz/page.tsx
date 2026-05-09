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
import { Plus, ArrowLeft, Search, Trash2, ShoppingBag, ChevronRight, FileText, Printer, Download, User, MapPin, Building2, CreditCard, Banknote } from "lucide-react";
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
  SelectValue as UISelectValue 
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

export default function SprzedazPage() {
  const router = useRouter();
  const [positions, setPositions] = useState([
    { 
      id: "s1",
      time: "14:30", 
      user: "Jan Kowalski", 
      price: "89 zł", 
      profit: "45 zł",
      paymentMethod: "Karta",
      items: [
        { name: "Etui iPhone 13", category: "Akcesoria", price: 89 }
      ]
    },
    { 
      id: "s2",
      time: "13:15", 
      user: "Piotr Zakrzewski", 
      price: "129 zł", 
      profit: "80 zł",
      paymentMethod: "Gotówka",
      items: [
        { name: "Etui MagSafe iPhone 14", category: "Akcesoria", price: 129 }
      ]
    },
  ]);

  const [inventory, setInventory] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"gotowka" | "karta">("gotowka");
  
  // Invoice form state
  const [customerData, setCustomerData] = useState({
    name: "",
    nip: "",
    address: "",
    email: ""
  });
  
  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  
  // Current item selection state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customProductName, setCustomProductName] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleProfit, setSaleProfit] = useState("");

  const categories = [
    { id: "akcesoria", label: "Akcesoria" },
    { id: "telefony", label: "Telefony" },
    { id: "czesci", label: "Części" },
  ];

  useEffect(() => {
    const mockInventory = [
      { id: "1", name: "Szkło hartowane iPhone 15", category: "akcesoria", stock: 12, price: 49 },
      { id: "2", name: "Etui MagSafe iPhone 14", category: "akcesoria", stock: 3, price: 129 },
      { id: "3", name: "Bateria Samsung S21", category: "czesci", stock: 5, price: 89 },
      { id: "4", name: "iPhone 13 128GB Blue", category: "telefony", stock: 1, price: 2499 },
    ];
    setInventory(mockInventory);
  }, []);

  const filteredInventory = inventory.filter(item => 
    (!selectedCategory || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = () => {
    const name = selectedProduct ? selectedProduct.name : customProductName;
    const category = selectedProduct ? selectedProduct.category : (selectedCategory || "Inne");
    
    if (!name || !salePrice) return;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      price: parseFloat(salePrice),
      profit: parseFloat(saleProfit || "0"),
    };

    setCart([...cart, newItem]);
    
    // Reset selection for next item
    setSelectedProduct(null);
    setCustomProductName("");
    setSalePrice("");
    setSaleProfit("");
    setSearchQuery("");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const totalProfit = cart.reduce((sum, item) => sum + item.profit, 0);

    const newSale = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: "Piotr Zakrzewski",
      price: `${totalAmount} zł`,
      profit: `${totalProfit} zł`,
      paymentMethod: paymentMethod === "gotowka" ? "Gotówka" : "Karta",
      items: cart.map(item => ({
        name: item.name,
        category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        price: item.price
      }))
    };

    setPositions([newSale, ...positions]);
    setCart([]);
    setIsDialogOpen(false);
    setSelectedCategory(null);
    setPaymentMethod("gotowka");
  };

  const handleGenerateInvoice = () => {
    if (!selectedSale) return;
    
    // Create query params for the invoice page
    const params = new URLSearchParams({
      id: selectedSale.id,
      name: customerData.name,
      nip: customerData.nip,
      address: customerData.address,
      email: customerData.email,
      date: new Date().toLocaleDateString('pl-PL'),
      time: selectedSale.time,
      price: selectedSale.price,
      items: JSON.stringify(selectedSale.items)
    });

    // Open invoice in new window/tab
    window.open(`/faktura/${selectedSale.id}?${params.toString()}`, '_blank');
    setIsInvoiceModalOpen(false);
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6 pb-24">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Sprzedaż i Skup</h1>
        </div>

        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-800 py-4 px-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-xs font-bold uppercase tracking-widest">Dzisiejsza lista</CardTitle>
              <Badge className="bg-emerald-500 text-white border-none text-[10px]">SUMA: 439 zł</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-none">
                  <TableHead className="text-[10px] font-bold uppercase text-slate-400 pl-6">Data i Godzina</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right">Cena</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right pr-6">Zysk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos, idx) => (
                  <TableRow 
                    key={idx} 
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedSale(pos);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-black text-slate-800">
                          {new Date().toLocaleDateString('pl-PL')}, {pos.time}
                        </p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{pos.user}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right font-black text-slate-800">{pos.price}</TableCell>
                    <TableCell className="py-4 text-right pr-6">
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-md">+{pos.profit}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Koszty i Transfery</h2>
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Brak zarejestrowanych kosztów</p>
              <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase h-8 border-slate-100">Dodaj koszt</Button>
            </CardContent>
          </Card>
        </section>

        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden flex flex-col max-h-[90vh]">
              {selectedSale && (
                <>
                  <DialogHeader className="p-8 bg-slate-900 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <DialogTitle className="text-2xl font-black mb-1">Szczegóły Sprzedaży</DialogTitle>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                          {new Date().toLocaleDateString('pl-PL')}, {selectedSale.time}
                        </p>
                      </div>
                      <Badge className="bg-blue-600 text-white border-none px-3 py-1 font-black">
                        #{selectedSale.id}
                      </Badge>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* User Info */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                        {selectedSale.user.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sprzedawca</p>
                        <p className="font-black text-slate-800">{selectedSale.user}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sprzedane Produkty</Label>
                      <div className="space-y-3">
                        {selectedSale.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                            <div>
                              <p className="font-bold text-slate-800">{item.name}</p>
                              <p className="text-[10px] text-blue-500 font-bold uppercase">{item.category}</p>
                            </div>
                            <p className="font-black text-slate-900">{item.price} zł</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Suma</p>
                        <p className="text-xl font-black text-slate-900">{selectedSale.price}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-700">
                        <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest mb-1">Zysk</p>
                        <p className="text-xl font-black">+{selectedSale.profit}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl text-blue-700">
                        <p className="text-[10px] text-blue-600/60 font-bold uppercase tracking-widest mb-1">Płatność</p>
                        <div className="flex items-center gap-1.5">
                          {selectedSale.paymentMethod === "Karta" ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                          <p className="text-sm font-black uppercase tracking-tight">{selectedSale.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="p-8 bg-slate-50">
                    <Button 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-blue-100"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        setIsInvoiceModalOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Wystaw Fakturę
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-blue-600 text-white">
                <DialogTitle className="text-2xl font-black mb-1">Dane do Faktury</DialogTitle>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Wprowadź dane kontrahenta</p>
              </DialogHeader>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> Nazwa Firmy / Imię i Nazwisko
                    </Label>
                    <Input 
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      placeholder="np. Januszex Sp. z o.o."
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Search className="h-3 w-3" /> NIP
                    </Label>
                    <Input 
                      value={customerData.nip}
                      onChange={(e) => setCustomerData({ ...customerData, nip: e.target.value })}
                      placeholder="1234567890"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Adres
                    </Label>
                    <Input 
                      value={customerData.address}
                      onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                      placeholder="ul. Kolorowa 1, 00-000 Miasto"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" /> Email (opcjonalnie)
                    </Label>
                    <Input 
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      placeholder="biuro@firma.pl"
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-slate-400"
                    onClick={() => setIsInvoiceModalOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleGenerateInvoice}
                    disabled={!customerData.name || !customerData.nip || !customerData.address}
                    className="flex-[2] h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-blue-100"
                  >
                    <Printer className="h-4 w-4" />
                    Generuj Fakturę
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setCart([]);
              setSelectedCategory(null);
            }
          }}>
            <DialogTrigger 
              render={
                <div className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-500 hover:scale-110 transition-all cursor-pointer p-0 flex items-center justify-center text-white")}>
                  <Plus className="h-8 w-8" />
                </div>
              }
            />
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden flex flex-col max-h-[90vh]">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-xl font-black text-slate-900">Nowa Sprzedaż</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metoda Płatności</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("gotowka")}
                      className={cn(
                        "flex items-center justify-center gap-3 h-12 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest",
                        paymentMethod === "gotowka" 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <Banknote className={cn("h-4 w-4", paymentMethod === "gotowka" ? "text-emerald-600" : "text-slate-300")} />
                      Gotówka
                    </button>
                    <button
                      onClick={() => setPaymentMethod("karta")}
                      className={cn(
                        "flex items-center justify-center gap-3 h-12 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest",
                        paymentMethod === "karta" 
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <CreditCard className={cn("h-4 w-4", paymentMethod === "karta" ? "text-blue-600" : "text-slate-300")} />
                      Karta
                    </button>
                  </div>
                </div>

                {/* Cart Preview */}
                {cart.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Koszyk ({cart.length})</Label>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 group">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-blue-500 font-bold uppercase">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-black text-slate-900">{item.price} zł</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-300 hover:text-red-500"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl text-white">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">Suma koszyka</span>
                        <span className="text-lg font-black">{totalCartAmount} zł</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Item Section */}
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                      {cart.length + 1}
                    </div>
                    <Label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Dodaj produkt</Label>
                  </div>

                  {/* Step 1: Category */}
                  {!selectedCategory ? (
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant="outline"
                          className="h-16 rounded-2xl border-slate-100 hover:border-blue-200 hover:bg-blue-50 group flex flex-col items-center justify-center gap-1 transition-all"
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          <span className="text-xs font-black text-slate-700 group-hover:text-blue-600 uppercase tracking-tighter">{cat.label}</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                          {selectedCategory}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[9px] font-bold uppercase text-slate-400"
                          onClick={() => {
                            setSelectedCategory(null);
                            setSelectedProduct(null);
                            setCustomProductName("");
                          }}
                        >
                          Zmień kategorię
                        </Button>
                      </div>

                      {/* Step 2: Product Selection/Search */}
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            className="pl-10 h-12 bg-slate-50 border-none rounded-xl font-bold" 
                            placeholder="Szukaj lub wpisz nazwę..." 
                            value={searchQuery || customProductName}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setCustomProductName(e.target.value);
                              setSelectedProduct(null);
                            }}
                          />
                        </div>

                        {/* Search Results / Inventory */}
                        {searchQuery && filteredInventory.length > 0 && !selectedProduct && (
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 max-h-[160px] overflow-y-auto">
                            {filteredInventory.map((item) => (
                              <button
                                key={item.id}
                                className="w-full p-3 text-left hover:bg-blue-50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                                onClick={() => {
                                  setSelectedProduct(item);
                                  setSearchQuery(item.name);
                                  setSalePrice(item.price.toString());
                                }}
                              >
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Stan: {item.stock} szt.</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Price & Profit */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cena</label>
                            <Input 
                              type="number" 
                              value={salePrice}
                              onChange={(e) => setSalePrice(e.target.value)}
                              className="h-12 bg-slate-50 border-none rounded-xl font-bold" 
                              placeholder="0.00" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zysk</label>
                            <Input 
                              type="number" 
                              value={saleProfit}
                              onChange={(e) => setSaleProfit(e.target.value)}
                              className="h-12 bg-slate-50 border-none rounded-xl font-bold text-emerald-600" 
                              placeholder="0.00" 
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={addToCart}
                          disabled={(!selectedProduct && !customProductName) || !salePrice}
                          className="w-full h-12 bg-slate-100 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj kolejny przedmiot
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="p-6 bg-slate-50">
                <Button 
                  onClick={handleFinalizeSale}
                  disabled={cart.length === 0}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-lg shadow-blue-200"
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Zatwierdź sprzedaż ({cart.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

