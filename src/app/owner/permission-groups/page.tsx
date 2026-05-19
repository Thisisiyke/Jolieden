"use client";

import { Plus } from "lucide-react";
import { PageHeader, Card } from "../../../components/manage/ManageShell";
import { PERMISSION_GROUPS } from "../../../lib/owner";

export default function PermissionGroupsPage() {
  return (
    <>
      <PageHeader title="Permission Groups" actions={
        <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New permission group
        </button>
      } />
      <div className="p-6">
        <Card>
          {PERMISSION_GROUPS.map((g, i) => (
            <div key={g.id} className={"flex items-center justify-between px-5 py-4 " + (i !== PERMISSION_GROUPS.length - 1 ? "border-b border-ink-100" : "")}>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink-900">{g.name}</div>
                <div className="text-[12px] text-ink-500 mt-0.5">{g.description}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-ink-700">{g.members} member{g.members === 1 ? "" : "s"}</span>
                <a className="text-[12px] text-brand font-semibold underline cursor-pointer">Edit group</a>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
