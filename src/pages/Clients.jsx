import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ClientForm from "@/components/forms/ClientForm";
import { formatDate } from "@/lib/crm";

export default function Clients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("all");
  const [sort, setSort] = useState("-created_date");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => base44.entities.Company.list("-created_date", 200) });
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-created_date", 500) });

  const companyName = (id) => companies.find((c) => c.id === id)?.company_name || "—";

  const filtered = useMemo(() => {
    let list = clients;
    if (companyId !== "all") list = list.filter((c) => c.company_id === companyId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => [c.client_name, c.company_name, c.phone, c.email, c.industry].some((v) => v?.toLowerCase().includes(q)));
    }
    const key = sort.replace("-", "");
    const dir = sort.startsWith("-") ? -1 : 1;
    return [...list].sort((a, b) => ((a[key] || "") > (b[key] || "") ? dir : -dir));
  }, [clients, companyId, search, sort]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  const handleSubmit = async (data) => {
    if (editing) await base44.entities.Client.update(editing.id, data);
    else await base44.entities.Client.create(data);
    refresh();
    setFormOpen(false);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`"${c.client_name}" müştərisini silmək istədiyinizə əminsiniz?`)) return;
    await base44.entities.Client.delete(c.id);
    refresh();
  };

  const exportExcel = () => {
    const header = ["Müştəri adı", "Şirkət", "Bağlı şirkət", "Telefon", "WhatsApp", "Email", "Sahə", "Ünvan"];
    const rows = filtered.map((c) => [c.client_name, c.company_name, companyName(c.company_id), c.phone, c.whatsapp, c.email, c.industry, c.address]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "musteriler.csv";
    a.click();
  };

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Müştərilər</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} müştəri</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel} className="gap-2"><Download className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span></Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2"><Plus className="w-4 h-4" /> Yeni müştəri</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Axtarış..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün şirkətlər</SelectItem>
            {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Ən yeni</SelectItem>
            <SelectItem value="created_date">Ən köhnə</SelectItem>
            <SelectItem value="client_name">Ad (A-Z)</SelectItem>
            <SelectItem value="-client_name">Ad (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müştəri</TableHead>
              <TableHead className="hidden md:table-cell">Bağlı şirkət</TableHead>
              <TableHead className="hidden sm:table-cell">Telefon</TableHead>
              <TableHead className="hidden lg:table-cell">Sahə</TableHead>
              <TableHead className="hidden lg:table-cell">Tarix</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="group">
                <TableCell>
                  <Link to={`/musteriler/${c.id}`} className="font-medium hover:underline">{c.client_name}</Link>
                  {c.company_name && <p className="text-xs text-muted-foreground">{c.company_name}</p>}
                </TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="secondary">{companyName(c.company_id)}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.phone || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{c.industry || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(c.created_date)}</TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setEditing(c); setFormOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => handleDelete(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Müştəri tapılmadı</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ClientForm open={formOpen} onOpenChange={setFormOpen} client={editing} companies={companies} onSubmit={handleSubmit} />
    </div>
  );
}