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

const AVAILABLE_EMPLOYEES = [
  { id: "3", name: "Kamil Nowicki", initials: "KN", shop: "Kaufland Włocławek", shopId: "1" },
  { id: "4", name: "Anna Nowak", initials: "AN", shop: "Kaufland Włocławek", shopId: "1" }
];

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
        }
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
  }, [isAddEmployeeOpen]);

  const isEmployee = userRole === "employee" || pathname === "/pracownik";
  const displayName = userName || (isEmployee ? "Jan Kowalski" : "Piotr Zakrzewski");
  const displayRole = userRole === "employee" ? "Pracownik" : (userRole === "owner" ? "Właściciel" : (isEmployee ? "Pracownik" : "Właściciel"));

  const getActiveEmployees = () => {
    if (typeof window === 'undefined') return [];
    const active = sessionStorage.getItem('activeEmployees');
    return active ? JSON.parse(active) : [];
  };

  const addEmployeeToSession = (employee: typeof AVAILABLE_EMPLOYEES[0]) => {
    const active = getActiveEmployees();
    const exists = active.find((e: any) => e.id === employee.id);
    if (!exists) {
      if (active.length >= 3) {
        addToast({ type: "error", title: "Błąd", message: "Maksymalnie 3 pracowników może być zalogowanych jednocześnie!" });
        return false;
      }
      
      if (active.length > 0) {
        const firstShopId = active[0].shopId;
        if (employee.shopId !== firstShopId) {
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
    }
    sessionStorage.setItem('selectedEmployeeId', employee.id);
    
    addAction({
      type: "logowanie",
      description: `Dodanie pracownika do sesji - ${employee.name}`,
      employeeName: employee.name,
      employeeId: employee.id,
      shopName: employee.shop,
      shopId: employee.shopId
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
      sessionStorage.setItem('selectedEmployeeId', updatedEmployees[0].id);
    }

    setActiveEmployeesCount(updatedEmployees.length);

    addAction({
      type: "inna",
      description: `Wylogowano pracownika z sesji - ${employeeToRemove.name}`,
      employeeName: employeeToRemove.name,
      employeeId: employeeToRemove.id,
      shopName: employeeToRemove.shop,
      shopId: employeeToRemove.shopId
    });

    addToast({ type: "success", title: "Wylogowano", message: `${employeeToRemove.name} został wylogowany z sesji! (Pozostało: ${updatedEmployees.length}/3)` });
  };

  const handleSwitchEmployee = (employeeId: string) => {
    if (sessionStorage.getItem('selectedEmployeeId') === employeeId) return;

    const employeeToSwitch = getActiveEmployees().find((e: any) => e.id === employeeId);
    if (!employeeToSwitch) return;

    sessionStorage.setItem('selectedEmployeeId', employeeId);

    addAction({
      type: "inna",
      description: `Przełączono profil na - ${employeeToSwitch.name}`,
      employeeName: employeeToSwitch.name,
      employeeId: employeeToSwitch.id,
      shopName: employeeToSwitch.shop,
      shopId: employeeToSwitch.shopId
    });

    setUserName(employeeToSwitch.name);
    setShopName(employeeToSwitch.shop);
    
    addToast({ type: "info", title: "Przełączono profil", message: `Aktualnie pracujesz jako: ${employeeToSwitch.name}` });
  };

  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shop = getSessionStorageSafe("shopName", null);
    setShopName(shop);
  }, []);

  const handleAddEmployee = () => {
    if (!login || !password) {
      addToast({ type: "error", title: "Błąd", message: "Wprowadź login i hasło!" });
      return;
    }

    let employeeData: typeof AVAILABLE_EMPLOYEES[0] | null = null;

    if (login.toLowerCase() === "pracownik" && password === "mobilehub") {
      employeeData = {
        id: "1",
        name: "Jan Kowalski",
        initials: "JK",
        shop: "Kaufland Włocławek",
        shopId: "1"
      };
    } else if (login.toLowerCase() === "kamil" && password === "nowicki") {
      employeeData = AVAILABLE_EMPLOYEES[0];
    } else if (login.toLowerCase() === "anna" && password === "nowak") {
      employeeData = AVAILABLE_EMPLOYEES[1];
    }

    if (!employeeData) {
      addToast({ type: "error", title: "Błąd logowania", message: "Błędny login lub hasło!" });
      return;
    }

    const success = addEmployeeToSession(employeeData);
    if (success) {
      setIsAddEmployeeOpen(false);
      setLogin("");
      setPassword("");
      setShowPassword(false);
      addToast({ 
        type: "success", 
        title: "Zalogowano ✓", 
        message: `${employeeData.name} zalogowany do systemu! (Aktywni pracownicy: ${activeEmployeesCount + 1}/3)`,
        duration: 4000
      });
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
                <Link href="/dokumenty" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  <span>Dokumenty</span>
                </Link>
              </DropdownMenuItem>

              {!isEmployee && (
                <DropdownMenuItem variant="default" className="p-0">
                  <Link href="/faktury" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    <span>Faktury</span>
                  </Link>
                </DropdownMenuItem>
              )}

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
                    sessionStorage.removeItem("userRole");
                    sessionStorage.removeItem("userName");
                    sessionStorage.removeItem("userShop");
                    sessionStorage.removeItem("activeEmployees");
                    sessionStorage.removeItem("selectedEmployeeId");
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
                disabled={!login || !password || activeEmployeesCount >= 3}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Zaloguj Pracownika
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