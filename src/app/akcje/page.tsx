"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, User, Store, Clock, ShoppingCart, Package, Wrench, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import { 
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Action {
  id: string;
  type: "sprzedaz" | "przyjecie" | "serwis" | "edycja" | "logowanie" | "inna";
  description: string;
  employeeName: string;
  employeeId: string;
  shopName: string;
  shopId: string;
  timestamp: string;
  details?: string;
}

const actionTypes = {
  sprzedaz: { label: "Sprzedaż", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-700", bgColor: "bg-emerald-50" },
  przyjecie: { label: "Przyjęcie", icon: Package, color: "bg-blue-100 text-blue-700", bgColor: "bg-blue-50" },
  serwis: { label: "Serwis", icon: Wrench, color: "bg-amber-100 text-amber-700", bgColor: "bg-amber-50" },
  edycja: { label: "Edycja", icon: Settings, color: "bg-purple-100 text-purple-700", bgColor: "bg-purple-50" },
  logowanie: { label: "Logowanie", icon: User, color: "bg-gray-100 text-gray-700", bgColor: "bg-gray-50" },
  inna: { label: "Inna", icon: Clock, color: "bg-primary/10 text-primary", bgColor: "bg-primary/5" },
};

const defaultActions: Action[] = [];

export function addAction(action: Omit<Action, "id" | "timestamp">) {
  const newAction: Action = {
    ...action,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString().replace("T", " ").substr(0, 19),
  };
  
  if (typeof window !== "undefined") {
    const actions = getLocalStorageSafe('system_actions', defaultActions);
    actions.unshift(newAction);
    localStorage.setItem('system_actions', JSON.stringify(actions));
    window.dispatchEvent(new CustomEvent('action_added', { detail: newAction }));
  }
  
  return newAction;
}

export function getActions(): Action[] {
  if (typeof window === "undefined") return defaultActions;
  const saved = localStorage.getItem('system_actions');
  return saved ? JSON.parse(saved) : defaultActions;
}

export default function AkcjePage() {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShop, setFilterShop] = useState<string | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
      return;
    }
    setUserRole(role);
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setActions(getActions());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleActionAdded = (e: CustomEvent<Action>) => {
      setActions(prev => [e.detail, ...prev]);
    };
    window.addEventListener('action_added', handleActionAdded as EventListener);
    return () => window.removeEventListener('action_added', handleActionAdded as EventListener);
  }, []);

  const shops = useMemo(() => {
    if (typeof window === "undefined") return [];
    const savedShops = getLocalStorageSafe('shops', []);
    return savedShops.length > 0 ? savedShops : [
      { id: "1", name: "Trzy Stawy" },
      { id: "2", name: "Galeria Katowicka" },
      { id: "3", name: "Silesia City Center" },
    ];
  }, [actions]);

  const employees = useMemo(() => {
    if (typeof window === "undefined") return [];
    const savedEmployees = getLocalStorageSafe('employees', []);
    return savedEmployees.length > 0 ? savedEmployees : [
      { id: "1", name: "Piotr Zakrzewski" },
      { id: "2", name: "Jan Kowalski" },
      { id: "3", name: "Anna Nowak" },
    ];
  }, [actions]);

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      const matchesSearch = !searchQuery || 
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.shopName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesShop = !filterShop || action.shopId === filterShop;
      const matchesEmployee = !filterEmployee || action.employeeId === filterEmployee;
      const matchesType = !filterType || action.type === filterType;
      
      return matchesSearch && matchesShop && matchesEmployee && matchesType;
    });
  }, [actions, searchQuery, filterShop, filterEmployee, filterType]);

  const clearFilters = () => {
    setFilterShop(null);
    setFilterEmployee(null);
    setFilterType(null);
    setSearchQuery("");
  };

  const hasActiveFilters = filterShop || filterEmployee || filterType || searchQuery;

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
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
              Ostatnie Akcje
            </h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "rounded-xl font-bold text-xs uppercase",
              showFilters && "bg-primary text-white"
            )}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtry
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-white border-none shadow-sm h-12 rounded-2xl font-bold text-xs uppercase" 
            placeholder="Szukaj akcji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showFilters && (
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Sklep</Label>
                  <UISelect value={filterShop || "all"} onValueChange={(val) => setFilterShop(val === "all" ? null : val)} items={[{ value: "all", label: "Wszystkie sklepy" }, ...shops.map((shop: { id: string; name: string }) => ({ value: shop.id, label: shop.name }))]}>
                    <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                      <Store className="h-4 w-4 mr-2 text-primary" />
                      <UISelectValue placeholder="Wszystkie sklepy" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-xl">
                      <UISelectItem value="all" className="font-bold text-xs uppercase">Wszystkie sklepy</UISelectItem>
                      {shops.map((shop: { id: string; name: string }) => (
                        <UISelectItem key={shop.id} value={shop.id} className="font-bold text-xs uppercase">{shop.name}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Pracownik</Label>
                  <UISelect value={filterEmployee || "all"} onValueChange={(val) => setFilterEmployee(val === "all" ? null : val)} items={[{ value: "all", label: "Wszyscy pracownicy" }, ...employees.map((emp: { id: string; name: string }) => ({ value: emp.id, label: emp.name }))]}>
                    <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <UISelectValue placeholder="Wszyscy pracownicy" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-xl">
                      <UISelectItem value="all" className="font-bold text-xs uppercase">Wszyscy pracownicy</UISelectItem>
                      {employees.map((emp: { id: string; name: string }) => (
                        <UISelectItem key={emp.id} value={emp.id} className="font-bold text-xs uppercase">{emp.name}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Typ akcji</Label>
                  <UISelect value={filterType || "all"} onValueChange={(val) => setFilterType(val === "all" ? null : val)} items={[{ value: "all", label: "Wszystkie typy" }, ...Object.entries(actionTypes).map(([key, val]) => ({ value: key, label: val.label }))]}>
                    <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <UISelectValue placeholder="Wszystkie typy" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-xl">
                      <UISelectItem value="all" className="font-bold text-xs uppercase">Wszystkie typy</UISelectItem>
                      {Object.entries(actionTypes).map(([key, val]) => (
                        <UISelectItem key={key} value={key} className="font-bold text-xs uppercase">{val.label}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full h-10 text-xs font-bold uppercase text-muted-foreground hover:text-primary"
                >
                  Wyczyść filtry
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => {
              const ActionType = actionTypes[action.type];
              return (
                <Card 
                  key={action.id} 
                  className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all rounded-2xl"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        ActionType.bgColor
                      )}>
                        <ActionType.icon className={cn("h-5 w-5", ActionType.color.split(" ")[1])} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-foreground uppercase tracking-tight">{action.description}</p>
                            {action.details && (
                              <p className="text-xs text-muted-foreground mt-1">{action.details}</p>
                            )}
                          </div>
                          <Badge className={cn("flex-shrink-0 font-black text-[9px] uppercase tracking-widest", ActionType.color)}>
                            {ActionType.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 font-bold uppercase tracking-widest">
                            <User className="h-3 w-3" />
                            {action.employeeName}
                          </span>
                          <span className="flex items-center gap-1 font-bold uppercase tracking-widest">
                            <Store className="h-3 w-3" />
                            {action.shopName}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                          {action.timestamp}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                <p className="font-black text-foreground uppercase tracking-tight">Brak akcji</p>
                <p className="text-xs text-muted-foreground mt-1">Nie znaleziono akcji spełniających kryteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}