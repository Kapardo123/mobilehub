"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, MapPin, ChevronRight, RefreshCw, Key, Eye, EyeOff, Trash2, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue 
} from "@/components/ui/select";

export default function PracownicyPage() {
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
    }
  }, [router]);

  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "pracownik",
    login: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const [employees, setEmployees] = useState([
    { id: "1", name: "Piotr Zakrzewski", role: "Właściciel", initials: "PZ", shops: ["Trzy Stawy", "Galeria Katowicka", "Silesia City Center"], status: "Online", login: "piotr.z", password: "PIN 123456" },
    // Trzy Stawy
    { id: "2", name: "Jan Kowalski", role: "Pracownik", initials: "JK", shops: ["Trzy Stawy"], status: "W pracy", login: "jan.k", password: "PIN 654321" },
    { id: "3", name: "Maria Wójcik", role: "Pracownik", initials: "MW", shops: ["Trzy Stawy"], status: "Offline", login: "maria.w", password: "PIN 223344" },
    { id: "4", name: "Krzysztof Nowak", role: "Pracownik", initials: "KN", shops: ["Trzy Stawy"], status: "Offline", login: "krzysztof.n", password: "PIN 556677" },
    // Galeria Katowicka
    { id: "5", name: "Anna Nowak", role: "Pracownik", initials: "AN", shops: ["Galeria Katowicka"], status: "W pracy", login: "anna.n", password: "PIN 112233" },
    { id: "6", name: "Marek Krawczyk", role: "Pracownik", initials: "MK", shops: ["Galeria Katowicka"], status: "Offline", login: "marek.k", password: "PIN 334455" },
    { id: "7", name: "Karolina Zielińska", role: "Pracownik", initials: "KZ", shops: ["Galeria Katowicka"], status: "Offline", login: "karolina.z", password: "PIN 778899" },
    // Silesia City Center
    { id: "8", name: "Tomasz Szymański", role: "Pracownik", initials: "TS", shops: ["Silesia City Center"], status: "W pracy", login: "tomasz.s", password: "PIN 445566" },
    { id: "9", name: "Barbara Dąbrowska", role: "Pracownik", initials: "BD", shops: ["Silesia City Center"], status: "Offline", login: "barbara.d", password: "PIN 889900" },
    { id: "10", name: "Łukasz Kamiński", role: "Pracownik", initials: "ŁK", shops: ["Silesia City Center"], status: "Offline", login: "lukasz.k", password: "PIN 990011" },
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem('pracownicy_employees');
    if (saved) {
      try {
        setEmployees(JSON.parse(saved));
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem('pracownicy_employees', JSON.stringify(employees));
  }, [employees]);

  const [showCredentialsFor, setShowCredentialsFor] = useState<any | null>(null);

  const generateCredentials = () => {
    if (!newEmployee.name) return;
    
    const nameParts = newEmployee.name.trim().split(" ");
    const login = nameParts.length > 1 
      ? `${nameParts[0].toLowerCase()}.${nameParts[1][0].toLowerCase()}${Math.floor(Math.random() * 99)}`
      : `${nameParts[0].toLowerCase()}${Math.floor(Math.random() * 99)}`;

    const password = Math.floor(100000 + Math.random() * 900000).toString();

    setNewEmployee({ ...newEmployee, login, password });
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.login || !newEmployee.password) return;
    
    const shopLabel = shops.find(s => s.id === selectedShop)?.label || "";
    
    const employee = {
      id: Math.random().toString(36).substring(2, 11),
      name: newEmployee.name,
      role: newEmployee.role.charAt(0).toUpperCase() + newEmployee.role.slice(1),
      initials: newEmployee.name.split(" ").map(n => n[0]).join("").toUpperCase(),
      shops: [shopLabel],
      status: "Offline",
      login: newEmployee.login,
      password: `PIN ${newEmployee.password}`
    };

    setEmployees([...employees, employee]);
    window.dispatchEvent(new CustomEvent('pracownicy_updated'));
    addToast({ message: `Dodano pracownika ${employee.name}`, variant: "success" });
    setShowCredentialsFor(employee);
    setNewEmployee({ name: "", role: "pracownik", login: "", password: "" });
    setIsAddDialogOpen(false);
  };

  const removeEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(employees.filter(emp => emp.id !== id));
    window.dispatchEvent(new CustomEvent('pracownicy_updated'));
    if (emp) addToast({ message: `Usunięto pracownika ${emp.name}`, variant: "info" });
  };

  const shops = [
    { id: "trzy-stawy", label: "Trzy Stawy", count: employees.filter(e => e.shops.includes("Trzy Stawy")).length },
    { id: "galeria-katowicka", label: "Galeria Katowicka", count: employees.filter(e => e.shops.includes("Galeria Katowicka")).length },
    { id: "silesia-city", label: "Silesia City Center", count: employees.filter(e => e.shops.includes("Silesia City Center")).length },
  ];

  const filteredEmployees = selectedShop 
    ? employees.filter(emp => 
        emp.shops.some(s => s.toLowerCase().includes(selectedShop.split('-')[0])) && 
        emp.role.toLowerCase() !== "właściciel" && 
        emp.role.toLowerCase() !== "wlasciciel"
      )
    : [];

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
              onClick={() => selectedShop ? setSelectedShop(null) : window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
              {selectedShop ? shops.find(s => s.id === selectedShop)?.label : "Wybierz Punkt"}
            </h1>
          </div>
          
          {selectedShop && (
            <>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10 h-10 px-4 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Dodaj
                  </Button>}></DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-none p-0 overflow-hidden">
                  <DialogHeader className="p-8 bg-primary text-white text-left">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Nowy Pracownik</DialogTitle>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Dodaj nowego pracownika do systemu</p>
                  </DialogHeader>
                  <div className="p-8 space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Imię i Nazwisko</Label>
                      <Input 
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        placeholder="np. Marek Nowak" 
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase" 
                      />
                    </div>

                    <div className="grid gap-4 p-4 bg-accent/50 rounded-2xl border border-primary/10">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dane logowania</Label>
                        <Button 
                          onClick={generateCredentials}
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[9px] font-black uppercase text-primary hover:bg-primary/10 rounded-lg gap-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Generuj
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <Label className="text-[9px] font-bold text-muted-foreground mb-1 ml-1 block">Login</Label>
                          <div className="relative">
                            <Input 
                              value={newEmployee.login}
                              readOnly
                              className="h-10 bg-white border-none rounded-xl pr-10 font-mono text-xs" 
                            />
                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/30" />
                          </div>
                        </div>

                        <div className="relative">
                          <Label className="text-[9px] font-bold text-muted-foreground mb-1 ml-1 block">Hasło (PIN)</Label>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              value={newEmployee.password}
                              readOnly
                              className="h-10 bg-white border-none rounded-xl pr-10 font-mono text-xs tracking-widest" 
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary/30 hover:text-primary"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rola</Label>
                      <UISelect 
                        value={newEmployee.role}
                        onValueChange={(val) => val && setNewEmployee({ ...newEmployee, role: val })}
                        items={[
                          { value: "pracownik", label: "Pracownik" },
                          { value: "kierownik", label: "Kierownik" },
                          { value: "wlasciciel", label: "Właściciel" }
                        ]}
                      >
                        <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase text-foreground">
                          <UISelectValue placeholder="Wybierz rolę" />
                        </UISelectTrigger>
                        <UISelectContent className="rounded-2xl">
                          <UISelectItem value="pracownik">Pracownik</UISelectItem>
                          <UISelectItem value="kierownik">Kierownik</UISelectItem>
                          <UISelectItem value="wlasciciel">Właściciel</UISelectItem>
                        </UISelectContent>
                      </UISelect>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="ghost"
                        className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-accent"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Anuluj
                      </Button>
                      <Button 
                        onClick={handleAddEmployee}
                        disabled={!newEmployee.name || !newEmployee.login || !newEmployee.password}
                        className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10"
                      >
                        Zapisz Pracownika
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={!!showCredentialsFor} onOpenChange={(open) => !open && setShowCredentialsFor(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none p-0 overflow-hidden">
                  <div className="bg-primary p-8 text-white text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-1 uppercase tracking-tight">Dane Logowania</h2>
                    <p className="text-white/70 text-sm font-medium">{showCredentialsFor?.name}</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="bg-accent/30 p-4 rounded-2xl border border-primary/5">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Login do systemu</Label>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg text-foreground">{showCredentialsFor?.login}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/30 hover:text-primary" onClick={() => navigator.clipboard.writeText(showCredentialsFor?.login)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-accent/30 p-4 rounded-2xl border border-primary/5">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Hasło / PIN</Label>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg text-foreground tracking-widest">{showCredentialsFor?.password}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/30 hover:text-primary" onClick={() => navigator.clipboard.writeText(showCredentialsFor?.password)}>
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowCredentialsFor(null)}
                      className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest"
                    >
                      Rozumiem
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {!selectedShop ? (
          /* Shop Selection View */
          <div className="grid gap-4">
            {shops.map((shop) => (
              <Card 
                key={shop.id} 
                className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all cursor-pointer rounded-3xl border border-primary/5"
                onClick={() => setSelectedShop(shop.id)}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center group-hover:scale-110 transition-all">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-lg uppercase tracking-tight">{shop.label}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {shop.count} Pracowników
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary/30 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Employee List View for Selected Shop */
          <div className="grid gap-4">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, idx) => (
                <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-3xl border border-primary/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-accent group-hover:border-primary/20 transition-all">
                          <AvatarFallback className="bg-accent text-primary font-black text-sm uppercase">{emp.initials}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          emp.status === 'W pracy' ? 'bg-emerald-500' : 
                          emp.status === 'Online' ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`} />
                      </div>
                      <div>
                        <p className="font-black text-foreground uppercase tracking-tight">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{emp.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary/30 hover:text-primary hover:bg-accent rounded-xl transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCredentialsFor(emp);
                        }}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Czy na pewno chcesz usunąć pracownika ${emp.name}?`)) {
                            removeEmployee(emp.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-dashed border-primary/10">
                <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Brak pracowników w tym punkcie</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
