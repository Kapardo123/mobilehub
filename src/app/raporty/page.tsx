"use client"

import { Navbar } from "@/components/navbar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Download, 
  FileText, 
  Store, 
  Users,
  ShoppingCart,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function RaportyPage() {
  const [activeTab, setActiveTab] = useState<'sklepy' | 'pracownicy'>('sklepy');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);

  const months = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", 
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  const daysOfWeek = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

  // Mock data for employees
  const employeeData = [
    { name: 'Jan Kowalski', sales: 18400, avatar: 'JK', role: 'Pracownik', shop: 'Trzy Stawy' },
    { name: 'Anna Nowak', sales: 15200, avatar: 'AN', role: 'Pracownik', shop: 'Galeria Katowicka' },
    { name: 'Marek Wiśniewski', sales: 12100, avatar: 'MW', role: 'Kierownik', shop: 'Silesia City' },
    { name: 'Piotr Zakrzewski', sales: 22500, avatar: 'PZ', role: 'Właściciel', shop: 'Trzy Stawy' },
  ];

  // Mock data generation based on Excel structure
  const reportData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Simulating profit from previous months (e.g., 5000 PLN per month)
    const previousMonthsProfit = selectedMonth * 5000;
    let cumulativeSum = previousMonthsProfit;
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(selectedYear, selectedMonth, day);
      const dayName = daysOfWeek[date.getDay()];
      
      // Mock values to resemble the Excel screenshot
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const profit = isWeekend ? 0 : Math.floor(Math.random() * 2000) + 300;
      const revenue = profit + Math.floor(Math.random() * 1000) + 200;
      const costs = Math.random() > 0.7 ? -Math.floor(Math.random() * 2000) : 0;
      
      cumulativeSum += profit;
      
      return {
        dayName,
        fullDate: `${day}.${(selectedMonth + 1).toString().padStart(2, '0')}.${selectedYear}`,
        profit,
        revenue,
        costs,
        cumulative: cumulativeSum,
        isWeekend
      };
    });
  }, [selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      profit: acc.profit + curr.profit,
      revenue: acc.revenue + curr.revenue,
      costs: acc.costs + curr.costs
    }), { profit: 0, revenue: 0, costs: 0 });
  }, [reportData]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 lg:p-8 w-full max-w-[1200px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm border border-slate-200">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Raport Miesięczny</h1>
              <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Zestawienie wyników</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "rounded-xl text-[10px] font-black uppercase px-4 h-9 transition-all",
                  activeTab === 'sklepy' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                )}
                onClick={() => setActiveTab('sklepy')}
              >
                <Store className="h-3 w-3 mr-2" />
                Sklepy
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "rounded-xl text-[10px] font-black uppercase px-4 h-9 transition-all",
                  activeTab === 'pracownicy' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                )}
                onClick={() => setActiveTab('pracownicy')}
              >
                <Users className="h-3 w-3 mr-2" />
                Pracownicy
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl"
                onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1 text-center min-w-[140px]">
                <p className="text-xs font-black uppercase tracking-tighter">{months[selectedMonth]}</p>
                <p className="text-[10px] font-bold text-slate-400">{selectedYear}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl"
                onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {activeTab === 'sklepy' ? (
          /* SHOPS VIEW - EXCEL TABLE */
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 border-r border-slate-700">Dzień</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest border-r border-slate-700">L.P.</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-center bg-blue-600/20 border-r border-slate-700">Zysk ({months[selectedMonth].toLowerCase()})</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right border-r border-slate-700">Wpływ</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right border-r border-slate-700">Koszta</TableHead>
                      <TableHead className="text-white font-black uppercase text-[10px] tracking-widest text-right">{selectedYear}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((day, i) => (
                      <TableRow 
                        key={i} 
                        className={cn(
                          "border-b border-slate-200 hover:bg-blue-50/30 transition-colors",
                          day.dayName === "niedziela" ? "bg-slate-50/50" : "",
                          day.costs < -1000 ? "bg-red-50/50" : "",
                          day.profit > 1500 ? "bg-emerald-50/30" : ""
                        )}
                      >
                        <TableCell className="font-bold text-slate-600 text-xs py-3 border-r border-slate-200">{day.dayName}</TableCell>
                        <TableCell className="font-black text-slate-900 text-xs border-r border-slate-200">{day.fullDate}</TableCell>
                        <TableCell className="text-center font-black text-blue-600 bg-blue-50/30 border-r border-slate-200">
                          {day.profit > 0 ? day.profit : 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 border-r border-slate-200">{day.revenue}</TableCell>
                        <TableCell className={cn(
                          "text-right font-black border-r border-slate-200",
                          day.costs < 0 ? "text-red-500" : "text-slate-400"
                        )}>
                          {day.costs !== 0 ? day.costs : 0}
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900 bg-slate-50/50">
                          {day.cumulative}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Summary Row */}
                    <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                      <TableCell colSpan={2} className="text-white font-black uppercase text-[10px] tracking-widest py-6 text-right border-r border-slate-700">Suma Miesiąca:</TableCell>
                      <TableCell className="text-center text-blue-400 font-black text-lg bg-blue-400/10 border-r border-slate-700">{totals.profit}</TableCell>
                      <TableCell className="text-right text-white font-black text-lg border-r border-slate-700">{totals.revenue}</TableCell>
                      <TableCell className="text-right text-red-400 font-black text-lg border-r border-slate-700">{totals.costs}</TableCell>
                      <TableCell className="text-right text-emerald-400 font-black text-xl bg-white/5">
                        {reportData[reportData.length - 1]?.cumulative}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* EMPLOYEES VIEW */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeeData.map((emp, i) => (
                <Card 
                  key={i} 
                  className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setIsEmployeeDetailsOpen(true);
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        {emp.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-black text-slate-800">{emp.name}</h3>
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 text-slate-400">
                            {emp.shop}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Obrót całkowity</p>
                          <p className="text-sm font-black text-slate-900">{emp.sales.toLocaleString()} zł</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Employee Details Modal */}
        <Dialog open={isEmployeeDetailsOpen} onOpenChange={setIsEmployeeDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-3xl border-none p-0 overflow-hidden flex flex-col max-h-[85vh]">
            {selectedEmployee && (
              <>
                <DialogHeader className="p-8 bg-slate-900 text-white border-none">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl text-white">
                      {selectedEmployee.avatar}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-black mb-1">{selectedEmployee.name}</DialogTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white/10 text-blue-400 border-none px-2 py-0.5 font-black text-[9px] uppercase">
                          {selectedEmployee.shop}
                        </Badge>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          {selectedEmployee.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Obrót w okresie</p>
                      <p className="text-2xl font-black text-slate-900">{selectedEmployee.sales.toLocaleString()} zł</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest mb-1">Status</p>
                      <p className="text-2xl font-black text-emerald-700">Aktywny</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Szczegółowa historia transakcji dostępna wkrótce</p>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                  <Button 
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-xs tracking-widest"
                    onClick={() => setIsEmployeeDetailsOpen(false)}
                  >
                    Zamknij podgląd
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-white rounded-3xl p-6 border-l-4 border-blue-600">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Progres roczny</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900">254,4%</h3>
              <TrendingUp className="h-8 w-8 text-emerald-500 mb-1" />
            </div>
          </Card>

          <Card className="border-none shadow-md bg-slate-900 rounded-3xl p-6 md:col-span-2 overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Średni zysk dzienny</p>
                <h3 className="text-3xl font-black text-white">{(totals.profit / reportData.length).toFixed(0)} <span className="text-sm opacity-40">zł / dzień</span></h3>
              </div>
              <div className="flex gap-2">
                <Button className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl font-bold text-xs gap-2">
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white border-none rounded-xl font-bold text-xs gap-2 shadow-lg shadow-blue-900/20">
                  <FileText className="h-4 w-4" /> Eksportuj CSV
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </Card>
        </div>
      </main>
    </div>
  );
}
