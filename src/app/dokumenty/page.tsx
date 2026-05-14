"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, MoreVertical, FileDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DokumentyPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (!role) {
      router.push("/login");
    }
    setUserRole(role);
  }, [router]);
  const documents = [
    { name: "Faktura_FS_2025_03_001.pdf", type: "Faktura", date: "12.03.2025", size: "1.2 MB" },
    { name: "Umowa_Komis_iPhone15.pdf", type: "Umowa", date: "11.03.2025", size: "0.8 MB" },
    { name: "Raport_Miesieczny_Luty.xlsx", type: "Raport", date: "01.03.2025", size: "2.5 MB" },
    { name: "Cennik_Hurtownia_Marzec.pdf", type: "Cennik", date: "28.02.2025", size: "4.1 MB" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={userRole === "employee" ? "/pracownik" : "/"}>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Dokumenty</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest h-10 px-4 text-white">
            <FileDown className="h-4 w-4 mr-2" />
            Wgraj plik
          </Button>
        </div>

        <div className="grid gap-3">
          {documents.map((doc, idx) => (
            <Card key={idx} className="border-none shadow-sm bg-white hover:bg-accent/30 transition-all cursor-pointer rounded-2xl border border-primary/5 group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText className="h-5 w-5 text-primary group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[180px]">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{doc.date} • {doc.size}</p>
                      <Badge variant="secondary" className="text-[8px] h-4 px-1.5 uppercase font-black bg-secondary/20 text-secondary border-none">
                        {doc.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 border-dashed border-primary/10 bg-white/50 p-8 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl group hover:border-primary/30 transition-all">
          <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileDown className="h-7 w-7 text-primary/40" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground uppercase tracking-tight">Przeciągnij pliki tutaj</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">PDF, PNG, JPG lub XLSX do 10MB</p>
          </div>
          <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest h-9 border-primary/10 text-primary hover:bg-accent">Wybierz z dysku</Button>
        </Card>
      </main>
    </div>
  );
}
