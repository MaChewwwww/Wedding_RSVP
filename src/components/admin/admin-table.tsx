import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Wrapper ─────────────────────────────────────── */
export function AdminTable({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("overflow-x-auto rounded-2xl", className)}
      style={{
        border: "1px solid rgba(240,168,188,0.2)",
        boxShadow: "0 2px 12px rgba(60,30,20,0.05)",
      }}
    >
      {props.children}
    </div>
  );
}

/* ── Table element ───────────────────────────────── */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full text-left text-sm", className)}
      {...props}
    />
  );
}

/* ── Head ────────────────────────────────────────── */
export function TableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("text-xs font-semibold uppercase tracking-wider text-muted-ink", className)}
      style={{ background: "rgba(253,232,240,0.45)" }}
      {...props}
    />
  );
}

/* ── Header cell ─────────────────────────────────── */
export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-4 py-3", className)}
      {...props}
    />
  );
}

/* ── Body ────────────────────────────────────────── */
export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y", className)}
      style={{ "--tw-divide-color": "rgba(240,168,188,0.15)" } as React.CSSProperties}
      {...props}
    />
  );
}

/* ── Row ─────────────────────────────────────────── */
export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors duration-100 hover:bg-blush-light/20",
        className,
      )}
      {...props}
    />
  );
}

/* ── Data cell ───────────────────────────────────── */
export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 align-top text-ink", className)}
      {...props}
    />
  );
}

/* ── Empty state ─────────────────────────────────── */
export function TableEmpty({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-10 text-center text-sm text-muted-ink">
        {message}
      </td>
    </tr>
  );
}

/* ── Pagination ──────────────────────────────────── */
export function useTablePagination<T>(data: T[], pageSize = 15) {
  const [page, setPage] = React.useState(1);
  React.useEffect(() => {
    setPage(1); // Reset to first page when data changes
  }, [data]);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentData = data.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, totalPages, currentData };
}

export function TablePagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-blush/20 bg-paper-2/40 px-4 py-3 sm:px-6">
      <p className="text-sm text-muted-ink">
        Page <span className="font-medium text-ink">{page}</span> of{" "}
        <span className="font-medium text-ink">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-blush/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-blush-light disabled:opacity-50 disabled:hover:bg-paper"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-blush/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-blush-light disabled:opacity-50 disabled:hover:bg-paper"
        >
          Next
        </button>
      </div>
    </div>
  );
}
