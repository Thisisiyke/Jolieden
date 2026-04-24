export function Avatar({
  name,
  hue = 280,
  size = 28,
}: {
  name: string;
  hue?: number;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = `hsl(${hue} 70% 65%)`;
  return (
    <span
      style={{ background: bg, width: size, height: size, fontSize: size * 0.42 }}
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0"
    >
      {initials}
    </span>
  );
}
