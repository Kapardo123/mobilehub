"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addAction } from "@/app/akcje/page";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login.toLowerCase() === "pracownik") {
      sessionStorage.setItem("userRole", JSON.stringify("employee"));
      sessionStorage.setItem("userName", JSON.stringify("Jan Kowalski"));
      sessionStorage.setItem("userId", JSON.stringify("2"));
      sessionStorage.setItem("shopName", JSON.stringify("Kaufland Włocławek"));
      sessionStorage.setItem("shopId", JSON.stringify("1"));
      
      addAction({
        type: "logowanie",
        description: "Logowanie do systemu",
        employeeName: "Jan Kowalski",
        employeeId: "2",
        shopName: "Kaufland Włocławek",
        shopId: "1"
      });
      
      router.push("/pracownik");
    } else if (login.toLowerCase() === "wlasciciel" || login.toLowerCase() === "właściciel") {
      sessionStorage.setItem("userRole", JSON.stringify("owner"));
      sessionStorage.setItem("userName", JSON.stringify("Piotr Zakrzewski"));
      sessionStorage.setItem("userId", JSON.stringify("1"));
      sessionStorage.setItem("shopName", JSON.stringify("Dominikańska Wrocław"));
      sessionStorage.setItem("shopId", JSON.stringify("3"));
      
      addAction({
        type: "logowanie",
        description: "Logowanie do systemu",
        employeeName: "Piotr Zakrzewski",
        employeeId: "1",
        shopName: "Dominikańska Wrocław",
        shopId: "3"
      });
      
      router.push("/");
    } else {
      alert("Błędny login. Użyj 'pracownik' lub 'wlasciciel'.");
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
              Wprowadź swoje dane, aby uzyskać dostęp
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-5 p-8 pt-6">
              <div className="space-y-2 group">
                <Label htmlFor="login" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5" />
                  Login
                </Label>
                <div className="relative">
                  <Input 
                    id="login" 
                    type="text" 
                    placeholder="pracownik lub wlasciciel" 
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`h-12 bg-gray-50 border-2 rounded-xl text-sm font-medium placeholder:text-gray-400 transition-all duration-200 ${
                      isFocused ? 'border-primary shadow-md shadow-primary/10' : 'border-transparent hover:border-gray-200'
                    }`}
                  />
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Hasło
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  defaultValue="123456"
                  className="h-12 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium placeholder:text-gray-400 focus:border-primary focus:shadow-md focus:shadow-primary/10 hover:border-gray-200 transition-all duration-200"
                />
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full bg-primary hover:bg-primary/90 rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-200 active:scale-[0.98] mt-2"
              >
                <span className="flex items-center justify-center gap-2">
                  Zaloguj się
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </CardContent>
          </form>

          <CardFooter className="bg-gray-50/80 border-t border-gray-100 p-5 justify-center">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Wpisz <span className="text-primary font-semibold">pracownik</span> lub <span className="text-primary font-semibold">wlasciciel</span>, aby przetestować system
            </p>
          </CardFooter>
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
