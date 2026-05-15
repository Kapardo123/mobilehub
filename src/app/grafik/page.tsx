"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, Calendar, User, LogIn, Plus, X, Info, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";

// Employee colors for visual distinction
const employeeColors = [
  "bg-rose-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export default function GrafikPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userShop, setUserShop] = useState("trzy-stawy");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
      return;
    }
    setUserRole(role === "owner" ? "Właściciel" : "Pracownik");
    const shop = getSessionStorageSafe("userShop", "trzy-stawy");
    setUserShop(shop);
  }, [router]);

  const isOwner = userRole === "Właściciel";
  const [selectedShop, setSelectedShop] = useState("trzy-stawy");

  const shopLabels: Record<string, string> = {
    "trzy-stawy": "Trzy Stawy",
    "galeria-katowicka": "Galeria Katowicka",
    "silesia-city": "Silesia City Center"
  };

  useEffect(() => {
    if (!isOwner && userShop) {
      setSelectedShop(userShop);
    }
  }, [isOwner, userShop]);

  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [view, setView] = useState<"month" | "edit">("month");

  useEffect(() => {
    setView("month");
  }, [isOwner]);

  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  // Month navigation
  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
    setSelectedDay(today.getDate());
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

  const monthDays = getDaysInMonth(selectedMonth, selectedYear);

  const [activePreset, setActivePreset] = useState("Otwarcie");
  const [customRange, setCustomRange] = useState({ start: "10:00", end: "15:00" });
  const [isShiftDetailsOpen, setIsShiftDetailsOpen] = useState(false);
  const [selectedShiftDetails, setSelectedShiftDetails] = useState<any>(null);

  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem('pracownicy_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const grafikEmployees = parsed.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          initials: emp.initials
        }));
        setEmployees(grafikEmployees);
      } catch {
        setEmployees([
          { id: "jk", name: "Jan Kowalski", initials: "JK" },
          { id: "an", name: "Anna Nowak", initials: "AN" },
          { id: "pz", name: "Piotr Zakrzewski", initials: "PZ" },
        ]);
      }
    } else {
      setEmployees([
        { id: "jk", name: "Jan Kowalski", initials: "JK" },
        { id: "an", name: "Anna Nowak", initials: "AN" },
        { id: "pz", name: "Piotr Zakrzewski", initials: "PZ" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      const saved = localStorage.getItem('pracownicy_employees');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const grafikEmployees = parsed.map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            initials: emp.initials
          }));
          setEmployees(grafikEmployees);
        } catch { }
      }
    };
    window.addEventListener('pracownicy_updated', handler);
    return () => window.removeEventListener('pracownicy_updated', handler);
  }, []);

  const [shifts, setShifts] = useState([
    { name: "Jan Kowalski", initials: "JK", shift: "09:00 - 17:00", start: 9, end: 17, shop: "trzy-stawy", status: "W pracy", date: 12 },
    { name: "Anna Nowak", initials: "AN", shift: "10:00 - 18:00", start: 10, end: 18, shop: "trzy-stawy", status: "Zaplanowane", date: 12 },
    { name: "Piotr Zakrzewski", initials: "PZ", shift: "12:00 - 20:00", start: 12, end: 20, shop: "galeria-katowicka", status: "Zaplanowane", date: 12 },
    { name: "Jan Kowalski", initials: "JK", shift: "09:00 - 17:00", start: 9, end: 17, shop: "trzy-stawy", status: "Zaplanowane", date: 15 },
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedShifts = localStorage.getItem('grafik_shifts');
    if (savedShifts) {
      try {
        setShifts(JSON.parse(savedShifts));
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem('grafik_shifts', JSON.stringify(shifts));
  }, [shifts]);

  const shiftPresets = [
    { label: "Otwarcie", range: "09:00 - 17:00", start: 9, end: 17 },
    { label: "Cały dzień", range: "09:00 - 20:00", start: 9, end: 20 },
    { label: "Zamknięcie", range: "12:00 - 20:00", start: 12, end: 20 },
    { label: "Własna", range: `${customRange.start} - ${customRange.end}`, start: parseInt(customRange.start), end: parseInt(customRange.end) },
  ];

  // Get color for employee
  const getEmployeeColor = (initials: string) => {
    const index = employees.findIndex(e => e.initials === initials);
    return employeeColors[index % employeeColors.length];
  };

  const toggleShift = (empId: string, dayDate: number) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    setShifts(prev => {
      const existingIndex = prev.findIndex(s => s.date === dayDate && s.initials === emp.initials && s.shop === selectedShop);
      
      if (existingIndex >= 0) {
        // Remove shift
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        // Add shift using active preset
        const preset = shiftPresets.find(p => p.label === activePreset) || shiftPresets[0];
        return [...prev, {
          name: emp.name,
          initials: emp.initials,
          shift: preset.range,
          start: preset.start,
          end: preset.end,
          shop: selectedShop,
          status: "Zaplanowane",
          date: dayDate
        }];
      }
    });
  };

  const showShiftDetails = (dayDate: number) => {
    const dayShifts = shifts.filter(s => s.date === dayDate && s.shop === selectedShop);
    if (dayShifts.length > 0) {
      setSelectedShiftDetails({
        date: dayDate,
        dayName: monthDays.find(d => d.date === dayDate)?.day,
        monthName: monthNames[selectedMonth],
        shifts: dayShifts
      });
      setIsShiftDetailsOpen(true);
    }
  };

  const clearMonth = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    setShifts(prev => prev.filter(s => !(s.initials === emp.initials && s.shop === selectedShop)));
  };

  const clearAll = () => {
    if (typeof window !== 'undefined' && window.confirm(`Czy na pewno chcesz wyczyścić CAŁY grafik dla tego sklepu?`)) {
      setShifts(prev => prev.filter(s => s.shop !== selectedShop));
    }
  };

  // Copy week to next week
  const copyWeek = () => {
    const startDay = selectedDay;
    const endDay = startDay + 6;
    const weekShifts = shifts.filter(s => s.date >= startDay && s.date <= endDay && s.shop === selectedShop);
    
    const newShifts = weekShifts.map(shift => ({
      ...shift,
      date: shift.date + 7
    }));

    setShifts(prev => {
      // Remove existing shifts in target week
      const filtered = prev.filter(s => !(s.date >= startDay + 7 && s.date <= endDay + 7 && s.shop === selectedShop));
      return [...filtered, ...newShifts];
    });
  };

  const filteredShifts = shifts.filter(s => s.shop === selectedShop && s.date === selectedDay);
  
  const myShift = useMemo(() => {
    return filteredShifts.find(s => s.initials === "JK"); 
  }, [filteredShifts]);

  const timelineHours = Array.from({ length: 14 }, (_, i) => i + 8);

  const getDayCoverageStatus = (dayDate: number) => {
    const dayShifts = shifts.filter(s => s.date === dayDate && s.shop === selectedShop);
    if (dayShifts.length === 0) return "none";
    
    const hasOpening = dayShifts.some(s => s.start <= 10);
    const hasClosing = dayShifts.some(s => s.end >= 18);
    
    return (hasOpening && hasClosing) ? "full" : "partial";
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={userRole === "Pracownik" ? "/pracownik" : "/"}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">Grafik Pracy</h1>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{monthNames[selectedMonth]} {selectedYear}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <Tabs value={view} onValueChange={(v: any) => setView(v)} className="bg-white p-1 rounded-xl h-10 shadow-sm border border-primary/5">
                <TabsList className="bg-transparent border-none">
                  <TabsTrigger value="month" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-3 data-[state=active]:bg-accent data-[state=active]:text-primary">Miesiąc</TabsTrigger>
                  <TabsTrigger value="edit" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-3 data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm">Ustal grafik</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            {!isOwner && (
              <Badge className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-primary/10">
                Podgląd Miesięczny
              </Badge>
            )}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-primary/5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToPrevMonth}
            className="rounded-full hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <Button 
            variant="outline"
            onClick={goToToday}
            className="text-[10px] font-black uppercase tracking-widest border-primary/10 text-primary"
          >
            Dzisiaj
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextMonth}
            className="rounded-full hover:bg-accent"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </div>

        <div className={cn(
          "bg-white p-1 rounded-2xl shadow-sm border border-primary/5",
          !isOwner && "opacity-80 pointer-events-none"
        )}>
          <Select 
            value={selectedShop} 
            onValueChange={(val) => isOwner && val && setSelectedShop(val)}
            disabled={!isOwner}
          >
            <SelectTrigger className="border-none bg-transparent h-12 focus:ring-0 font-bold text-foreground">
              <div className="flex items-center gap-2 pl-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{shopLabels[selectedShop] || selectedShop}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-primary/5">
              <SelectItem value="trzy-stawy">Trzy Stawy</SelectItem>
              <SelectItem value="galeria-katowicka">Galeria Katowicka</SelectItem>
              <SelectItem value="silesia-city">Silesia City Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {view === "month" ? (
          /* FULL MONTH CALENDAR VIEW */
          <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden border border-primary/5 p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map(d => (
                  <div key={d} className="text-center text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest py-2">
                    {d}
                  </div>
                ))}
                
                {/* Empty slots for first week offset */}
                {Array.from({ length: (monthDays[0].dayNum + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-14 sm:h-20" />
                ))}

                {monthDays.map((d) => {
                  const dayShifts = shifts.filter(s => s.date === d.date && s.shop === selectedShop);
                  const myDayShift = dayShifts.find(s => s.initials === "JK");
                  const isToday = d.date === new Date().getDate() && selectedMonth === new Date().getMonth();
                  const coverage = getDayCoverageStatus(d.date);
                  
                  return (
                    <div
                      key={d.date}
                      onClick={() => showShiftDetails(d.date)}
                      className={cn(
                        "h-14 sm:h-20 rounded-2xl flex flex-col items-center justify-center relative transition-all group border cursor-pointer",
                        isToday ? "border-primary/30 ring-1 ring-primary/10" : "border-transparent",
                        myDayShift ? "bg-primary text-white shadow-lg shadow-primary/20" : 
                        coverage === "full" ? "bg-emerald-500/10" : 
                        coverage === "partial" ? "bg-amber-500/10" : "bg-accent/30",
                        !myDayShift && dayShifts.length > 0 && "hover:bg-accent/50"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-black",
                        myDayShift ? "text-white" : "text-foreground"
                      )}>{d.date}</span>
                      
                      {/* Show employee color dots */}
                      {!myDayShift && dayShifts.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {dayShifts.slice(0, 3).map((shift, i) => (
                            <div 
                              key={i}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                getEmployeeColor(shift.initials)
                              )}
                            />
                          ))}
                          {dayShifts.length > 3 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          )}
                        </div>
                      )}
                      
                      {myDayShift && (
                        <div className="hidden sm:flex flex-col items-center mt-1">
                          <span className="text-[7px] font-black uppercase text-white/70 leading-none">{myDayShift.shift}</span>
                        </div>
                      )}

                      {/* Coverage indicator */}
                      {!myDayShift && (
                        <div className={cn(
                          "absolute top-1 right-1 h-1.5 w-1.5 rounded-full",
                          coverage === "full" ? "bg-emerald-500" : 
                          coverage === "partial" ? "bg-amber-500" : "bg-red-200"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-4 bg-accent/30 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Twoje podsumowanie</p>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                      {shifts.filter(s => s.initials === "JK" && s.shop === selectedShop).length} dni roboczych w tym miesiącu
                    </p>
                  </div>
                </div>

                {/* Coverage legend */}
                {isOwner && (
                  <div className="p-4 bg-white border border-primary/5 rounded-2xl flex items-center gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Pełne pokrycie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Częściowe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-200" />
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Brak</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Nadchodzące zmiany</h2>
              <div className="grid gap-3">
                {shifts
                  .filter(s => s.initials === "JK" && s.shop === selectedShop && s.date >= new Date().getDate())
                  .sort((a, b) => a.date - b.date)
                  .slice(0, 3)
                  .map((shift, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white rounded-3xl border border-primary/5">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-accent text-primary flex items-center justify-center font-black text-xs">
                            {shift.date}
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground uppercase tracking-tight">
                              {monthDays.find(d => d.date === shift.date)?.day}, {monthNames[selectedMonth]}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="h-3 w-3 text-primary" />
                              <span className="text-xs font-bold text-muted-foreground uppercase">{shift.shift}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                          Zaplanowane
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>
          </div>
        ) : view === "edit" ? (
          /* EDIT GRID VIEW */
          <div className="space-y-6">
            <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm border border-primary/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wybierz Godziny</Label>
                  <div className="flex gap-2 flex-wrap">
                    {shiftPresets.map((p) => (
                      <Button
                        key={p.label}
                        size="sm"
                        variant={activePreset === p.label ? "default" : "outline"}
                        className={cn(
                          "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          activePreset === p.label ? "bg-primary shadow-lg shadow-primary/20" : "border-primary/10 text-primary"
                        )}
                        onClick={() => setActivePreset(p.label)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline"
                  onClick={copyWeek}
                  className="border-primary/20 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kopiuj tydzień
                </Button>
              </div>
              
              {activePreset === "Własna" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Od</Label>
                    <Input 
                      type="time" 
                      value={customRange.start}
                      onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                      className="h-10 bg-accent/30 border-none rounded-xl font-bold text-xs" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Do</Label>
                    <Input 
                      type="time" 
                      value={customRange.end}
                      onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                      className="h-10 bg-accent/30 border-none rounded-xl font-bold text-xs" 
                    />
                  </div>
                </div>
              )}
            </div>

            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden border border-primary/5">
              <div className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary border-none">
                      <TableHead className="w-40 text-[10px] font-black uppercase text-white tracking-widest pl-8 h-14">Pracownik</TableHead>
                      {monthDays.slice(selectedDay - 1, selectedDay + 6).map((d) => {
                        const coverage = getDayCoverageStatus(d.date);
                        return (
                          <TableHead key={d.date} className="text-center p-0 min-w-[3rem]">
                            <div className="flex flex-col items-center py-2">
                              <span className="text-[8px] font-black text-white/50 uppercase">{d.day}</span>
                              <span className="text-xs font-black text-white">{d.date}</span>
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full mt-1",
                                coverage === "full" ? "bg-emerald-400" : 
                                coverage === "partial" ? "bg-amber-400" : "bg-red-300"
                              )} />
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp, empIndex) => (
                      <TableRow key={emp.id} className="border-b border-primary/5 hover:bg-accent/10 transition-colors">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-xl text-white flex items-center justify-center font-black text-[10px] uppercase",
                              employeeColors[empIndex % employeeColors.length]
                            )}>
                              {emp.initials}
                            </div>
                            <span className="text-xs font-black text-foreground uppercase tracking-tight">{emp.name}</span>
                          </div>
                        </TableCell>
                        {monthDays.slice(selectedDay - 1, selectedDay + 6).map((d) => {
                          const hasShift = shifts.some(s => s.date === d.date && s.initials === emp.initials && s.shop === selectedShop);
                          const shift = shifts.find(s => s.date === d.date && s.initials === emp.initials && s.shop === selectedShop);
                          return (
                            <TableCell key={d.date} className="p-1 text-center">
                              <button
                                onClick={() => toggleShift(emp.id, d.date)}
                                className={cn(
                                  "w-10 h-10 rounded-xl transition-all flex items-center justify-center group relative",
                                  hasShift 
                                    ? `${employeeColors[empIndex % employeeColors.length]} text-white shadow-md scale-110` 
                                    : "bg-accent/30 text-primary/20 hover:bg-primary/10 hover:text-primary/40"
                                )}
                              >
                                {hasShift ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                                {hasShift && shift && (
                                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                    {shift.shift}
                                  </div>
                                )}
                              </button>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                onClick={clearAll}
                className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
              >
                Wyczyść wszystko
              </Button>
              <Button className="flex-[2] h-12 bg-secondary hover:bg-secondary/90 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-secondary/10">
                Zapisz grafik
              </Button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Shift Details Dialog */}
      <Dialog open={isShiftDetailsOpen} onOpenChange={setIsShiftDetailsOpen}>
        <DialogContent className="rounded-[2rem] border-none p-6 max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              {selectedShiftDetails?.dayName} {selectedShiftDetails?.date} {selectedShiftDetails?.monthName}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsShiftDetailsOpen(false)} className="rounded-full hover:bg-accent">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {selectedShiftDetails?.shifts.map((shift: any, i: number) => {
              const empIndex = employees.findIndex(e => e.initials === shift.initials);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-accent/30 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl text-white flex items-center justify-center font-black text-xs",
                      employeeColors[empIndex % employeeColors.length]
                    )}>
                      {shift.initials}
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">{shift.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{shift.shift}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                    {shift.status}
                  </Badge>
                </div>
              );
            })}
            {selectedShiftDetails?.shifts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-bold">Brak zaplanowanych zmian</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
