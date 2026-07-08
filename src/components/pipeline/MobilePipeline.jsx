import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STATUSES, LEAD_STATUS_COLORS, formatMoney } from "@/lib/crm";

export default function MobilePipeline({ leads, clientName, serviceName, onStatusChange, onEdit, onDelete }) {
  const [open, setOpen] = useState(() => new Set([LEAD_STATUSES[0]]));

  const toggle = (status) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {LEAD_STATUSES.map((status) => {
        const columnLeads = leads.filter((l) => l.status === status);
        const isOpen = open.has(status);
        return (
          <div key={status} className="bg-muted/50 rounded-2xl overflow-hidden">
            <button onClick={() => toggle(status)} className="w-full flex items-center justify-between p-3">
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${LEAD_STATUS_COLORS[status]}`}>{status}</span>
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                {columnLeads.length}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 space-y-2">
                {columnLeads.map((l) => (
                  <div key={l.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/musteriler/${l.client_id}`} className="text-sm font-semibold hover:underline">{clientName(l.client_id)}</Link>
                      <div className="flex gap-1">
                        <button className="p-1 text-muted-foreground" onClick={() => onEdit(l)}><Pencil className="w-3.5 h-3.5" /></button>
                        <button className="p-1 text-muted-foreground" onClick={() => onDelete(l)}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{serviceName(l.service_id) || l.source || "—"}</span>
                      {l.budget > 0 && <span className="font-semibold text-foreground">{formatMoney(l.budget)}</span>}
                    </div>
                    <Select value={l.status} onValueChange={(v) => onStatusChange(l, v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {columnLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Boşdur</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}