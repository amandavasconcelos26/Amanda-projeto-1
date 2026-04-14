import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditSummary } from '@/src/types';
import { FileCheck, AlertTriangle, FileSearch, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface KPISectionProps {
  summary: AuditSummary;
}

export const KPISection: React.FC<KPISectionProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">CTEs Analisados</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FileCheck className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-extrabold font-heading text-slate-900 tracking-tight">{summary.totalAnalizados}</div>
            <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-widest">Total processado</p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Divergências</CardTitle>
            <div className="p-2 bg-rose-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-extrabold font-heading text-rose-600 tracking-tight">{summary.divergencias}</div>
            <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-widest">{summary.faltantes} documentos faltantes</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Diferença Motorista</CardTitle>
            <div className="p-2 bg-amber-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold font-heading text-amber-600 tracking-tight font-mono">
              {formatCurrency(summary.valorTotalDivergencia)}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-widest">Soma das pendências reais</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Diferença Empresa</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold font-heading text-emerald-600 tracking-tight font-mono">
              {formatCurrency(summary.totalEmpresaA - summary.totalEmpresaB)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margem A:</span>
              <span className="text-[10px] font-bold text-slate-600 font-mono">{formatCurrency(summary.margemTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {summary.lacunasSequenciais && summary.lacunasSequenciais.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-amber-200 bg-amber-50/30 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2 border-b border-amber-100">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileSearch className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold font-heading text-amber-800">Lacunas Sequenciais Detectadas</CardTitle>
              <p className="text-[10px] text-amber-600 font-medium">Numerações de CTE que parecem estar faltando na sequência numérica</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {summary.lacunasSequenciais.map((gap, idx) => (
                <span key={idx} className="px-2 py-1 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-md shadow-sm">
                  {gap}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
