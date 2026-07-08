import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Percent, Wallet, TrendingUp, UserPlus, Receipt, PiggyBank } from "lucide-react";
import StatCard from "@/components/StatCard";
import DealExpenses from "@/components/sales/DealExpenses";
import { AZ_MONTHS, formatMoney } from "@/lib/crm";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function Sales() {
  const queryClient = useQueryClient();
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => base44.entities.Company.list("-created_date", 200) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-created_date", 500) });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => base44.entities.Service.list("-created_date", 500) });
  const { data: expenses = [] } = useQuery({ queryKey: ["expenses"], queryFn: () => base44.entities.Expense.list("-date", 500) });
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: () => base44.entities.Lead.list("-created_date", 500) });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => base44.entities.Deal.list("-created_date", 500) });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: () => base44.entities.Payment.list("-created_date", 500) });

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  const now = new Date();
  const monthlyRevenue = [...Array(6)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const total = payments
      .filter((p) => p.status === "ödənilib" && p.payment_date && new Date(p.payment_date).getMonth() === d.getMonth() && new Date(p.payment_date).getFullYear() === d.getFullYear())
      .reduce((s, p) => s + (p.amount || 0), 0);
    return { ay: AZ_MONTHS[d.getMonth()], gəlir: total };
  });

  const byCompany = companies.map((c) => ({
    name: c.company_name,
    value: deals.filter((d) => d.company_id === c.id).reduce((s, d) => s + (d.amount || 0), 0),
  })).filter((x) => x.value > 0);

  const sourceCounts = leads.reduce((acc, l) => {
    const k = l.source || "Digər";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const bySources = Object.entries(sourceCounts).map(([name, value]) => ({ name, say: value }));

  const won = leads.filter((l) => l.status === "Qazanıldı").length;
  const conversion = leads.length ? Math.round((won / leads.length) * 100) : 0;
  const totalRevenue = payments.filter((p) => p.status === "ödənilib").reduce((s, p) => s + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const clientName = (id) => clients.find((c) => c.id === id)?.client_name || "—";
  const serviceName = (id) => services.find((s) => s.id === id)?.name || "";

  const handleAddExpense = async (deal, data) => {
    await base44.entities.Expense.create({
      ...data,
      deal_id: deal.id,
      client_id: deal.client_id,
      date: new Date().toISOString().slice(0, 10),
    });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  const handleDeleteExpense = async (exp) => {
    if (!confirm("Bu xərci silmək istədiyinizə əminsiniz?")) return;
    await base44.entities.Expense.delete(exp.id);
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Satış paneli</h1>
        <p className="text-sm text-muted-foreground mt-1">Satış və gəlir analitikası</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Ümumi gəlir" value={formatMoney(totalRevenue)} icon={Wallet} accent="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Ümumi satış" value={formatMoney(deals.reduce((s, d) => s + (d.amount || 0), 0))} icon={TrendingUp} accent="bg-blue-500/10 text-blue-600" />
        <StatCard title="Ümumi xərc" value={formatMoney(totalExpenses)} icon={Receipt} accent="bg-red-500/10 text-red-600" />
        <StatCard title="Xalis mənfəət" value={formatMoney(netProfit)} icon={PiggyBank} accent={netProfit >= 0 ? "bg-teal-500/10 text-teal-600" : "bg-red-500/10 text-red-600"} />
        <StatCard title="Müraciət sayı" value={leads.length} icon={UserPlus} accent="bg-violet-500/10 text-violet-600" />
        <StatCard title="Conversion rate" value={`${conversion}%`} icon={Percent} accent="bg-amber-500/10 text-amber-600" />
      </div>

      <DealExpenses
        deals={deals}
        expenses={expenses}
        clientName={clientName}
        serviceName={serviceName}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Aylıq gəlir</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="ay" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="gəlir" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Şirkət üzrə satış</h2>
          {byCompany.length === 0 ? (
            <p className="text-sm text-muted-foreground py-16 text-center">Satış məlumatı yoxdur</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCompany} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {byCompany.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-bold mb-4">Lead mənbələri</h2>
          {bySources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-16 text-center">Müraciət məlumatı yoxdur</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bySources} layout="vertical">
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={90} />
                <Tooltip />
                <Bar dataKey="say" fill="#10b981" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}