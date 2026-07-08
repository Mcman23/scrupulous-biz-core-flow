import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import FollowUpForm from "@/components/forms/FollowUpForm";
import { formatDate } from "@/lib/crm";

const toKey = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function FollowUps() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);

  const { data: followups = [], isLoading } = useQuery({ queryKey: ["followups"], queryFn: () => base44.entities.FollowUp.list("reminder_date", 500) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-created_date", 500) });

  const clientName = (id) => clients.find((c) => c.id === id)?.client_name || "";
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["followups"] });

  const markedDays = followups.filter((f) => f.status === "gözləyir" && f.reminder_date).map((f) => new Date(f.reminder_date + "T00:00:00"));
  const dayFollowups = followups.filter((f) => f.reminder_date === toKey(selected));
  const pending = followups.filter((f) => f.status === "gözləyir");

  const handleAdd = async (data) => {
    await base44.entities.FollowUp.create(data);
    refresh();
    setFormOpen(false);
  };

  const toggleStatus = async (f) => {
    await base44.entities.FollowUp.update(f.id, { status: f.status === "gözləyir" ? "tamamlandı" : "gözləyir" });
    refresh();
  };

  const handleDelete = async (f) => {
    if (!window.confirm("Bu geri dönüşü silmək istədiyinizə əminsiniz?")) return;
    await base44.entities.FollowUp.delete(f.id);
    refresh();
  };

  const FollowUpRow = ({ f, showDate }) => (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 group">
      <Checkbox checked={f.status === "tamamlandı"} onCheckedChange={() => toggleStatus(f)} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${f.status === "tamamlandı" ? "line-through text-muted-foreground" : ""}`}>{f.title}</p>
        <p className="text-xs text-muted-foreground">{clientName(f.client_id)}{showDate ? ` · ${formatDate(f.reminder_date)}` : ""}</p>
      </div>
      <button className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(f)}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Geri dönüş təqvimi</h1>
          <p className="text-sm text-muted-foreground mt-1">{pending.length} gözləyən xatırlatma</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Yeni geri dönüş</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex justify-center">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            modifiers={{ marked: markedDays }}
            modifiersClassNames={{ marked: "font-bold underline decoration-primary decoration-2 underline-offset-4" }}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-bold mb-3">{formatDate(selected)} üçün tapşırıqlar</h2>
            <div className="space-y-2">
              {dayFollowups.map((f) => <FollowUpRow key={f.id} f={f} />)}
              {dayFollowups.length === 0 && <p className="text-sm text-muted-foreground py-4">Bu tarixdə tapşırıq yoxdur</p>}
            </div>
          </div>
          <div>
            <h2 className="font-bold mb-3">Bütün gözləyənlər</h2>
            <div className="space-y-2">
              {pending.map((f) => <FollowUpRow key={f.id} f={f} showDate />)}
              {pending.length === 0 && <p className="text-sm text-muted-foreground py-4">Gözləyən geri dönüş yoxdur</p>}
            </div>
          </div>
        </div>
      </div>

      <FollowUpForm open={formOpen} onOpenChange={setFormOpen} clients={clients} onSubmit={handleAdd} />
    </div>
  );
}