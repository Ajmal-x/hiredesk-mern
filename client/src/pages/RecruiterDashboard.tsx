import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  Spinner,
  StatusBadge,
} from '../components/ui';
import { APPLICATION_STATUSES, type RecruiterStats } from '../types';

function StatIcon({ type }: { type: 'jobs' | 'open' | 'closed' | 'users' }) {
  const paths = {
    jobs: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 11h18M10 11v2h4v-2" />
      </>
    ),
    open: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12 2.3 2.3 4.7-5" />
      </>
    ),
    closed: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0 0-6M17 15.5a5 5 0 0 1 3.5 4.5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      {paths[type]}
    </svg>
  );
}

export function RecruiterDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: () =>
      api.get<{ data: RecruiterStats }>('/stats/recruiter'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Spinner label="Loading your dashboard" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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

  const maxPipeline = Math.max(
    1,
    ...Object.values(stats.pipeline),
  );

  const maxTrend = Math.max(
    1,
    ...stats.trend.map((point) => point.count),
  );

  const totalInTrend = stats.trend.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Recruiter workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Hiring dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Monitor your jobs, applications, and candidate pipeline from one
              place.
            </p>
          </div>

          <Link
            to="/recruiter/jobs/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Post a job
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <StatIcon type="jobs" />
              </div>

              <span className="text-xs font-medium text-slate-400">
                All time
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.totals.jobs}
            </p>

            <p className="mt-1 text-sm text-slate-500">Total jobs</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <StatIcon type="open" />
              </div>

              <span className="text-xs font-medium text-emerald-600">
                Active
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.totals.openJobs}
            </p>

            <p className="mt-1 text-sm text-slate-500">Open positions</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <StatIcon type="closed" />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Completed
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.totals.closedJobs}
            </p>

            <p className="mt-1 text-sm text-slate-500">Closed jobs</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <StatIcon type="users" />
              </div>

              <span className="text-xs font-medium text-brand-600">
                Candidates
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stats.totals.applicants}
            </p>

            <p className="mt-1 text-sm text-slate-500">Total applicants</p>
          </div>
        </div>

        {/* Empty state */}
        {stats.totals.jobs === 0 ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <EmptyState
              title="You haven't posted a job yet"
              description="Create your first role and start building your candidate pipeline."
              action={
                <Link
                  to="/recruiter/jobs/new"
                  className="btn-primary"
                >
                  Post your first job
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Pipeline + Top jobs */}
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Candidate pipeline
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current status across your applications.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {stats.totals.applicants} total
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {APPLICATION_STATUSES.map((status) => {
                    const count = stats.pipeline[status];
                    const percentage =
                      (count / maxPipeline) * 100;

                    return (
                      <div key={status}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <StatusBadge status={status} />

                          <span className="text-sm font-semibold tabular-nums text-slate-700">
                            {count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Most applied roles
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Jobs attracting the most candidates.
                    </p>
                  </div>

                  <Link
                    to="/recruiter/jobs"
                    className="shrink-0 text-xs font-semibold text-brand-700 transition hover:text-brand-800"
                  >
                    Manage jobs →
                  </Link>
                </div>

                {stats.topJobs.length === 0 ? (
                  <div className="mt-8 rounded-xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No applications yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Applications will appear here as candidates apply.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-5 divide-y divide-slate-100">
                    {stats.topJobs.map((job, index) => (
                      <li
                        key={job._id}
                        className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                          {index + 1}
                        </span>

                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                        >
                          {job.title}
                        </Link>

                        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold tabular-nums text-brand-700">
                          {job.applicantCount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Applications trend */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Applications received
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Candidate applications over the last 30 days.
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold tabular-nums text-slate-950">
                    {totalInTrend}
                  </p>

                  <p className="text-xs text-slate-400">
                    applications
                  </p>
                </div>
              </div>

              {totalInTrend === 0 ? (
                <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No applications in the last 30 days.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your application activity will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-8 flex h-40 items-end gap-1">
                    {stats.trend.map((point) => {
                      const height =
                        point.count === 0
                          ? '3px'
                          : `${(point.count / maxTrend) * 100}%`;

                      return (
                        <div
                          key={point._id}
                          className="group flex h-full flex-1 items-end"
                          title={`${formatDate(point._id)}: ${
                            point.count
                          } application${
                            point.count === 1 ? '' : 's'
                          }`}
                        >
                          <div
                            className={`w-full rounded-t-md transition-all ${
                              point.count === 0
                                ? 'bg-slate-100'
                                : 'bg-brand-500 group-hover:bg-brand-600'
                            }`}
                            style={{ height }}
                          >
                            <span className="sr-only">
                              {point._id}: {point.count} applications
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex justify-between text-[11px] text-slate-400">
                    <span>
                      {formatDate(stats.trend[0]._id)}
                    </span>

                    <span>
                      {formatDate(
                        stats.trend[stats.trend.length - 1]._id,
                      )}
                    </span>
                  </div>
                </>
              )}
            </section>

            {/* Quick actions */}
            <section className="mt-6 overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 text-white shadow-sm sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold">
                    Keep your hiring moving
                  </p>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                    Manage your open positions, review candidates, and create
                    new opportunities from your recruiter workspace.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/recruiter/jobs"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-700 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Manage jobs
                  </Link>

                  <Link
                    to="/recruiter/jobs/new"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Post a job
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}