"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Store, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Trophy,
  Filter
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Badge } from "@/components/ui/badge";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";

const salesData = {
  all: [
    { name: '01.05', sales: 4200, profit: 1800 },
    { name: '05.05', sales: 3800, profit: 1600 },
    { name: '10.05', sales: 5100, profit: 2200 },
    { name: '15.05', sales: 4600, profit: 2000 },
    { name: '20.05', sales: 5800, profit: 2600 },
    { name: '25.05', sales: 5200, profit: 2300 },
    { name: '30.05', sales: 6100, profit: 2800 },
  ],
  'trzy-stawy': [
    { name: '01.05', sales: 1500, profit: 700 },
    { name: '10.05', sales: 2100, profit: 900 },
    { name: '20.05', sales: 2400, profit: 1100 },
    { name: '30.05', sales: 2600, profit: 1200 },
  ],
  'galeria-katowicka': [
    { name: '01.05', sales: 1200, profit: 500 },
    { name: '15.05', sales: 1800, profit: 800 },
    { name: '25.05', sales: 1600, profit: 700 },
  ],
  'silesia-city': [
    { name: '05.05', sales: 2800, profit: 1200 },
    { name: '15.05', sales: 2200, profit: 900 },
    { name: '25.05', sales: 2600, profit: 1100 },
  ]
};

const categoryData = {
  all: [
    { name: 'Akcesoria', value: 55, color: '#2563eb' },
    { name: 'Telefony', value: 40, color: '#9333ea' },
    { name: 'Części', value: 5, color: '#10b981' },
  ],
  'trzy-stawy': [
    { name: 'Akcesoria', value: 75, color: '#2563eb' },
    { name: 'Telefony', value: 25, color: '#9333ea' },
  ],
  'galeria-katowicka': [
    { name: 'Telefony', value: 50, color: '#9333ea' },
    { name: 'Akcesoria', value: 40, color: '#2563eb' },
    { name: 'Części', value: 10, color: '#10b981' },
  ],
  'silesia-city': [
    { name: 'Akcesoria', value: 45, color: '#2563eb' },
    { name: 'Telefony', value: 55, color: '#9333ea' },
  ]
};

const employeeData = [
  { name: 'Jan Kowalski', sales: 18400, shopId: 'trzy-stawy' },
  { name: 'Anna Nowak', sales: 15200, shopId: 'galeria-katowicka' },
  { name: 'Marek Wiśniewski', sales: 12100, shopId: 'silesia-city' },
  { name: 'Piotr Zakrzewski', sales: 22500, shopId: 'trzy-stawy' },
  { name: 'Katarzyna Lis', sales: 14200, shopId: 'galeria-katowicka' },
  { name: 'Tomasz Bąk', sales: 11500, shopId: 'silesia-city' },
];

const shopData = [
  { id: 'trzy-stawy', name: 'Trzy Stawy', sales: 28400, trend: '+14%' },
  { id: 'galeria-katowicka', name: 'Galeria Katowicka', sales: 21200, trend: '+8%' },
  { id: 'silesia-city', name: 'Silesia City', sales: 32500, trend: '+18%' },
];

