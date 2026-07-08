import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, UserPlus, TrendingUp, Wallet, CalendarClock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import { LEAD_STATUS_COLORS, formatMoney, formatDate } from "@/lib/crm";

export default function Dashboard() {
  const [companyId, setCompanyId] = useState("all");
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => base44.entities.Company.list("-created_date", 200) });
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-created_date", 500) });
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: () => base44.entities.Lead.list("-created_date", 500) });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => base44.entities.Deal.list("-created_date", 500) });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: () => base44.entities.Payment.list("-created_date", 500) });
  const { data: followups = [] } = useQuery({ queryKey: ["followups"], queryFn: () => base44.entities.FollowUp.list("reminder_date", 500) });

  const byCompany = (arr) => (companyId === "all" ? arr : arr.filter((x) => x.company_id === companyId));
  const fClients = byCompany(clients);
  const fLeads = byCompany(leads);
  const fDeals = byCompany(deals);
  const fPayments = byCompany(payments);
  const clientIds = new Set(fClients.map((c) => c.id));
  const fFollowups = companyId === "all" ? followups : followups.filter((f) => clientIds.has(f.client_id));

  const revenue = fPayments.filter((p) => p.status === "ödənilib").reduce((s, p) => s + (p.amount || 0), 0);
  const clientName = (id) => clients.find((c) => c.id === id)?.client_name || "—";

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">İdarəetmə paneli</h1>
          <p className="text-sm text-muted-foreground mt-1">Bütün şirkətlərinizin ümumi görünüşü</p>
        </div>
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün şirkətlər</SelectItem>
            {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Ümumi müştəri sayı" value={fClients.length} icon={Users} accent="bg-blue-500/10 text-blue-600" />
        <StatCard title="Yeni müraciətlər" value={fLeads.filter((l) => l.status === "Yeni müraciət").length} icon={UserPlus} accent="bg-violet-500/10 text-violet-600" />
        <StatCard title="Aktiv satışlar" value={fDeals.filter((d) => d.status === "davam edir").length} icon={TrendingUp} accent="bg-amber-500/10 text-amber-600" />
        <StatCard title="Gəlir" value={formatMoney(revenue)} icon={Wallet} accent="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Geri dönüşlər" value={fFollowups.filter((f) => f.status === "gözləyir").length} icon={CalendarClock} accent="bg-rose-500/10 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Son müraciətlər</h2>
          <div className="space-y-3">
            {fLeads.slice(0, 6).map((l) => (
              <Link key={l.id} to={`/musteriler/${l.client_id}`} className="flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg hover:bg-accent transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{clientName(l.client_id)}</p>
                  <p className="text-xs text-muted-foreground">{l.source || "—"} · {formatDate(l.created_date)}</p>
                </div>
                <Badge variant="secondary" className={`shrink-0 ${LEAD_STATUS_COLORS[l.status] || ""}`}>{l.status}</Badge>
              </Link>
            ))}
            {fLeads.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Hələ müraciət yoxdur</p>}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Yaxınlaşan geri dönüşlər</h2>
          <div className="space-y-3">
            {fFollowups.filter((f) => f.status === "gözləyir").slice(0, 6).map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{clientName(f.client_id)}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">{formatDate(f.reminder_date)}</span>
              </div>
            ))}
            {fFollowups.filter((f) => f.status === "gözləyir").length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Gözləyən geri dönüş yoxdur</p>}
          </div>
        </div>
      </div>
    </div>
  );
}