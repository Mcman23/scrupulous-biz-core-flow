import React from "react";

export default function StatCard({ title, value, icon: Icon, accent = "bg-primary/10 text-primary" }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 transition-shadow hover:shadow-md">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-xl font-bold tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}