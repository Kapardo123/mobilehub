"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usersService } from "@/lib/supabase/users";
import { auditService } from "@/lib/supabase/actions";
import { shopAccessService } from "@/lib/supabase/shopAccess";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('=== ROZPOCZĘCIE LOGOWANIA ===');
      console.log('Przed czyszczeniem sesji:', {
        userRole: sessionStorage.getItem("userRole"),
        userName: sessionStorage.getItem("userName"),
        userId: sessionStorage.getItem("userId")
      });

      sessionStorage.clear();

      console.log('Po czyszczeniu sesji:', {
        userRole: sessionStorage.getItem("userRole"),
        userName: sessionStorage.getItem("userName")
      });

      const user = await usersService.login(login, password);
      
      if (user) {
        console.log('Zalogowano użytkownika:', user);

        sessionStorage.setItem("userRole", user.role);
        sessionStorage.setItem("userName", `${user.first_name} ${user.last_name}`);
        sessionStorage.setItem("userId", user.id);
        sessionStorage.setItem("userInitials", user.initials);

        console.log('=== ZAPISANO DANE DO SESJI ===');
        console.log('Dane po zapisie:', {
          userRole: sessionStorage.getItem("userRole"),
          userName: sessionStorage.getItem("userName"),
          userId: sessionStorage.getItem("userId"),
          userInitials: sessionStorage.getItem("userInitials")
        });
        
        const userShops = await usersService.getUserShops(user.id);
        console.log('Sklepy użytkownika:', userShops);
        
        if (userShops && userShops.length > 0) {
          const primaryShop = userShops.find(s => s.is_primary) || userShops[0];
          sessionStorage.setItem("shopId", primaryShop.shop_id);
          sessionStorage.setItem("shopName", primaryShop.shop_name);
          console.log('Ustawiono sklep:', primaryShop.shop_name);

          const employeeData = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            initials: user.initials || `${user.first_name[0]}${user.last_name[0]}`,
            shop: primaryShop.shop_name,
            shopId: primaryShop.shop_id,
            role: user.role
          };

          sessionStorage.setItem('activeEmployees', JSON.stringify([employeeData]));
          sessionStorage.setItem('selectedEmployeeId', user.id);
          console.log('Dodano użytkownika do activeEmployees:', employeeData);

          try {
            console.log('=== INICJALIZACJA ZARZĄDZANIA DOSTEPEM DO SKLEPÓW ===');
            const accessStatus = await shopAccessService.initializeShopAccess(
              user.id,
              `${user.first_name} ${user.last_name}`,
              user.role as 'owner' | 'employee' | 'admin',
              primaryShop.shop_id,
              primaryShop.shop_name
            );
            console.log('Status dostępu do sklepów:', accessStatus);
            sessionStorage.setItem('shopAccessStatus', JSON.stringify(accessStatus));
          } catch (accessError: any) {
            console.error('Błąd inicjalizacji dostępu do sklepów:', accessError);
            console.error('Typ błędu:', typeof accessError);
            console.error('Szczegóły:', accessError?.message || accessError?.toString() || JSON.stringify(accessError));

            const errorMessage = accessError?.message || (typeof accessError === 'string' ? accessError : 'Nieznany błąd dostępu do sklepu');

            if (errorMessage.includes('jest obecnie zajęty') || errorMessage.includes('occupied')) {
              alert(errorMessage);
              setIsLoading(false);
              return;
            }

            console.warn('Kontynuowanie mimo błędu dostępu do sklepu (non-critical):', errorMessage);
          }

          localStorage.setItem('justLoggedIn', JSON.stringify({
            employeeCount: 1,
            employeeData: employeeData,
            timestamp: Date.now()
          }));
          console.log('Zapisano do localStorage justLoggedIn');
        }
        
        await auditService.logLogin({
          userId: user.id,
          userName: `${user.first_name} ${user.last_name}`
        });
        
        console.log('Przekierowanie dla roli:', user.role);
        
        if (user.role === 'owner' || user.role === 'admin' || user.role === 'employee') {
          window.location.href = "/";
        } else {
          window.location.href = "/pracownik";
        }
      } else {
        alert("Błędny login lub hasło!");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error);

      let errorMessage = 'Błąd logowania! Spróbuj ponownie.';

      if (error?.message?.includes('Supabase') || error?.message?.includes('konfiguracji')) {
        errorMessage = 'Błąd konfiguracji bazy danych! Skontaktuj się z administratorem.';
      } else if (error?.message) {
        errorMessage = `Błąd: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                disabled={isLoading}
                className="h-12 w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg shadow-primary/15 transition-all duration-200 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Logowanie...
                  </span>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Zaloguj się
                  </>
                )}
              </Button>
            </form>
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
