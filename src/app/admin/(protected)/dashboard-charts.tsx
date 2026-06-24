"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Slice = { name: string; value: number; color: string };

const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(240,168,188,0.4)",
  background: "rgba(253,251,247,0.98)",
  fontSize: "12px",
  color: "#3a3330",
  boxShadow: "0 4px 16px rgba(60,30,20,0.12)",
} as const;

export function RsvpDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-ink">
        No RSVP data yet.
      </p>
    );
  }
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold text-ink">
          {total}
        </span>
        <span className="text-xs text-muted-ink">guests</span>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-1.5 text-xs text-muted-ink">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            {d.name} · <span className="font-semibold text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SimpleBar({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,168,188,0.25)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#6b6460" }}
          axisLine={{ stroke: "rgba(240,168,188,0.4)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#6b6460" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(240,168,188,0.1)" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
