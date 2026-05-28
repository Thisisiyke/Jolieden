"use client";

import { useMemo, useState } from "react";
import { Search, Download, GitMerge, Plus } from "lucide-react";
import { CLIENTS, clientSlug, type Client } from "../../lib/data";
import { ClientsTable, type SortKey, type SortDir } from "../../components/clients/ClientsTable";
import { FilterBuilder, applyFilters, type FilterRule } from "../../components/clients/FilterBuilder";
import { AudiencesPanel } from "../../components/clients/AudiencesPanel";
import { AddClientDrawer } from "../../components/clients/AddClientDrawer";
import { MergeClientsDrawer } from "../../components/clients/MergeClientsDrawer";

function daysSince(iso?: string): number {
  if (!iso) return 9999;
  const d = new Date(iso).getTime();
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
}

function downloadCsv(rows: Client[]) {
  const header = ["First name", "Last name", "Phone", "Email", "Email opt-in", "Text opt-in", "Visits", "Total spend"];
  const lines = [header.join(",")];
  for (const c of rows) {
    lines.push(
      [c.firstName, c.lastName, c.phone, c.email, c.emailOptIn ? "Y" : "N", c.textOptIn ? "Y" : "N", c.visits, c.totalSpend]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clients.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientsPage() {
  const [tab, setTab] = useState<"clients" | "audiences">("clients");
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [q, setQ] = useState("");
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAdd, setShowAdd] = useState(false);
  const [showMerge, setShowMerge] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...clients];
    // Search: name, phone, email
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(s),
      );
    }
    // Structured filters
    rows = applyFilters(rules, rows, daysSince) as Client[];
    // Sort
    rows.sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortKey === "name") {
        va = `${a.firstName} ${a.lastName}`.toLowerCase();
        vb = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortKey === "phone") {
        va = a.phone; vb = b.phone;
      } else if (sortKey === "email") {
        va = a.email.toLowerCase(); vb = b.email.toLowerCase();
      } else if (sortKey === "marketing") {
        const score = (c: Client) => (c.emailOptIn ? 2 : 0) + (c.textOptIn ? 1 : 0);
        va = -score(a); vb = -score(b);
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [clients, q, rules, sortKey, sortDir]);

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const liveCount = filtered.length;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50" onClick={() => setFilterOpen(false)}>
      {/* Sub-tabs */}
      <div className="bg-white border-b border-ink-200 px-6">
        <div className="flex gap-6">
          {(["clients", "audiences"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "relative py-3 text-[14px] font-semibold " +
                (tab === t ? "text-brand" : "text-ink-500 hover:text-ink-900")
              }
            >
              {t === "clients" ? "Clients" : "Audiences"}
              {tab === t && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Page header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-ink-200">
        <h1 className="text-[20px] font-semibold text-ink-900">
          {tab === "clients" ? "Clients" : "Audiences"}
        </h1>
        {tab === "clients" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCsv(filtered)}
              className="h-9 px-3 rounded border border-ink-300 bg-white text-ink-700 text-[14px] font-medium hover:bg-ink-50 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => setShowMerge(true)}
              className="h-9 px-3 rounded border border-ink-300 bg-white text-ink-700 text-[14px] font-medium hover:bg-ink-50 inline-flex items-center gap-2"
            >
              <GitMerge className="h-4 w-4" /> Merge clients
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="h-9 px-3 rounded bg-ink-900 text-white text-[14px] font-semibold hover:bg-black inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add client
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {tab === "audiences" ? (
          <AudiencesPanel />
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[14px] text-ink-700">
                <span className="font-semibold text-ink-900">{liveCount.toLocaleString()}</span>{" "}
                client{liveCount === 1 ? "" : "s"} in your directory
              </div>
              <div className="flex-1" />
              <div onClick={(e) => e.stopPropagation()}>
                <FilterBuilder
                  rules={rules}
                  onChange={setRules}
                  anchorOpen={filterOpen}
                  onToggleOpen={setFilterOpen}
                />
              </div>
              <div className="relative">
                <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, phone, or email"
                  className="w-72 h-9 pl-9 pr-3 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
                />
              </div>
            </div>

            <ClientsTable
              rows={filtered}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          </div>
        )}
      </div>

      <AddClientDrawer
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={(c) => {
          const id = `cl${Date.now()}`;
          setClients((prev) => [
            { id, slug: clientSlug(c.firstName, c.lastName), avatarHue: Math.floor(Math.random() * 360), ...c },
            ...prev,
          ]);
        }}
      />
      <MergeClientsDrawer
        open={showMerge}
        onClose={() => setShowMerge(false)}
        clients={clients}
        onMerge={(keepId, mergedIds) => {
          setClients((prev) => {
            const keep = prev.find((c) => c.id === keepId);
            if (!keep) return prev;
            const merged = prev.filter((c) => mergedIds.includes(c.id));
            const consolidated: Client = {
              ...keep,
              visits: keep.visits + merged.reduce((s, m) => s + m.visits, 0),
              totalSpend: keep.totalSpend + merged.reduce((s, m) => s + m.totalSpend, 0),
            };
            return prev
              .filter((c) => !mergedIds.includes(c.id))
              .map((c) => (c.id === keepId ? consolidated : c));
          });
        }}
      />
    </div>
  );
}
