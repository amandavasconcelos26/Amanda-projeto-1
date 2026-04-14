import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertTriangle, Edit, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { AuditResult } from '@/src/types';
import { cn } from '@/lib/utils';

interface AuditTableProps {
  results: AuditResult[];
  onUpdateResult?: (updatedResult: AuditResult) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({ results, onUpdateResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [onlyDivergent, setOnlyDivergent] = useState(false);
  const [editingCte, setEditingCte] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    freteEmpresaA?: number;
    freteMotoristaA?: number;
    freteEmpresaB?: number;
    freteMotoristaB?: number;
  }>({});

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesSearch = r.cte.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const isDivergent = r.status === 'BOTH_DIVERGENT' || r.status === 'A_ONLY' || r.status === 'B_ONLY';
      const matchesDivergentToggle = !onlyDivergent || isDivergent;
      
      return matchesSearch && matchesStatus && matchesDivergentToggle;
    });
  }, [results, searchTerm, statusFilter, onlyDivergent]);

  const handleStartEdit = (result: AuditResult) => {
    setEditingCte(result.cte);
    setEditValues({
      freteEmpresaA: result.sistemaA?.freteEmpresa,
      freteMotoristaA: result.sistemaA?.freteMotorista,
      freteEmpresaB: result.sistemaB?.freteEmpresa,
      freteMotoristaB: result.sistemaB?.freteMotorista,
    });
  };

  const handleSaveEdit = (result: AuditResult) => {
    if (!onUpdateResult) return;

    const updatedResult: AuditResult = {
      ...result,
      sistemaA: result.sistemaA ? {
        ...result.sistemaA,
        freteEmpresa: editValues.freteEmpresaA ?? result.sistemaA.freteEmpresa,
        freteMotorista: editValues.freteMotoristaA ?? result.sistemaA.freteMotorista,
      } : undefined,
      sistemaB: result.sistemaB ? {
        ...result.sistemaB,
        freteEmpresa: editValues.freteEmpresaB ?? result.sistemaB.freteEmpresa,
        freteMotorista: editValues.freteMotoristaB ?? result.sistemaB.freteMotorista,
      } : undefined,
    };

    // Recalculate differences and status
    const itemA = updatedResult.sistemaA;
    const itemB = updatedResult.sistemaB;

    if (itemA && itemB) {
      const diffEmpresa = Math.abs(itemA.freteEmpresa - itemB.freteEmpresa);
      const diffMotorista = Math.abs(itemA.freteMotorista - itemB.freteMotorista);
      
      const diffEmpresaRounded = Math.round(diffEmpresa * 100) / 100;
      const diffMotoristaRounded = Math.round(diffMotorista * 100) / 100;

      updatedResult.status = (diffEmpresaRounded > 0.00 || diffMotoristaRounded > 0.00) ? 'BOTH_DIVERGENT' : 'BOTH_MATCH';
      updatedResult.diferencaMotorista = itemA.freteMotorista - itemB.freteMotorista;
      updatedResult.divergencias = {
        ...updatedResult.divergencias,
        freteEmpresa: diffEmpresaRounded > 0.00 ? diffEmpresaRounded : undefined,
        freteMotorista: diffMotoristaRounded > 0.00 ? diffMotoristaRounded : undefined,
      };
    }

    onUpdateResult(updatedResult);
    setEditingCte(null);
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatPercent = (val?: number) => {
    if (val === undefined) return '-';
    return `${val.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por Número do CTE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-200 rounded-xl h-11 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={onlyDivergent ? "destructive" : "outline"}
            size="sm"
            onClick={() => setOnlyDivergent(!onlyDivergent)}
            className={cn(
              "rounded-xl h-11 px-6 transition-all font-semibold",
              !onlyDivergent && "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
            )}
          >
            <AlertTriangle className={cn("mr-2 h-4 w-4", onlyDivergent ? "text-white" : "text-rose-500")} />
            {onlyDivergent ? "Mostrando Divergências" : "Todas as Pendências"}
          </Button>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px] border-slate-200 rounded-xl h-11 font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Filtrar por Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value="BOTH_MATCH">Conciliados</SelectItem>
              <SelectItem value="BOTH_DIVERGENT">Divergentes</SelectItem>
              <SelectItem value="A_ONLY">Apenas Relatório ATUA</SelectItem>
              <SelectItem value="B_ONLY">Apenas Relatório GW</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[120px] font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4 pl-6">CTE</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4">Empresa (A)</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4">Empresa (B)</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4">Motorista (A)</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4">Motorista (B)</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4">Dif. Motorista</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest py-4 pr-6">Margem (B)</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredResults.map((result, index) => {
                  const isEditing = editingCte === result.cte;
                  const isCritical = result.sistemaA?.freteMotorista === 0 && (result.sistemaB?.freteMotorista || 0) > 0;
                  
                  return (
                    <motion.tr 
                      key={result.cte}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
                      className={cn(
                        "transition-all duration-200 group border-b border-slate-50 data-grid-row",
                        result.status === 'BOTH_DIVERGENT' && "bg-rose-50/20",
                        (result.status === 'A_ONLY' || result.status === 'B_ONLY') && "bg-amber-50/20",
                        isEditing && "bg-indigo-50/50 ring-1 ring-inset ring-indigo-200",
                        isCritical && "bg-red-100/50 hover:bg-red-100"
                      )}
                    >
                      <TableCell className="font-mono font-bold text-slate-700 text-sm py-4 pl-6">
                        <div className="flex flex-col">
                          <span>{result.cte}</span>
                          {result.fuzzyMatch && (
                            <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Sugestão</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.status === 'A_ONLY' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50 text-[10px] font-bold px-2 py-0">APENAS A</Badge>}
                        {result.status === 'B_ONLY' && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 text-[10px] font-bold px-2 py-0">APENAS B</Badge>}
                        {result.status === 'BOTH_DIVERGENT' && (
                          <Badge variant="destructive" className={cn("text-[10px] font-bold px-2 py-0", isCritical && "animate-pulse")}>
                            {isCritical ? "CRÍTICO" : "DIVERGENTE"}
                          </Badge>
                        )}
                        {result.status === 'BOTH_MATCH' && <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 text-[10px] font-bold px-2 py-0">CONCILIADO</Badge>}
                      </TableCell>
                      
                      {/* Empresa (A) */}
                      <TableCell className={cn("text-right font-mono text-sm", result.divergencias.freteEmpresa ? "text-rose-600 font-bold" : "text-slate-600")}>
                        {isEditing && result.sistemaA ? (
                          <Input 
                            type="number" 
                            value={editValues.freteEmpresaA} 
                            onChange={(e) => setEditValues({...editValues, freteEmpresaA: parseFloat(e.target.value)})}
                            className="h-8 w-24 text-right ml-auto font-mono text-xs border-indigo-200 focus-visible:ring-indigo-500/20"
                          />
                        ) : formatCurrency(result.sistemaA?.freteEmpresa)}
                      </TableCell>
                      
                      {/* Empresa (B) */}
                      <TableCell className={cn("text-right font-mono text-sm", result.divergencias.freteEmpresa ? "text-rose-600 font-bold" : "text-slate-600")}>
                        {isEditing && result.sistemaB ? (
                          <Input 
                            type="number" 
                            value={editValues.freteEmpresaB} 
                            onChange={(e) => setEditValues({...editValues, freteEmpresaB: parseFloat(e.target.value)})}
                            className="h-8 w-24 text-right ml-auto font-mono text-xs border-indigo-200 focus-visible:ring-indigo-500/20"
                          />
                        ) : formatCurrency(result.sistemaB?.freteEmpresa)}
                      </TableCell>
                      
                      {/* Motorista (A) */}
                      <TableCell className={cn("text-right font-mono text-sm", result.divergencias.freteMotorista ? "text-rose-600 font-bold" : "text-slate-600")}>
                        {isEditing && result.sistemaA ? (
                          <Input 
                            type="number" 
                            value={editValues.freteMotoristaA} 
                            onChange={(e) => setEditValues({...editValues, freteMotoristaA: parseFloat(e.target.value)})}
                            className="h-8 w-24 text-right ml-auto font-mono text-xs border-indigo-200 focus-visible:ring-indigo-500/20"
                          />
                        ) : formatCurrency(result.sistemaA?.freteMotorista)}
                      </TableCell>
                      
                      {/* Motorista (B) */}
                      <TableCell className={cn("text-right font-mono text-sm", result.divergencias.freteMotorista ? "text-rose-600 font-bold" : "text-slate-600")}>
                        {isEditing && result.sistemaB ? (
                          <Input 
                            type="number" 
                            value={editValues.freteMotoristaB} 
                            onChange={(e) => setEditValues({...editValues, freteMotoristaB: parseFloat(e.target.value)})}
                            className="h-8 w-24 text-right ml-auto font-mono text-xs border-indigo-200 focus-visible:ring-indigo-500/20"
                          />
                        ) : formatCurrency(result.sistemaB?.freteMotorista)}
                      </TableCell>

                      <TableCell className={cn("text-right font-mono font-bold text-sm", Math.abs(result.diferencaMotorista) > 0.01 ? "text-rose-600" : "text-emerald-600")}>
                        {formatCurrency(result.diferencaMotorista)}
                      </TableCell>
                      <TableCell className={cn("text-right font-mono font-bold text-sm pr-6", (result.sistemaB?.margem || 0) < 0 ? "text-rose-600" : "text-slate-600")}>
                        {formatPercent(result.sistemaB?.margem)}
                      </TableCell>
                      
                      <TableCell className="pr-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleSaveEdit(result)}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => setEditingCte(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleStartEdit(result)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-6 w-6 opacity-20" />
                      <span>Nenhum CTE encontrado com os filtros atuais.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