export default function RaportyPage() {
  const [activeTab, setActiveTab] = useState<'sklepy' | 'pracownicy'>('sklepy');
  const [dateFrom, setDateFrom] = useState('2024-05-01');
  const [dateTo, setDateTo] = useState('2024-05-31');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedSaleInReport, setSelectedSaleInReport] = useState<any>(null);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);
  const [isSaleDetailsOpen, setIsSaleDetailsOpen] = useState(false);

  // Mock data for employee specific sales
  const employeeSalesHistory = [
    { 
      id: '1', 
      date: '2024-05-10', 
      time: '14:20', 
      price: '5200 zł', 
      profit: '800 zł', 
      shop: 'Silesia City',
      items: [
        { name: 'iPhone 15 Pro 128GB', category: 'Telefony', price: 5200 }
      ]
    },
    { 
      id: '2', 
      date: '2024-05-12', 
      time: '11:15', 
      price: '50 zł', 
      profit: '45 zł', 
      shop: 'Silesia City',
      items: [
        { name: 'Szkło hartowane 9H', category: 'Akcesoria', price: 50 }
      ]
    },
    { 
      id: '3', 
      date: '2024-05-15', 
      time: '16:45', 
      price: '120 zł', 
      profit: '60 zł', 
      shop: 'Silesia City',
      items: [
        { name: 'Etui MagSafe', category: 'Akcesoria', price: 120 }
      ]
    },
  ];

  const filteredEmployees = selectedShopId === 'all' 
    ? employeeData 
    : employeeData.filter(emp => emp.shopId === selectedShopId);

  const sortedEmployees = [...filteredEmployees].sort((a, b) => b.sales - a.sales);

  const filteredEmployeeSales = employeeSalesHistory
    .filter(sale => sale.date >= dateFrom && sale.date <= dateTo)
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeB - dateTimeA;
    });

  const totalFilteredSalesAmount = filteredEmployeeSales.reduce((sum, sale) => {
    return sum + parseInt(sale.price.replace(' zł', ''));
  }, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6 pb-20">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analityka</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Centrum Raportowania</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <Button 
                variant="ghost" 
                size="sm"
                className={`rounded-xl text-[10px] font-black uppercase px-4 ${activeTab === 'sklepy' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-400'}`}
                onClick={() => setActiveTab('sklepy')}
              >
                <Store className="h-3 w-3 mr-2" />
                Sklepy
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={`rounded-xl text-[10px] font-black uppercase px-4 ${activeTab === 'pracownicy' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-400'}`}
                onClick={() => setActiveTab('pracownicy')}
              >
                <Users className="h-3 w-3 mr-2" />
                Pracownicy
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-[2] flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">Data od</p>
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-transparent font-black text-slate-800 border-none p-0 focus:ring-0 text-sm"
                  />
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">Data do</p>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-transparent font-black text-slate-800 border-none p-0 focus:ring-0 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 w-full">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Filtruj wg punktu</p>
                  <select 
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full bg-transparent font-black text-slate-800 border-none p-0 focus:ring-0 cursor-pointer text-sm"
                  >
                    <option value="all">Wszystkie punkty</option>
                    {shopData.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'sklepy' ? (
          /* SHOPS REPORT VIEW */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">+14.2%</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Przychód {selectedShopId !== 'all' ? shopData.find(s => s.id === selectedShopId)?.name : 'Całkowity'}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {selectedShopId === 'all' 
                      ? '82 100 zł' 
                      : `${shopData.find(s => s.id === selectedShopId)?.sales} zł`}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">+8.5%</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Zysk Netto (Szacowany)</p>
                  <p className="text-2xl font-black text-slate-900">
                    {selectedShopId === 'all' 
                      ? '34 400 zł' 
                      : `${Math.floor(shopData.find(s => s.id === selectedShopId)!.sales * 0.42)} zł`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Trend Chart */}
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-0 border-b border-slate-50">
                <div className="flex justify-between items-center pb-4">
                  <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Trend {selectedShopId !== 'all' ? shopData.find(s => s.id === selectedShopId)?.name : 'Sprzedaży i Zysku'}
                  </CardTitle>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Sprzedaż</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Zysk</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData[selectedShopId as keyof typeof salesData]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category and Shop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-white rounded-3xl">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-blue-600" /> Udział Kategorii
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData[selectedShopId as keyof typeof categoryData]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData[selectedShopId as keyof typeof categoryData].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-slate-900">100%</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Suma</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData[selectedShopId as keyof typeof categoryData].map((cat, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{cat.name}</span>
                        <span className="ml-auto text-[10px] font-black text-slate-900">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedShopId === 'all' && (
                <Card className="border-none shadow-sm bg-white rounded-3xl">
                  <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" /> Ranking Punktów
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {shopData.map((shop, i) => (
                      <div key={i} className="group cursor-pointer" onClick={() => setSelectedShopId(shop.id)}>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-sm font-black text-slate-800">{shop.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shop.sales} zł obrotu</p>
                          </div>
                          <div className="flex items-center text-emerald-500 font-black text-xs">
                            {shop.trend} <ArrowUpRight className="h-3 w-3 ml-0.5" />
                          </div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 group-hover:bg-blue-600 transition-all duration-500" 
                            style={{ width: `${(shop.sales / 35000) * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* EMPLOYEES REPORT VIEW */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Employee Ranking Table-like Cards */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Szczegóły Wykonania</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sortuj: Sprzedaż</span>
              </div>
              
              <div className="space-y-3">
                {sortedEmployees.map((emp, i) => (
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
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-black text-slate-800">{emp.name}</h3>
                            <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 text-slate-400">
                              {shopData.find(s => s.id === emp.shopId)?.name}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Obrót całkowity</p>
                            <p className="text-sm font-black text-slate-900">{emp.sales} zł</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {sortedEmployees.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Brak danych dla tego punktu</p>
                  </div>
                )}
              </div>
            </section>

            {/* Monthly Efficiency Chart */}
             <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
               <CardHeader className="p-6 pb-0">
                 <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest">
                   Porównanie Obrotów {selectedShopId !== 'all' ? `w ${shopData.find(s => s.id === selectedShopId)?.name}` : '(Wszyscy)'}
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={sortedEmployees} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fontSize: 8, fontWeight: 'bold', fill: '#94a3b8'}}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                       />
                       <Tooltip 
                         cursor={{fill: '#f8fafc'}}
                         contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                       />
                       <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={30} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
            </div>
          )}
        </main>

        {/* Employee Sales Modal */}
        <Dialog open={isEmployeeDetailsOpen} onOpenChange={setIsEmployeeDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-3xl border-none p-0 overflow-hidden flex flex-col max-h-[85vh]">
            {selectedEmployee && (
              <>
                <DialogHeader className="p-8 bg-slate-900 text-white">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl text-white">
                      {selectedEmployee.name.split(' ').map((n: any) => n[0]).join('')}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-black mb-1">{selectedEmployee.name}</DialogTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white/10 text-blue-400 border-none px-2 py-0.5 font-black text-[9px] uppercase">
                          {shopData.find(s => s.id === selectedEmployee.shopId)?.name}
                        </Badge>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          Historia sprzedaży
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Date Filter in Modal */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Od</p>
                        <input 
                          type="date" 
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full bg-transparent font-black text-slate-800 border-none p-0 focus:ring-0 text-xs"
                        />
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div className="flex-1">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Do</p>
                        <input 
                          type="date" 
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full bg-transparent font-black text-slate-800 border-none p-0 focus:ring-0 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Obrót w okresie</p>
                      <p className="text-2xl font-black text-slate-900">{totalFilteredSalesAmount} zł</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest mb-1">Liczba transakcji</p>
                      <p className="text-2xl font-black text-emerald-700">{filteredEmployeeSales.length}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-blue-600" /> Operacje
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {filteredEmployeeSales.map((sale) => (
                        <div 
                          key={sale.id} 
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedSaleInReport(sale);
                            setIsSaleDetailsOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{sale.date}, {sale.time}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {sale.items.length} {sale.items.length === 1 ? 'produkt' : 'produkty'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">{sale.price}</p>
                            <p className="text-[9px] font-black text-emerald-500">+{sale.profit}</p>
                          </div>
                        </div>
                      ))}
                      {filteredEmployeeSales.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brak sprzedaży w tym okresie</p>
                        </div>
                      )}
                    </div>
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

        {/* Individual Sale Details Modal (Nested) */}
        <Dialog open={isSaleDetailsOpen} onOpenChange={setIsSaleDetailsOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-3xl border-none p-0 overflow-hidden flex flex-col max-h-[70vh]">
            {selectedSaleInReport && (
              <>
                <DialogHeader className="p-6 bg-blue-600 text-white">
                  <DialogTitle className="text-xl font-black mb-1">Produkty Sprzedaży</DialogTitle>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">
                    {selectedSaleInReport.date}, {selectedSaleInReport.time}
                  </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedSaleInReport.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase">{item.category}</p>
                      </div>
                      <p className="font-black text-slate-900">{item.price} zł</p>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Łączna kwota</span>
                    <span className="text-xl font-black text-slate-900">{selectedSaleInReport.price}</span>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                  <Button 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-xs tracking-widest"
                    onClick={() => setIsSaleDetailsOpen(false)}
                  >
                    Powrót do pracownika
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
}
