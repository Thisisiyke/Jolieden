import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronDown, CreditCard, Mail, Phone, Printer, RotateCcw, Plus } from "lucide-react";
import { ORDERS } from "../../../../lib/sales";
import { Avatar } from "../../../../components/Avatar";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const order = ORDERS.find((o) => o.uuid === uuid);
  if (!order) notFound();

  const lineTotal = order.lineItems.reduce((s, li) => s + li.price, 0);

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-ink-50">
      <div className="px-6 py-4 bg-white border-b border-ink-200">
        <Link href="/sales/orders" className="text-[12px] text-ink-500 hover:text-brand inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> All Orders
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-12 gap-4">
        {/* Main */}
        <div className="col-span-8 space-y-4">
          <div className="rounded-lg border border-ink-200 bg-white">
            <div className="px-5 py-4 flex items-center justify-between border-b border-ink-100">
              <div className="flex items-center gap-3">
                <Avatar name={order.staff} hue={120} />
                <div>
                  <div className="text-[18px] font-semibold text-ink-900">Purchase {order.number}</div>
                  <div className="text-[11px] text-ink-500">{order.staff} · {order.date} · {order.time}</div>
                </div>
              </div>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold tracking-wide bg-emerald-100 text-emerald-700">
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-ink-500 bg-ink-50 border-b border-ink-200">
              Line items
            </div>
            <div className="divide-y divide-ink-100">
              {order.lineItems.map((li) => (
                <details key={li.id} className="group">
                  <summary className="px-5 py-3 flex items-center gap-3 cursor-pointer list-none">
                    <ChevronDown className="h-4 w-4 text-ink-500 -rotate-90 group-open:rotate-0 transition" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-ink-900">{li.service}</div>
                      <div className="text-[11px] text-ink-500">{li.staff}</div>
                    </div>
                    <span className="text-[14px] font-semibold text-ink-900">${li.price.toFixed(2)}</span>
                    <button className="h-8 w-8 rounded hover:bg-ink-100 text-ink-500 flex items-center justify-center" title="Refund">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </summary>
                  {li.modifiers && li.modifiers.length > 0 && (
                    <div className="px-12 pb-3 -mt-1 flex flex-wrap gap-1.5">
                      {li.modifiers.map((m) => (
                        <span key={m} className="bg-ink-100 text-ink-700 rounded px-2 py-0.5 text-[11px]">{m}</span>
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </div>

            <div className="px-5 py-3 bg-ink-50 border-t border-ink-200">
              <div className="flex justify-between py-1 text-[14px]">
                <span className="text-ink-700">Subtotal</span>
                <span className="font-medium">${lineTotal.toFixed(2)}</span>
              </div>
              {order.creditFee > 0 && (
                <div className="flex justify-between py-1 text-[14px]">
                  <span className="text-ink-700">Credit Fee</span>
                  <span className="font-medium">${order.creditFee.toFixed(2)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between py-1 text-[14px]">
                  <span className="text-ink-700">Tax</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-[15px] font-semibold border-t border-ink-200 mt-1">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="col-span-4 space-y-4">
          {/* Client */}
          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <div className="text-[11px] uppercase font-bold tracking-wide text-ink-500">Client</div>
            <div className="mt-2 flex items-center gap-3">
              <Avatar name={order.client} hue={280} />
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink-900">{order.client}</div>
                {order.appointmentDate && (
                  <a className="text-[11px] text-brand underline cursor-pointer">View Appointment</a>
                )}
              </div>
            </div>
            {(order.clientPhone || order.clientEmail) && (
              <div className="mt-3 space-y-1 text-[12px] text-ink-700">
                {order.clientPhone && <div className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> {order.clientPhone}</div>}
                {order.clientEmail && <div className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {order.clientEmail}</div>}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="h-9 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50 inline-flex items-center justify-center gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</button>
              <button className="h-9 rounded border border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50 inline-flex items-center justify-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</button>
            </div>
          </div>

          {/* Payments */}
          {order.payments.map((p) => (
            <div key={p.id} className="rounded-lg border border-ink-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-12 rounded bg-ink-100 flex items-center justify-center"><CreditCard className="h-4 w-4 text-ink-700" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink-900">{p.method}{p.last4 ? ` ending in ${p.last4}` : ""}</div>
                  {p.expires && <div className="text-[11px] text-ink-500">Exp {p.expires}</div>}
                </div>
                <div className="text-[14px] font-semibold">${p.amount.toFixed(2)}</div>
              </div>
              <button className="mt-3 w-full h-9 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center justify-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Start Refund
              </button>
            </div>
          ))}

          {/* Tags */}
          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <div className="text-[11px] uppercase font-bold tracking-wide text-ink-500 mb-2">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {(order.tags ?? []).map((t) => (
                <span key={t} className="rounded-full bg-brand-100 text-brand text-[11px] font-semibold px-2 py-0.5">{t}</span>
              ))}
              <button className="rounded-full border border-dashed border-ink-300 text-[11px] font-semibold text-ink-700 px-2 py-0.5 hover:bg-ink-50 inline-flex items-center gap-1"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <div className="text-[11px] uppercase font-bold tracking-wide text-ink-500 mb-2 flex items-center justify-between">
              Notes
              <button className="text-ink-500 hover:text-brand"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="text-[14px] text-ink-700">{order.note ?? <span className="text-ink-400">No notes yet.</span>}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
