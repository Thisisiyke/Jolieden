"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Monitor, Smartphone, Undo2, Redo2, Info, X } from "lucide-react";
import { CustomSelect } from "../CustomSelect";
import { BLAST_AUDIENCES, type BlastCampaign, type Channel } from "../../lib/marketing";

type Step = 1 | 2 | 3;

export function BlastWizard({
  campaign,
  channel,
  onClose,
  onSave,
}: {
  campaign?: BlastCampaign;
  channel: Channel;
  onClose: () => void;
  onSave: (c: BlastCampaign) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [confirmExit, setConfirmExit] = useState(false);
  const [name, setName] = useState(campaign?.name ?? "");
  const [audience, setAudience] = useState(campaign?.audience ?? BLAST_AUDIENCES[3]);
  const [excludeAudience, setExcludeAudience] = useState(campaign?.excludeAudience ?? "");
  const [excludeRecent, setExcludeRecent] = useState(campaign?.excludeRecent ?? false);
  const [subject, setSubject] = useState(campaign?.subject ?? "");
  const [preview, setPreview] = useState(campaign?.preview ?? "");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const recipientsEstimate = campaign?.estimatedRecipients ?? 7581;

  const exit = () => {
    if (name || subject || preview) setConfirmExit(true);
    else onClose();
  };

  const save = () => {
    onSave({
      id: campaign?.id ?? `bc${Date.now()}`,
      name: name || "Untitled campaign",
      channel,
      status: "draft",
      audience,
      excludeAudience,
      excludeRecent,
      estimatedRecipients: recipientsEstimate,
      subject,
      preview,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <header className="h-14 px-5 flex items-center justify-between border-b border-ink-200 shrink-0 bg-white">
        <button
          onClick={exit}
          className="text-[13px] text-ink-500 hover:text-brand inline-flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Summary
        </button>
        <div className="flex-1 mx-8 max-w-md">
          <Stepper step={step} />
        </div>
        <button
          onClick={save}
          className="h-9 px-4 rounded border border-ink-300 text-ink-700 text-[13px] font-medium hover:bg-ink-50"
        >
          Save and exit
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {step === 1 && (
          <Step1
            name={name} setName={setName}
            audience={audience} setAudience={setAudience}
            excludeAudience={excludeAudience} setExcludeAudience={setExcludeAudience}
            excludeRecent={excludeRecent} setExcludeRecent={setExcludeRecent}
            recipientsEstimate={recipientsEstimate}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && channel === "email" && (
          <Step2Email
            subject={subject} setSubject={setSubject}
            preview={preview} setPreview={setPreview}
            device={device} setDevice={setDevice}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 2 && channel === "text" && (
          <Step2Text
            preview={preview} setPreview={setPreview}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            recipientsEstimate={recipientsEstimate}
            onBack={() => setStep(2)}
            onLaunch={save}
          />
        )}
      </div>

      {confirmExit && (
        <ConfirmModal
          onYes={onClose}
          onNo={() => setConfirmExit(false)}
        />
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["General Settings", "Message", "Launch"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <div key={l} className="flex items-center gap-2 flex-1">
            <div
              className={
                "h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold " +
                (done
                  ? "bg-brand text-white"
                  : active
                    ? "bg-brand text-white"
                    : "bg-ink-100 text-ink-500")
              }
            >
              {done ? "✓" : n}
            </div>
            <span className={"text-[12px] " + (active ? "text-brand font-semibold" : "text-ink-500")}>
              {l}
            </span>
            {i < labels.length - 1 && (
              <div className="flex-1 h-px bg-ink-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  name, setName, audience, setAudience, excludeAudience, setExcludeAudience,
  excludeRecent, setExcludeRecent, recipientsEstimate, onNext,
}: {
  name: string; setName: (v: string) => void;
  audience: string; setAudience: (v: string) => void;
  excludeAudience: string; setExcludeAudience: (v: string) => void;
  excludeRecent: boolean; setExcludeRecent: (v: boolean) => void;
  recipientsEstimate: number;
  onNext: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-ink-50">
      <div className="max-w-2xl mx-auto p-8 space-y-5">
        <h1 className="text-[20px] font-semibold text-ink-900">General Settings</h1>

        <Field label="Campaign name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Spring Email"
            className="w-full h-10 px-3 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
          />
        </Field>

        <div className="rounded-lg border border-ink-200 bg-white p-5 space-y-4">
          <div className="text-[14px] font-semibold text-ink-900">Audience</div>

          <Field label="Send to">
            <CustomSelect
              value={audience}
              onChange={setAudience}
              options={[
                { value: "+create", label: "+ Create audience" },
                ...BLAST_AUDIENCES.map((a) => ({ value: a, label: a })),
              ]}
            />
          </Field>

          <Field label="Don't send to (optional)">
            <CustomSelect
              value={excludeAudience}
              onChange={setExcludeAudience}
              placeholder="Choose audience"
              options={[
                { value: "", label: "—" },
                ...BLAST_AUDIENCES.map((a) => ({ value: a, label: a })),
              ]}
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={excludeRecent}
              onChange={(e) => setExcludeRecent(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            <span className="text-[13px] text-ink-700">
              Exclude clients who recently received email marketing
            </span>
          </label>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-5">
          <div className="text-[12px] uppercase tracking-wide font-bold text-ink-500">
            Estimated recipients
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="text-[28px] font-bold text-ink-900">
              {recipientsEstimate.toLocaleString()}
            </div>
            <a className="text-[12px] text-brand underline">marketing consent</a>
          </div>
          <div className="text-[11px] text-ink-500 mt-2">
            Duplicates, blocked clients, and failed deliveries are excluded. Standard{" "}
            <a className="text-brand underline">usage rates apply</a>.
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!name.trim()}
            className="h-10 px-5 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2Email({
  subject, setSubject, preview, setPreview, device, setDevice, onBack, onNext,
}: {
  subject: string; setSubject: (v: string) => void;
  preview: string; setPreview: (v: string) => void;
  device: "desktop" | "mobile"; setDevice: (v: "desktop" | "mobile") => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="flex-1 flex min-h-0">
      {/* Designer canvas */}
      <div className="flex-1 bg-ink-100 flex flex-col items-center overflow-hidden">
        {/* Top template bar */}
        <div className="w-full bg-white border-b border-ink-200 px-5 py-2 flex items-center justify-between">
          <div className="text-[12px] text-ink-500">Email designer</div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 text-[12px] rounded border border-ink-300 text-ink-700 hover:bg-ink-50">
              Select template
            </button>
            <button className="h-8 px-3 text-[12px] rounded bg-brand text-white font-semibold hover:bg-brand-700">
              Use this template
            </button>
          </div>
        </div>
        {/* Canvas */}
        <div className="flex-1 overflow-auto py-6 px-4 w-full flex justify-center">
          <div
            className="bg-white rounded shadow-lg"
            style={{
              width: device === "desktop" ? "640px" : "360px",
              minHeight: "640px",
            }}
          >
            <div className="p-8 space-y-4">
              <div className="h-32 bg-ink-100 rounded flex items-center justify-center text-ink-500 text-[12px]">
                Header image
              </div>
              <div className="text-[24px] font-semibold text-ink-900">Save 20% on color this spring</div>
              <div className="text-[14px] text-ink-700 leading-relaxed">
                Limited-time offer for our valued clients. Book your appointment by April 30 to lock in the discount.
              </div>
              <button className="h-10 px-5 rounded bg-brand text-white text-[13px] font-semibold">
                Book now
              </button>
              <div className="border-t border-ink-200 pt-4 text-[11px] text-ink-500">
                Jolieden&apos;s Beauty Bar · Frederick Douglass · Unsubscribe
              </div>
            </div>
          </div>
        </div>
        {/* Bottom designer toolbar */}
        <div className="w-full bg-white border-t border-ink-200 px-4 py-2 flex items-center justify-center gap-1">
          <IconBtn title="Undo"><Undo2 className="h-4 w-4" /></IconBtn>
          <IconBtn title="Redo"><Redo2 className="h-4 w-4" /></IconBtn>
          <div className="w-px h-5 bg-ink-200 mx-1" />
          <IconBtn title="Preview"><Eye className="h-4 w-4" /></IconBtn>
          <button
            onClick={() => setDevice("desktop")}
            className={"h-8 w-8 rounded flex items-center justify-center " + (device === "desktop" ? "bg-brand text-white" : "text-ink-500 hover:bg-ink-100")}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={"h-8 w-8 rounded flex items-center justify-center " + (device === "mobile" ? "bg-brand text-white" : "text-ink-500 hover:bg-ink-100")}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right rail */}
      <aside className="w-80 border-l border-ink-200 bg-white shrink-0 flex flex-col">
        <RightRailTabs />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[10px] uppercase font-bold text-ink-500 tracking-wide">Drag a block</div>
          <div className="grid grid-cols-2 gap-2">
            {["COLUMNS", "HEADING", "TEXT", "IMAGE", "BUTTON", "DIVIDER", "HTML", "MENU"].map((b) => (
              <div
                key={b}
                draggable
                className="h-16 rounded border border-dashed border-ink-300 bg-ink-50 hover:border-brand hover:bg-brand-50 flex items-center justify-center text-[11px] font-semibold text-ink-700 cursor-grab"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
        {/* Bottom send-config strip */}
        <div className="border-t border-ink-200 p-4 space-y-3 bg-white">
          <Field label="Subject Line">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="It's a cold seaso..."
              className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand"
            />
          </Field>
          <Field label={
            <span className="inline-flex items-center gap-1">
              Email Preview Text <Info className="h-3 w-3 text-ink-500" />
            </span>
          }>
            <input
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <div className="text-ink-500 uppercase font-bold tracking-wide">Sender</div>
              <div className="text-ink-900 font-medium truncate">Jolieden&apos;s Beauty…</div>
            </div>
            <div>
              <div className="text-ink-500 uppercase font-bold tracking-wide">Reply-to</div>
              <div className="text-ink-900 font-medium truncate">hello@jolieden.com</div>
            </div>
          </div>
          <button className="w-full h-9 rounded border border-ink-300 text-ink-700 text-[12px] font-medium hover:bg-ink-50">
            ✉ Send a test email
          </button>
          <div className="flex items-center justify-between pt-2 border-t border-ink-100">
            <button onClick={onBack} className="h-9 px-3 text-[13px] text-ink-700 hover:text-brand inline-flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Go Back
            </button>
            <button onClick={onNext} className="h-9 px-4 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700 inline-flex items-center gap-1">
              Save and next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Step2Text({
  preview, setPreview, onBack, onNext,
}: {
  preview: string; setPreview: (v: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-ink-50">
      <div className="max-w-xl mx-auto p-8 space-y-5">
        <h1 className="text-[20px] font-semibold text-ink-900">Text Message</h1>
        <div className="rounded-lg border border-ink-200 bg-white p-5 space-y-3">
          <Field label="Message body">
            <textarea
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              maxLength={160}
              rows={5}
              placeholder="Hi {{first_name}} — book your spring color refresh!"
              className="w-full p-2 rounded border border-ink-300 bg-white text-[13px] outline-none focus:border-brand resize-none"
            />
          </Field>
          <div className="text-[11px] text-ink-500 text-right">
            {preview.length}/160 characters
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="h-10 px-4 rounded border border-ink-300 text-[13px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Go Back
          </button>
          <button onClick={onNext} className="h-10 px-5 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            Save and next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3({
  recipientsEstimate, onBack, onLaunch,
}: {
  recipientsEstimate: number;
  onBack: () => void;
  onLaunch: () => void;
}) {
  const [when, setWhen] = useState<"now" | "later">("now");
  const [date, setDate] = useState("2026-04-20");
  const [time, setTime] = useState("10:00");

  return (
    <div className="flex-1 overflow-y-auto bg-ink-50">
      <div className="max-w-2xl mx-auto p-8 space-y-5">
        <h1 className="text-[20px] font-semibold text-ink-900">Launch Campaign</h1>

        <div className="rounded-lg border border-ink-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] uppercase font-bold tracking-wide text-ink-500">Estimated recipients</div>
              <div className="text-[24px] font-bold text-ink-900 mt-1">{recipientsEstimate.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-5 space-y-3">
          <div className="text-[14px] font-semibold text-ink-900">Schedule</div>
          <div className="flex items-center gap-3">
            <Choice label="Send now" active={when === "now"} onClick={() => setWhen("now")} />
            <Choice label="Send later" active={when === "later"} onClick={() => setWhen("later")} />
          </div>
          {when === "later" && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Field label="Date">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px]" />
              </Field>
              <Field label="Time">
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-9 px-2 rounded border border-ink-300 bg-white text-[13px]" />
              </Field>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={onBack} className="h-10 px-4 rounded border border-ink-300 text-[13px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Go Back
          </button>
          <button onClick={onLaunch} className="h-10 px-5 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700">
            {when === "now" ? "Send now" : "Schedule send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "h-10 px-4 rounded border text-[13px] font-medium " +
        (active
          ? "border-brand bg-brand-50 text-brand"
          : "border-ink-300 bg-white text-ink-700 hover:bg-ink-50")
      }
    >
      {label}
    </button>
  );
}

function RightRailTabs() {
  const [tab, setTab] = useState<"content" | "blocks" | "body">("content");
  return (
    <div className="flex border-b border-ink-200">
      {(["content", "blocks", "body"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={
            "flex-1 py-2.5 text-[12px] font-semibold uppercase tracking-wide " +
            (tab === t ? "text-brand border-b-2 border-brand" : "text-ink-500 hover:text-ink-700")
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function ConfirmModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-5">
        <div className="text-[15px] font-semibold text-ink-900">Confirm Navigation</div>
        <div className="text-[13px] text-ink-700 mt-2">
          Entered information will be lost. Continue?
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onNo} className="h-9 px-4 rounded border border-ink-300 text-[13px] text-ink-700 hover:bg-ink-50">
            NO
          </button>
          <button onClick={onYes} className="h-9 px-4 rounded bg-brand text-white text-[13px] font-semibold hover:bg-brand-700">
            YES
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase font-bold tracking-wide text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button title={title} className="h-8 w-8 rounded flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-900">
      {children}
    </button>
  );
}

export function CloseX({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-8 w-8 rounded hover:bg-ink-100 text-ink-500"><X className="h-4 w-4" /></button>
  );
}
