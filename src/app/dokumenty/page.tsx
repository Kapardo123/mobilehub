import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, MoreVertical, FileDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DokumentyPage() {
  const documents = [
    { name: "Faktura_FS_2025_03_001.pdf", type: "Faktura", date: "12.03.2025", size: "1.2 MB" },
    { name: "Umowa_Komis_iPhone15.pdf", type: "Umowa", date: "11.03.2025", size: "0.8 MB" },
    { name: "Raport_Miesieczny_Luty.xlsx", type: "Raport", date: "01.03.2025", size: "2.5 MB" },
    { name: "Cennik_Hurtownia_Marzec.pdf", type: "Cennik", date: "28.02.2025", size: "4.1 MB" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Dokumenty</h1>
          </div>
          <Button className="bg-blue-600">
            <FileDown className="h-4 w-4 mr-2" />
            Wgraj plik
          </Button>
        </div>

        <div className="grid gap-3">
          {documents.map((doc, idx) => (
            <Card key={idx} className="border-none shadow-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{doc.date} • {doc.size}</p>
                      <Badge variant="secondary" className="text-[8px] h-4 px-1.5 uppercase font-black">
                        {doc.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 border-dashed border-slate-200 bg-white/50 p-8 flex flex-col items-center justify-center text-center space-y-3 rounded-2xl">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <FileDown className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Przeciągnij pliki tutaj</p>
            <p className="text-xs text-slate-400">PDF, PNG, JPG lub XLSX do 10MB</p>
          </div>
          <Button variant="outline" className="text-xs h-8">Wybierz z dysku</Button>
        </Card>
      </main>
    </div>
  );
}
