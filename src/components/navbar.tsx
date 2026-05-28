"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LogOut, Settings, Bell, Search, BookOpen, Calculator, ShoppingCart, Users, LayoutDashboard, MapPin, User, ChevronDown, Store, ClipboardList, FileText, UserPlus, LogIn, Smartphone, Lock, Eye, EyeOff, AlertTriangle, ArrowRightCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionStorageSafe } from "@/lib/storage";
import { addAction } from "@/app/akcje/page";
import { useToast } from "@/components/ui/toast";
import { usersService } from "@/lib/supabase/users";
import { shopAccessService, type ShopAccessStatus } from "@/lib/supabase/shopAccess";

export function Navbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeEmployeesCount, setActiveEmployeesCount] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<any>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [shopAccessStatus, setShopAccessStatus] = useState<ShopAccessStatus[]>([]);
  const [showShopAccess, setShowShopAccess] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const name = getSessionStorageSafe("userName", null);
    const role = getSessionStorageSafe("userRole", null);
    setUserName(name);
    setUserRole(role);

    const updateActiveCount = () => {
      const active = sessionStorage.getItem('activeEmployees');
      if (active) {
        setActiveEmployeesCount(JSON.parse(active).length);
      }

      const selectedId = sessionStorage.getItem('selectedEmployeeId');
      if (selectedId && active) {
        const employees = JSON.parse(active);
        const selectedEmp = employees.find((e: any) => e.id === selectedId);
        if (selectedEmp) {
          setUserName(selectedEmp.name);
          setShopName(selectedEmp.shop);
          const isOwner = selectedEmp.role === 'owner' || selectedEmp.role === 'admin';
          setUserRole(isOwner ? 'owner' : 'employee');
        }
      } else {
        const currentName = getSessionStorageSafe("userName", null);
        const currentRole = getSessionStorageSafe("userRole", null);
        setUserName(currentName);
        setUserRole(currentRole);
      }
    };

    updateActiveCount();

    const handleStorageChange = () => {
      updateActiveCount();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const updateActiveEmployeesCount = () => {
      const active = sessionStorage.getItem('activeEmployees');
      if (active) {
        setActiveEmployeesCount(JSON.parse(active).length);
      }
    };

    updateActiveEmployeesCount();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActiveEmployeesCount();
      }
    };

    const handleFocus = () => {
      updateActiveEmployeesCount();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(updateActiveEmployeesCount, 2000);

    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };

    return cleanup;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const justLoggedIn = localStorage.getItem('justLoggedIn');
      if (!justLoggedIn) return;

      const loginData = JSON.parse(justLoggedIn);

      if (loginData.employeeData) {
        setUserName(loginData.employeeData.name);
        setShopName(loginData.employeeData.shop);
        const isOwner = loginData.employeeData.role === 'owner' || loginData.employeeData.role === 'admin';
        setUserRole(isOwner ? 'owner' : 'employee');
        setActiveEmployeesCount(loginData.employeeCount || 1);
      }

      localStorage.removeItem('justLoggedIn');
    } catch (e) {
      console.error(e);
    }

    return;
  }, []);

  const isEmployee = userRole === "employee" || pathname === "/pracownik";
  const displayName = userName || "Ładowanie...";
  const displayRole = userRole === "employee" ? "Pracownik" : (userRole === "owner" ? "Właściciel" : (isEmployee ? "Pracownik" : "Właściciel"));

  const getActiveEmployees = () => {
    if (typeof window === 'undefined') return [];
    const active = sessionStorage.getItem('activeEmployees');
    if (!active) return [];

    const parsed = JSON.parse(active);

    const cleanString = (val: string | null | undefined) => {
      if (!val) return val;
      let cleaned = val;
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      return cleaned;
    };

    const cleaned = parsed.map((emp: any) => ({
      ...emp,
      id: cleanString(emp.id),
      name: cleanString(emp.name),
      initials: cleanString(emp.initials),
      shop: cleanString(emp.shop),
      shopId: cleanString(emp.shopId),
      role: cleanString(emp.role)
    }));

    sessionStorage.setItem('activeEmployees', JSON.stringify(cleaned));
    return cleaned;
  };

  interface EmployeeData {
    id: string;
    name: string;
    initials: string;
    shop: string;
    shopId: string;
    role?: string;
  }

  const addEmployeeToSession = (employee: EmployeeData) => {
    console.log('=== addEmployeeToSession START ===');
    console.log('Dodawany employee:', employee);

    const active = getActiveEmployees();
    console.log('Aktualni pracownicy PRZED dodaniem:', active);

    const exists = active.find((e: any) => e.id === employee.id);
    if (!exists) {
      if (active.length >= 3) {
        addToast({ type: "error", title: "Błąd", message: "Maksymalnie 3 pracowników może być zalogowanych jednocześnie!" });
        return false;
      }
      
      if (active.length > 0) {
        console.log('=== 🔍🔍🔍 SUPER DEBUG SPRAWDZANIE SKLEPU ===');
        console.log('📦 PIERWSZY PRACOWNIK (active[0]):');
        console.log('   - FULL OBJECT:', JSON.stringify(active[0], null, 2));
        console.log('   - shop:', active[0].shop);
        console.log('   - shop TYPE:', typeof active[0].shop);
        console.log('   - shop LENGTH:', active[0].shop?.length);
        console.log('   - shop CHARCODES:', [...(active[0].shop || '')].map(c => c.charCodeAt(0)));
        console.log('   - shop TRIMMED:', active[0].shop?.trim());
        console.log('   - shop LOWERCASE:', active[0].shop?.toLowerCase());
        console.log('   - shopId:', active[0].shopId);
        console.log('   - shopId TYPE:', typeof active[0].shopId);
        console.log('');
        console.log('📦 DODAWANY PRACOWNIK (employee):');
        console.log('   - FULL OBJECT:', JSON.stringify(employee, null, 2));
        console.log('   - shop:', employee.shop);
        console.log('   - shop TYPE:', typeof employee.shop);
        console.log('   - shop LENGTH:', employee.shop?.length);
        console.log('   - shop CHARCODES:', [...(employee.shop || '')].map(c => c.charCodeAt(0)));
        console.log('   - shop TRIMMED:', employee.shop?.trim());
        console.log('   - shop LOWERCASE:', employee.shop?.toLowerCase());
        console.log('   - shopId:', employee.shopId);
        console.log('   - shopId TYPE:', typeof employee.shopId);
        console.log('');

        const shopMatch = employee.shop === active[0].shop;
        const shopTrimmedMatch = employee.shop?.trim() === active[0].shop?.trim();
        const shopLowercaseMatch = employee.shop?.toLowerCase() === active[0].shop?.toLowerCase();
        const shopIdMatch = employee.shopId === active[0].shopId;

        console.log('⚖️ PORÓWNANIA:');
        console.log('   - shop EXACT match:', shopMatch);
        console.log('   - shop TRIMMED match:', shopTrimmedMatch);
        console.log('   - shop LOWERCASE match:', shopLowercaseMatch);
        console.log('   - shopId match:', shopIdMatch);

        if (!shopMatch && !shopIdMatch) {
          addToast({
            type: "error",
            title: "Błąd logowania",
            message: `Nie można zalogować pracownika z innego punktu! Wszyscy pracownicy muszą być z tego samego sklepu (${active[0].shop}).`
          });
          return false;
        }
      }
      
      active.push(employee);
      sessionStorage.setItem('activeEmployees', JSON.stringify(active));
      setActiveEmployeesCount(active.length);
      console.log('Aktualni pracownicy PO dodaniu:', active);
      console.log('Zapisano do sessionStorage activeEmployees:', JSON.parse(sessionStorage.getItem('activeEmployees') || '[]'));
    }
    
    sessionStorage.setItem('selectedEmployeeId', employee.id);
    sessionStorage.setItem('userId', employee.id);
    sessionStorage.setItem('userName', employee.name);
    sessionStorage.setItem('userInitials', employee.initials);
    sessionStorage.setItem('shopName', employee.shop);
    sessionStorage.setItem('shopId', employee.shopId);
    
    const isOwner = employee.role === 'owner' || employee.role === 'admin';
    sessionStorage.setItem('userRole', isOwner ? 'owner' : 'employee');

    window.dispatchEvent(new Event('storage'));

    addAction({
      action_type: "logowanie",
      description: `Dodanie pracownika do sesji - ${employee.name}`,
      actor_id: employee.id,
      actor_name: employee.name,
      shop_id: employee.shopId,
      shop_name: employee.shop
    });
    
    return true;
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const active = getActiveEmployees();
    if (active.length <= 1) {
      addToast({ type: "error", title: "Błąd", message: "Nie można wylogować ostatniego pracownika! Użyj przycisku 'Wyloguj System'." });
      return;
    }

    const employeeToRemove = active.find((e: any) => e.id === employeeId);
    if (!employeeToRemove) return;

    const updatedEmployees = active.filter((e: any) => e.id !== employeeId);
    sessionStorage.setItem('activeEmployees', JSON.stringify(updatedEmployees));
    
    const currentSelectedId = sessionStorage.getItem('selectedEmployeeId');
    if (currentSelectedId === employeeId && updatedEmployees.length > 0) {
      const nextEmployee = updatedEmployees[0];
      sessionStorage.setItem('selectedEmployeeId', nextEmployee.id);
      sessionStorage.setItem('userId', nextEmployee.id);
      sessionStorage.setItem('userName', nextEmployee.name);
      sessionStorage.setItem('userInitials', nextEmployee.initials);
      sessionStorage.setItem('shopName', nextEmployee.shop);
      sessionStorage.setItem('shopId', nextEmployee.shopId);

      const isOwner = (nextEmployee as any).role === 'owner' || (nextEmployee as any).role === 'admin';
      sessionStorage.setItem('userRole', isOwner ? 'owner' : 'employee');

      setUserName(nextEmployee.name);
      setShopName(nextEmployee.shop);
      setUserRole(isOwner ? 'owner' : 'employee');
    }

    setActiveEmployeesCount(updatedEmployees.length);

    window.dispatchEvent(new Event('storage'));

    addAction({
      action_type: "inna",
      description: `Wylogowano pracownika z sesji - ${employeeToRemove.name}`,
      actor_id: employeeToRemove.id,
      actor_name: employeeToRemove.name,
      shop_id: employeeToRemove.shopId,
      shop_name: employeeToRemove.shop
    });

    addToast({ type: "success", title: "Wylogowano", message: `${employeeToRemove.name} został wylogowany z sesji! (Pozostało: ${updatedEmployees.length}/3)` });
  };

  const switchToEmployee = (employeeId: string) => {
    const active = getActiveEmployees();
    const employee = active.find((e: any) => e.id === employeeId);
    
    if (!employee) {
      addToast({ type: "error", title: "Błąd", message: "Pracownik nie znaleziony w aktywnych!" });
      return;
    }
    
    sessionStorage.setItem('selectedEmployeeId', employee.id);
    sessionStorage.setItem('userId', employee.id);
    sessionStorage.setItem('userName', employee.name);
    sessionStorage.setItem('userInitials', employee.initials);
    sessionStorage.setItem('shopName', employee.shop);
    sessionStorage.setItem('shopId', employee.shopId);

    const isOwner = (employee as any).role === 'owner' || (employee as any).role === 'admin';
    sessionStorage.setItem('userRole', isOwner ? 'owner' : 'employee');
    
    addToast({ 
      type: "success", 
      title: "Przełączono ✓", 
      message: `Teraz pracujesz jako: ${employee.name}`,
      duration: 3000
    });
    
    window.location.reload();
  };

  const handleSwitchEmployee = (employeeId: string) => {
    if (sessionStorage.getItem('selectedEmployeeId') === employeeId) return;

    const employeeToSwitch = getActiveEmployees().find((e: any) => e.id === employeeId);
    if (!employeeToSwitch) return;

    sessionStorage.setItem('selectedEmployeeId', employeeId);
    sessionStorage.setItem('userId', employeeToSwitch.id);
    sessionStorage.setItem('userName', employeeToSwitch.name);
    sessionStorage.setItem('userInitials', employeeToSwitch.initials);
    sessionStorage.setItem('shopName', employeeToSwitch.shop);
    sessionStorage.setItem('shopId', employeeToSwitch.shopId);
    
    const isOwner = employeeToSwitch.id.includes('owner') || employeeToSwitch.id === '1' || employeeToSwitch.name.toLowerCase().includes('właściciel');
    sessionStorage.setItem('userRole', isOwner ? 'owner' : 'employee');

    addAction({
      action_type: "inna",
      description: `Przełączono profil na - ${employeeToSwitch.name}`,
      actor_id: employeeToSwitch.id,
      actor_name: employeeToSwitch.name,
      shop_id: employeeToSwitch.shopId,
      shop_name: employeeToSwitch.shop
    });

    setUserName(employeeToSwitch.name);
    setShopName(employeeToSwitch.shop);
    
    addToast({ type: "info", title: "Przełączono profil", message: `Aktualnie pracujesz jako: ${employeeToSwitch.name}` });
    
    window.dispatchEvent(new CustomEvent('employee_switched', { 
      detail: { 
        employeeId: employeeToSwitch.id,
        employeeName: employeeToSwitch.name,
        shopId: employeeToSwitch.shopId,
        shopName: employeeToSwitch.shop
      } 
    }));
  };

  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shop = getSessionStorageSafe("shopName", null);
    setShopName(shop);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadShopAccessStatus = async () => {
      try {
        console.log('=== ŁADOWANIE STATUSU DOSTĘPU DO SKLEPÓW ===');
        const status = await shopAccessService.getAllShopsStatus();
        console.log('Status sklepów:', status);
        setShopAccessStatus(status);

        const blockedCount = shopAccessService.getBlockedShopsCount();
        if (blockedCount > 0) {
          const blockedInfo = shopAccessService.getBlockedShopsInfo();
          console.log('Zablokowane sklepy:', blockedInfo);
        }
      } catch (error) {
        console.error('Błąd ładowania statusu dostępu do sklepów:', error);
      }
    };

    loadShopAccessStatus();

    const intervalId = setInterval(loadShopAccessStatus, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleAddEmployee = async () => {
    console.log('=== handleAddEmployee START ===');
    console.log('Login:', login);
    console.log('Password:', password);
    console.log('activeEmployeesCount:', activeEmployeesCount);

    if (!login || !password) {
      console.log('BRAK LOGINU LUB HASŁA!');
      addToast({ type: "error", title: "Błąd", message: "Wprowadź login i hasło!" });
      return;
    }

    if (activeEmployeesCount >= 3) {
      addToast({ type: "error", title: "Błąd", message: "Maksymalnie 3 pracowników może być zalogowanych jednocześnie!" });
      return;
    }

    setIsAddingEmployee(true);

    try {
      const user = await usersService.login(login, password);
      console.log('Wynik logowania z bazy:', user);

      if (!user) {
        console.log('BŁĘDNE DANE LOGOWANIA! Nie znaleziono użytkownika w bazie');
        addToast({ type: "error", title: "Błąd logowania", message: "Błędny login lub hasło!" });
        setIsAddingEmployee(false);
        return;
      }

      const userShops = await usersService.getUserShops(user.id);
      console.log('Sklepy użytkownika:', userShops);

      if (!userShops || userShops.length === 0) {
        addToast({ type: "error", title: "Błąd", message: "Użytkownik nie ma przypisanego sklepu!" });
        setIsAddingEmployee(false);
        return;
      }

      const primaryShop = userShops.find(s => s.is_primary) || userShops[0];

      const employeeData: EmployeeData = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        initials: user.initials || `${user.first_name[0]}${user.last_name[0]}`,
        shop: primaryShop.shop_name,
        shopId: primaryShop.shop_id,
        role: user.role
      };

      console.log('Przygotowano employeeData:', employeeData);

      const success = addEmployeeToSession(employeeData);
      console.log('addEmployeeToSession returned:', success);
      console.log('employeeData.name:', employeeData.name);

      if (success) {
        setIsAddEmployeeOpen(false);
        setLogin("");
        setPassword("");
        setShowPassword(false);

        console.log('=== Ustawiam stan Reacta na ===', employeeData.name);
        setUserName(employeeData.name);
        setShopName(employeeData.shop);
        const isOwner = user.role === 'owner' || user.role === 'admin';
        setUserRole(isOwner ? 'owner' : 'employee');

        addToast({
          type: "success",
          title: "Zalogowano ✓",
          message: `${employeeData.name} zalogowany do systemu! (Aktywni pracownicy: ${activeEmployeesCount + 1}/3)`,
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Błąd podczas logowania pracownika:', error);
      addToast({ type: "error", title: "Błąd", message: "Wystąpił błąd podczas logowania!" });
    } finally {
      setIsAddingEmployee(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 py-2 flex items-center justify-between">
      <Link href={isEmployee ? "/pracownik" : "/"} className="flex items-center gap-2">
        <img src="/logo.png" alt="Mobile Hub" className="h-10 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-3">
        {isEmployee && (
          <Button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="h-10 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Zaloguj Kolejnego
            {activeEmployeesCount > 0 && (
              <span className="ml-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                {activeEmployeesCount}/3
              </span>
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none group flex items-center gap-3 bg-accent hover:bg-primary/10 px-4 py-2 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all shadow-sm">
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-black text-foreground leading-none group-hover:text-primary transition-colors uppercase tracking-tight">
                {displayName}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-2.5 w-2.5 text-primary" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {displayRole === "Właściciel" ? "Właściciel" : (shopName || "Kaufland Włocławek")}
                </span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-xl bg-white border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className="h-3 w-3 text-primary/30 group-hover:text-primary/50 transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-primary/5 shadow-2xl rounded-2xl p-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1">
                Profil Użytkownika
              </DropdownMenuLabel>
              <div className="px-2 py-2 mb-2">
                <p className="text-sm font-black text-foreground uppercase tracking-tight">
                  {displayName}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {displayRole}
                </p>
                {activeEmployeesCount > 0 && (
                  <p className="text-[9px] font-semibold text-emerald-600 mt-1">
                    Aktywni: {activeEmployeesCount}/3
                  </p>
                )}
              </div>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="h-px bg-primary/5 my-1" />
            
            <DropdownMenuGroup>
              <DropdownMenuItem variant="default" className="p-0">
                <Link href={isEmployee ? "/pracownik" : "/"} className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                  <span>Pulpit Sterowniczy</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="h-px bg-primary/5 my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem variant="default" className="p-0">
                <Link href="/dokumenty" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  <span>Dokumenty</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem variant="default" className="p-0">
                <Link href="/faktury" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span>Faktury</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem variant="default" className="p-0">
                <Link href="/grafik" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  <span>Grafik Pracy</span>
                </Link>
              </DropdownMenuItem>

              {!isEmployee && (
                <DropdownMenuItem variant="default" className="p-0">
                  <Link href="/sklepy" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                    <Store className="mr-2 h-4 w-4 text-primary" />
                    <span>Zarządzaj Punktami</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="h-px bg-primary/5 my-1" />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" className="p-0">
                <Link href="/login" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-red-50 rounded-xl transition-colors" onClick={() => {
                  if (typeof window !== "undefined") {
                    const userId = sessionStorage.getItem('userId');
                    if (userId) {
                      shopAccessService.unblockAllShopsForUser(userId).catch(console.error);
                    }
                    sessionStorage.removeItem("userRole");
                    sessionStorage.removeItem("userName");
                    sessionStorage.removeItem("userId");
                    sessionStorage.removeItem("userInitials");
                    sessionStorage.removeItem("shopId");
                    sessionStorage.removeItem("shopName");
                    sessionStorage.removeItem("userShop");
                    sessionStorage.removeItem("activeEmployees");
                    sessionStorage.removeItem("selectedEmployeeId");
                    sessionStorage.removeItem("shopAccessStatus");
                    shopAccessService.clearSession();
                  }
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj System</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                Zaloguj Kolejnego Pracownika
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Login
                  </Label>
                  <Input
                    type="text"
                    placeholder="Wprowadź login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="h-12 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium placeholder:text-gray-400 focus:border-emerald-500 focus:shadow-md"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEmployee();
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Hasło
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Wprowadź hasło"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium placeholder:text-gray-400 pr-12 focus:border-emerald-500 focus:shadow-md"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddEmployee();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">
                  <span className="font-semibold">Aktywni pracownicy: </span>
                  <span className="font-bold text-emerald-600">{activeEmployeesCount}/3</span>
                </p>

                {activeEmployeesCount >= 3 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-semibold text-red-700">
                      Maksymalna liczba pracowników osiągnięta (3/3)
                    </p>
                  </div>
                )}

                {activeEmployeesCount > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                    <Label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                      <Users className="h-3.5 w-3.5" />
                      Aktywni Pracownicy ({activeEmployeesCount})
                    </Label>
                    
                    {getActiveEmployees().map((emp: any) => {
                      const isCurrent = sessionStorage.getItem('selectedEmployeeId') === emp.id;
                      console.log('Rendering employee:', emp, 'isCurrent:', isCurrent);
                      return (
                        <div 
                          key={emp.id} 
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                            isCurrent 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : 'bg-white border-gray-200 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black ${
                              isCurrent 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {(emp.initials || emp.name?.split(' ').map((n: string) => n[0]).join('') || '?').substring(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${isCurrent ? 'text-emerald-700' : 'text-foreground'}`}>
                                {emp.name || `Pracownik ${emp.id}`}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                📍 {emp.shop || 'Brak danych'}
                              </p>
                            </div>
                          </div>
                          
                          {getActiveEmployees().length > 1 && (
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSwitchEmployee(emp.id);
                                  }}
                                  className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all"
                                  title={`Przełącz na ${emp.name}`}
                                >
                                  <ArrowRightCircle className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEmployeeToRemove(emp);
                                  setConfirmDialogOpen(true);
                                }}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                title={`Wyloguj ${emp.name}`}
                              >
                                <LogOut className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddEmployeeOpen(false);
                  setLogin("");
                  setPassword("");
                  setShowPassword(false);
                }}
                className="rounded-xl"
              >
                Anuluj
              </Button>
              <Button
                onClick={handleAddEmployee}
                disabled={!login || !password || activeEmployeesCount >= 3 || isAddingEmployee}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                {isAddingEmployee ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Logowanie...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Zaloguj Pracownika
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[400px] bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900">
                    Potwierdź wylogowanie
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    Czy na pewno chcesz wylogować:
                  </p>
                  <p className="text-base font-bold text-red-600">
                    {employeeToRemove?.name || 'tego pracownika'}?
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmDialogOpen(false);
                    setEmployeeToRemove(null);
                  }}
                  className="flex-1 h-11 rounded-xl font-bold text-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={() => {
                    if (employeeToRemove) {
                      handleRemoveEmployee(employeeToRemove.id);
                    }
                    setConfirmDialogOpen(false);
                    setEmployeeToRemove(null);
                  }}
                  className="flex-1 h-11 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Tak, wyloguj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}