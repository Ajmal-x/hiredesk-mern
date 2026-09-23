import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatRelativeDate } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  Spinner,
  StatCard,
  StatusBadge,
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { APPLICATION_STATUSES, type CandidateStats } from '../types';

function Icon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function CompanyAvatar({ company }: { company?: string }) {
  const letter = company?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white">
      {letter}
    </div>
  );
}

export function CandidateDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['candidate-stats'],
    queryFn: () =>
      api.get<{ data: CandidateStats }>('/stats/candidate'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <Spinner label="Loading your dashboard" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Could not load dashboard'
            }
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  const stats = data.data;
  const maxCount = Math.max(
    1,
    ...Object.values(stats.pipeline),
  );

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Candidate dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Keep track of your applications and stay on top of your job
              search.
            </p>
          </div>

          <Link
            to="/jobs"
            className="btn-primary inline-flex w-fit items-center gap-2"
          >
            <Icon>
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </Icon>
            Find jobs
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon>
                  <path d="M5 4h14v16H5z" />
                  <path d="M9 8h6" />
                  <path d="M9 12h6" />
                  <path d="M9 16h3" />
                </Icon>
              </div>

              <span className="text-xs font-medium text-slate-400">
                Total
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.totals.applications}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Applications sent
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <Icon>
                  <path d="M4 12h4l2-7 4 14 2-7h4" />
                </Icon>
              </div>

              <span className="text-xs font-medium text-slate-400">
                Progress
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.totals.responseRate}%
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Response rate
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon>
                  <path d="m5 12 4 4L19 6" />
                </Icon>
              </div>

              <span className="text-xs font-medium text-slate-400">
                Pipeline
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.pipeline.offered}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Offers received
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Pipeline */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Application pipeline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  See where your applications currently stand.
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <Icon>
                  <path d="M4 19V5" />
                  <path d="M4 19h16" />
                  <path d="m7 15 3-4 3 2 5-7" />
                </Icon>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              {APPLICATION_STATUSES.map((status) => {
                const count = stats.pipeline[status];

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between gap-4">
                      <StatusBadge status={status} />

                      <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {count}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent applications */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recent applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest application activity.
                </p>
              </div>

              <Link
                to="/applications"
                className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                View all →
              </Link>
            </div>

            {stats.recent.length === 0 ? (
              <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-900">
                  No applications yet
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Find a role that matches your skills and start building
                  your application pipeline.
                </p>

                <Link
                  to="/jobs"
                  className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Browse jobs →
                </Link>
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-slate-100">
                {stats.recent.map((application) => (
                  <li
                    key={application._id}
                    className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <CompanyAvatar
                      company={application.job?.company}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {application.job?.title ?? 'Job removed'}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {application.job?.company ?? 'Unknown company'}
                        {' · '}
                        {formatRelativeDate(
                          application.createdAt,
                        )}
                      </p>
                    </div>

                    <StatusBadge status={application.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Empty dashboard CTA */}
        {stats.totals.applications === 0 && (
          <div className="mt-8">
            <div className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-sm sm:p-9">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Your next move
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Your next opportunity could be one search away.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Explore open roles, find opportunities that match your
                  skills, and keep every application organized in one place.
                </p>

                <Link
                  to="/jobs"
                  className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Explore open jobs →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}