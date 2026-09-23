import type { ApplicationStatus } from '../types';

export function formatSalary(min: number, max: number): string {
  if (!min && !max) return 'Not disclosed';

  const usd = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  if (min && max) {
    return `${usd(min)} – ${usd(max)}`;
  }

  return usd(min || max);
}

export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: 'bg-slate-100 text-slate-700',
  shortlisted: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-800',
  offered: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "1 year", "3 years", "Fresher" */
export function formatExperience(years: number): string {
  if (years <= 0) return 'Fresher';

  return `${years} ${years === 1 ? 'year' : 'years'} experience`;
}