import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { formatMoney } from "@/lib/crm";

export default function DealExpenses({ deals, expenses, clientName, serviceName, onAddExpense, onDeleteExpense }) {
  const [openDeal, setOpenDeal] = useState(null);
  const [dialogDeal, setDialogDeal] = useState(null);
  const [form, setForm] = useState({ amount: "", description: "" });
  const [saving, setSaving] = useState(false);

  const dealExpenses = (dealId) => expenses.filter((e) => e.deal_id === dealId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onAddExpense(dialogDeal, { amount: parseFloat(form.amount) || 0, description: form.description });
    setSaving(false);
    setDialogDeal(null);
    setForm({ amount: "", description: "" });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h2 className="font-bold mb-4">Satışlar üzrə xərclər</h2>
      {deals.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Satış məlumatı yoxdur</p>
      ) : (
        <div className="divide-y divide-border">
          {deals.map((deal) => {
            const exps = dealExpenses(deal.id);
            const spent = exps.reduce((s, x) => s + (x.amount || 0), 0);
            const profit = (deal.amount || 0) - spent;
            const isOpen = openDeal === deal.id;
            return (
              <div key={deal.id} className="py-3">
                <button className="w-full flex flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpenDeal(isOpen ? null : deal.id)}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{clientName(deal.client_id)}</p>
                    <p className="text-xs text-muted-foreground">{serviceName(deal.service_id) || deal.status}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span>Satış: <b>{formatMoney(deal.amount || 0)}</b></span>
                    <span className="text-red-600">Xərc: <b>{formatMoney(spent)}</b></span>
                    <span className={profit >= 0 ? "text-emerald-600" : "text-red-600"}>Mənfəət: <b>{formatMoney(profit)}</b></span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-3 pl-2 space-y-2">
                    {exps.map((x) => (
                      <div key={x.id} className="flex items-center justify-between gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                        <span className="truncate">{x.description || "Xərc"}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <b className="text-red-600">-{formatMoney(x.amount)}</b>
                          <button onClick={() => onDeleteExpense(x)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </span>
                      </div>
                    ))}
                    {exps.length === 0 && <p className="text-xs text-muted-foreground">Bu satış üzrə xərc yoxdur</p>}
                    <Button variant="outline" size="sm" onClick={() => setDialogDeal(deal)}>
                      <Plus className="w-3.5 h-3.5" /> Xərc əlavə et
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!dialogDeal} onOpenChange={(v) => !v && setDialogDeal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xərc əlavə et — {dialogDeal ? clientName(dialogDeal.client_id) : ""}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Məbləğ (₼) *</Label>
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Təsvir</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Məs: Reklam büdcəsi" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogDeal(null)}>Ləğv et</Button>
              <Button type="submit" disabled={saving}>{saving ? "Yadda saxlanılır..." : "Əlavə et"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}