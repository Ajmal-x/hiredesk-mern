import type { ReactNode } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { STATUS_STYLES, titleCase } from '../lib/format';
import type { ApplicationStatus } from '../types';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-14 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </span>

      <span className="mt-4 text-sm font-medium text-slate-600">
        {label}…
      </span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"
      role="alert"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle size={23} strokeWidth={1.8} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        Something went wrong
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-600">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center sm:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox size={23} strokeWidth={1.8} />
      </div>

      <h3 className="mt-5 text-base font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {titleCase(status)}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-slate-950">
        {value}
      </p>

      {hint && (
        <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export function FormError({
  message,
}: {
  message?: string | null;
}) {
  if (!message) return null;

  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700"
      role="alert"
    >
      <AlertCircle
        size={17}
        className="mt-0.5 shrink-0"
        strokeWidth={1.8}
      />

      <span>{message}</span>
    </div>
  );
}

export function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p
      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
      role="alert"
    >
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <div className="flex h-10 items-center gap-1 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
        <span>{page}</span>
        <span className="font-normal text-slate-400">of</span>
        <span>{totalPages}</span>
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}