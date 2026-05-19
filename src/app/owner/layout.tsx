import { OwnerNav } from "../../components/owner/OwnerNav";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-ink-50">
      <OwnerNav />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
}
