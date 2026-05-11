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
    <nav className="sticky top-0 z-50 w-full border-b bg-white px-4 py-2 flex items-center justify-between">
      <Link href={isEmployee ? "/pracownik" : "/"} className="flex items-center gap-2">
        <img src="/logo.png" alt="Mobile Hub" className="h-10 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none group">
            <div className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
              <div className="flex flex-col items-end text-right">
                <span className="text-xs font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {displayName}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-2.5 w-2.5 text-blue-600" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {displayRole === "Właściciel" ? "Właściciel" : "Trzy Stawy"}
                  </span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <ChevronDown className="h-3 w-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayRole}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href={isEmployee ? "/pracownik" : "/"} className="flex items-center w-full px-2 py-1.5">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Pulpit</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/telefony" className="flex items-center w-full px-2 py-1.5">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Telefony na stanie</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/dokumenty" className="flex items-center w-full px-2 py-1.5">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Dokumenty</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/magazyn" className="flex items-center w-full px-2 py-1.5">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>Magazyn</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/grafik" className="flex items-center w-full px-2 py-1.5">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Grafik</span>
                </Link>
              </DropdownMenuItem>
              {!isEmployee && (
                <DropdownMenuItem className="cursor-pointer p-0">
                  <Link href="/sklepy" className="flex items-center w-full px-2 py-1.5">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Sklepy</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 p-0">
                <Link href="/login" className="flex items-center w-full px-2 py-1.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
