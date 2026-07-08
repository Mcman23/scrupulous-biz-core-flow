import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const EMPTY = { company_name: "", phone: "", email: "", address: "", description: "", status: "aktiv" };

export default function CompanyForm({ open, onOpenChange, company, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(company ? { ...EMPTY, ...company } : EMPTY); }, [open, company]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { company_name, phone, email, address, description, status } = form;
    await onSubmit({ company_name, phone, email, address, description, status });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{company ? "Şirkəti redaktə et" : "Yeni şirkət"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Şirkət adı *</Label>
            <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Ünvan</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Təsvir</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label>Aktiv</Label>
            <Switch checked={form.status === "aktiv"} onCheckedChange={(v) => set("status", v ? "aktiv" : "deaktiv")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
            <Button type="submit" disabled={saving}>{saving ? "Yadda saxlanılır..." : "Yadda saxla"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}