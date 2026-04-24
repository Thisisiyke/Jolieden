export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center bg-ink-50">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-brand text-white flex items-center justify-center text-2xl font-semibold shadow-lg">
          {title[0]}
        </div>
        <h1 className="mt-4 text-[20px] font-semibold text-ink-900">{title}</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          This area is part of the prototype scaffolding. Wire up real data and
          views here next.
        </p>
      </div>
    </div>
  );
}
