import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Phone, Mail, MapPin, MessageCircle, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityForm from "@/components/forms/ActivityForm";
import { LEAD_STATUS_COLORS, formatMoney, formatDate } from "@/lib/crm";

export default function ClientDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activityOpen, setActivityOpen] = useState(false);

  const { data: client, isLoading } = useQuery({ queryKey: ["client", id], queryFn: () => base44.entities.Client.get(id) });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => base44.entities.Company.list("-created_date", 200) });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => base44.entities.Service.list("-created_date", 500) });
  const { data: activities = [] } = useQuery({ queryKey: ["activities", id], queryFn: () => base44.entities.Activity.filter({ client_id: id }, "-date", 200) });
  const { data: leads = [] } = useQuery({ queryKey: ["leads", id], queryFn: () => base44.entities.Lead.filter({ client_id: id }, "-created_date", 200) });
  const { data: deals = [] } = useQuery({ queryKey: ["deals", id], queryFn: () => base44.entities.Deal.filter({ client_id: id }, "-created_date", 200) });
  const { data: payments = [] } = useQuery({ queryKey: ["payments", id], queryFn: () => base44.entities.Payment.filter({ client_id: id }, "-payment_date", 200) });

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  if (!client) return <p className="text-center py-24 text-muted-foreground">Müştəri tapılmadı</p>;

  const company = companies.find((c) => c.id === client.company_id);
  const serviceName = (sid) => services.find((s) => s.id === sid)?.name || "—";

  const addActivity = async (data) => {
    await base44.entities.Activity.create({ ...data, client_id: id });
    queryClient.invalidateQueries({ queryKey: ["activities", id] });
    setActivityOpen(false);
  };

  return (
    <div className="space-y-6">
      <Link to="/musteriler" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Müştərilər
      </Link>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xl">
              {client.client_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">{client.client_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {company && <Badge variant="secondary" className="gap-1"><Building2 className="w-3 h-3" /> {company.company_name}</Badge>}
                {client.industry && <Badge variant="outline">{client.industry}</Badge>}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 text-sm text-muted-foreground">
          {client.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {client.phone}</p>}
          {client.whatsapp && <p className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {client.whatsapp}</p>}
          {client.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {client.email}</p>}
          {client.address && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {client.address}</p>}
        </div>
        {client.notes && <p className="mt-4 text-sm bg-muted rounded-xl p-3">{client.notes}</p>}
      </div>

      <Tabs defaultValue="activities">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="activities">Əlaqə tarixçəsi</TabsTrigger>
          <TabsTrigger value="leads">Müraciətlər</TabsTrigger>
          <TabsTrigger value="deals">Satışlar</TabsTrigger>
          <TabsTrigger value="payments">Ödənişlər</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-3 mt-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setActivityOpen(true)}><Plus className="w-4 h-4" /> Yeni qeyd</Button>
          {activities.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary">{a.type}</Badge>
                <p className="text-sm mt-2">{a.description}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatDate(a.date)}</span>
            </div>
          ))}
          {activities.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Hələ əlaqə qeydi yoxdur</p>}
        </TabsContent>

        <TabsContent value="leads" className="space-y-3 mt-4">
          {leads.map((l) => (
            <div key={l.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" /> {serviceName(l.service_id)}</p>
                <p className="text-xs text-muted-foreground mt-1">Mənbə: {l.source || "—"} · Büdcə: {formatMoney(l.budget)}</p>
              </div>
              <Badge variant="secondary" className={LEAD_STATUS_COLORS[l.status] || ""}>{l.status}</Badge>
            </div>
          ))}
          {leads.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Müraciət yoxdur</p>}
        </TabsContent>

        <TabsContent value="deals" className="space-y-3 mt-4">
          {deals.map((d) => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{serviceName(d.service_id)}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(d.close_date)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatMoney(d.amount)}</p>
                <Badge variant="secondary" className="mt-1">{d.status}</Badge>
              </div>
            </div>
          ))}
          {deals.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Satış yoxdur</p>}
        </TabsContent>

        <TabsContent value="payments" className="space-y-3 mt-4">
          {payments.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{formatDate(p.payment_date)}</p>
              <div className="text-right">
                <p className="text-sm font-bold">{formatMoney(p.amount)}</p>
                <Badge variant="secondary" className={p.status === "ödənilib" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}>{p.status}</Badge>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Ödəniş yoxdur</p>}
        </TabsContent>
      </Tabs>

      <ActivityForm open={activityOpen} onOpenChange={setActivityOpen} onSubmit={addActivity} />
    </div>
  );
}