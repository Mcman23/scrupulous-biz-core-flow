import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadForm from "@/components/forms/LeadForm";
import MobilePipeline from "@/components/pipeline/MobilePipeline";
import { LEAD_STATUSES, LEAD_STATUS_COLORS, formatMoney } from "@/lib/crm";

export default function Pipeline() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: () => base44.entities.Lead.list("-created_date", 500) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-created_date", 500) });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => base44.entities.Service.list("-created_date", 500) });

  const clientName = (id) => clients.find((c) => c.id === id)?.client_name || "—";
  const serviceName = (id) => services.find((s) => s.id === id)?.name;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["leads"] });

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const leadId = result.draggableId;
    queryClient.setQueryData(["leads"], (old = []) => old.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    await base44.entities.Lead.update(leadId, { status: newStatus });
    refresh();
  };

  const handleSubmit = async (data) => {
    if (editing) await base44.entities.Lead.update(editing.id, data);
    else await base44.entities.Lead.create(data);
    refresh();
    setFormOpen(false);
  };

  const handleDelete = async (l) => {
    if (!window.confirm("Bu müraciəti silmək istədiyinizə əminsiniz?")) return;
    await base44.entities.Lead.delete(l.id);
    refresh();
  };

  if (isLoading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">CRM Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Müraciətləri mərhələlər üzrə idarə edin</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2"><Plus className="w-4 h-4" /> Yeni müraciət</Button>
      </div>

      <div className="md:hidden">
        <MobilePipeline
          leads={leads}
          clientName={clientName}
          serviceName={serviceName}
          onStatusChange={async (l, status) => {
            queryClient.setQueryData(["leads"], (old = []) => old.map((x) => (x.id === l.id ? { ...x, status } : x)));
            await base44.entities.Lead.update(l.id, { status });
            refresh();
          }}
          onEdit={(l) => { setEditing(l); setFormOpen(true); }}
          onDelete={handleDelete}
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {LEAD_STATUSES.map((status) => {
            const columnLeads = leads.filter((l) => l.status === status);
            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`w-64 shrink-0 rounded-2xl p-3 transition-colors ${snapshot.isDraggingOver ? "bg-accent" : "bg-muted/50"}`}>
                    <div className="flex items-center justify-between px-1 mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${LEAD_STATUS_COLORS[status]}`}>{status}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{columnLeads.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[60px]">
                      {columnLeads.map((l, index) => (
                        <Draggable key={l.id} draggableId={l.id} index={index}>
                          {(prov, snap) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              className={`group bg-card border border-border rounded-xl p-3 space-y-1.5 ${snap.isDragging ? "shadow-lg rotate-2" : "hover:shadow-sm"} transition-shadow`}>
                              <div className="flex items-start justify-between gap-2">
                                <Link to={`/musteriler/${l.client_id}`} className="text-sm font-semibold hover:underline">{clientName(l.client_id)}</Link>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(l); setFormOpen(true); }}><Pencil className="w-3 h-3" /></button>
                                  <button className="p-1 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(l)}><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                              {serviceName(l.service_id) && <p className="text-xs text-muted-foreground">{serviceName(l.service_id)}</p>}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{l.source || "—"}</span>
                                {l.budget > 0 && <span className="font-semibold text-foreground">{formatMoney(l.budget)}</span>}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <LeadForm open={formOpen} onOpenChange={setFormOpen} lead={editing} clients={clients} services={services} onSubmit={handleSubmit} />
    </div>
  );
}