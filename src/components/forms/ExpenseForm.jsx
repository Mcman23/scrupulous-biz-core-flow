import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Reklam", "Material", "Personal", "Nəqliyyat", "Digər"];
const EMPTY = { client_id: "", amount: "", category: "Digər", date: new Date().toISOString().slice(0, 10), description: "" };

export default function ExpenseForm({ open, onClose, onSubmit, expense, clients }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(expense ? { ...EMPTY, ...expense } : EMPTY);
  }, [open, expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({ ...form, amount: parseFloat(form.amount) || 0 });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Xərci redaktə et" : "Yeni xərc"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Müştəri *</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })} required>
              <SelectTrigger><SelectValue placeholder="Müştəri seçin" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Məbləğ (₼) *</Label>
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Tarix</Label>
              <Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kateqoriya</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Qeyd</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Ləğv et</Button>
            <Button type="submit" disabled={saving || !form.client_id}>{saving ? "Yadda saxlanılır..." : "Yadda saxla"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}