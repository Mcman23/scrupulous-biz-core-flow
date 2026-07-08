import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CompanyForm from "@/components/forms/CompanyForm";

export default function Companies() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: companies = [], isLoading } = useQuery({ queryKey: ["companies"], queryFn: () => base44.entities.Company.list("-created_date", 200) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["companies"] });

  const handleSubmit = async (data) => {
    if (editing) await base44.entities.Company.update(editing.id, data);
    else await base44.entities.Company.create(data);
    refresh();
    setFormOpen(false);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`"${c.company_name}" şirkətini silmək istədiyinizə əminsiniz?`)) return;
    await base44.entities.Company.delete(c.id);
    refresh();
  };

  const toggleStatus = async (c) => {
    await base44.entities.Company.update(c.id, { status: c.status === "aktiv" ? "deaktiv" : "aktiv" });
    refresh();
  };

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Şirkətlər</h1>
          <p className="text-sm text-muted-foreground mt-1">İdarə etdiyiniz bizneslər</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2"><Plus className="w-4 h-4" /> Yeni şirkət</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg shrink-0">
                  {c.company_name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{c.company_name}</p>
                  <Badge variant="secondary" className={c.status === "aktiv" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}>
                    {c.status === "aktiv" ? "Aktiv" : "Deaktiv"}
                  </Badge>
                </div>
              </div>
              <Switch checked={c.status === "aktiv"} onCheckedChange={() => toggleStatus(c)} />
            </div>
            {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {c.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</p>}
              {c.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</p>}
              {c.address && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {c.address}</p>}
            </div>
            <div className="flex gap-2 mt-auto pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => { setEditing(c); setFormOpen(true); }}>
                <Pencil className="w-3.5 h-3.5" /> Redaktə
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleDelete(c)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {companies.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-12">Hələ şirkət əlavə edilməyib</p>}
      </div>

      <CompanyForm open={formOpen} onOpenChange={setFormOpen} company={editing} onSubmit={handleSubmit} />
    </div>
  );
}