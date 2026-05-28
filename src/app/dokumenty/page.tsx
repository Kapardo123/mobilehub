"use client"

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, FileDown, Trash2, Loader2, Upload, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSessionStorageSafe } from "@/lib/storage";
import { documentsService } from "@/lib/supabase/documents";
import { supabase } from '@/lib/supabase';
import { formatDatePL } from "@/lib/dateFormat";

interface Document {
  id: string;
  name?: string;
  original_filename?: string;
  filename?: string;
  url?: string;
  file_url?: string;
  storage_path?: string;
  document_type?: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  shop_id?: string;
  created_at?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

export default function DokumentyPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getSessionStorageSafe("userRole", "");
    const uid = getSessionStorageSafe("userId", "");
    const sid = getSessionStorageSafe("shopId", "");
    if (!role) {
      router.push("/login");
    }
    setUserRole(role);
    setUserId(uid);
    if (sid) {
      (window as any).currentShopId = sid;
    }
  }, [router]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await documentsService.getAll();
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Nie udało się załadować dokumentów');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Czy na pewno chcesz usunąć dokument "${doc.original_filename || doc.filename}"?\n\nTa operacja jest nieodwracalna!`)) return;

    try {
      setDeletingId(doc.id);
      console.log('🗑️ Rozpoczynam usuwanie dokumentu:', doc.original_filename || doc.filename);

      // Step 1: Delete file from Storage if exists
      if (doc.storage_path) {
        console.log('📦 Usuwam plik z Storage:', doc.storage_path);
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.storage_path]);

        if (storageError) {
          console.warn('⚠️ Błąd usuwania z Storage (kontynuuje):', storageError);
        } else {
          console.log('✅ Plik usunięty z Storage');
        }
      }

      // Step 2: Permanent delete from database
      console.log('💾 Usuwam rekord z bazy danych...');
      await documentsService.permanentDelete(doc.id);
      
      console.log('✅ Dokument trwale usunięty');
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      
    } catch (err) {
      console.error('❌ Błąd podczas usuwania dokumentu:', err);
      alert('Błąd podczas usuwania dokumentu. Spróbuj ponownie.');
    } finally {
      setDeletingId(null);
    }
  };

  const detectDocumentType = (filename: string): string => {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('faktura') || lowerName.includes('fv') || lowerName.includes('invoice')) return 'faktura';
    if (lowerName.includes('umowa') || lowerName.includes('contract')) return 'umowa';
    if (lowerName.includes('raport') || lowerName.includes('report')) return 'raport';
    if (lowerName.includes('cennik') || lowerName.includes('price')) return 'cennik';
    return 'inny';
  };

  const uploadFile = async (file: File) => {
    try {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert('Nieobsługiwany format pliku. Dozwolone: PDF, PNG, JPG, XLSX');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert('Plik jest zbyt duży. Maksymalny rozmiar to 10MB');
        return;
      }

      if (!userId) {
        console.error('❌ Brak userId - użytkownik nie zalogowany?', { userId });
        alert('Błąd autoryzacji. Zaloguj się ponownie.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      console.log('📤 Rozpoczynam upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userId
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      setUploadProgress(10);

      // Step 1: Upload to Supabase Storage
      console.log('⬆️ Step 1/3: Upload do Storage...', { filePath });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Błąd Storage upload:', uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      console.log('✅ Storage upload OK:', uploadData);
      setUploadProgress(40);

      // Step 2: Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', publicUrlData?.publicUrl);
      setUploadProgress(60);

      // Step 3: Save metadata to database
      console.log('💾 Step 2/3: Zapis do bazy danych...');
      
      const documentType = detectDocumentType(file.name);
      
      const docData = {
        shop_id: (window as any).currentShopId || '',
        file_name: fileName,
        file_url: publicUrlData?.publicUrl || '',
        file_type: documentType as any,
        file_size: file.size,
        uploaded_by: userId
      };

      console.log('📝 Dane dokumentu do zapisu:', docData);

      const newDoc = await documentsService.create(docData);

      console.log('✅ Dokument zapisany w bazie:', newDoc);
      setUploadProgress(100);
      
      setDocuments(prev => [newDoc, ...prev]);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      console.error('❌ Błąd podczas uploadu:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Błąd: ${errorMessage}`);
      setIsUploading(false);
      setUploadProgress(0);
      alert(`Wystąpił błąd:\n${errorMessage}\n\nSprawdź konsolę (F12) po szczegóły.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return formatDatePL(dateString);
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      faktura: 'Faktura',
      umowa: 'Umowa',
      raport: 'Raport',
      cennik: 'Cennik',
      inny: 'Inny'
    };
    return labels[type] || type;
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/20">
      <Navbar />
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Dokumenty</h1>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest h-10 px-4 text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wgrywanie... {uploadProgress}%
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Wgraj plik
              </>
            )}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setError(null); loadDocuments(); }}
                  className="mt-2 text-xs"
                >
                  Spróbuj ponownie
                </Button>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        )}

        {isUploading && (
          <Card className="border-blue-200 bg-blue-50 p-4 rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-sm font-bold text-blue-700">Wgrywanie dokumentu...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 font-medium">{uploadProgress}% ukończone</p>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-sm font-bold text-muted-foreground">Ładowanie dokumentów...</span>
          </div>
        ) : documents.length === 0 ? (
          <Card 
            className={`border-2 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl transition-all ${
              dragActive 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-primary/10 bg-white/50 hover:border-primary/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`h-14 w-14 rounded-2xl bg-accent flex items-center justify-center transition-transform ${dragActive ? 'scale-110' : ''}`}>
              <Upload className={`h-7 w-7 ${dragActive ? 'text-primary' : 'text-primary/40'}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-foreground uppercase tracking-tight">
                {dragActive ? 'Upuść plik tutaj' : 'Brak dokumentów'}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                {dragActive ? '' : 'Wgraj pierwszy dokument'}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="text-[10px] font-black uppercase tracking-widest h-9 border-primary/10 text-primary hover:bg-accent"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Wybierz z dysku
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border-none shadow-sm bg-white hover:bg-accent/30 transition-all cursor-pointer rounded-2xl border border-primary/5 group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText className="h-5 w-5 text-primary group-hover:text-white transition-all" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[180px]">{doc.original_filename || doc.filename}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{formatDate(doc.created_at || '')} • {formatFileSize(doc.file_size || 0)}</p>
                        <Badge variant="secondary" className="text-[8px] h-4 px-1.5 uppercase font-black bg-secondary/20 text-secondary border-none">
                          {getDocumentTypeLabel(doc.document_type || '')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc);
                      }}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && documents.length > 0 && (
          <Card 
            className={`border-2 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl transition-all ${
              dragActive 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-primary/10 bg-white/50 hover:border-primary/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`h-14 w-14 rounded-2xl bg-accent flex items-center justify-center transition-transform ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              <Upload className={`h-7 w-7 ${dragActive ? 'text-primary' : 'text-primary/40'}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-foreground uppercase tracking-tight">
                {dragActive ? 'Upuść plik tutaj' : 'Przeciągnij pliki tutaj'}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">PDF, PNG, JPG lub XLSX do 10MB</p>
            </div>
            <Button 
              variant="outline" 
              className="text-[10px] font-black uppercase tracking-widest h-9 border-primary/10 text-primary hover:bg-accent"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Wybierz z dysku
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}