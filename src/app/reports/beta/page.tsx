"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { ReportsTabs } from "../../../components/reports/ReportsTabs";
import { BetaSidebar } from "../../../components/reports/BetaSidebar";
import { BetaTable } from "../../../components/reports/BetaTable";
import { BETA_REPORTS, type BetaReport } from "../../../lib/reports";

export default function ReportsBetaPage() {
  const [reports, setReports] = useState<BetaReport[]>(BETA_REPORTS);
  const [folder, setFolder] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customFolders, setCustomFolders] = useState<string[]>([]);

  const counts = useMemo(() => {
    return {
      all: reports.filter((r) => !r.trashed).length,
      fav: reports.filter((r) => r.favorite && !r.trashed).length,
      shared: reports.filter((r) => r.shared && !r.trashed).length,
      trash: reports.filter((r) => r.trashed).length,
      classic: reports.filter((r) => r.folder === "Classic BLVD Reports" && !r.trashed).length,
    };
  }, [reports]);

  const visible = useMemo(() => {
    let rows = [...reports];
    if (folder === "all") rows = rows.filter((r) => !r.trashed);
    else if (folder === "fav") rows = rows.filter((r) => r.favorite && !r.trashed);
    else if (folder === "shared") rows = rows.filter((r) => r.shared && !r.trashed);
    else if (folder === "trash") rows = rows.filter((r) => r.trashed);
    else if (folder === "classic") rows = rows.filter((r) => r.folder === "Classic BLVD Reports" && !r.trashed);
    else rows = rows.filter((r) => r.folder === folder && !r.trashed);

    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s),
      );
    }
    return rows;
  }, [reports, folder, q]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAll = (all: boolean) => {
    setSelected(all ? new Set(visible.map((r) => r.id)) : new Set());
  };
  const toggleFavorite = (id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)));
  };
  const trashIds = (ids: string[]) => {
    setReports((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, trashed: true } : r)));
    setSelected(new Set());
  };

  const addFolder = () => {
    const name = prompt("New folder name");
    if (name?.trim()) setCustomFolders((prev) => [...prev, name.trim()]);
  };

  const addReport = () => {
    const id = `rb${Date.now()}`;
    setReports((prev) => [
      {
        id,
        name: "Untitled Report",
        description: "—",
        folder: "My Reports",
        createdBy: "Frederick Douglass",
        shared: false,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50">
      <ReportsTabs active="beta" />
      <div className="flex-1 flex min-h-0">
        <BetaSidebar
          active={folder}
          onPick={(id) => { setFolder(id); setSelected(new Set()); }}
          counts={counts}
          customFolders={customFolders}
          onAddFolder={addFolder}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white border-b border-ink-200 px-6 py-3 flex items-center justify-between">
            <div className="relative">
              <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search reports"
                className="h-9 pl-9 pr-3 w-72 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand"
              />
            </div>
            <button
              onClick={addReport}
              className="h-9 px-3 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add report
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <BetaTable
              rows={visible}
              selected={selected}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
              onToggleFavorite={toggleFavorite}
              onTrash={trashIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
