"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Sliders } from "lucide-react";
import { PageHeader, Card, ToggleRow } from "../../../components/manage/ManageShell";
import { CustomSelect } from "../../../components/CustomSelect";
import { PRODUCTS, type Product } from "../../../lib/manage";

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>(PRODUCTS);
  const [q, setQ] = useState("");
  const [supplier, setSupplier] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [brand, setBrand] = useState("ALL");

  const suppliers = Array.from(new Set(rows.flatMap((r) => r.suppliers)));
  const categories = Array.from(new Set(rows.map((r) => r.category)));
  const brands = Array.from(new Set(rows.map((r) => r.brand)));

  const filtered = useMemo(() =>
    rows.filter((r) =>
      (supplier === "ALL" || r.suppliers.includes(supplier)) &&
      (category === "ALL" || r.category === category) &&
      (brand === "ALL" || r.brand === brand) &&
      (q.trim() === "" || r.name.toLowerCase().includes(q.toLowerCase()))
    ),
    [rows, q, supplier, category, brand],
  );

  return (
    <>
      <PageHeader title="Products" actions={
        <>
          <button className="h-9 px-3 rounded border border-ink-300 text-[14px] font-medium text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2">
            <Sliders className="h-4 w-4" /> Adjust Quantities
          </button>
          <button className="h-9 px-3 rounded bg-brand text-white text-[14px] font-semibold hover:bg-brand-700 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Product
          </button>
        </>
      } />

      <div className="px-6 py-3 bg-white border-b border-ink-200 flex items-center gap-3 flex-wrap">
        <FilterCell label="Suppliers" value={supplier} onChange={setSupplier} options={["ALL", ...suppliers]} />
        <FilterCell label="Categories" value={category} onChange={setCategory} options={["ALL", ...categories]} />
        <FilterCell label="Brands" value={brand} onChange={setBrand} options={["ALL", ...brands]} />
        <div className="flex-1" />
        <div className="relative">
          <Search className="h-4 w-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="h-9 pl-9 pr-3 w-64 rounded border border-ink-300 bg-white text-[14px] outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="p-6">
        <Card>
          <table className="w-full text-[14px]">
            <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500 tracking-wide">
              <tr>
                <th className="w-12 px-4 py-2.5" />
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Supplier</th>
                <th className="text-left px-4 py-2.5">Brand</th>
                <th className="text-left px-4 py-2.5">Category</th>
                <th className="text-right px-4 py-2.5">Price</th>
                <th className="text-right px-4 py-2.5">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <ToggleRow
                      checked={p.enabled}
                      onChange={(v) => setRows((prev) => prev.map((x) => x.id === p.id ? { ...x, enabled: v } : x))}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">{p.name}</td>
                  <td className="px-4 py-3 text-ink-700">{p.suppliers.join(", ")}</td>
                  <td className="px-4 py-3 text-ink-700">{p.brand}</td>
                  <td className="px-4 py-3 text-ink-700">{p.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">${p.price.toFixed(2)}</td>
                  <td className={"px-4 py-3 text-right font-semibold " + (p.stock === 0 ? "text-rose-600" : p.stock < 10 ? "text-amber-600" : "")}>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function FilterCell({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="min-w-[160px]">
      <CustomSelect
        value={value}
        onChange={onChange}
        options={options.map((o) => ({ value: o, label: o === "ALL" ? `All ${label}` : o }))}
      />
    </div>
  );
}
