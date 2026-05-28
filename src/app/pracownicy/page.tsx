"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, MapPin, ChevronRight, RefreshCw, Key, Eye, EyeOff, Trash2, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getSessionStorageSafe } from "@/lib/storage";
import { usersService } from "@/lib/supabase/users";
import { shopsService } from "@/lib/supabase/shops";
import { supabase } from "@/lib/supabase";
import { auditService } from "@/lib/supabase/actions";
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
      return;
    }
    if (role === "employee") {
      router.push("/pracownik");
      return;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [employees, setEmployees] = useState([
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "Piotr Zakrzewski", role: "Właściciel", initials: "PZ", shops: ["Kaufland Włocławek", "Riviera Gdynia", "Dominikańska Wrocław"], status: "Online", login: "piotr.z", password: "PIN 123456" },
    // Kaufland Włocławek
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Jan Kowalski", role: "Pracownik", initials: "JK", shops: ["Kaufland Włocławek"], status: "W pracy", login: "pracownik", password: "mobilehub" },
    // Riviera Gdynia
    { id: "550e8400-e29b-41d4-a716-446655440004", name: "Anna Nowak", role: "Pracownik", initials: "AN", shops: ["Kaufland Włocławek"], status: "W pracy", login: "anna", password: "nowak" },
    // Dominikańska Wrocław
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "Kamil Nowicki", role: "Pracownik", initials: "KN", shops: ["Kaufland Włocławek"], status: "Offline", login: "kamil", password: "nowicki" },
  ]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data;
      try {
        data = await usersService.getAllWithShops();
        console.log('Pobrano pracowników ze sklepami z bazy:', data?.length || 0);
      } catch (dbError) {
        console.error('Błąd pobierania z bazy, używam domyślnych:', dbError);
        data = null;
      }
      
      if (data && data.length > 0) {
        const formattedEmployees = data.map(user => {
          const shopNames = user.shops && Array.isArray(user.shops) && user.shops.length > 0 
            ? user.shops.map((s: any) => s.shop_name)
            : ["Brak przypisanego sklepu"];
          
          console.log(`Pracownik: ${user.first_name} ${user.last_name}, sklepy:`, shopNames);
          
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Pracownik',
            role: user.role === 'owner' ? 'Właściciel' : 
                  user.role === 'admin' ? 'Administrator' : 
                  user.role === 'employee' ? 'Pracownik' : user.role,
            initials: user.initials || '??',
            shops: shopNames,
            status: user.is_active ? "Online" : "Offline",
            login: user.login || '',
            password: `PIN ${user.password_hash?.substring(0, 6) || '******'}`
          };
        });
        
        setEmployees(formattedEmployees);
        console.log('Ustawiono pracowników:', formattedEmployees.length);
      } else {
        console.log('Brak danych z bazy, pozostawiono domyślnych');
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const [showCredentialsFor, setShowCredentialsFor] = useState<any | null>(null);

  const generateCredentials = () => {
    if (!newEmployee.name) return;
    
    const nameParts = newEmployee.name.trim().split(" ").filter(part => part.length > 0);
    
    if (nameParts.length === 0) return;
    
    const login = nameParts.length > 1 && nameParts[1]
      ? `${nameParts[0].toLowerCase()}.${nameParts[1][0].toLowerCase()}${Math.floor(Math.random() * 99)}`
      : `${nameParts[0].toLowerCase()}${Math.floor(Math.random() * 99)}`;

    const password = Math.floor(100000 + Math.random() * 900000).toString();

    setNewEmployee({ ...newEmployee, login, password });
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.login || !newEmployee.password) return;
    
    try {
      const nameParts = newEmployee.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const initials = nameParts.map(n => n[0]).join("").toUpperCase();
      
      const createdUser = await usersService.create({
        first_name: firstName,
        last_name: lastName,
        initials: initials,
        login: newEmployee.login,
        password_hash: newEmployee.password,
        email: `${newEmployee.login.toLowerCase()}@test.com`,
        role: (newEmployee.role === 'pracownik' ? 'employee' :
              newEmployee.role === 'wlasciciel' ? 'owner' :
              newEmployee.role) as 'owner' | 'employee' | 'admin',
        is_active: true,
        deleted_at: null
      });
      
      console.log('Utworzono użytkownika:', createdUser);
      console.log('Wybrany sklep (selectedShop):', selectedShop);
      console.log('Typ selectedShop:', typeof selectedShop);
      
      if (selectedShop && selectedShop !== '' && selectedShop !== 'undefined') {
        try {
          console.log('Próba przypisania do sklepu:', {
            user_id: createdUser.id,
            shop_id: selectedShop,
            is_primary: true
          });
          
          const { data: shopData, error: shopError } = await supabase
            .from('user_shops')
            .insert({
              user_id: createdUser.id,
              shop_id: selectedShop,
              is_primary: true
            })
            .select();
          
          console.log('Wynik insertu do user_shops:', { shopData, shopError });
          
          if (shopError) {
            console.error('Błąd przypisywania do sklepu:', JSON.stringify(shopError));
            console.error('Error code:', shopError.code);
            console.error('Error message:', shopError.message);
            console.error('Error details:', shopError.details);
            console.error('Error hint:', shopError.hint);
          } else {
            console.log('Przypisano do sklepu:', selectedShop);
          }
        } catch (shopErr) {
          console.error('Wyjątek przy przypisywaniu do sklepu:', shopErr);
        }
      } else {
        console.log('Pominięto przypisanie do sklepu - brak wybranego sklepu');
      }
      
      const shopLabel = shops.find(s => s.id === selectedShop)?.label || selectedShop || "Brak przypisanego sklepu";
      
      const employee = {
        id: createdUser.id,
        name: newEmployee.name,
        role: newEmployee.role.charAt(0).toUpperCase() + newEmployee.role.slice(1),
        initials: initials,
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
    } catch (error) {
      console.error('Error adding employee:', error);
      addToast({ message: "Błąd dodawania pracownika", variant: "error" });
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      await usersService.softDelete(id);
      
      const emp = employees.find(e => e.id === id);
      setEmployees(employees.filter(emp => emp.id !== id));
      window.dispatchEvent(new CustomEvent('pracownicy_updated'));
      if (emp) addToast({ message: `Usunięto pracownika ${emp.name}`, variant: "info" });
    } catch (error) {
      console.error('Error removing employee:', error);
      addToast({ message: "Błąd usuwania pracownika", variant: "error" });
    }
  };

  const [shops, setShops] = useState<{id: string; label: string; count: number}[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setIsLoadingShops(true);
      console.log('Pobieranie sklepów z bazy...');
      
      const shopsData = await shopsService.getAll();
      console.log('Pobrano sklepy:', shopsData);
      
      const shopList = shopsData.map(shop => ({
        id: shop.id,
        label: shop.name,
        count: employees.filter(e => e.shops.includes(shop.name)).length
      }));
      
      setShops(shopList);
      console.log('Ustawiono listę sklepów:', shopList);
    } catch (error) {
      console.error('Błąd podczas pobierania sklepów:', error);
      setShops([]);
    } finally {
      setIsLoadingShops(false);
    }
  };

  useEffect(() => {
    if (employees.length > 0 && !isLoadingShops) {
      loadShops();
    }
  }, [employees]);

  useEffect(() => {
    const handleShopsUpdated = () => {
      console.log('Zdarzenie shops_updated - odświeżanie sklepów');
      loadShops();
    };
    
    window.addEventListener('shops_updated', handleShopsUpdated);
    return () => window.removeEventListener('shops_updated', handleShopsUpdated);
  }, []);

  const filteredEmployees = selectedShop 
    ? employees.filter(emp => {
        const selectedShopLabel = shops.find(s => s.id === selectedShop)?.label;
        return emp.shops.some(s => s.toLowerCase().includes(selectedShopLabel?.toLowerCase() || '')) && 
        emp.role.toLowerCase() !== "właściciel" && 
        emp.role.toLowerCase() !== "wlasciciel";
      })
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Ładowanie pracowników...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">Błąd ładowania danych</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEmployees}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
            >
              Spróbuj ponownie
            </Button>
          </div>
        )}
        
        {!isLoading && !error && (
        <>
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
                          { value: "wlasciciel", label: "Właściciel" }
                        ]}
                      >
                        <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase text-foreground">
                          <UISelectValue placeholder="Wybierz rolę" />
                        </UISelectTrigger>
                        <UISelectContent className="rounded-2xl">
                          <UISelectItem value="pracownik">Pracownik</UISelectItem>
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
                      className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest mb-3"
                    >
                      Rozumiem
                    </Button>

                    <Button 
                      onClick={async () => {
                        if (showCredentialsFor?.login && showCredentialsFor?.password) {
                          try {
                            sessionStorage.clear();
                            
                            console.log('Próba logowania na konto:', showCredentialsFor.login);
                            
                            const user = await usersService.login(showCredentialsFor.login, showCredentialsFor.password.replace('PIN ', ''));
                            
                            if (user) {
                              console.log('Zalogowano pomyślnie:', user);
                              console.log('Rola użytkownika:', user.role);
                              console.log('ID użytkownika:', user.id);
                              
                              sessionStorage.setItem("userRole", user.role);
                              sessionStorage.setItem("userName", `${user.first_name} ${user.last_name}`);
                              sessionStorage.setItem("userId", user.id);
                              sessionStorage.setItem("userInitials", user.initials || `${user.first_name[0]}${user.last_name[0]}`);

                              const userShops = await usersService.getUserShops(user.id);
                              console.log('=== PRACOWNICY - Sklepy użytkownika ===');
                              console.log('User:', `${user.first_name} ${user.last_name}`);
                              console.log('Sklepy:', userShops);

                              if (userShops && userShops.length > 0) {
                                const primaryShop = userShops.find(s => s.is_primary) || userShops[0];
                                console.log('Primary shop:', primaryShop);
                                console.log('Shop ID:', primaryShop.shop_id, '(type:', typeof primaryShop.shop_id + ')');
                                console.log('Shop Name:', primaryShop.shop_name, '(type:', typeof primaryShop.shop_name + ')');

                                sessionStorage.setItem("shopId", primaryShop.shop_id);
                                sessionStorage.setItem("shopName", primaryShop.shop_name);

                                console.log('✅ Ustawiono sklep w sesji:');
                                console.log('  - shopId:', sessionStorage.getItem("shopId"));
                                console.log('  - shopName:', sessionStorage.getItem("shopName"));
                              } else {
                                console.warn('⚠️ Użytkownik nie ma przypisanych sklepów!');
                              }
                              
                              await auditService.logLogin({
                                userId: user.id,
                                userName: `${user.first_name} ${user.last_name}`
                              });
                              
                              setShowCredentialsFor(null);
                              
                              console.log('Przekierowanie dla roli:', user.role);
                              
                              if (user.role === 'owner' || user.role === 'admin' || user.role === 'employee') {
                                window.location.href = "/";
                              } else {
                                window.location.href = "/pracownik";
                              }
                            } else {
                              alert('Błąd logowania: Nieprawidłowy login lub PIN');
                              console.error('Błąd login dla:', showCredentialsFor.login);
                            }
                          } catch (error) {
                            console.error('Błąd podczas logowania:', error);
                            alert('Błąd podczas logowania: ' + (error instanceof Error ? error.message : 'Nieznany błąd'));
                          }
                        }
                      }}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Zaloguj na to konto
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
        </>
        )}
      </main>
    </div>
  );
}
