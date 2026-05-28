"use client"

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { getSessionStorageSafe } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, ArrowLeft, Download, User, Building2, Edit, Trash2, X, Save, Store } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useInvoicesData } from "@/hooks/useInvoicesData";
import { toISODateString, getCurrentTimePL, formatDatePL } from "@/lib/dateFormat";

interface Invoice {
  id: string;
  customerName: string;
  customerNip: string;
  customerAddress: string;
  customerEmail: string;
  date: string;
  time: string;
  totalPrice: number;
  items: Array<{
    name: string;
    category: string;
    price: number;
  }>;
  employeeName: string;
  shopName: string;
  createdAt: string;
}

export default function InvoicesHistoryPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerNip: "",
    customerAddress: "",
    customerEmail: "",
    date: "",
    time: ""
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentShopId, setCurrentShopId] = useState<string>("");
  const { addToast } = useToast();
  
  const {
    invoices: invoicesData,
    isLoading,
    error,
    updateInvoice,
    deleteInvoice,
    refresh
  } = useInvoicesData();

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (invoicesData.length > 0) {
      console.log('📊 Filtrowanie faktur dla roli:', userRole, '| Shop ID:', currentShopId);
      console.log('  - Łączna liczba faktur w bazie:', invoicesData.length);
      
      let filteredInvoices = invoicesData;
      
      if (userRole === 'employee' && currentShopId) {
        filteredInvoices = invoicesData.filter(inv => inv.shop_id === currentShopId);
        console.log('  - Pracownik widzi tylko faktury ze swojego sklepu:', filteredInvoices.length);
      } else if (userRole === 'owner') {
        console.log('  - Owner widzi wszystkie faktury:', filteredInvoices.length);
      }
      
      const formattedInvoices: Invoice[] = filteredInvoices.map(inv => ({
        id: inv.invoice_number || inv.id,
        customerName: inv.customer?.company_name || `${inv.customer?.first_name || ''} ${inv.customer?.last_name || ''}`.trim() || 'Klient',
        customerNip: inv.customer?.nip || '',
        customerAddress: inv.customer?.address || '',
        customerEmail: inv.customer?.email || '',
        date: inv.issue_date ? toISODateString(new Date(inv.issue_date)) : (inv.created_at ? toISODateString(new Date(inv.created_at)) : ''),
        time: inv.created_at ? getCurrentTimePL() : '',
        totalPrice: Number(inv.total_amount) || 0,
        items: (inv.invoice_items || []).map((item: any) => ({
          name: item.product_name || item.description || 'Pozycja',
          category: item.category || 'inne',
          price: Number(item.unit_price) || 0
        })),
        employeeName: inv.employee ? 
          `${inv.employee.first_name || ''} ${inv.employee.last_name || ''}`.trim() || 
          inv.employee.initials || 
          'Nieznany pracownik' : 
          'Brak danych',
        shopName: inv.shop?.name || inv.shop?.shop_name || 'Nieznany sklep',
        createdAt: inv.created_at
      }));
      
      setInvoices(formattedInvoices);
    }
  }, [invoicesData, userRole, currentShopId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", null);
    setUserRole(role);
    const shopId = getSessionStorageSafe("shopId", "");
    setCurrentShopId(shopId);
  }, []);

  const openInvoice = (invoice: Invoice) => {
    const queryParams = new URLSearchParams({
      id: invoice.id,
      name: invoice.customerName,
      nip: invoice.customerNip,
      address: invoice.customerAddress,
      email: invoice.customerEmail,
      date: invoice.date,
      time: invoice.time,
      price: invoice.totalPrice.toString(),
      items: JSON.stringify(invoice.items)
    });
    window.open(`/faktura/${invoice.id}?${queryParams.toString()}`, "_blank");
  };

  const handleEditClick = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setEditingInvoice(invoice);
    setEditForm({
      customerName: invoice.customerName,
      customerNip: invoice.customerNip,
      customerAddress: invoice.customerAddress,
      customerEmail: invoice.customerEmail,
      date: invoice.date,
      time: invoice.time
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    if (confirm("Czy na pewno chcesz usunąć tę fakturę?")) {
      try {
        const invoiceToDelete = invoicesData.find(inv => 
          (inv.invoice_number || inv.id) === invoice.id
        );
        
        if (invoiceToDelete) {
          await deleteInvoice(invoiceToDelete.id);
        }
        
        addToast({
          title: "Faktura usunięta",
          description: "Faktura została pomyślnie usunięta",
          variant: "success"
        });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        addToast({
          title: "Błąd",
          description: "Nie udało się usunąć faktury",
          variant: "error"
        });
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editingInvoice) return;
    
    try {
      const invoiceToUpdate = invoicesData.find(inv => 
        (inv.invoice_number || inv.id) === editingInvoice.id
      );
      
      if (invoiceToUpdate) {
        await updateInvoice(invoiceToUpdate.id, {
          notes: `Zaktualizowano: ${editForm.customerName}`
        });
        
        await refresh();
      }
      
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      
      addToast({
        title: "Faktura zaktualizowana",
        description: "Faktura została pomyślnie zaktualizowana",
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      addToast({
        title: "Błąd",
        description: "Nie udało się zaktualizować faktury",
        variant: "error"
      });
    }
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <Navbar />
      <main className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-primary/10 text-primary hover:bg-accent">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Historia faktur</h1>
            <p className="text-primary/70 font-medium">
              {userRole === 'employee' ? 'Faktury z Twojego sklepu' : 'Wszystkie wygenerowane faktury'}
            </p>
            {userRole === 'employee' && (
              <p className="text-xs text-primary/50 mt-1 flex items-center gap-1.5">
                <Store className="h-3 w-3" />
                Widzisz tylko faktury wygenerowane w Twoim sklepie
              </p>
            )}
          </div>
        </div>

        {isLoading && (
          <Card className="border-none shadow-xl bg-white rounded-3xl p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-black text-foreground tracking-tight">Ładowanie faktur...</p>
          </Card>
        )}

        {error && (
          <Card className="border-none shadow-xl bg-red-50 rounded-3xl p-6 text-center">
            <p className="text-red-700 font-bold text-lg mb-2">Błąd ładowania danych</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button 
              onClick={refresh}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Spróbuj ponownie
            </Button>
          </Card>
        )}

        {!isLoading && !error && invoices.length === 0 ? (
          <Card className="border-none shadow-xl bg-white rounded-3xl p-12 text-center">
            <FileText className="h-16 w-16 text-primary/20 mx-auto mb-4" />
            <p className="text-xl font-black text-foreground tracking-tight mb-2">Brak faktur</p>
            <p className="text-muted-foreground font-medium">Wygeneruj swoją pierwszą fakturę w zakładce Sprzedaż</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.slice().reverse().map((invoice) => (
              <Card
                key={invoice.id}
                className="border-none shadow-xl bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => openInvoice(invoice)}>
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-foreground tracking-tight">Faktura {invoice.id}</h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm font-bold text-muted-foreground">{invoice.customerName}</p>
                          </div>
                          {invoice.customerNip && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-sm font-bold text-muted-foreground">NIP: {invoice.customerNip}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs font-bold text-muted-foreground">{invoice.date} {invoice.time}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3.5 w-3.5 text-primary/70" />
                          <p className="text-xs font-bold text-primary/80">{invoice.employeeName}</p>
                          <span className="text-primary/30">•</span>
                          <Store className="h-3.5 w-3.5 text-primary/50" />
                          <p className="text-xs font-bold text-primary/60">{invoice.shopName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {userRole === "owner" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10 border border-primary/10 hover:bg-primary/10"
                            onClick={(e) => handleEditClick(e, invoice)}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10 border border-red-100 hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(e, invoice)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <div className="text-right ml-4">
                        <p className="text-2xl font-black text-primary">{invoice.totalPrice} zł</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Suma</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary/5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Pozycje ({invoice.items.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {invoice.items.map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-accent/50 rounded-xl text-xs font-black text-foreground">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Edytuj fakturę</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nazwa klienta</Label>
                <Input
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">NIP</Label>
                <Input
                  value={editForm.customerNip}
                  onChange={(e) => setEditForm({ ...editForm, customerNip: e.target.value })}
                  className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Adres</Label>
                <Input
                  value={editForm.customerAddress}
                  onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })}
                  className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email</Label>
                <Input
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                  className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Data</Label>
                  <Input
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Godzina</Label>
                  <Input
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest h-12 border border-primary/10"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Anuluj
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest h-12"
                  onClick={handleEditSubmit}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
