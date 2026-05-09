"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Settings, MapPin, ChevronRight, RefreshCw, Key, Eye, EyeOff, Trash2, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

export default function PracownicyPage() {
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
    { id: "2", name: "Jan Kowalski", role: "Pracownik", initials: "JK", shops: ["Trzy Stawy"], status: "W pracy", login: "jan.k", password: "PIN 654321" },
    { id: "3", name: "Anna Nowak", role: "Pracownik", initials: "AN", shops: ["Galeria Katowicka", "Silesia City Center"], status: "Offline", login: "anna.n", password: "PIN 112233" },
  ]);

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
      id: Math.random().toString(36).substr(2, 9),
      name: newEmployee.name,
      role: newEmployee.role.charAt(0).toUpperCase() + newEmployee.role.slice(1),
      initials: newEmployee.name.split(" ").map(n => n[0]).join("").toUpperCase(),
      shops: [shopLabel],
      status: "Offline",
      login: newEmployee.login,
      password: `PIN ${newEmployee.password}`
    };

    setEmployees([...employees, employee]);
    setShowCredentialsFor(employee);
    setNewEmployee({ name: "", role: "pracownik", login: "", password: "" });
    setIsAddDialogOpen(false);
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
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
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => selectedShop ? setSelectedShop(null) : window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {selectedShop ? shops.find(s => s.id === selectedShop)?.label : "Wybierz Punkt"}
            </h1>
          </div>
          
          {selectedShop && (
            <>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger 
                  render={
                    <div className={cn(buttonVariants({ variant: "default", size: "default" }), "bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-100 h-10 px-4 text-xs cursor-pointer text-white")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Dodaj
                    </div>
                  }
                />
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-none">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900">Nowy Pracownik</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Imię i Nazwisko</Label>
                      <Input 
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        placeholder="np. Marek Nowak" 
                        className="h-12 bg-slate-50 border-none rounded-xl font-bold" 
                      />
                    </div>

                    <div className="grid gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Dane logowania</Label>
                        <Button 
                          onClick={generateCredentials}
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[9px] font-black uppercase text-blue-600 hover:bg-blue-100 rounded-lg gap-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Generuj
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <Label className="text-[9px] font-bold text-slate-400 mb-1 ml-1 block">Login</Label>
                          <div className="relative">
                            <Input 
                              value={newEmployee.login}
                              readOnly
                              className="h-10 bg-white border-none rounded-xl pr-10 font-mono text-xs" 
                            />
                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                          </div>
                        </div>

                        <div className="relative">
                          <Label className="text-[9px] font-bold text-slate-400 mb-1 ml-1 block">Hasło (PIN)</Label>
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
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-300 hover:text-slate-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rola</Label>
                      <UISelect 
                        value={newEmployee.role}
                        onValueChange={(val) => val && setNewEmployee({ ...newEmployee, role: val })}
                      >
                        <UISelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-700">
                          <UISelectValue placeholder="Wybierz rolę" />
                        </UISelectTrigger>
                        <UISelectContent className="rounded-2xl">
                          <UISelectItem value="pracownik">Pracownik</UISelectItem>
                          <UISelectItem value="kierownik">Kierownik</UISelectItem>
                          <UISelectItem value="wlasciciel">Właściciel</UISelectItem>
                        </UISelectContent>
                      </UISelect>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddEmployee}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm uppercase tracking-widest"
                    >
                      Zapisz Pracownika
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={!!showCredentialsFor} onOpenChange={(open) => !open && setShowCredentialsFor(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none p-0 overflow-hidden">
                  <div className="bg-blue-600 p-8 text-white text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-1">Dane Logowania</h2>
                    <p className="text-blue-100 text-sm font-medium">{showCredentialsFor?.name}</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Login do systemu</Label>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg text-slate-700">{showCredentialsFor?.login}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600" onClick={() => navigator.clipboard.writeText(showCredentialsFor?.login)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hasło / PIN</Label>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg text-slate-700">{showCredentialsFor?.password}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600" onClick={() => navigator.clipboard.writeText(showCredentialsFor?.password)}>
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowCredentialsFor(null)}
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm uppercase tracking-widest"
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
                className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all cursor-pointer rounded-3xl"
                onClick={() => setSelectedShop(shop.id)}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg">{shop.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {shop.count} Pracowników
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Employee List View for Selected Shop */
          <div className="grid gap-4">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, idx) => (
                <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-3xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-slate-100">
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-sm">{emp.initials}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          emp.status === 'W pracy' ? 'bg-emerald-500' : 
                          emp.status === 'Online' ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
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
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
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
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Brak pracowników w tym punkcie</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
