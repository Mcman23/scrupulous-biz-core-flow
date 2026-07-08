import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EMPTY = { name: "", description: "", price: "" };

export default function ServiceForm({ open, onOpenChange, service, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(service ? { ...EMPTY, ...service, price: service.price ?? "" } : EMPTY); }, [open, service]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({ name: form.name, description: form.description, price: form.price === "" ? 0 : Number(form.price) });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Xidməti redaktə et" : "Yeni xidmət"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Xidmətin adı *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Təsvir</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Qiymət (₼)</Label>
            <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
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