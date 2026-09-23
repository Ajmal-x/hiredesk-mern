import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, ApiRequestError, toQuery } from '../lib/api';
import { formatDate, formatSalary } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  FormError,
  Pager,
  Spinner,
  StatusBadge,
} from '../components/ui';
import {
  APPLICATION_STATUSES,
  type Application,
  type Paginated,
} from '../types';

function CompanyAvatar({ name }: { name?: string }) {
  const letter = name?.trim().charAt(0).toUpperCase() || 'J';

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
      {letter}
    </div>
  );
}

function HistoryItem({
  status,
  at,
  note,
  isLast,
}: {
  status: string;
  at: string;
  note?: string;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {!isLast && (
        <span className="absolute left-[5px] top-3 h-full w-px bg-slate-200" />
      )}

      <span className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400 ring-4 ring-white" />

      <div className="min-w-0 pb-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold capitalize text-slate-800">
            {status}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500">{formatDate(at)}</span>
        </div>

        {note && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {note}
          </p>
        )}
      </div>
    </li>
  );
}

export function MyApplications() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const query = toQuery({
    status: statusFilter,
    page,
    limit: 10,
  });

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['my-applications', query],
    queryFn: () =>
      api.get<Paginated<Application>>(`/applications/mine${query}`),
    placeholderData: keepPreviousData,
  });

  const withdraw = useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-applications'],
      });

      queryClient.invalidateQueries({
        queryKey: ['candidate-stats'],
      });
    },

    onError: (err) => {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not withdraw the application',
      );
    },
  });

  const handleWithdraw = (application: Application) => {
    setError(null);

    const title = application.job?.title ?? 'this job';

    if (
      window.confirm(
        `Withdraw your application for ${title}? This cannot be undone.`,
      )
    ) {
      withdraw.mutate(application._id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Application tracker
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              My applications
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Keep track of every role you&apos;ve applied to and follow your
              progress from application to offer.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Find jobs
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Application history
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Filter your applications by their current status.
            </p>
          </div>

          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              setError(null);
            }}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>

            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <FormError message={error} />
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <Spinner label="Loading applications" />
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <ErrorState
              message={
                queryError instanceof Error
                  ? queryError.message
                  : 'Could not load applications'
              }
              onRetry={refetch}
            />
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <EmptyState
              title={
                statusFilter
                  ? `No ${statusFilter} applications`
                  : 'No applications yet'
              }
              description={
                statusFilter
                  ? 'Try a different status filter.'
                  : 'Once you apply to a job, it will appear here with its current progress.'
              }
              action={
                !statusFilter && (
                  <Link to="/jobs" className="btn-primary">
                    Browse jobs
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Applications */}
            <div className="mt-6 space-y-4">
              {data?.data.map((application) => {
                const company = application.job?.company;
                const title = application.job?.title;

                return (
                  <article
                    key={application._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="p-5 sm:p-6">
                      {/* Main info */}
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <CompanyAvatar name={company} />

                          <div className="min-w-0">
                            {application.job ? (
                              <Link
                                to={`/jobs/${application.job._id}`}
                                className="block truncate text-lg font-bold text-slate-950 transition hover:text-brand-700"
                              >
                                {title}
                              </Link>
                            ) : (
                              <p className="text-lg font-bold text-slate-500">
                                This job has been removed
                              </p>
                            )}

                            {application.job && (
                              <p className="mt-1 text-sm font-medium text-slate-600">
                                {company}
                              </p>
                            )}

                            {application.job && (
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-3.5 w-3.5"
                                  >
                                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                                    <circle cx="12" cy="10" r="2.5" />
                                  </svg>
                                  {application.job.location}
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-3.5 w-3.5"
                                  >
                                    <path d="M12 2v20M2 12h20" />
                                  </svg>
                                  {formatSalary(
                                    application.job.salaryMin,
                                    application.job.salaryMax,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 self-start">
                          <StatusBadge status={application.status} />
                        </div>
                      </div>

                      {/* Applied date */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-500">
                          Applied on{' '}
                          <span className="font-medium text-slate-700">
                            {formatDate(application.createdAt)}
                          </span>
                        </p>

                        {application.job && (
                          <Link
                            to={`/jobs/${application.job._id}`}
                            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                          >
                            View job →
                          </Link>
                        )}
                      </div>

                      {/* Status history */}
                      {application.history.length > 1 && (
                        <div className="mt-5 rounded-xl bg-slate-50 p-4">
                          <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Application progress
                            </p>
                          </div>

                          <ol>
                            {application.history.map((entry, index) => (
                              <HistoryItem
                                key={`${entry.status}-${index}`}
                                status={entry.status}
                                at={entry.at}
                                note={entry.note}
                                isLast={
                                  index === application.history.length - 1
                                }
                              />
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Actions */}
                      {application.status !== 'offered' && (
                        <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => handleWithdraw(application)}
                            disabled={withdraw.isPending}
                          >
                            {withdraw.isPending
                              ? 'Withdrawing...'
                              : 'Withdraw application'}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pager
                page={page}
                totalPages={data?.pagination.totalPages ?? 1}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}