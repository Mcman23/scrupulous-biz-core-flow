import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_TYPES } from "@/lib/crm";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { type: "Zəng", description: "", date: "" };

export default function ActivityForm({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm({ ...EMPTY, date: today() }); }, [open]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni əlaqə qeydi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Növ</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tarix</Label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Təsvir *</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} required />
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