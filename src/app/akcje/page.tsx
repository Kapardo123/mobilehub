"use client"

export const dynamic = 'force-dynamic';

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, User, Store, Clock, ShoppingCart, Package, Wrench, Settings, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSessionStorageSafe } from "@/lib/storage";
import { auditService } from "@/lib/supabase/actions";
import { shopsService } from "@/lib/supabase/shops";
import type { Action } from "@/lib/supabase/actions";

export { Action };
export async function addAction(action: Omit<import('@/lib/supabase').Database['public']['Tables']['audit_log']['Insert'], 'id' | 'created_at'>): Promise<import('@/lib/supabase').Database['public']['Tables']['audit_log']['Row']> {
  return await auditService.addAction(action);
}

export async function getActions(): Promise<Action[]> {
  return await auditService.getAll(50);
}

export default function AkcjePage() {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShop, setFilterShop] = useState<string>("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<{id: string; name: string}[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const currentUserRole = isMounted ? getSessionStorageSafe("userRole", "") : "";
  const currentShopId = isMounted ? getSessionStorageSafe("shopId", "") : "";
  const currentShopName = isMounted ? getSessionStorageSafe("shopName", "") : "";
  const isEmployee = currentUserRole === 'employee';

  useEffect(() => {
    if (typeof window !== "undefined") setIsMounted(true);
    loadShops();
    loadActions();
  }, []);

  const loadShops = async () => {
    try {
      const shopsData = await shopsService.getAll();
      setShops([
        { id: "all", name: "Wszystkie sklepy" },
        ...shopsData.map(shop => ({ id: shop.id, name: shop.name }))
      ]);
      console.log('Pobrano sklepy w akcjach:', shopsData.length);
    } catch (error) {
      console.error('Błąd podczas pobierania sklepów:', error);
      setShops([{ id: "all", name: "Wszystkie sklepy" }]);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
      return;
    }
  }, [router]);

  const loadActions = async () => {
    try {
      setIsLoading(true);
      const data = await auditService.getAll(100);
      
      console.log('📥 Otrzymano', data.length, 'akcji z auditService');
      if (data.length > 0) {
        console.log('🔍 Pierwsza akcja przed mapowaniem:', JSON.stringify(data[0], null, 2));
      }
      
      const mappedActions = data.map(log => {
        const mapped = ({
          ...log,
          employeeName: log.actor_name || 'Nieznany użytkownik',
          shopName: log.shop_name || 'Nieznany sklep',
          employeeId: log.actor_id || '',
          shopId: log.shop_id || '',
          timestamp: log.created_at,
          description: log.description,
          details: log.details,
          type: log.action_type as Action['type']
        });
        
        if (data.indexOf(log) === 0) {
          console.log('🎯 Pierwsza akcja PO mapowaniu:', {
            actor_name: log.actor_name,
            shop_name: log.shop_name,
            employeeName: mapped.employeeName,
            shopName: mapped.shopName
          });
        }
        
        return mapped;
      });
      
      console.log('✅ Ustawiam', mappedActions.length, 'akcji');
      setActions(mappedActions);
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shopsList = useMemo(() => shops, [shops]);

  const employees = useMemo(() => [
    { id: "all", name: "Wszyscy pracownicy" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "Piotr Zakrzewski (Właściciel)" },
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Jan Kowalski" },
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "Kamil Nowicki" },
    { id: "550e8400-e29b-41d4-a716-446655440004", name: "Anna Nowak" },
  ], []);

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      const matchesSearch = !searchQuery ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.shopName?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesShop = true;
      if (isEmployee && currentShopId) {
        matchesShop = action.shopId === currentShopId || action.shop_id === currentShopId;
      } else {
        matchesShop = filterShop === "all" || action.shopId === filterShop;
      }
      
      const matchesEmployee = filterEmployee === "all" || action.employeeId === filterEmployee;
      const matchesType = filterType === "all" || action.type === filterType;

      return matchesSearch && matchesShop && matchesEmployee && matchesType;
    });
  }, [actions, searchQuery, filterShop, filterEmployee, filterType, isEmployee, currentShopId]);

  const clearFilters = () => {
    setFilterShop("all");
    setFilterEmployee("all");
    setFilterType("all");
    setSearchQuery("");
  };

  const hasActiveFilters = filterShop !== "all" || filterEmployee !== "all" || filterType !== "all" || searchQuery;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-accent/20">
        <Navbar />
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">Ładowanie akcji...</p>
          </div>
        </main>
      </div>
    );
  }

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
          
          {!isEmployee && (
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
          )}
        </div>

        {isEmployee && currentShopName && (
          <div className="bg-accent/30 border-none h-10 rounded-xl flex items-center gap-2 px-4">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-bold text-xs uppercase text-primary">{currentShopName}</span>
            <Badge variant="secondary" className="text-[10px]">Tylko Twój sklep</Badge>
          </div>
        )}

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
                  <UISelect value={filterShop} onValueChange={setFilterShop}>
                    <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                      <Store className="h-4 w-4 mr-2 text-primary" />
                      <UISelectValue placeholder="Wybierz sklep" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-xl">
                      {shopsList.map(shop => (
                        <UISelectItem key={shop.id} value={shop.id}>{shop.name}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Pracownik</Label>
                  <UISelect value={filterEmployee} onValueChange={setFilterEmployee}>
                    <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <UISelectValue placeholder="Wybierz pracownika" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-xl">
                      {employees.map(emp => (
                        <UISelectItem key={emp.id} value={emp.id}>{emp.name}</UISelectItem>
                      ))}
                    </UISelectContent>
                  </UISelect>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Typ akcji</Label>
                  <UISelect value={filterType} onValueChange={setFilterType}>
                    <UISelectTrigger className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <UISelectValue placeholder="Wybierz typ" />
                    </UISelectTrigger>
                    <UISelectContent className="rounded-xl">
                      <UISelectItem value="all">Wszystkie typy</UISelectItem>
                      <UISelectItem value="sprzedaz">Sprzedaż</UISelectItem>
                      <UISelectItem value="koszt">Koszt</UISelectItem>
                      <UISelectItem value="logowanie">Logowanie</UISelectItem>
                      <UISelectItem value="przyjecie">Przyjęcie</UISelectItem>
                      <UISelectItem value="serwis">Serwis</UISelectItem>
                      <UISelectItem value="edycja">Edycja</UISelectItem>
                      <UISelectItem value="inna">Inna</UISelectItem>
                    </UISelectContent>
                  </UISelect>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full rounded-xl font-bold text-xs uppercase text-muted-foreground"
                  >
                    Wyczyść filtry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {filteredActions.length === 0 ? (
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl p-8">
              <div className="text-center space-y-3">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  Brak akcji
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {hasActiveFilters ? 'Brak wyników dla wybranych filtrów' : 'Nie odnotowano jeszcze żadnych akcji'}
                </p>
              </div>
            </Card>
          ) : (
            filteredActions.map((action) => {
              const config = actionTypes[(action.type || 'inna') as keyof typeof actionTypes] || actionTypes.inna;
              const IconComponent = config.icon;
              
              return (
                <Card key={action.id} className={cn("border-none shadow-sm rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md", config.bgColor)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm leading-tight line-clamp-2">
                            {action.description}
                          </p>
                          <Badge variant="secondary" className={cn("shrink-0 text-[9px] font-black px-2 py-0.5 rounded-lg", config.color)}>
                            {config.label}
                          </Badge>
                        </div>
                        
                        {action.details && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {action.details}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {action.employeeName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {action.shopName}
                          </span>
                          <span>{action.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredActions.length > 0 && (
          <div className="text-center pb-8">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Pokazano {filteredActions.length} z {actions.length} akcji
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

const actionTypes = {
  sprzedaz: { label: "Sprzedaż", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-700", bgColor: "bg-emerald-50" },
  przyjecie: { label: "Przyjęcie", icon: Package, color: "bg-blue-100 text-blue-700", bgColor: "bg-blue-50" },
  serwis: { label: "Serwis", icon: Wrench, color: "bg-amber-100 text-amber-700", bgColor: "bg-amber-50" },
  edycja: { label: "Edycja", icon: Settings, color: "bg-purple-100 text-purple-700", bgColor: "bg-purple-50" },
  logowanie: { label: "Logowanie", icon: User, color: "bg-gray-100 text-gray-700", bgColor: "bg-gray-50" },
  inna: { label: "Inna", icon: Clock, color: "bg-primary/10 text-primary", bgColor: "bg-primary/5" },
  koszt: { label: "Koszt", icon: DollarSign, color: "bg-red-100 text-red-700", bgColor: "bg-red-50" },
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

function UISelect({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase px-4 appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

function UISelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function UISelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}

function UISelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function UISelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  return <option value={value}>{children}</option>;
}
