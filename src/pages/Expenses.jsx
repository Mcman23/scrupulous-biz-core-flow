import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Wallet, Receipt, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { formatMoney, formatDate } from "@/lib/crm";

export default function Expenses() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: expenses = [], isLoading } = useQuery({ queryKey: ["expenses"], queryFn: () => base44.entities.Expense.list("-date", 500) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-created_date", 500) });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: () => base44.entities.Payment.list("-created_date", 500) });

  const clientName = (id) => clients.find((c) => c.id === id)?.client_name || "—";
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["expenses"] });

  const handleSubmit = async (data) => {
    if (editing) await base44.entities.Expense.update(editing.id, data);
    else await base44.entities.Expense.create(data);
    refresh();
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (exp) => {
    if (!confirm("Bu xərci silmək istədiyinizə əminsiniz?")) return;
    await base44.entities.Expense.delete(exp.id);
    refresh();
  };

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  const totalIncome = payments.filter((p) => p.status === "ödənilib").reduce((s, p) => s + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const profit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Xərclər</h1>
          <p className="text-sm text-muted-foreground mt-1">Görülən işlərin xərclərini qeyd edin və mənfəəti izləyin</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4" /> Yeni xərc
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Ümumi gəlir" value={formatMoney(totalIncome)} icon={Wallet} accent="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Ümumi xərc" value={formatMoney(totalExpenses)} icon={Receipt} accent="bg-red-500/10 text-red-600" />
        <StatCard title="Xalis mənfəət" value={formatMoney(profit)} icon={TrendingUp} accent={profit >= 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600"} />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">Hələ xərc qeydi yoxdur</p>
        ) : (
          <div className="divide-y divide-border">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{clientName(exp.client_id)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exp.category || "Digər"}{exp.date ? ` · ${formatDate(exp.date)}` : ""}{exp.description ? ` · ${exp.description}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-red-600">-{formatMoney(exp.amount)}</span>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(exp); setFormOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(exp)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ExpenseForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={handleSubmit} expense={editing} clients={clients} />
    </div>
  );
}