"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MapPin, 
  Store, 
  Mail, 
  Trash2, 
  Edit2,
  ArrowLeft,
  Building2,
  Users,
  Phone,
  Hash
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionStorageSafe } from "@/lib/storage";
import { shopsService } from "@/lib/supabase/shops";
import { salesService } from "@/lib/supabase/sales";
import { costsService } from "@/lib/supabase/costs";
import { cashRegisterService } from "@/lib/supabase/cashRegister";
import { shiftsService } from "@/lib/supabase/shifts";
import { documentsService } from "@/lib/supabase/documents";
import { inventoryService } from "@/lib/supabase/inventory";
import { invoicesService } from "@/lib/supabase/invoices";
import { auditService } from "@/lib/supabase/actions";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface Shop {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  employees: number;
  is_active?: boolean;
}

interface NewShopForm {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
}

interface EditShopForm {
  id: string;
  name: string;
  address: string;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
}

export default function SklepyPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role) {
      router.push("/login");
    }
    setUserRole(role);
  }, [router]);

  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      const shopsData = await shopsService.getAll();
      
      const shopsWithEmployees = await Promise.all(shopsData.map(async (shop) => {
        const { data: userShops } = await supabase
          .from('user_shops')
          .select('user_id, users!inner(role, first_name, last_name, deleted_at, is_active)')
          .eq('shop_id', shop.id)
          .is('unassigned_at', null);
        
        const employeeCount = userShops?.filter((us: any) => {
          return (
            us.users?.role !== 'owner' &&
            !us.users?.deleted_at &&
            us.users?.is_active
          );
        }).length || 0;
        
        return {
          id: shop.id,
          code: shop.code,
          name: shop.name,
          address: shop.address,
          city: shop.city,
          postal_code: shop.postal_code,
          phone: shop.phone,
          email: shop.email,
          employees: employeeCount,
          is_active: shop.is_active
        };
      }));
      
      setShops(shopsWithEmployees);
    } catch (error) {
      console.error('Błąd podczas ładowania sklepów:', error);
      addToast({
        type: "error",
        title: "Błąd ładowania",
        message: "Nie udało się załadować listy sklepów"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [newShop, setNewShop] = useState<NewShopForm>({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    email: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<EditShopForm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const validateShop = (shop: { name: string; address: string; city: string; postal_code: string; email: string }): string | null => {
    if (!shop.name.trim()) return "Nazwa sklepu jest wymagana";
    if (shop.name.trim().length < 2) return "Nazwa sklepu musi mieć co najmniej 2 znaki";
    if (!shop.address.trim()) return "Adres jest wymagany";
    if (!shop.city.trim()) return "Miasto jest wymagane";
    if (!shop.postal_code.trim()) return "Kod pocztowy jest wymagany";
    
    const postalCodeRegex = /^\d{2}-\d{3}$/;
    if (!postalCodeRegex.test(shop.postal_code.trim())) {
      return "Kod pocztowy musi być w formacie XX-XXX";
    }
    
    if (shop.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shop.email.trim())) {
        return "Nieprawidłowy format adresu email";
      }
    }
    
    return null;
  };

  const generateCode = (name: string, existingShops: Shop[]): string => {
    let baseCode = name.toLowerCase()
      .replace(/[ęóąśłżźćń]/g, (c) => ({
        'ę': 'e', 'ó': 'o', 'ą': 'a', 'ś': 's',
        'ł': 'l', 'ż': 'z', 'ź': 'z', 'ć': 'c', 'ń': 'n'
      }[c] || c))
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 15);
    
    if (existingShops.some(s => s.code === baseCode)) {
      baseCode = baseCode + '_' + Date.now().toString(36);
    }
    
    return baseCode;
  };

  const handleAddShop = async () => {
    const validationError = validateShop(newShop);
    if (validationError) {
      addToast({
        type: "warning",
        title: "Upełnij dane",
        message: validationError
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const createdShop = await shopsService.create({
        code: generateCode(newShop.name, shops),
        name: newShop.name.trim(),
        address: newShop.address.trim(),
        city: newShop.city.trim(),
        postal_code: newShop.postal_code.trim(),
        phone: newShop.phone.trim() || null,
        email: newShop.email.trim() || null,
        is_active: true
      });
      
      const { data: owners } = await supabase
        .from('users')
        .select('id')
        .in('role', ['owner', 'admin'])
        .eq('is_active', true)
        .is('deleted_at', null);
      
      let ownerCount = 0;
      if (owners && owners.length > 0) {
        const ownerAssignments = owners.map((owner: any, index: number) => ({
          user_id: owner.id,
          shop_id: createdShop.id,
          is_primary: index === 0
        }));
        
        const { error: assignError } = await supabase
          .from('user_shops')
          .insert(ownerAssignments);
        
        if (!assignError) {
          ownerCount = owners.length;
        }
      }
      
      const shopWithEmployees: Shop = {
        id: createdShop.id,
        code: createdShop.code,
        name: createdShop.name,
        address: createdShop.address,
        city: createdShop.city,
        postal_code: createdShop.postal_code,
        phone: createdShop.phone,
        email: createdShop.email,
        employees: 0,
        is_active: createdShop.is_active
      };

      setShops([...shops, shopWithEmployees]);
      setNewShop({ name: "", address: "", city: "", postal_code: "", phone: "", email: "" });
      setIsDialogOpen(false);
      
      window.dispatchEvent(new CustomEvent('shops_updated'));
      window.dispatchEvent(new CustomEvent('data_updated'));
      
      addToast({
        type: "success",
        title: "Dodano sklep",
        message: `Pomyślnie dodano sklep: ${createdShop.name}${ownerCount > 0 ? ` (przypisano ${ownerCount} właścicieli)` : ''}`
      });
    } catch (error: any) {
      console.error('Błąd podczas dodawania sklepu:', error);
      
      let errorMessage = "Wystąpił nieoczekiwany błąd podczas dodawania sklepu";
      
      if (error?.code === '23505' || error?.message?.toLowerCase().includes('unique') || error?.message?.toLowerCase().includes('duplicate')) {
        errorMessage = "Sklep z taką nazwą lub kodem już istnieje";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: "error",
        title: "Błąd dodawania sklepu",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (shop: Shop) => {
    setEditingShop({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      city: shop.city,
      postal_code: shop.postal_code,
      phone: shop.phone,
      email: shop.email
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateShop = async () => {
    if (!editingShop) return;
    
    const validationError = validateShop({
      name: editingShop.name,
      address: editingShop.address,
      city: editingShop.city || "",
      postal_code: editingShop.postal_code || "",
      email: editingShop.email || ""
    });
    
    if (validationError) {
      addToast({
        type: "warning",
        title: "Upełnij dane",
        message: validationError
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedShop = await shopsService.update(editingShop.id, {
        name: editingShop.name.trim(),
        address: editingShop.address.trim(),
        city: editingShop.city?.trim() || null,
        postal_code: editingShop.postal_code?.trim() || null,
        phone: editingShop.phone?.trim() || null,
        email: editingShop.email?.trim() || null
      });
      
      setShops(prev => prev.map(s => s.id === editingShop.id ? {
        ...s,
        name: updatedShop.name,
        address: updatedShop.address,
        city: updatedShop.city,
        postal_code: updatedShop.postal_code,
        phone: updatedShop.phone,
        email: updatedShop.email
      } : s));
      
      setEditingShop(null);
      setIsEditDialogOpen(false);
      
      window.dispatchEvent(new CustomEvent('shops_updated'));
      window.dispatchEvent(new CustomEvent('data_updated'));
      
      addToast({
        type: "success",
        title: "Zaktualizowano sklep",
        message: `Pomyślnie zaktualizowano dane sklepu: ${updatedShop.name}`
      });
    } catch (error: any) {
      console.error('Błąd podczas aktualizacji sklepu:', error);
      
      let errorMessage = "Wystąpił nieoczekiwany błąd podczas aktualizacji sklepu";
      if (error?.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: "error",
        title: "Błąd aktualizacji",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm(`CZY NA PEWNO CHCESZ USUNĄĆ SKLEP: ${name.toUpperCase()}?\n\n⚠️ UWAGA: Usunięcie sklepu spowoduje TRWAŁE usunięcie wszystkich powiązanych danych:\n\n• 📊 Sprzedaże i pozycje sprzedaży\n• 💰 Koszty i doładowania\n• 📄 Faktury i ich pozycje\n• 📋 Dokumenty\n• 📦 Magazyn/towar\n• 🕐 Zmiany pracowników\n• 💵 Zamknięcia kasy\n• 📝 Logi audytowe\n• 👥 Powiązania pracowników\n\nTej operacji nie można cofnąć!`)) {
      setIsDeleting(id);
      
      try {
        await supabase.from('user_shops').delete().eq('shop_id', id);
        await auditService.deleteByShopId(id);
        await cashRegisterService.deleteByShopId(id);
        await shiftsService.deleteByShopId(id);
        
        const { data: docs } = await supabase.from('documents').select('id, file_path').eq('shop_id', id);
        if (docs && docs.length > 0) {
          for (const doc of docs) {
            if (doc.file_path) {
              try {
                await supabase.storage.from('documents').remove([doc.file_path]);
              } catch (storageError) {
                console.warn('Błąd usuwania pliku z storage:', storageError);
              }
            }
          }
        }
        await documentsService.deleteByShopId(id);
        await invoicesService.deleteByShopId(id);
        await costsService.deleteByShopId(id);
        await salesService.deleteByShopId(id);
        await inventoryService.deleteByShopId(id);
        await shopsService.softDelete(id);
        
        setShops(prev => prev.filter(s => s.id !== id));
        
        window.dispatchEvent(new CustomEvent('shops_updated'));
        window.dispatchEvent(new CustomEvent('data_updated'));
        
        addToast({
          type: "success",
          title: "Usunięto sklep",
          message: `Pomyślnie usunięto sklep: ${name}`
        });
      } catch (error) {
        console.error('Błąd podczas usuwania sklepu:', error);
        
        addToast({
          type: "error",
          title: "Błąd usuwania",
          message: "Wystąpił błąd podczas usuwania sklepu. Niektóre dane mogą nie zostać usunięte."
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">Zarządzanie Sklepami</h1>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Twoje punkty sprzedaży</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-10 gap-2 shadow-lg shadow-primary/10">
                <Plus className="h-4 w-4" />
                Dodaj Sklep
              </Button>
            }></DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-primary text-white text-left">
                <DialogTitle className="text-2xl font-black mb-1">Nowy Sklep</DialogTitle>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Dodaj nowy punkt sprzedaży do systemu</p>
              </DialogHeader>

              <div className="p-8 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Store className="h-3 w-3" /> Nazwa Sklepu <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      value={newShop.name}
                      onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                      placeholder="np. Kaufland Włocławek"
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Adres <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      value={newShop.address}
                      onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                      placeholder="ul. Kolorowa 1"
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Miasto <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={newShop.city}
                        onChange={(e) => setNewShop({ ...newShop, city: e.target.value })}
                        placeholder="Włocławek"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Hash className="h-3 w-3" /> Kod <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={newShop.postal_code}
                        onChange={(e) => setNewShop({ ...newShop, postal_code: e.target.value })}
                        placeholder="00-000"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Phone className="h-3 w-3" /> Telefon
                      </Label>
                      <Input 
                        value={newShop.phone}
                        onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                        placeholder="+48 123 456 789"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Email
                      </Label>
                      <Input 
                        value={newShop.email}
                        onChange={(e) => setNewShop({ ...newShop, email: e.target.value })}
                        placeholder="sklep@firma.pl"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-accent"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleAddShop}
                    disabled={isSubmitting}
                    className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10 disabled:opacity-50"
                  >
                    {isSubmitting ? "Dodawanie..." : "Dodaj Punkt"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-secondary text-white text-left">
                <DialogTitle className="text-2xl font-black mb-1">Edytuj Sklep</DialogTitle>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Zmień dane punktu sprzedaży</p>
              </DialogHeader>

              <div className="p-8 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Store className="h-3 w-3" /> Nazwa Sklepu <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      value={editingShop?.name || ""}
                      onChange={(e) => setEditingShop(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="np. Kaufland Włocławek"
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Adres <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      value={editingShop?.address || ""}
                      onChange={(e) => setEditingShop(prev => prev ? { ...prev, address: e.target.value } : null)}
                      placeholder="ul. Kolorowa 1"
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Miasto <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={editingShop?.city || ""}
                        onChange={(e) => setEditingShop(prev => prev ? { ...prev, city: e.target.value } : null)}
                        placeholder="Włocławek"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Hash className="h-3 w-3" /> Kod <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={editingShop?.postal_code || ""}
                        onChange={(e) => setEditingShop(prev => prev ? { ...prev, postal_code: e.target.value } : null)}
                        placeholder="00-000"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Phone className="h-3 w-3" /> Telefon
                      </Label>
                      <Input 
                        value={editingShop?.phone || ""}
                        onChange={(e) => setEditingShop(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        placeholder="+48 123 456 789"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Email
                      </Label>
                      <Input 
                        value={editingShop?.email || ""}
                        onChange={(e) => setEditingShop(prev => prev ? { ...prev, email: e.target.value } : null)}
                        placeholder="sklep@firma.pl"
                        className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-accent"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleUpdateShop}
                    disabled={isSubmitting}
                    className="flex-[2] h-12 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-secondary/10 disabled:opacity-50"
                  >
                    {isSubmitting ? "Zapisywanie..." : "Zapisz Zmiany"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {shops.map((shop) => (
            <Card key={shop.id} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl border border-primary/5 group hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-2 bg-primary group-hover:w-3 transition-all" />
                  <div className="flex-1 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{shop.name}</h3>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3 w-3 text-primary/50" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {shop.address}
                              {shop.city && `, ${shop.city}`}
                              {shop.postal_code && ` ${shop.postal_code}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3 w-3 text-primary/50" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{shop.employees} Pracowników</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-accent text-primary"
                        onClick={() => handleEditClick(shop)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500"
                        onClick={() => handleDeleteShop(shop.id, shop.name)}
                        disabled={isDeleting === shop.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
