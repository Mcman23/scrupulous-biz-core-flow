import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceForm from "@/components/forms/ServiceForm";
import { formatMoney } from "@/lib/crm";

export default function Services() {
  const queryClient = useQueryClient();
  const [activeCompany, setActiveCompany] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: companies = [], isLoading } = useQuery({ queryKey: ["companies"], queryFn: () => base44.entities.Company.list("-created_date", 200) });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => base44.entities.Service.list("-created_date", 500) });

  useEffect(() => {
    if (!activeCompany && companies.length > 0) setActiveCompany(companies[0].id);
  }, [companies, activeCompany]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["services"] });
  const companyServices = services.filter((s) => s.company_id === activeCompany);

  const handleSubmit = async (data) => {
    if (editing) await base44.entities.Service.update(editing.id, data);
    else await base44.entities.Service.create({ ...data, company_id: activeCompany });
    refresh();
    setFormOpen(false);
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`"${s.name}" xidmətini silmək istədiyinizə əminsiniz?`)) return;
    await base44.entities.Service.delete(s.id);
    refresh();
  };

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Xidmətlər</h1>
          <p className="text-sm text-muted-foreground mt-1">Şirkət üzrə xidmətlər</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2" disabled={!activeCompany}>
          <Plus className="w-4 h-4" /> Yeni xidmət
        </Button>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Əvvəlcə şirkət əlavə edin</p>
      ) : (
        <>
          <Tabs value={activeCompany} onValueChange={setActiveCompany}>
            <TabsList className="flex-wrap h-auto">
              {companies.map((c) => <TabsTrigger key={c.id} value={c.id}>{c.company_name}</TabsTrigger>)}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {companyServices.map((s) => (
              <div key={s.id} className="group bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Briefcase className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => handleDelete(s)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div>
                  <p className="font-bold">{s.name}</p>
                  {s.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                </div>
                <p className="text-lg font-extrabold mt-auto">{formatMoney(s.price)}</p>
              </div>
            ))}
            {companyServices.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-12">Bu şirkət üçün xidmət yoxdur</p>}
          </div>
        </>
      )}

      <ServiceForm open={formOpen} onOpenChange={setFormOpen} service={editing} onSubmit={handleSubmit} />
    </div>
  );
}