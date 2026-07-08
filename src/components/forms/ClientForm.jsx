import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY = { company_id: "", client_name: "", company_name: "", phone: "", whatsapp: "", email: "", address: "", industry: "", notes: "" };

export default function ClientForm({ open, onOpenChange, client, companies, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(client ? { ...EMPTY, ...client } : EMPTY); }, [open, client]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { company_id, client_name, company_name, phone, whatsapp, email, address, industry, notes } = form;
    await onSubmit({ company_id, client_name, company_name, phone, whatsapp, email, address, industry, notes });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Müştərini redaktə et" : "Yeni müştəri"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Bağlı olduğu şirkət *</Label>
            <Select value={form.company_id} onValueChange={(v) => set("company_id", v)} required>
              <SelectTrigger><SelectValue placeholder="Şirkət seçin" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Müştəri adı *</Label>
              <Input value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Müştərinin şirkəti</Label>
              <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sahə</Label>
              <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="məs. Restoran" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Ünvan</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Qeydlər</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
            <Button type="submit" disabled={saving || !form.company_id}>{saving ? "Yadda saxlanılır..." : "Yadda saxla"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}