import React, { useCallback } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFileSelect, selectedFile, accept = ".csv,.xlsx,.xls,.pdf" }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <Card 
      className={cn(
        "relative border-2 border-dashed p-10 transition-all duration-300 ease-in-out rounded-2xl group overflow-hidden",
        selectedFile 
          ? "border-indigo-500 bg-indigo-50/30 shadow-sm" 
          : cn(
              "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 hover:shadow-md",
              isDragging && "border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10"
            )
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-5 text-center relative z-10">
        <div className={cn(
          "rounded-2xl p-5 transition-all duration-300 shadow-sm border border-white",
          selectedFile 
            ? "bg-white text-indigo-600 scale-110 shadow-md" 
            : "bg-white text-slate-400 group-hover:scale-110 group-hover:rotate-3 group-hover:text-indigo-500"
        )}>
          {selectedFile ? <CheckCircle2 className="h-10 w-10" /> : <Upload className="h-10 w-10" />}
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-bold font-heading text-slate-800 tracking-tight">{label}</p>
          <div className="flex flex-col items-center gap-1">
            {selectedFile ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-xs text-indigo-700 font-bold truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">
                Arraste o arquivo aqui ou <span className="text-indigo-600 font-bold underline decoration-2 underline-offset-4">procure no computador</span>
              </p>
            )}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, Excel ou CSV</p>
          </div>
        </div>

        <input
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileChange}
          accept={accept}
        />
      </div>
      
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 bg-gradient-to-br from-white/0 via-white/0 to-white/5" />
    </Card>
  );
};
