"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, Calendar, User, Coffee, LogIn, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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

export default function GrafikPage() {
  const [selectedShop, setSelectedShop] = useState("trzy-stawy");
  const [selectedDay, setSelectedDay] = useState(12);
  const [view, setView] = useState("day");
  const [activePreset, setActivePreset] = useState("Otwarcie");
  const [customRange, setCustomRange] = useState({ start: "10:00", end: "15:00" });

  // Generate all days for March 2025
  const generateMonthDays = () => {
    const daysArr = [];
    const weekdays = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];
    for (let i = 1; i <= 31; i++) {
      const date = new Date(2025, 2, i); // March 2025
      daysArr.push({
        day: weekdays[date.getDay()],
        date: i,
        fullDate: date
      });
    }
    return daysArr;
  };

  const [monthDays] = useState(generateMonthDays());

  const employees = [
    { id: "jk", name: "Jan Kowalski", initials: "JK" },
    { id: "an", name: "Anna Nowak", initials: "AN" },
    { id: "pz", name: "Piotr Zakrzewski", initials: "PZ" },
  ];

  const shiftPresets = [
    { label: "Otwarcie", range: "09:00 - 17:00", start: 9, end: 17 },
    { label: "Cały dzień", range: "09:00 - 20:00", start: 9, end: 20 },
    { label: "Zamknięcie", range: "12:00 - 20:00", start: 12, end: 20 },
    { label: "Własna", range: `${customRange.start} - ${customRange.end}`, start: parseInt(customRange.start), end: parseInt(customRange.end) },
  ];

  const [shifts, setShifts] = useState([
    { name: "Jan Kowalski", initials: "JK", shift: "09:00 - 17:00", start: 9, end: 17, shop: "trzy-stawy", status: "W pracy", date: 12 },
    { name: "Anna Nowak", initials: "AN", shift: "10:00 - 18:00", start: 10, end: 18, shop: "trzy-stawy", status: "Zaplanowane", date: 12 },
    { name: "Piotr Zakrzewski", initials: "PZ", shift: "12:00 - 20:00", start: 12, end: 20, shop: "galeria-katowicka", status: "Zaplanowane", date: 12 },
    { name: "Jan Kowalski", initials: "JK", shift: "09:00 - 17:00", start: 9, end: 17, shop: "trzy-stawy", status: "Zaplanowane", date: 15 },
  ]);

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

  const filteredShifts = shifts.filter(s => s.shop === selectedShop && s.date === selectedDay);
  const timelineHours = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00

  const getDayCoverageStatus = (dayDate: number) => {
    const dayShifts = shifts.filter(s => s.date === dayDate && s.shop === selectedShop);
    if (dayShifts.length === 0) return "none";
    
    // Check if there is coverage from opening (e.g. 10:00) to closing (e.g. 18:00)
    const hasOpening = dayShifts.some(s => s.start <= 10);
    const hasClosing = dayShifts.some(s => s.end >= 18);
    
    return (hasOpening && hasClosing) ? "full" : "partial";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">Grafik Pracy</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marzec 2025</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={setView} className="bg-slate-100 p-1 rounded-xl h-10">
              <TabsList className="bg-transparent border-none">
                <TabsTrigger value="day" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-3 data-active:bg-white data-active:shadow-sm">Podgląd</TabsTrigger>
                <TabsTrigger value="edit" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-3 data-active:bg-blue-600 data-active:text-white data-active:shadow-sm">Ustal grafik</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <Select value={selectedShop} onValueChange={(val) => val && setSelectedShop(val)}>
            <SelectTrigger className="border-none bg-transparent h-12 focus:ring-0 font-bold text-slate-700">
              <div className="flex items-center gap-2 pl-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <SelectValue placeholder="Wybierz punkt" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="trzy-stawy">Trzy Stawy</SelectItem>
              <SelectItem value="galeria-katowicka">Galeria Katowicka</SelectItem>
              <SelectItem value="silesia-city">Silesia City Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {view === "day" ? (
          <>
            {/* Weekly Calendar Strip */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">Kalendarz Miesięczny</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Pełna</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Luki</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                  {monthDays.map((d) => {
                    const status = getDayCoverageStatus(d.date);
                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDay(d.date)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all min-w-[3.5rem] h-20 relative ${
                          selectedDay === d.date 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "bg-white text-slate-400 border border-slate-50"
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase ${selectedDay === d.date ? "text-blue-100" : "text-slate-300"}`}>
                          {d.day}
                        </span>
                        <span className="text-sm font-black tracking-tighter">
                          {d.date}
                        </span>
                        
                        {/* Coverage Dots */}
                        <div className="flex gap-1 mt-1">
                          {status === "full" ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          ) : status === "partial" ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-100" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Daily Shifts List */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Obsada na dziś</h2>
                <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-400 uppercase">{filteredShifts.length} osoby</Badge>
              </div>
              <div className="space-y-3">
                {filteredShifts.length > 0 ? (
                  filteredShifts.map((shift, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-3xl">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-slate-50">
                            <AvatarFallback className="bg-slate-50 text-slate-400 font-black text-xs">{shift.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-black text-slate-800">{shift.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-bold text-slate-500 tracking-tighter">{shift.shift}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`text-[9px] font-black uppercase tracking-widest border-none ${
                          shift.status === 'W pracy' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {shift.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Brak zaplanowanych zmian</p>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : view === "edit" ? (
          /* Fast Scheduling Matrix */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex flex-col gap-4 mb-8">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">1. Wybierz typ zmiany</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                   {shiftPresets.map(p => (
                     <button 
                       key={p.label}
                       onClick={() => setActivePreset(p.label)}
                       className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                         activePreset === p.label 
                           ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105" 
                           : "bg-slate-50 border-transparent text-slate-500 hover:border-blue-200"
                       }`}
                     >
                       <span className="text-[10px] font-black uppercase tracking-tighter">{p.label}</span>
                       <span className="text-[9px] font-bold opacity-70">{p.range}</span>
                     </button>
                   ))}
                </div>
              </div>

              {activePreset === "Własna" && (
                <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 px-1">Ustaw własne godziny</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 ml-1">Od</Label>
                      <Input 
                        type="time" 
                        value={customRange.start}
                        onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                        className="h-10 bg-white border-none rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 ml-1">Do</Label>
                      <Input 
                        type="time" 
                        value={customRange.end}
                        onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                        className="h-10 bg-white border-none rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Kliknij w pole, aby przypisać</h2>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Pełna obsada</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Brak/Niepełna</span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-[10px] font-black text-slate-300 uppercase sticky left-0 bg-white z-20 min-w-[100px]">Pracownik</th>
                        {monthDays.map(d => {
                          const status = getDayCoverageStatus(d.date);
                          return (
                            <th key={d.date} className="p-2 text-center min-w-[3rem]">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-bold text-slate-300 uppercase leading-none">{d.day}</span>
                                <span className="text-[10px] font-black text-slate-700">{d.date}</span>
                                <div className={`h-1 w-1 rounded-full ${
                                  status === "full" ? "bg-emerald-500" : status === "partial" ? "bg-red-500" : "bg-slate-100"
                                }`} />
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id} className="border-t border-slate-50 group/row">
                          <td className="py-3 pr-4 sticky left-0 bg-white z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-7 w-7 border border-slate-100">
                                  <AvatarFallback className="text-[9px] font-black">{emp.initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[50px]">{emp.name.split(' ')[0]}</span>
                              </div>
                               <Button 
                                 onClick={() => {
                                   if (typeof window !== 'undefined' && window.confirm(`Czy na pewno chcesz wyczyścić cały miesiąc dla pracownika ${emp.name}?`)) {
                                     clearMonth(emp.id);
                                   }
                                 }}
                                 variant="ghost" 
                                 size="icon" 
                                 title="Wyczyść miesiąc"
                                 className="h-6 w-6 opacity-0 group-hover/row:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
                               >
                                 <Plus className="h-3 w-3 rotate-45" />
                               </Button>
                             </div>
                           </td>
                          {monthDays.map(d => {
                            const hasShift = shifts.find(s => s.date === d.date && s.initials === emp.initials && s.shop === selectedShop);
                            return (
                              <td key={d.date} className="p-1">
                                <button 
                                  onClick={() => toggleShift(emp.id, d.date)}
                                  className={`w-full h-12 rounded-xl border-2 transition-all flex items-center justify-center relative group ${
                                    hasShift 
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100" 
                                      : "bg-slate-50 border-transparent hover:border-blue-300"
                                  }`}
                                >
                                  {hasShift ? (
                                    <div className="flex flex-col items-center scale-90">
                                      <span className="text-[8px] font-black uppercase leading-none">{hasShift.shift.split(' ')[0]}</span>
                                      <span className="text-[8px] font-black uppercase leading-none mt-0.5">{hasShift.shift.split(' ')[2]}</span>
                                    </div>
                                  ) : (
                                    <Plus className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-3">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black h-12 rounded-2xl shadow-xl transition-all active:scale-95 text-[11px] uppercase tracking-widest">
                  Zapisz zmiany
                </Button>
                <Button 
                  onClick={clearAll}
                  variant="outline" 
                  className="border-slate-100 text-slate-400 font-black h-12 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-50"
                >
                  Wyczyść
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
