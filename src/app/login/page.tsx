"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login.toLowerCase() === "pracownik") {
      router.push("/pracownik");
    } else if (login.toLowerCase() === "wlasciciel" || login.toLowerCase() === "właściciel") {
      router.push("/");
    } else {
      alert("Błędny login. Użyj 'pracownik' lub 'wlasciciel'.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-4">
            <Smartphone className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">MOBILE<span className="text-blue-600 italic">HUB</span></h1>
          <p className="text-slate-500 font-medium">Zaloguj się do systemu zarządzania</p>
        </div>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pt-8 px-8">
            <CardTitle className="text-xl font-bold">Logowanie</CardTitle>
            <CardDescription>
              Wprowadź swoje dane, aby uzyskać dostęp do panelu
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-6 p-8">
              <div className="grid gap-2">
                <Label htmlFor="login" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Login</Label>
                <Input 
                  id="login" 
                  type="text" 
                  placeholder="pracownik lub wlasciciel" 
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hasło</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  defaultValue="123456"
                  className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </div>
              <Button type="submit" className="h-12 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95">
                Zaloguj się
              </Button>
            </CardContent>
          </form>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 justify-center">
            <p className="text-xs text-slate-400 font-medium text-center">
              Wpisz <span className="text-blue-600 font-bold">pracownik</span> lub <span className="text-blue-600 font-bold">wlasciciel</span>, aby przetestować system
            </p>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            © 2026 MOBILEHUB Management System
          </p>
        </div>
      </div>
    </div>
  );
}
