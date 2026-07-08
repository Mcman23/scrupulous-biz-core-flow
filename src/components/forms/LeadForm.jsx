import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/crm";

const EMPTY = { client_id: "", source: "Instagram", status: "Yeni müraciət", service_id: "", budget: "", assigned_user: "" };

export default function LeadForm({ open, onOpenChange, lead, clients, services, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(lead ? { ...EMPTY, ...lead, budget: lead.budget ?? "" } : EMPTY); }, [open, lead]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedClient = clients.find((c) => c.id === form.client_id);
  const companyServices = services.filter((s) => !selectedClient || s.company_id === selectedClient.company_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      client_id: form.client_id,
      company_id: selectedClient?.company_id || "",
      source: form.source,
      status: form.status,
      service_id: form.service_id,
      budget: form.budget === "" ? 0 : Number(form.budget),
      assigned_user: form.assigned_user,
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Müraciəti redaktə et" : "Yeni müraciət"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Müştəri *</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v)}>
              <SelectTrigger><SelectValue placeholder="Müştəri seçin" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mənbə</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Xidmət</Label>
            <Select value={form.service_id} onValueChange={(v) => set("service_id", v)}>
              <SelectTrigger><SelectValue placeholder="Xidmət seçin" /></SelectTrigger>
              <SelectContent>
                {companyServices.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Büdcə (₼)</Label>
              <Input type="number" min="0" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Məsul şəxs</Label>
              <Input value={form.assigned_user} onChange={(e) => set("assigned_user", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
            <Button type="submit" disabled={saving || !form.client_id}>{saving ? "Yadda saxlanılır..." : "Yadda saxla"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}