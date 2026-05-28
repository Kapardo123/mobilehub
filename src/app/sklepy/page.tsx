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
  Users
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionStorageSafe } from "@/lib/storage";
import { usersService } from "@/lib/supabase/users";
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

interface Shop {
  id: string;
  name: string;
  address: string;
  employees: number;
  is_active?: boolean;
}

export default function SklepyPage() {
  const router = useRouter();
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
      console.log('Pobrano sklepy z bazy:', shopsData);
      
      const shopsWithEmployees = await Promise.all(shopsData.map(async (shop) => {
        const { count } = await supabase
          .from('user_shops')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shop.id)
          .is('unassigned_at', null);
        
        return {
          id: shop.id,
          name: shop.name,
          address: shop.address || 'Brak adresu',
          employees: count || 0,
          is_active: shop.is_active
        };
      }));
      
      setShops(shopsWithEmployees);
    } catch (error) {
      console.error('Błąd podczas ładowania sklepów:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [newShop, setNewShop] = useState({
    name: "",
    address: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const handleAddShop = async () => {
    if (!newShop.name || !newShop.address) return;
    
    try {
      console.log('Dodawanie nowego sklepu:', newShop);
      
      const createdShop = await shopsService.create({
        code: newShop.name.toLowerCase().replace(/\s+/g, '_').substring(0, 20),
        name: newShop.name,
        address: newShop.address,
        is_active: true
      });
      
      console.log('Utworzono sklep w bazie:', createdShop);
      
      const { data: owners } = await supabase
        .from('users')
        .select('id')
        .in('role', ['owner', 'admin'])
        .eq('is_active', true)
        .is('deleted_at', null);
      
      console.log('Znaleziono właścicieli:', owners?.length || 0);
      
      if (owners && owners.length > 0) {
        const ownerAssignments = owners.map((owner, index) => ({
          user_id: owner.id,
          shop_id: createdShop.id,
          is_primary: index === 0
        }));
        
        const { error: assignError } = await supabase
          .from('user_shops')
          .insert(ownerAssignments);
        
        if (assignError) {
          console.error('Błąd przypisywania właścicieli do sklepu:', assignError);
        } else {
          console.log(`Przypisano ${owners.length} właścicieli do sklepu ${createdShop.name}`);
          
          const shopWithEmployees: Shop = {
            id: createdShop.id,
            name: createdShop.name,
            address: createdShop.address || newShop.address,
            employees: owners.length,
            is_active: createdShop.is_active
          };

          setShops([...shops, shopWithEmployees]);
          setNewShop({ name: "", address: "" });
          setIsDialogOpen(false);
          
          window.dispatchEvent(new CustomEvent('shops_updated'));
          alert(`✅ Dodano sklep: ${createdShop.name}\n👤 Automatycznie przypisano ${owners.length} właścicieli`);
          return;
        }
      }
      
      const shop: Shop = {
        id: createdShop.id,
        name: createdShop.name,
        address: createdShop.address || newShop.address,
        employees: 0,
        is_active: createdShop.is_active
      };

      setShops([...shops, shop]);
      setNewShop({ name: "", address: "" });
      setIsDialogOpen(false);
      
      window.dispatchEvent(new CustomEvent('shops_updated'));
      alert(`✅ Dodano sklep: ${createdShop.name}`);
    } catch (error: any) {
      console.error('Błąd podczas dodawania sklepu:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details (supabase):', error?.details);
      console.error('Error hint:', error?.hint);
      
      alert('Błąd podczas dodawania sklepu:\n\n' + 
        (error?.message || 'Nieznany błąd') + 
        '\n\nCode: ' + (error?.code || 'brak') +
        '\nDetails: ' + (error?.details || 'brak'));
    }
  };

  const handleEditClick = (shop: Shop) => {
    setEditingShop(shop);
    setIsEditDialogOpen(true);
  };

  const handleUpdateShop = async () => {
    if (!editingShop || !editingShop.name || !editingShop.address) return;
    
    try {
      console.log('Aktualizacja sklepu:', editingShop);
      
      const updatedShop = await shopsService.update(editingShop.id, {
        name: editingShop.name,
        address: editingShop.address
      });
      
      console.log('Zaktualizowano sklep w bazie:', updatedShop);
      
      setShops(prev => prev.map(s => s.id === editingShop.id ? {
        ...s,
        name: updatedShop.name,
        address: updatedShop.address || editingShop.address
      } : s));
      setEditingShop(null);
      setIsEditDialogOpen(false);
      
      window.dispatchEvent(new CustomEvent('shops_updated'));
      alert(`✅ Zaktualizowano sklep: ${updatedShop.name}`);
    } catch (error) {
      console.error('Błąd podczas aktualizacji sklepu:', error);
      alert('Błąd podczas aktualizacji sklepu: ' + (error instanceof Error ? error.message : 'Nieznany błąd'));
    }
  };

  const handleDeleteShop = async (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm(`CZY NA PEWNO CHCESZ USUNĄĆ SKLEP: ${name.toUpperCase()}?\n\n⚠️ UWAGA: Usunięcie sklepu spowoduje TRWAŁE usunięcie wszystkich powiązanych danych:\n\n• 📊 Sprzedaże i pozycje sprzedaży\n• 💰 Koszty i doładowania\n• 📄 Faktury i ich pozycje\n• 📋 Dokumenty\n• 📦 Magazyn/towar\n• 🕐 Zmiany pracowników\n• 💵 Zamknięcia kasy\n• 📝 Logi audytowe\n• 👥 Powiązania pracowników\n\nTej operacji nie można cofnąć!`)) {
      try {
        console.log('🗑️ Rozpoczynam kaskadowe usuwanie sklepu:', id, name);
        
        // 1. Usuń powiązania użytkowników ze sklepem (tabela user_shops)
        console.log('1️⃣ Usuwanie powiązań użytkowników...');
        await supabase
          .from('user_shops')
          .delete()
          .eq('shop_id', id);
        
        // 2. Usuń audyt log (najpierw bo może mieć foreign keys)
        console.log('2️⃣ Usuwanie logów audytowych...');
        await auditService.deleteByShopId(id);
        
        // 3. Usuń zamknięcia kasy
        console.log('3️⃣ Usuwanie zamknięć kasy...');
        await cashRegisterService.deleteByShopId(id);
        
        // 4. Usuń zmiany pracowników
        console.log('4️⃣ Usuwanie zmian pracowników...');
        await shiftsService.deleteByShopId(id);
        
        // 5. Usuń dokumenty (również z storage!)
        console.log('5️⃣ Usuwanie dokumentów...');
        const { data: docs } = await supabase
          .from('documents')
          .select('id, file_path')
          .eq('shop_id', id);
        
        if (docs && docs.length > 0) {
          // Usuń pliki z Storage
          for (const doc of docs) {
            if (doc.file_path) {
              try {
                await supabase.storage.from('documents').remove([doc.file_path]);
              } catch (storageError) {
                console.warn('⚠️ Błąd usuwania pliku z storage:', storageError);
              }
            }
          }
        }
        await documentsService.deleteByShopId(id);
        
        // 6. Usuń faktury i ich pozycje
        console.log('6️⃣ Usuwanie faktur...');
        await invoicesService.deleteByShopId(id); // invoice_items usunie się przez CASCADE
        
        // 7. Usuń koszty
        console.log('7️⃣ Usuwanie kosztów...');
        await costsService.deleteByShopId(id);
        
        // 8. Usuń sprzedaż i pozycje sprzedaży
        console.log('8️⃣ Usuwania sprzedaży...');
        await salesService.deleteByShopId(id); // sale_items usunie się przez CASCADE
        
        // 9. Usuń magazyn/towar
        console.log('9️⃣ Usuwanie magazynu...');
        await inventoryService.deleteByShopId(id);
        
        // 10. Na końcu soft-delete samego sklepu
        console.log('🔟 Soft-deleting sklepu...');
        await shopsService.softDelete(id);
        
        console.log('✅ Pomyślnie usunięto sklep i wszystkie powiązane dane:', name);
        
        setShops(prev => prev.filter(s => s.id !== id));
        
        window.dispatchEvent(new CustomEvent('shops_updated'));
        alert(`✅ Usunięto sklep: ${name}\n\nWszystkie powiązane dane zostały trwale usunięte.`);
      } catch (error) {
        console.error('❌ Błąd podczas kaskadowego usuwania sklepu:', error);
        alert('Błąd podczas usuwania sklepu: ' + (error instanceof Error ? error.message : 'Nieznany błąd') + '\n\nSklep mógł zostać częściowo usunięty. Skontaktuj się z administratorem.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6 pb-24">
        {/* Header */}
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
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-primary text-white text-left">
                <DialogTitle className="text-2xl font-black mb-1">Nowy Sklep</DialogTitle>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Dodaj nowy punkt sprzedaży do systemu</p>
              </DialogHeader>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Store className="h-3 w-3" /> Nazwa Sklepu
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
                      <MapPin className="h-3 w-3" /> Adres
                    </Label>
                    <Input 
                      value={newShop.address}
                      onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                      placeholder="ul. Kolorowa 1, 00-000 Miasto"
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-accent"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleAddShop}
                    disabled={!newShop.name || !newShop.address}
                    className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10"
                  >
                    Dodaj Punkt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Shop Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-secondary text-white text-left">
                <DialogTitle className="text-2xl font-black mb-1">Edytuj Sklep</DialogTitle>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Zmień dane punktu sprzedaży</p>
              </DialogHeader>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Store className="h-3 w-3" /> Nazwa Sklepu
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
                      <MapPin className="h-3 w-3" /> Adres
                    </Label>
                    <Input 
                      value={editingShop?.address || ""}
                      onChange={(e) => setEditingShop(prev => prev ? { ...prev, address: e.target.value } : null)}
                      placeholder="ul. Kolorowa 1, 00-000 Miasto"
                      className="h-12 bg-accent/30 border-none rounded-xl font-bold text-xs uppercase"
                    />
                  </div>

                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-accent"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    onClick={handleUpdateShop}
                    disabled={!editingShop?.name || !editingShop?.address}
                    className="flex-[2] h-12 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-secondary/10"
                  >
                    Zapisz Zmiany
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shops List */}
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
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3 w-3 text-primary/50" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{shop.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-3 w-3 text-primary/50" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{shop.employees} Pracowników</span>
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
