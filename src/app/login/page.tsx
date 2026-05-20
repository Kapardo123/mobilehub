"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addAction } from "@/app/akcje/page";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login.toLowerCase() === "wlasciciel" && password === "admin") {
      sessionStorage.setItem("userRole", JSON.stringify("owner"));
      sessionStorage.setItem("userName", JSON.stringify("Piotr Zakrzewski"));
      sessionStorage.setItem("userId", JSON.stringify("0"));
      sessionStorage.setItem("shopName", JSON.stringify("Dominikańska Wrocław"));
      sessionStorage.setItem("shopId", JSON.stringify("3"));
      
      addAction({
        type: "logowanie",
        description: "Logowanie do systemu (Właściciel)",
        employeeName: "Piotr Zakrzewski",
        employeeId: "0",
        shopName: "Dominikańska Wrocław",
        shopId: "3"
      });
      
      router.push("/");
    } else if (login.toLowerCase() === "pracownik" && password === "mobilehub") {
      sessionStorage.setItem("userRole", JSON.stringify("employee"));
      sessionStorage.setItem("userName", JSON.stringify("Jan Kowalski"));
      sessionStorage.setItem("userId", JSON.stringify("1"));
      sessionStorage.setItem("userInitials", JSON.stringify("JK"));
      sessionStorage.setItem("shopName", JSON.stringify("Kaufland Włocławek"));
      sessionStorage.setItem("shopId", JSON.stringify("1"));
      
      const firstEmployee = {
        id: "1",
        name: "Jan Kowalski",
        initials: "JK",
        shop: "Kaufland Włocławek",
        shopId: "1"
      };
      
      const existingActive = sessionStorage.getItem('activeEmployees');
      if (!existingActive) {
        sessionStorage.setItem('activeEmployees', JSON.stringify([firstEmployee]));
      }
      sessionStorage.setItem('selectedEmployeeId', "1");
      
      addAction({
        type: "logowanie",
        description: "Logowanie do systemu (Pracownik)",
        employeeName: "Jan Kowalski",
        employeeId: "1",
        shopName: "Kaufland Włocławek",
        shopId: "1"
      });
      
      router.push("/pracownik");
    } else {
      alert("Błędny login lub hasło!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-3">
          <img src="/logo.png" alt="Mobile Hub" className="h-20 w-auto mx-auto object-contain drop-shadow-lg" />
          <p className="text-muted-foreground font-medium text-base">Zaloguj się do systemu zarządzania</p>
        </div>

        <Card className="border-none shadow-xl bg-white rounded-[1.5rem] overflow-hidden border border-gray-200/60">
          <CardHeader className="space-y-1 pt-8 px-8 pb-0">
            <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">Logowanie</CardTitle>
            <CardDescription className="text-sm font-normal text-muted-foreground">
              Wprowadź swoje dane logowania
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 p-8 pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2 group">
                <Label htmlFor="login" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5" />
                  Login
                </Label>
                <Input 
                  id="login" 
                  type="text" 
                  placeholder="Wprowadź login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className={`h-12 bg-gray-50 border-2 rounded-xl text-sm font-medium placeholder:text-gray-400 transition-all duration-200 ${
                    isFocused ? 'border-primary shadow-md shadow-primary/10' : 'border-transparent hover:border-gray-200'
                  }`}
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Hasło
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Wprowadź hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`h-12 bg-gray-50 border-2 rounded-xl text-sm font-medium placeholder:text-gray-400 pr-12 transition-all duration-200 ${
                      isFocused ? 'border-primary shadow-md shadow-primary/10' : 'border-transparent hover:border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg shadow-primary/15 transition-all duration-200 active:scale-[0.98]"
              >
                <Lock className="h-4 w-4 mr-2" />
                Zaloguj się
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Dane testowe:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <p className="font-bold text-primary">Właściciel</p>
                    <p className="text-muted-foreground text-[10px] mt-1">
                      Login: <span className="font-mono font-semibold">wlasciciel</span>
                    </p>
                    <p className="text-muted-foreground text-[10px]">
                      Hasło: <span className="font-mono font-semibold">admin</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <p className="font-bold text-emerald-600">Pracownicy</p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-muted-foreground text-[9px]">
                        <span className="font-mono font-semibold">pracownik</span> / <span className="font-mono font-semibold">mobilehub</span> (JK)
                      </p>
                      <p className="text-muted-foreground text-[9px]">
                        <span className="font-mono font-semibold">tomasz</span> / <span className="font-mono font-semibold">lewandowski</span> (TL)
                      </p>
                      <p className="text-muted-foreground text-[9px]">
                        <span className="font-mono font-semibold">marta</span> / <span className="font-mono font-semibold">kowalczyk</span> (MK)
                      </p>
                      <p className="text-muted-foreground text-[9px]">
                        <span className="font-mono font-semibold">kamil</span> / <span className="font-mono font-semibold">nowicki</span> (KN)
                      </p>
                      <p className="text-muted-foreground text-[9px]">
                        <span className="font-mono font-semibold">anna</span> / <span className="font-mono font-semibold">nowak</span> (AN)
                      </p>
                      <p className="text-muted-foreground text-[9px]">
                        <span className="font-mono font-semibold">pawel</span> / <span className="font-mono font-semibold">wisniewski</span> (PW)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-2">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            © 2026 MOBILEHUB Management System
          </p>
        </div>
      </div>
    </div>
  );
}