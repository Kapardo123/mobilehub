"use client"

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { getLocalStorageSafe, getSessionStorageSafe } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, ArrowLeft, Download, User, Building2, Edit, Trash2, X, Save } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

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
  createdAt: string;
}

export default function InvoicesHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  const { addToast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedInvoices = localStorage.getItem("invoices");
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    const role = getSessionStorageSafe("userRole", null);
    setUserRole(role);
  }, []);

  const saveInvoicesToStorage = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    if (typeof window !== "undefined") {
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    }
  };

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

  const handleDeleteClick = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    if (confirm("Czy na pewno chcesz usunąć tę fakturę?")) {
      const updatedInvoices = invoices.filter((inv) => inv.id !== invoice.id);
      saveInvoicesToStorage(updatedInvoices);
      addToast({
        title: "Faktura usunięta",
        description: "Faktura została pomyślnie usunięta",
        variant: "success"
      });
    }
  };

  const handleEditSubmit = () => {
    if (!editingInvoice) return;
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === editingInvoice.id) {
        return { ...inv, ...editForm };
      }
      return inv;
    });
    saveInvoicesToStorage(updatedInvoices);
    setIsEditDialogOpen(false);
    setEditingInvoice(null);
    addToast({
      title: "Faktura zaktualizowana",
      description: "Faktura została pomyślnie zaktualizowana",
      variant: "success"
    });
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
            <p className="text-primary/70 font-medium">Wszystkie wygenerowane faktury</p>
          </div>
        </div>

        {invoices.length === 0 ? (
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
