"use client";

import { useState } from "react";
import {
  SALES_SUMMARY_BY_CATEGORY,
  SALES_SUMMARY_BY_PAYMENT,
  DAILY_SUMMARY_ROWS,
  LINE_ITEMS,
  STAFF_PERFORMANCE,
  findSummaryLabel,
  type SummaryReportId,
} from "../../lib/reports";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

export function SummaryRenderer({
  id,
  range,
}: {
  id: SummaryReportId;
  range: string;
}) {
  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[20px] font-semibold text-ink-900">
          {findSummaryLabel(id)}
        </h1>
        <div className="text-[12px] text-ink-500">{range}</div>
      </div>
      {id === "sales-summary" && <SalesSummary />}
      {id === "daily-summary" && <DailySummary />}
      {id === "detailed-line-item" && <DetailedLineItem />}
      {id === "staff-performance" && <StaffPerformance />}
      {!["sales-summary", "daily-summary", "detailed-line-item", "staff-performance"].includes(id) && (
        <PlaceholderTable />
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">{children}</div>;
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={"text-left px-4 py-2 font-bold uppercase text-[10px] tracking-wide text-ink-500 " + className}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={"px-4 py-2.5 text-[13px] " + className}>{children}</td>;
}

function SalesSummary() {
  const totalGross = SALES_SUMMARY_BY_CATEGORY.reduce((s, r) => s + r.gross, 0);
  const totalRefunds = SALES_SUMMARY_BY_CATEGORY.reduce((s, r) => s + r.refunds, 0);
  const totalNet = totalGross + totalRefunds;
  return (
    <div className="space-y-4">
      <Card>
        <div className="px-4 py-2.5 bg-ink-50 text-[12px] font-semibold text-ink-700 border-b border-ink-200">
          By Sales Category
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-200">
              <Th>Category</Th>
              <Th className="text-right">Count</Th>
              <Th className="text-right">Gross</Th>
              <Th className="text-right">Refunds</Th>
              <Th className="text-right">Net</Th>
            </tr>
          </thead>
          <tbody>
            {SALES_SUMMARY_BY_CATEGORY.map((r) => (
              <tr key={r.label} className="border-b border-ink-100">
                <Td className="font-medium">{r.label}</Td>
                <Td className="text-right">{r.count}</Td>
                <Td className="text-right">${r.gross.toFixed(2)}</Td>
                <Td className="text-right text-rose-600">{r.refunds === 0 ? "$0.00" : `-$${Math.abs(r.refunds).toFixed(2)}`}</Td>
                <Td className="text-right font-semibold">${r.net.toFixed(2)}</Td>
              </tr>
            ))}
            <tr className="bg-ink-50 font-semibold">
              <Td>Total</Td>
              <Td className="text-right">—</Td>
              <Td className="text-right">${totalGross.toFixed(2)}</Td>
              <Td className="text-right text-rose-600">{totalRefunds === 0 ? "$0.00" : `-$${Math.abs(totalRefunds).toFixed(2)}`}</Td>
              <Td className="text-right">${totalNet.toFixed(2)}</Td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="px-4 py-2.5 bg-ink-50 text-[12px] font-semibold text-ink-700 border-b border-ink-200">
          By Payment Method
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-200">
              <Th>Method</Th>
              <Th className="text-right">Transactions</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {SALES_SUMMARY_BY_PAYMENT.map((r) => (
              <tr key={r.method} className="border-b border-ink-100">
                <Td className="font-medium">{r.method}</Td>
                <Td className="text-right">{r.txns}</Td>
                <Td className="text-right">${r.total.toFixed(2)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DailySummary() {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const sorted = [...DAILY_SUMMARY_ROWS].sort((a, b) =>
    sortDir === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
  );
  const totals = DAILY_SUMMARY_ROWS.reduce(
    (acc, r) => ({
      appts: acc.appts + r.appts, requested: acc.requested + r.requested,
      services: acc.services + r.services, svcRev: acc.svcRev + r.svcRev,
      svcTax: acc.svcTax + r.svcTax, products: acc.products + r.products,
      prodRev: acc.prodRev + r.prodRev, prodTax: acc.prodTax + r.prodTax,
      packages: acc.packages + r.packages,
    }),
    { appts: 0, requested: 0, services: 0, svcRev: 0, svcTax: 0, products: 0, prodRev: 0, prodTax: 0, packages: 0 },
  );

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-ink-50 border-b border-ink-200">
            <tr>
              <Th>
                <button onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")} className="inline-flex items-center gap-1 text-ink-900">
                  Date {sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </Th>
              <Th className="text-right">Appts</Th>
              <Th className="text-right">Requested</Th>
              <Th className="text-right">Services</Th>
              <Th className="text-right">Svc Revenue</Th>
              <Th className="text-right">Svc Tax</Th>
              <Th className="text-right">Products</Th>
              <Th className="text-right">Prod Revenue</Th>
              <Th className="text-right">Prod Tax</Th>
              <Th className="text-right">Packages</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.date} className="border-b border-ink-100">
                <Td className="font-medium">{r.date}</Td>
                <Td className="text-right">{r.appts}</Td>
                <Td className="text-right">{r.requested}</Td>
                <Td className="text-right">{r.services}</Td>
                <Td className="text-right">${r.svcRev.toFixed(2)}</Td>
                <Td className="text-right">${r.svcTax.toFixed(2)}</Td>
                <Td className="text-right">{r.products}</Td>
                <Td className="text-right">${r.prodRev.toFixed(2)}</Td>
                <Td className="text-right">${r.prodTax.toFixed(2)}</Td>
                <Td className="text-right">{r.packages}</Td>
              </tr>
            ))}
            <tr className="bg-ink-50 font-semibold">
              <Td>Total</Td>
              <Td className="text-right">{totals.appts}</Td>
              <Td className="text-right">{totals.requested}</Td>
              <Td className="text-right">{totals.services}</Td>
              <Td className="text-right">${totals.svcRev.toFixed(2)}</Td>
              <Td className="text-right">${totals.svcTax.toFixed(2)}</Td>
              <Td className="text-right">{totals.products}</Td>
              <Td className="text-right">${totals.prodRev.toFixed(2)}</Td>
              <Td className="text-right">${totals.prodTax.toFixed(2)}</Td>
              <Td className="text-right">{totals.packages}</Td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DetailedLineItem() {
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <div className="space-y-3">
      <div className="relative">
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className="h-8 px-3 rounded-full bg-brand text-white text-[12px] font-semibold inline-flex items-center gap-2 hover:bg-brand-700"
        >
          <Filter className="h-3 w-3" /> Filters
        </button>
        {filterOpen && (
          <div className="absolute left-0 top-full mt-2 z-30 w-72 bg-white rounded-lg shadow-xl border border-ink-200 p-4 space-y-3">
            <div className="text-[11px] uppercase font-bold text-ink-500">Filter rows</div>
            <Field label="Type">
              <select className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px]">
                <option>All</option><option>Service</option><option>Product</option><option>Tip</option>
              </select>
            </Field>
            <Field label="Staff">
              <select className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px]">
                <option>All</option><option>Mame Diarra</option><option>Naomi K.</option>
              </select>
            </Field>
            <button onClick={() => setFilterOpen(false)} className="w-full h-9 rounded bg-brand text-white text-[12px] font-semibold">
              Apply
            </button>
          </div>
        )}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-ink-50 border-b border-ink-200">
              <tr>
                <Th>Order #</Th>
                <Th>Client</Th>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Line Item</Th>
                <Th>Staff</Th>
                <Th>Description</Th>
                <Th className="text-right">Unit</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {LINE_ITEMS.map((r, i) => (
                <tr key={i} className="border-b border-ink-100">
                  <Td className="text-ink-700">{r.order}</Td>
                  <Td className="font-medium">{r.client}</Td>
                  <Td>{r.date}</Td>
                  <Td>{r.type}</Td>
                  <Td>{r.lineType}</Td>
                  <Td>{r.staff}</Td>
                  <Td className="text-ink-500">{r.description}</Td>
                  <Td className="text-right">${r.unit.toFixed(2)}</Td>
                  <Td className="text-right">{r.qty}</Td>
                  <Td className="text-right font-semibold">${r.total.toFixed(2)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StaffPerformance() {
  const totals = STAFF_PERFORMANCE.reduce(
    (a, r) => ({
      sched: a.sched + r.sched, booked: a.booked + r.booked,
      appts: a.appts + r.appts, services: a.services + r.services,
      svcRev: a.svcRev + r.svcRev, tip: a.tip + r.tip,
      clients: a.clients + r.clients, newClients: a.newClients + r.newClients,
    }),
    { sched: 0, booked: 0, appts: 0, services: 0, svcRev: 0, tip: 0, clients: 0, newClients: 0 },
  );
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-ink-50 border-b border-ink-200">
            <tr>
              <Th>Name</Th>
              <Th className="text-right">Hours Scheduled</Th>
              <Th className="text-right">Hours Booked</Th>
              <Th className="text-right">Utilization</Th>
              <Th className="text-right">Appts</Th>
              <Th className="text-right">Services</Th>
              <Th className="text-right">Service Revenue</Th>
              <Th className="text-right">Avg / Appt</Th>
              <Th className="text-right">Tip Revenue</Th>
              <Th className="text-right">Clients</Th>
              <Th className="text-right">New Clients</Th>
            </tr>
          </thead>
          <tbody>
            {STAFF_PERFORMANCE.map((r) => (
              <tr key={r.name} className="border-b border-ink-100">
                <Td className="font-medium">{r.name}</Td>
                <Td className="text-right">{r.sched}</Td>
                <Td className="text-right">{r.booked}</Td>
                <Td className="text-right">{r.util}%</Td>
                <Td className="text-right">{r.appts}</Td>
                <Td className="text-right">{r.services}</Td>
                <Td className="text-right">${r.svcRev.toFixed(2)}</Td>
                <Td className="text-right">${r.avg.toFixed(2)}</Td>
                <Td className="text-right">${r.tip.toFixed(2)}</Td>
                <Td className="text-right">{r.clients}</Td>
                <Td className="text-right">{r.newClients}</Td>
              </tr>
            ))}
            <tr className="bg-ink-50 font-semibold">
              <Td>Total</Td>
              <Td className="text-right">{totals.sched}</Td>
              <Td className="text-right">{totals.booked}</Td>
              <Td className="text-right">{Math.round(totals.booked / totals.sched * 100)}%</Td>
              <Td className="text-right">{totals.appts}</Td>
              <Td className="text-right">{totals.services}</Td>
              <Td className="text-right">${totals.svcRev.toFixed(2)}</Td>
              <Td className="text-right">${(totals.svcRev / totals.appts).toFixed(2)}</Td>
              <Td className="text-right">${totals.tip.toFixed(2)}</Td>
              <Td className="text-right">{totals.clients}</Td>
              <Td className="text-right">{totals.newClients}</Td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PlaceholderTable() {
  return (
    <Card>
      <div className="p-12 text-center text-ink-500 text-[13px]">
        This summary&apos;s data set isn&apos;t wired up in the prototype yet.
        The shell, toolbar, and date-range filter all work — connect real data
        to populate the table here.
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase font-bold tracking-wide text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
