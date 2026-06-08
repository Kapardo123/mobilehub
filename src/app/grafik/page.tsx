"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, Calendar, User, Plus, X, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getSessionStorageSafe } from "@/lib/storage";
import { useShiftsData } from "@/hooks/useShiftsData";
import { shopsService } from "@/lib/supabase/shops";
import { usersService } from "@/lib/supabase/users";
import { toISODateString } from "@/lib/dateFormat";

const employeeColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
];

const monthNames = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

const generateInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    const word = parts[0];
    return word.length >= 2 ? word.substring(0, 2).toUpperCase() : word.toUpperCase();
  }
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('');
};

const padTime = (time: string): string => {
  const parts = time.split(':');
  return `${parts[0].padStart(2, '0')}:${parts[1]?.padStart(2, '0') || '00'}`;
};

const getDaysInMonth = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push({
      date: date.getDate(),
      day: ["Niedz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"][date.getDay()],
      dayNum: date.getDay()
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
};

interface ShiftDisplay {
  id: string;
  shiftId: string;
  employeeId: string;
  name: string;
  initials: string;
  start: number;
  end: number;
  startTimeStr: string;
  endTimeStr: string;
  shop: string;
  date: number;
  status: string;
}

interface EmployeeData {
  id: string;
  name: string;
  initials: string;
  role: string;
  shops: string[];
}

export default function GrafikPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userShop, setUserShop] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) { router.push("/login"); return; }
    setUserRole(role === "owner" ? "Właściciel" : "Pracownik");
    setUserShop(getSessionStorageSafe("shopId", "kaufland-wloclawek"));
    setCurrentUserId(getSessionStorageSafe("userId", ""));
    setCurrentUserName(getSessionStorageSafe("userName", ""));
    setIsMounted(true);
  }, [router]);

  const isOwner = userRole === "Właściciel";
  const isEmployee = userRole === "Pracownik";

  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shops, setShops] = useState<{ id: string; name: string }[]>([]);
  const [shopLabels, setShopLabels] = useState<Record<string, string>>({});

  const selectedShopName = useMemo(() => {
    if (!selectedShop) return "Wybierz sklep";
    return shopLabels[selectedShop] || shops.find(s => s.id === selectedShop)?.name || selectedShop;
  }, [selectedShop, shopLabels, shops]);

  const loadShops = useCallback(async () => {
    try {
      const data = await shopsService.getAll();
      setShops(data.map(s => ({ id: s.id, name: s.name })));
      const labels: Record<string, string> = {};
      data.forEach(s => { labels[s.id] = s.name; });
      setShopLabels(labels);
      if (data.length > 0 && !selectedShop) setSelectedShop(data[0].id);
    } catch {}
  }, []);

  useEffect(() => { loadShops(); }, [loadShops]);

  useEffect(() => {
    if (isEmployee && userShop && shops.length > 0) {
      setSelectedShop(userShop);
    }
  }, [isEmployee, userShop, shops]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const effectiveShopId = isOwner ? selectedShop : userShop;

  const startDate = toISODateString(new Date(selectedYear, selectedMonth, 1));
  const endDate = toISODateString(new Date(selectedYear, selectedMonth + 1, 0));

  const hookOptions = useMemo(() => {
    if (isOwner) return { shopId: effectiveShopId || undefined, startDate, endDate };
    return { employeeId: currentUserId || undefined, startDate, endDate };
  }, [isOwner, effectiveShopId, currentUserId, startDate, endDate]);

  const {
    shifts: shiftsData,
    isLoading,
    addShift,
    deleteShift,
  } = useShiftsData(hookOptions);

  const formattedShifts: ShiftDisplay[] = useMemo(() => {
    if (!shiftsData) return [];
    return shiftsData
      .filter((shift: any) => {
        if (isEmployee && currentUserId) {
          return shift.employee_id === currentUserId;
        }
        return true;
      })
      .map((shift: any) => {
        const name = `${shift.employee?.first_name || ''} ${shift.employee?.last_name || ''}`.trim() || 'Pracownik';
        const initials = shift.employee?.initials && shift.employee?.initials !== '??'
          ? shift.employee?.initials
          : generateInitials(name);
        const startTimeStr = padTime((shift.start_time || '08:00').substring(0, 5));
        const endTimeStr = padTime((shift.end_time || '16:00').substring(0, 5));
        return {
          id: shift.id,
          shiftId: shift.id,
          employeeId: shift.employee_id || shift.employee?.id || '',
          name,
          initials,
          start: parseInt(startTimeStr.split(':')[0]),
          end: parseInt(endTimeStr.split(':')[0]),
          startTimeStr,
          endTimeStr,
          shop: shift.shop_id || shift.shop?.code || effectiveShopId,
          date: new Date(shift.shift_date).getDate(),
          status: shift.status || 'planowany',
        };
      });
  }, [shiftsData, effectiveShopId, isEmployee, currentUserId]);

  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  const loadEmployees = useCallback(async () => {
    try {
      const data = await usersService.getAllWithShops();
      if (data && data.length > 0) {
        const mapped: EmployeeData[] = data
          .filter(user => user.role === 'employee' || user.role === 'owner')
          .map(user => {
            const shopNames = user.shops && Array.isArray(user.shops) && user.shops.length > 0
              ? user.shops.map((s: any) => s.shop_name)
              : [];
            const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Pracownik';
            return {
              id: user.id,
              name,
              initials: user.initials && user.initials !== '??' ? user.initials : generateInitials(name),
              role: user.role,
              shops: shopNames,
            };
          });
        setEmployees(mapped);
        localStorage.setItem('pracownicy_employees', JSON.stringify(mapped));
        return;
      }
    } catch {}

    const saved = localStorage.getItem('pracownicy_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped: EmployeeData[] = parsed.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          initials: emp.initials && emp.initials !== '??' ? emp.initials : generateInitials(emp.name),
          role: emp.role,
          shops: emp.shops || []
        }));
        setEmployees(mapped);
        return;
      } catch {}
    }

    setEmployees([]);
  }, []);

  useEffect(() => {
    loadEmployees();
    window.addEventListener('pracownicy_updated', loadEmployees);
    return () => window.removeEventListener('pracownicy_updated', loadEmployees);
  }, [loadEmployees]);

  const filteredEmployeesForShop = useMemo(() => {
    if (isOwner) {
      if (!selectedShop) return employees;
      const shopName = shopLabels[selectedShop] || selectedShop;
      return employees.filter(emp => {
        if (!emp.shops || !Array.isArray(emp.shops) || emp.shops.length === 0) return true;
        return emp.shops.some((s: string) =>
          s.toLowerCase().includes(shopName.toLowerCase()) ||
          shopName.toLowerCase().includes(s.toLowerCase())
        );
      });
    }
    if (isEmployee && userShop) {
      const shopName = shopLabels[userShop] || userShop;
      return employees.filter(emp => {
        if (!emp.shops || !Array.isArray(emp.shops) || emp.shops.length === 0) return true;
        return emp.shops.some((s: string) =>
          s.toLowerCase().includes(shopName.toLowerCase()) ||
          shopName.toLowerCase().includes(s.toLowerCase())
        );
      });
    }
    return employees;
  }, [employees, isOwner, isEmployee, selectedShop, userShop, shopLabels]);

  const monthDays = useMemo(() => getDaysInMonth(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  const getDayShifts = useCallback((date: number) => {
    return formattedShifts.filter(s => s.date === date);
  }, [formattedShifts]);

  const stats = useMemo(() => {
    const totalHours = formattedShifts.reduce((acc, s) => acc + (s.end - s.start), 0);
    const totalShifts = formattedShifts.length;
    const uniqueEmp = new Set(formattedShifts.map(s => s.initials)).size;
    return { totalHours, totalShifts, uniqueEmp };
  }, [formattedShifts]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<number>(1);
  const [dialogDayShifts, setDialogDayShifts] = useState<ShiftDisplay[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMinute, setEndMinute] = useState("00");
  const [isSaving, setIsSaving] = useState(false);
  const [activePicker, setActivePicker] = useState<'start' | 'end'>('start');
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');
  const [minutePage, setMinutePage] = useState(0);

  const openDialog = (dayDate: number) => {
    if (!isOwner && !isEmployee) return;
    setDialogDate(dayDate);
    const dayShifts = getDayShifts(dayDate);
    setDialogDayShifts(dayShifts);
    setSelectedEmployeeId("");
    setStartHour("09");
    setStartMinute("00");
    setEndHour("17");
    setEndMinute("00");
    setActivePicker('start');
    setPickerMode('hour');
    setMinutePage(0);
    setShowAddForm(false);
    setIsDialogOpen(true);
  };

  const saveShift = async () => {
    if (!selectedEmployeeId || isSaving) return;
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    setIsSaving(true);
    try {
      const shiftDate = toISODateString(new Date(selectedYear, selectedMonth, dialogDate));
      const startTime = `${startHour}:${startMinute}`;
      const endTime = `${endHour}:${endMinute}`;
      await addShift({
        shift_date: shiftDate,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        shop_id: effectiveShopId,
        employee_id: selectedEmployeeId,
        status: 'planowany',
      });
      setIsDialogOpen(false);
    } catch {} finally {
      setIsSaving(false);
    }
  };

  const removeShift = async (shiftId: string) => {
    try { await deleteShift(shiftId); } catch {}
  };

  const getEmpColorIndex = (employeeId: string) => {
    return Math.max(0, filteredEmployeesForShop.findIndex(e => e.id === employeeId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {isOwner ? "Grafik pracowników" : "Mój grafik"}
                </h1>
                <p className="text-xs text-gray-500">{monthNames[selectedMonth]} {selectedYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && shops.length > 0 && (
                <Select value={selectedShop} onValueChange={(v) => setSelectedShop(v || "")}>
                  <SelectTrigger className="w-[220px] h-9 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{selectedShopName}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {isEmployee && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <User className="h-3 w-3" />
                  {currentUserName}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => {
            if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
            else setSelectedMonth(selectedMonth - 1);
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm">{monthNames[selectedMonth]} {selectedYear}</span>
          <Button variant="ghost" size="sm" onClick={() => {
            if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
            else setSelectedMonth(selectedMonth + 1);
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="border">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{stats.totalHours}h</div>
              <div className="text-[10px] text-gray-500">Godziny</div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600">{stats.totalShifts}</div>
              <div className="text-[10px] text-gray-500">Zmiany</div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{stats.uniqueEmp}</div>
              <div className="text-[10px] text-gray-500">Osób</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border">
          <CardContent className="p-4">
            {isOwner && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900">Dodawanie do grafiku</div>
                  <div className="text-xs text-blue-700">Kliknij na dowolny dzień, aby zarządzać zmianami</div>
                </div>
              </div>
            )}

            {isEmployee && (
              <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">Twój grafik</div>
                  <div className="text-xs text-emerald-700">Kliknij na dzień, aby zobaczyć szczegóły zmiany</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: (monthDays[0].dayNum + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="h-28" />
              ))}

              {monthDays.map((d) => {
                const dayShifts = getDayShifts(d.date);
                const isToday = d.date === new Date().getDate() &&
                  selectedMonth === new Date().getMonth() &&
                  selectedYear === new Date().getFullYear();
                const totalHoursDay = dayShifts.reduce((acc, s) => acc + (s.end - s.start), 0);
                const hasFullCoverage = dayShifts.length >= 2 || totalHoursDay >= 12;

                return (
                  <div
                    key={d.date}
                    onClick={() => openDialog(d.date)}
                    className={cn(
                      "h-28 p-2 rounded-lg border cursor-pointer transition-all relative group",
                      isToday ? "border-blue-500 bg-blue-50 shadow-md" :
                      dayShifts.length > 0 ? cn(
                        "border-l-4",
                        hasFullCoverage ? "border-green-500 bg-green-50/30" :
                        dayShifts.length === 1 ? "border-yellow-500 bg-yellow-50/30" :
                        "border-gray-200 hover:border-blue-400"
                      ) : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", isToday ? "text-blue-600" : "text-gray-800")}>
                          {d.date}
                        </span>
                        {dayShifts.length > 0 && (
                          <Badge variant="secondary" className={cn(
                            "text-[9px] px-1.5 py-0 h-4 font-bold",
                            hasFullCoverage ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {dayShifts.length} {dayShifts.length === 1 ? "osoba" : "osoby"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {dayShifts.length > 0 && <Clock className="h-3 w-3 text-gray-500" />}
                        {isOwner && (
                          <Plus className="h-3.5 w-3.5 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {dayShifts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-14 text-gray-300 group-hover:text-blue-400 transition-colors border-2 border-dashed border-gray-200 rounded-lg group-hover:border-blue-300">
                          {isOwner ? (
                            <>
                              <Plus className="h-5 w-5 mb-1" />
                              <span className="text-[10px] font-semibold">Dodaj pracownika</span>
                            </>
                          ) : (
                            <span className="text-[10px]">Brak zmian</span>
                          )}
                        </div>
                      ) : (
                        <>
                          {dayShifts.slice(0, 3).map((shift, i) => {
                            const empIndex = getEmpColorIndex(shift.employeeId);
                            const empFromList = employees.find(e => e.id === shift.employeeId);
                            const displayInitials = empFromList?.initials || shift.initials;
                            return (
                              <div
                                key={`${shift.shiftId}-${i}`}
                                className={cn(
                                  "px-2 py-1 rounded text-white shadow-sm text-center",
                                  employeeColors[empIndex % employeeColors.length]
                                )}
                              >
                                <span className="inline-flex items-center justify-center font-black text-[11px] bg-white/25 rounded px-1.5 py-0.5 leading-none">
                                  {displayInitials}
                                </span>
                                <div className="text-[10px] opacity-90 mt-0.5 font-medium">
                                  {shift.startTimeStr} – {shift.endTimeStr}
                                </div>
                              </div>
                            );
                          })}
                          {dayShifts.length > 3 && (
                            <div className="text-center py-1 px-2 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                              +{dayShifts.length - 3} więcej
                            </div>
                          )}
                          {totalHoursDay > 0 && (
                            <div className="flex items-center justify-between pt-1 border-t border-black/10 mt-1">
                              <span className="text-[9px] text-gray-600 font-medium">Razem:</span>
                              <span className="text-[10px] font-bold text-gray-800">{totalHoursDay}h</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Ładowanie grafiku...
          </div>
        )}

        {employees.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isOwner
                  ? `Pracownicy (${filteredEmployeesForShop.length})`
                  : `Pracownicy (${filteredEmployeesForShop.length})`}
              </div>
              {isOwner && filteredEmployeesForShop.length > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">
                  Dostępni do grafiku
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredEmployeesForShop.map((emp, index) => {
                const empShiftsCount = formattedShifts.filter(s => s.employeeId === emp.id).length;
                return (
                  <div key={emp.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white">
                    <div className={cn(
                      "w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0",
                      employeeColors[index % employeeColors.length]
                    )}>
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-800 truncate">{emp.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {empShiftsCount > 0 ? (
                          <Badge variant="secondary" className={cn(
                            "text-[9px] px-1.5 py-0 h-3.5 font-bold",
                            empShiftsCount >= 10 ? "bg-green-100 text-green-700" :
                            empShiftsCount >= 5 ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {empShiftsCount} zmian
                          </Badge>
                        ) : (
                          <span className="text-[9px] text-gray-400">Brak zmian</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setIsDialogOpen(false); }}>
          <DialogContent className="sm:max-w-[480px] p-0 max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  {dialogDate} {monthNames[selectedMonth]} {selectedYear}
                </DialogTitle>
              </DialogHeader>

              {dialogDayShifts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Zaplanowane zmiany ({dialogDayShifts.length})
                  </Label>
                  <div className="space-y-2">
                    {dialogDayShifts.map((shift) => {
                      const empIndex = getEmpColorIndex(shift.employeeId);
                      return (
                        <div
                          key={shift.shiftId}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl text-white shadow-md",
                            employeeColors[empIndex % employeeColors.length]
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center font-bold text-sm flex-shrink-0 border-2 border-white/40">
                            {shift.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{shift.name}</div>
                            <div className="text-xs opacity-90">
                              {shift.startTimeStr} - {shift.endTimeStr}
                              <span className="ml-1">({shift.end - shift.start}h)</span>
                            </div>
                          </div>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white hover:bg-white/20 rounded-lg flex-shrink-0"
                              onClick={() => removeShift(shift.shiftId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isOwner && (
                <>
                  {!showAddForm ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj zmianę
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-blue-900">Nowa zmiana</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowAddForm(false)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-600">Pracownik</Label>
                        <Select value={selectedEmployeeId} onValueChange={(v) => setSelectedEmployeeId(v || "")}>
                          <SelectTrigger className="h-10 bg-white border-2 hover:border-blue-400 transition-colors">
                            {selectedEmployeeId
                              ? (() => {
                                  const emp = employees.find(e => e.id === selectedEmployeeId);
                                  if (emp) return (
                                    <div className="flex items-center gap-2">
                                      <div className={cn(
                                        "w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center",
                                        employeeColors[getEmpColorIndex(emp.id) % employeeColors.length]
                                      )}>
                                        {emp.initials}
                                      </div>
                                      <span className="truncate">{emp.name}</span>
                                    </div>
                                  );
                                  return <span className="text-muted-foreground">Wybierz pracownika...</span>;
                                })()
                              : <span className="text-muted-foreground">Wybierz pracownika...</span>
                            }
                          </SelectTrigger>
                          <SelectContent>
                            {filteredEmployeesForShop.map((emp, index) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center",
                                    employeeColors[index % employeeColors.length]
                                  )}>
                                    {emp.initials}
                                  </div>
                                  <span>{emp.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { setActivePicker('start'); setPickerMode('hour'); setMinutePage(0); }}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-center",
                              activePicker === 'start'
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                            )}
                          >
                            <div className={cn("text-[10px] font-bold uppercase tracking-wide", activePicker === 'start' ? "text-blue-100" : "text-gray-400")}>
                              🔵 Od
                            </div>
                            <div className="text-2xl font-black tabular-nums mt-0.5">
                              {startHour}<span className={cn(activePicker === 'start' ? "text-blue-200" : "text-gray-300")}>:</span>{startMinute}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActivePicker('end'); setPickerMode('hour'); setMinutePage(0); }}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-center",
                              activePicker === 'end'
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                            )}
                          >
                            <div className={cn("text-[10px] font-bold uppercase tracking-wide", activePicker === 'end' ? "text-blue-100" : "text-gray-400")}>
                              🟢 Do
                            </div>
                            <div className="text-2xl font-black tabular-nums mt-0.5">
                              {endHour}<span className={cn(activePicker === 'end' ? "text-blue-200" : "text-gray-300")}>:</span>{endMinute}
                            </div>
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-3 bg-white rounded-xl border border-gray-200 py-1.5">
                          <button
                            type="button"
                            onClick={() => setPickerMode('hour')}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                              pickerMode === 'hour'
                                ? "bg-blue-600 text-white shadow"
                                : "text-gray-500 hover:bg-gray-100"
                            )}
                          >
                            🕐 Godzina
                          </button>
                          <span className="text-gray-500 text-lg font-bold tabular-nums">
                            {pickerMode === 'hour'
                              ? (activePicker === 'start' ? startHour : endHour)
                              : (activePicker === 'start' ? startMinute : endMinute)}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setPickerMode('minute'); setMinutePage(0); }}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                              pickerMode === 'minute'
                                ? "bg-blue-600 text-white shadow"
                                : "text-gray-500 hover:bg-gray-100"
                            )}
                          >
                            ⏱️ Minuta
                          </button>
                        </div>

                        <div className="relative mx-auto" style={{ width: '280px', height: '280px' }}>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-200 shadow-inner">
                            {pickerMode === 'hour' ? (
                              <>
                                {Array.from({ length: 24 }, (_, i) => {
                                  const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
                                  const radius = 105;
                                  const cx = 140 + radius * Math.cos(angle);
                                  const cy = 140 + radius * Math.sin(angle);
                                  const currentH = activePicker === 'start' ? parseInt(startHour) : parseInt(endHour);
                                  const isSelected = i === currentH;
                                  const isPrimary = i >= 6 && i <= 20;
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        const val = String(i).padStart(2, '0');
                                        if (activePicker === 'start') setStartHour(val);
                                        else setEndHour(val);
                                        setPickerMode('minute');
                                      }}
                                      className={cn(
                                        "absolute flex items-center justify-center rounded-full font-bold transition-all text-xs -translate-x-1/2 -translate-y-1/2",
                                        isSelected
                                          ? "w-9 h-9 bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300"
                                          : isPrimary
                                            ? "w-8 h-8 bg-white text-gray-700 border-2 border-gray-200 hover:bg-blue-100 hover:text-blue-700 hover:scale-110 hover:border-blue-400"
                                            : "w-7 h-7 bg-gray-50 text-gray-400 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:scale-110"
                                      )}
                                      style={{ left: cx, top: cy }}
                                    >
                                      {String(i).padStart(2, '0')}
                                    </button>
                                  );
                                })}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                  <div className="text-[9px] font-bold text-gray-400 uppercase">
                                    {activePicker === 'start' ? 'Początek zmiany' : 'Koniec zmiany'}
                                  </div>
                                  <div className="text-2xl font-black text-blue-600 tabular-nums mt-0.5">
                                    {activePicker === 'start' ? `${startHour}:${startMinute}` : `${endHour}:${endMinute}`}
                                  </div>
                                  <div className="text-[9px] font-bold text-blue-400 mt-1">
                                    Kliknij godzinę →
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {Array.from({ length: 60 }, (_, i) => {
                                  const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
                                  const isBig = i % 5 === 0;
                                  const radiusBig = 115;
                                  const radiusSmall = 92;
                                  const radius = isBig ? radiusBig : radiusSmall;
                                  const cx = 140 + radius * Math.cos(angle);
                                  const cy = 140 + radius * Math.sin(angle);
                                  const currentM = activePicker === 'start' ? parseInt(startMinute) : parseInt(endMinute);
                                  const isSelected = i === currentM;
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        const val = String(i).padStart(2, '0');
                                        if (activePicker === 'start') setStartMinute(val);
                                        else setEndMinute(val);
                                      }}
                                      className={cn(
                                        "absolute flex items-center justify-center font-bold transition-all -translate-x-1/2 -translate-y-1/2 rounded-full",
                                        isSelected
                                          ? isBig
                                            ? "w-8 h-8 bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300 text-xs z-10"
                                            : "w-4 h-4 bg-blue-500 shadow-md scale-150 z-10"
                                          : isBig
                                            ? "w-8 h-8 bg-white text-gray-700 border-2 border-gray-300 hover:bg-blue-100 hover:text-blue-700 hover:scale-110 hover:border-blue-400 text-xs z-10"
                                            : "w-2.5 h-2.5 bg-gray-300 hover:bg-blue-400 hover:scale-150"
                                      )}
                                      style={{ left: cx, top: cy }}
                                    >
                                      {isBig ? String(i).padStart(2, '0') : ''}
                                    </button>
                                  );
                                })}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                  <div className="text-[9px] font-bold text-gray-400 uppercase">
                                    Wybierz minutę
                                  </div>
                                  <div className="text-2xl font-black text-blue-600 tabular-nums mt-0.5">
                                    :{activePicker === 'start' ? startMinute : endMinute}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setPickerMode('hour')}
                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-700 mt-1 underline underline-offset-2 pointer-events-auto"
                                  >
                                    ← wróć do godzin
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {(() => {
                          const sh = parseInt(startHour) || 0;
                          const sm = parseInt(startMinute) || 0;
                          const eh = parseInt(endHour) || 0;
                          const em = parseInt(endMinute) || 0;
                          let totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
                          if (totalMinutes <= 0) totalMinutes += 24 * 60;
                          const hours = Math.floor(totalMinutes / 60);
                          const mins = totalMinutes % 60;
                          const timeStr = mins === 0
                            ? `${hours} ${hours === 1 ? 'godzina' : hours >= 2 && hours <= 4 ? 'godziny' : 'godzin'}`
                            : `${hours}h ${mins}min`;
                          return (
                            <div className="text-center py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                              <span className="text-sm font-black text-blue-900">
                                ⏱️ {timeStr}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddForm(false)}
                          className="flex-1 h-9 text-sm"
                        >
                          Anuluj
                        </Button>
                        <Button
                          onClick={saveShift}
                          disabled={!selectedEmployeeId || isSaving}
                          className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
                        >
                          {isSaving ? "Zapisywanie..." : "Dodaj"}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!isOwner && dialogDayShifts.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Brak zmian w tym dniu</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}