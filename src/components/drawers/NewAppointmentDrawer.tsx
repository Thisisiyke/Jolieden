"use client";

import { useMemo, useState } from "react";
import { Drawer } from "../Drawer";
import { CustomSelect } from "../CustomSelect";
import { APPOINTMENTS, SERVICES, STAFF, type Appointment } from "../../lib/data";
import { Avatar } from "../Avatar";
import { Search, Calendar, User, ChevronRight } from "lucide-react";

type Step = "client" | "service" | "when";

export function NewAppointmentDrawer({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (appt: Omit<Appointment, "id" | "avatarHue">) => void;
}) {
  const [step, setStep] = useState<Step>("client");
  const [query, setQuery] = useState("");
  const [client, setClient] = useState<{ name: string; phone?: string } | null>(
    null,
  );
  const [service, setService] = useState<(typeof SERVICES)[number] | null>(null);
  const [staff, setStaff] = useState(STAFF[3].name);
  const [start, setStart] = useState("10:00am");

  const clientOptions = useMemo(() => {
    const seen = new Map<string, { name: string; phone?: string }>();
    APPOINTMENTS.forEach((a) => {
      if (!seen.has(a.client))
        seen.set(a.client, { name: a.client, phone: a.phone });
    });
    const list = Array.from(seen.values());
    if (!query.trim()) return list.slice(0, 8);
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.phone ?? "").includes(query),
    );
  }, [query]);

  const reset = () => {
    setStep("client");
    setQuery("");
    setClient(null);
    setService(null);
  };

  return (
    <Drawer
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New Appointment"
      width="max-w-md"
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="h-9 px-3 rounded border border-ink-300 text-ink-700 text-[13px] hover:bg-ink-50"
          >
            Cancel
          </button>
          {step === "when" && (
            <button
              disabled={!client || !service}
              onClick={() => {
                if (!client || !service) return;
                onCreate({
                  date: "2026-04-14",
                  client: client.name,
                  phone: client.phone,
                  service: service.name,
                  price: service.price,
                  start,
                  staff,
                  status: "unconfirmed",
                });
                reset();
                onClose();
              }}
              className="h-9 px-4 rounded bg-brand text-white font-semibold text-[13px] hover:bg-brand-700 disabled:opacity-50"
            >
              Create appointment
            </button>
          )}
        </div>
      }
    >
      {/* Step indicator */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2 text-[11px] text-ink-500">
        <Crumb active={step === "client"} done={!!client} label="Client" />
        <ChevronRight className="h-3 w-3" />
        <Crumb active={step === "service"} done={!!service} label="Service" />
        <ChevronRight className="h-3 w-3" />
        <Crumb active={step === "when"} label="When" />
      </div>

      {step === "client" && (
        <div className="px-5 pb-5">
          <div className="relative">
            <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, or email"
              className="w-full h-10 pl-9 pr-3 rounded border border-ink-300 text-[13px] outline-none focus:border-brand"
            />
          </div>
          <div className="mt-3 space-y-1">
            {clientOptions.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setClient(c);
                  setStep("service");
                }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-ink-50 text-left"
              >
                <Avatar name={c.name} />
                <div className="leading-tight min-w-0">
                  <div className="text-[13px] font-medium text-ink-900 truncate">
                    {c.name}
                  </div>
                  {c.phone && (
                    <div className="text-[11px] text-ink-500">{c.phone}</div>
                  )}
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                setClient({ name: query || "New Walk-In" });
                setStep("service");
              }}
              className="w-full mt-2 flex items-center gap-2 px-2 py-2 rounded border border-dashed border-ink-300 text-[12px] text-ink-700 hover:bg-ink-50"
            >
              <User className="h-4 w-4 text-brand" />
              Add new client{query ? ` "${query}"` : ""}
            </button>
          </div>
        </div>
      )}

      {step === "service" && (
        <div className="px-5 pb-5">
          <div className="text-[11px] text-ink-500 mb-2">
            Select a service for{" "}
            <span className="text-ink-900 font-medium">{client?.name}</span>
          </div>
          <div className="space-y-1">
            {SERVICES.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setService(s);
                  setStep("when");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-ink-200 hover:border-brand text-left"
              >
                <div>
                  <div className="text-[13px] font-medium text-ink-900">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-ink-500">{s.duration}</div>
                </div>
                <div className="text-[13px] font-semibold text-ink-900">
                  ${s.price}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "when" && (
        <div className="px-5 pb-5 space-y-4">
          <div className="text-[11px] text-ink-500">
            Booking{" "}
            <span className="text-ink-900 font-medium">{service?.name}</span> for{" "}
            <span className="text-ink-900 font-medium">{client?.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time">
              <input
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full h-9 px-2 rounded border border-ink-300 outline-none focus:border-brand text-[13px]"
              />
            </Field>
            <Field label="Staff">
              <CustomSelect
                value={staff}
                onChange={setStaff}
                options={STAFF.map((s) => ({ value: s.name, label: s.name }))}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Quick
              icon={<Calendar className="h-4 w-4" />}
              label="Select Time on Calendar"
            />
            <Quick icon={<User className="h-4 w-4" />} label="Add Walk-In" />
            <Quick
              icon={<Search className="h-4 w-4" />}
              label="View Times"
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Crumb({
  active,
  done,
  label,
}: {
  active?: boolean;
  done?: boolean;
  label: string;
}) {
  return (
    <span
      className={
        active
          ? "text-brand font-semibold"
          : done
            ? "text-ink-900"
            : "text-ink-500"
      }
    >
      {label}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-ink-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Quick({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="rounded border border-ink-200 hover:border-brand text-[11px] text-ink-700 px-2 py-2 flex flex-col items-center gap-1">
      <span className="text-brand">{icon}</span>
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}
