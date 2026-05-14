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
import { LogOut, Settings, Bell, Search, BookOpen, Calculator, ShoppingCart, Users, LayoutDashboard, MapPin, User, ChevronDown, Store, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    const role = sessionStorage.getItem("userRole");
    setUserName(name);
    setUserRole(role);
  }, []);

  const isEmployee = userRole === "employee" || pathname === "/pracownik";
  const displayName = userName || (isEmployee ? "Jan Kowalski" : "Piotr Zakrzewski");
  const displayRole = userRole === "employee" ? "Pracownik" : (userRole === "owner" ? "Właściciel" : (isEmployee ? "Pracownik" : "Właściciel"));

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 py-2 flex items-center justify-between">
      <Link href={isEmployee ? "/pracownik" : "/"} className="flex items-center gap-2">
        <img src="/logo.png" alt="Mobile Hub" className="h-10 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none group flex items-center gap-3 bg-accent hover:bg-primary/10 px-4 py-2 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all shadow-sm">
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-black text-foreground leading-none group-hover:text-primary transition-colors uppercase tracking-tight">
                {displayName}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-2.5 w-2.5 text-primary" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {displayRole === "Właściciel" ? "Właściciel" : "Trzy Stawy"}
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
                <Link href="/magazyn" className="flex items-center w-full px-2 py-2 font-bold text-xs uppercase tracking-tight hover:bg-accent rounded-xl transition-colors">
                  <ClipboardList className="mr-2 h-4 w-4 text-primary" />
                  <span>Magazyn</span>
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
                  sessionStorage.removeItem("userRole");
                  sessionStorage.removeItem("userName");
                  sessionStorage.removeItem("userShop");
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj System</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
