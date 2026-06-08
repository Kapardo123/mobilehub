"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSessionStorageSafe } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShoppingCart, 
  Receipt, 
  DollarSign, 
  FileText, 
  Package, 
  ArrowLeft,
  Loader2
} from "lucide-react";

interface ResetStats {
  sales: number;
  sale_items: number;
  costs: number;
  invoices: number;
  invoice_items: number;
  cash_register_closings: number;
  shifts: number;
  documents: number;
  inventory: number;
  audit_logs: number;
}

export default function ResetDataPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedTwice, setConfirmedTwice] = useState(false);
  const [stats, setStats] = useState<ResetStats | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{ success: boolean; message: string; deletedCounts?: ResetStats } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    if (!role || (role !== "owner" && role !== "admin")) {
      router.push("/login");
    }
    setUserRole(role);
  }, [router]);

  useEffect(() => {
    loadStats();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const newStats: ResetStats = {
        sales: 0,
        sale_items: 0,
        costs: 0,
        invoices: 0,
        invoice_items: 0,
        cash_register_closings: 0,
        shifts: 0,
        documents: 0,
        inventory: 0,
        audit_logs: 0
      };

      const tables = [
        { table: "sales", field: "sales" },
        { table: "sale_items", field: "sale_items" },
        { table: "costs", field: "costs" },
        { table: "invoices", field: "invoices" },
        { table: "invoice_items", field: "invoice_items" },
        { table: "cash_register_closings", field: "cash_register_closings" },
        { table: "shifts", field: "shifts" },
        { table: "documents", field: "documents" },
        { table: "inventory", field: "inventory" },
        { table: "audit_logs", field: "audit_logs" }
      ];

      for (const { table, field } of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          
          if (!error) {
            (newStats as any)[field] = count || 0;
          }
        } catch (e) {
          console.error(`Błąd ładowania statystyk dla ${table}:`, e);
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error("Błąd ładowania statystyk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirmed || !confirmedTwice) return;

    if (!window.confirm("⚠️ OSTATECZNE POTWIERDZENIE\n\nCzy NA PEWNO chcesz usunąć WSZYSTKIE dane finansowe, raporty i statystyki?\n\nTej operacji NIE MOŻNA cofnąć!")) {
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setResult(null);

    const deletedCounts: ResetStats = {
      sales: 0,
      sale_items: 0,
      costs: 0,
      invoices: 0,
      invoice_items: 0,
      cash_register_closings: 0,
      shifts: 0,
      documents: 0,
      inventory: 0,
      audit_logs: 0
    };

    try {
      addLog("🚀 Rozpoczynam czyszczenie danych finansowych...");

      // 1. Sale items (nie ma foreign key do shop_id, ale są połączone z sales)
      addLog("1️⃣ Usuwanie pozycji sprzedaży (sale_items)...");
      const { data: allSalesIds } = await supabase.from("sales").select("id");
      if (allSalesIds && allSalesIds.length > 0) {
        const ids = allSalesIds.map((s: any) => s.id);
        const { count: itemsCount } = await supabase.from("sale_items").select("*", { count: "exact", head: true }).in("sale_id", ids);
        const { error: itemsError } = await supabase.from("sale_items").delete().in("sale_id", ids);
        if (itemsError) throw itemsError;
        deletedCounts.sale_items = itemsCount || 0;
        addLog(`   ✅ Usunięto ${itemsCount || 0} pozycji sprzedaży`);
      } else {
        addLog("   ℹ️ Brak pozycji sprzedaży do usunięcia");
      }

      // 2. Sales
      addLog("2️⃣ Usuwanie sprzedaży (sales)...");
      const { count: salesCount } = await supabase.from("sales").select("*", { count: "exact", head: true });
      const { error: salesError } = await supabase.from("sales").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (salesError) throw salesError;
      deletedCounts.sales = salesCount || 0;
      addLog(`   ✅ Usunięto ${salesCount || 0} transakcji sprzedaży`);

      // 3. Invoice items
      addLog("3️⃣ Usuwanie pozycji faktur (invoice_items)...");
      const { data: allInvoicesIds } = await supabase.from("invoices").select("id");
      if (allInvoicesIds && allInvoicesIds.length > 0) {
        const ids = allInvoicesIds.map((i: any) => i.id);
        const { count: invItemsCount } = await supabase.from("invoice_items").select("*", { count: "exact", head: true }).in("invoice_id", ids);
        const { error: invItemsError } = await supabase.from("invoice_items").delete().in("invoice_id", ids);
        if (invItemsError) throw invItemsError;
        deletedCounts.invoice_items = invItemsCount || 0;
        addLog(`   ✅ Usunięto ${invItemsCount || 0} pozycji faktur`);
      } else {
        addLog("   ℹ️ Brak pozycji faktur do usunięcia");
      }

      // 4. Invoices
      addLog("4️⃣ Usuwanie faktur (invoices)...");
      const { count: invoicesCount } = await supabase.from("invoices").select("*", { count: "exact", head: true });
      const { error: invoicesError } = await supabase.from("invoices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (invoicesError) throw invoicesError;
      deletedCounts.invoices = invoicesCount || 0;
      addLog(`   ✅ Usunięto ${invoicesCount || 0} faktur`);

      // 5. Costs
      addLog("5️⃣ Usuwanie kosztów (costs)...");
      const { count: costsCount } = await supabase.from("costs").select("*", { count: "exact", head: true });
      const { error: costsError } = await supabase.from("costs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (costsError) throw costsError;
      deletedCounts.costs = costsCount || 0;
      addLog(`   ✅ Usunięto ${costsCount || 0} wpisów kosztów`);

      // 6. Cash register closings
      addLog("6️⃣ Usuwanie zamknięć kasy (cash_register_closings)...");
      const { count: closingsCount } = await supabase.from("cash_register_closings").select("*", { count: "exact", head: true });
      const { error: closingsError } = await supabase.from("cash_register_closings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (closingsError) throw closingsError;
      deletedCounts.cash_register_closings = closingsCount || 0;
      addLog(`   ✅ Usunięto ${closingsCount || 0} zamknięć kasy`);

      // 7. Shifts
      addLog("7️⃣ Usuwanie zmian pracowników (shifts)...");
      const { count: shiftsCount } = await supabase.from("shifts").select("*", { count: "exact", head: true });
      const { error: shiftsError } = await supabase.from("shifts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (shiftsError) throw shiftsError;
      deletedCounts.shifts = shiftsCount || 0;
      addLog(`   ✅ Usunięto ${shiftsCount || 0} zmian pracowników`);

      // 8. Documents (również pliki z storage)
      addLog("8️⃣ Usuwanie dokumentów (documents) i plików...");
      const { data: docs } = await supabase.from("documents").select("id, file_path");
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          if ((doc as any).file_path) {
            try {
              await supabase.storage.from("documents").remove([(doc as any).file_path]);
            } catch (storageErr) {
              console.warn("Błąd usuwania pliku z storage:", storageErr);
            }
          }
        }
      }
      const { count: docsCount } = await supabase.from("documents").select("*", { count: "exact", head: true });
      const { error: docsError } = await supabase.from("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (docsError) throw docsError;
      deletedCounts.documents = docsCount || 0;
      addLog(`   ✅ Usunięto ${docsCount || 0} dokumentów (wraz z plikami)`);

      // 9. Inventory / magazyn
      addLog("9️⃣ Usuwanie towaru z magazynu (inventory)...");
      const { count: inventoryCount } = await supabase.from("inventory").select("*", { count: "exact", head: true });
      const { error: inventoryError } = await supabase.from("inventory").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (inventoryError) throw inventoryError;
      deletedCounts.inventory = inventoryCount || 0;
      addLog(`   ✅ Usunięto ${inventoryCount || 0} pozycji magazynu`);

      // 10. Audit logs
      addLog("🔟 Usuwanie logów audytu (audit_logs)...");
      try {
        const { count: auditCount } = await supabase.from("audit_logs").select("*", { count: "exact", head: true });
        const { error: auditError } = await supabase.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (!auditError) {
          deletedCounts.audit_logs = auditCount || 0;
          addLog(`   ✅ Usunięto ${auditCount || 0} logów audytu`);
        } else {
          addLog(`   ⚠️ Nie znaleziono tabeli audit_logs lub brak uprawnień`);
        }
      } catch (auditErr) {
        addLog(`   ⚠️ Nie znaleziono tabeli audit_logs lub brak uprawnień`);
      }

      // Wysłanie zdarzenia odświeżenia danych
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("data_updated"));
      }

      addLog("✅✅✅ Zakończono pomyślnie czyszczenie wszystkich danych finansowych!");
      
      const totalDeleted = Object.values(deletedCounts).reduce((a, b) => a + b, 0);
      setResult({
        success: true,
        message: `Pomyślnie usunięto ${totalDeleted} rekordów z wszystkich tabel finansowych.`,
        deletedCounts
      });

      await loadStats();
    } catch (error: any) {
      console.error("Błąd podczas resetowania danych:", error);
      addLog(`❌ BŁĄD: ${error.message || "Nieznany błąd"}`);
      setResult({
        success: false,
        message: `Wystąpił błąd podczas resetowania danych: ${error.message || "Nieznany błąd"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalRecords = stats 
    ? stats.sales + stats.sale_items + stats.costs + stats.invoices + stats.invoice_items + 
      stats.cash_register_closings + stats.shifts + stats.documents + stats.inventory + stats.audit_logs 
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-6 pb-24 pt-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">🧹 Reset Danych Finansowych</h1>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Nieodwracalne czyszczenie wszystkich sklepów</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-10 w-10 text-red-500 shrink-0" />
            <div className="space-y-2">
              <h2 className="text-lg font-black text-red-700 uppercase">⚠️ OSTRZEŻENIE - OPERACJA NIEODWRACALNA</h2>
              <p className="text-sm font-semibold text-red-600">
                Ta strona pozwala na <strong>TRWAŁE usunięcie WSZYSTKICH</strong> danych finansowych, raportów i statystyk 
                z <strong>WSZYSTKICH</strong> sklepów w systemie.
              </p>
              <p className="text-sm text-red-700">
                Zostaną usunięte: <strong>sprzedaże, koszty, faktury, zamknięcia kasy, zmiany pracowników, dokumenty, magazyn i logi</strong>.
              </p>
              <p className="text-sm font-black text-red-800 uppercase">
                Sklepy, użytkownicy i uprawnienia pozostaną nietknięte.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground uppercase flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> Aktualne dane w bazie
            </h3>
            <div className="text-right">
              <div className="text-3xl font-black text-primary">{totalRecords.toLocaleString()}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">łącznie rekordów</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats && (
              <>
                <StatCard icon={<ShoppingCart className="h-5 w-5" />} label="Sprzedaż" value={stats.sales} color="text-emerald-600" />
                <StatCard icon={<Receipt className="h-5 w-5" />} label="Pozycje sprz." value={stats.sale_items} color="text-emerald-500" />
                <StatCard icon={<DollarSign className="h-5 w-5" />} label="Koszty" value={stats.costs} color="text-red-500" />
                <StatCard icon={<FileText className="h-5 w-5" />} label="Faktury" value={stats.invoices} color="text-blue-500" />
                <StatCard icon={<Receipt className="h-5 w-5" />} label="Pozycje fakt." value={stats.invoice_items} color="text-blue-400" />
                <StatCard icon={<Clock className="h-5 w-5" />} label="Zamknięcia kasy" value={stats.cash_register_closings} color="text-purple-500" />
                <StatCard icon={<Clock className="h-5 w-5" />} label="Zmiany prac." value={stats.shifts} color="text-orange-500" />
                <StatCard icon={<FileText className="h-5 w-5" />} label="Dokumenty" value={stats.documents} color="text-indigo-500" />
                <StatCard icon={<Package className="h-5 w-5" />} label="Magazyn" value={stats.inventory} color="text-amber-500" />
                <StatCard icon={<Database className="h-5 w-5" />} label="Logi audytu" value={stats.audit_logs} color="text-gray-500" />
              </>
            )}
          </div>
        </div>

        {/* Confirmation */}
        {!result && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 space-y-4">
            <h3 className="text-lg font-black text-foreground uppercase flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Potwierdzenie operacji
            </h3>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-accent/50 transition-colors">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isLoading}
                className="mt-1 h-5 w-5 rounded-md border-2 border-primary text-primary focus:ring-2 focus:ring-primary/30"
              />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Rozumiem, że ta operacja jest NIEODWRACALNA
                </div>
                <div className="text-xs text-muted-foreground">
                  Wszystkie dane finansowe zostaną trwale usunięte z bazy danych.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-accent/50 transition-colors">
              <input
                type="checkbox"
                checked={confirmedTwice}
                onChange={(e) => setConfirmedTwice(e.target.checked)}
                disabled={isLoading || !confirmed}
                className="mt-1 h-5 w-5 rounded-md border-2 border-primary text-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Chcę usunąć WSZYSTKIE dane finansowe dla WSZYSTKICH sklepów
                </div>
                <div className="text-xs text-muted-foreground">
                  Obejmuje to sprzedaż, koszty, faktury, zamknięcia kasy, magazyn i dokumenty.
                </div>
              </div>
            </label>

            <Button
              onClick={handleReset}
              disabled={!confirmed || !confirmedTwice || isLoading || totalRecords === 0}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:hover:bg-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  &nbsp; Usuwanie danych w toku...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  &nbsp; 🗑️ Usuń WSZYSTKIE dane finansowe ({totalRecords.toLocaleString()} rekordów)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-black rounded-2xl p-6 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-widest text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Dziennik operacji
            </h3>
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-green-300">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-6 border-2 ${result.success ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}`}>
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle className="h-10 w-10 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-red-500 shrink-0" />
              )}
              <div className="space-y-3 flex-1">
                <h2 className={`text-lg font-black uppercase ${result.success ? "text-emerald-700" : "text-red-700"}`}>
                  {result.success ? "✅ SUKCES! Dane zostały usunięte" : "❌ BŁĄD podczas usuwania danych"}
                </h2>
                <p className={`text-sm font-semibold ${result.success ? "text-emerald-700" : "text-red-700"}`}>
                  {result.message}
                </p>

                {result.success && result.deletedCounts && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-200">
                    <ResultStat label="Sprzedaż" value={result.deletedCounts.sales} />
                    <ResultStat label="Pozycje sprz." value={result.deletedCounts.sale_items} />
                    <ResultStat label="Koszty" value={result.deletedCounts.costs} />
                    <ResultStat label="Faktury" value={result.deletedCounts.invoices} />
                    <ResultStat label="Zamknięcia kasy" value={result.deletedCounts.cash_register_closings} />
                    <ResultStat label="Zmiany prac." value={result.deletedCounts.shifts} />
                    <ResultStat label="Dokumenty" value={result.deletedCounts.documents} />
                    <ResultStat label="Magazyn" value={result.deletedCounts.inventory} />
                    <ResultStat label="Logi" value={result.deletedCounts.audit_logs} />
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setConfirmed(false);
                      setConfirmedTwice(false);
                      setLogs([]);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase text-xs tracking-widest h-12"
                  >
                    Gotowe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-accent/30 rounded-xl p-4 border border-primary/5 hover:border-primary/20 transition-colors">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-black text-foreground">{value.toLocaleString()}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-emerald-100/50 rounded-lg p-3 text-center">
      <div className="text-xl font-black text-emerald-700">{value.toLocaleString()}</div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">{label}</div>
    </div>
  );
}
