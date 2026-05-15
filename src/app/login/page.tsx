"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addAction } from "@/app/akcje/page";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login.toLowerCase() === "pracownik") {
      sessionStorage.setItem("userRole", JSON.stringify("employee"));
      sessionStorage.setItem("userName", JSON.stringify("Jan Kowalski"));
      sessionStorage.setItem("userId", JSON.stringify("2"));
      sessionStorage.setItem("shopName", JSON.stringify("Trzy Stawy"));
      sessionStorage.setItem("shopId", JSON.stringify("1"));
      
      addAction({
        type: "logowanie",
        description: "Logowanie do systemu",
        employeeName: "Jan Kowalski",
        employeeId: "2",
        shopName: "Trzy Stawy",
        shopId: "1"
      });
      
      router.push("/pracownik");
    } else if (login.toLowerCase() === "wlasciciel" || login.toLowerCase() === "właściciel") {
      sessionStorage.setItem("userRole", JSON.stringify("owner"));
      sessionStorage.setItem("userName", JSON.stringify("Piotr Zakrzewski"));
      sessionStorage.setItem("userId", JSON.stringify("1"));
      sessionStorage.setItem("shopName", JSON.stringify("Silesia City Center"));
      sessionStorage.setItem("shopId", JSON.stringify("3"));
      
      addAction({
        type: "logowanie",
        description: "Logowanie do systemu",
        employeeName: "Piotr Zakrzewski",
        employeeId: "1",
        shopName: "Silesia City Center",
        shopId: "3"
      });
      
      router.push("/");
    } else {
      alert("Błędny login. Użyj 'pracownik' lub 'wlasciciel'.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src="/logo.png" alt="Mobile Hub" className="h-16 w-auto mx-auto object-contain" />
          <p className="text-muted-foreground font-medium">Zaloguj się do systemu zarządzania</p>
        </div>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden border border-primary/5">
          <CardHeader className="space-y-1 pt-8 px-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Logowanie</CardTitle>
            <CardDescription className="text-xs font-medium">
              Wprowadź swoje dane, aby uzyskać dostęp do panelu
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-6 p-8">
              <div className="grid gap-2">
                <Label htmlFor="login" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Login</Label>
                <Input 
                  id="login" 
                  type="text" 
                  placeholder="pracownik lub wlasciciel" 
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="h-12 bg-accent/30 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hasło</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  defaultValue="123456"
                  className="h-12 bg-accent/30 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>
              <Button type="submit" className="h-12 bg-primary hover:bg-primary/90 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95">
                Zaloguj się
              </Button>
            </CardContent>
          </form>
          <CardFooter className="bg-accent/10 border-t border-primary/5 p-6 justify-center">
            <p className="text-xs text-muted-foreground font-medium text-center">
              Wpisz <span className="text-primary font-bold">pracownik</span> lub <span className="text-primary font-bold">wlasciciel</span>, aby przetestować system
            </p>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
            © 2026 MOBILEHUB Management System
          </p>
        </div>
      </div>
    </div>
  );
}
