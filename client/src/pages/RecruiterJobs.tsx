import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import { formatDate, formatSalary } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  FormError,
  Spinner,
} from '../components/ui';
import type { Job } from '../types';

function JobStatus({
  status,
}: {
  status: Job['status'];
}) {
  const isOpen = status === 'open';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isOpen
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOpen ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
}

function JobIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 11h18M10 11v2h4v-2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0 0-6M17 15.5a5 5 0 0 1 3.5 4.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function RecruiterJobs() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get<{ data: Job[] }>('/jobs/mine'),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['my-jobs'],
    });

    queryClient.invalidateQueries({
      queryKey: ['recruiter-stats'],
    });
  };

  const toggleStatus = useMutation({
    mutationFn: (job: Job) =>
      api.patch(`/jobs/${job._id}`, {
        status: job.status === 'open' ? 'closed' : 'open',
      }),

    onSuccess: invalidate,

    onError: (err) =>
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not update the job',
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),

    onSuccess: invalidate,

    onError: (err) =>
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not delete the job',
      ),
  });

  const handleDelete = (job: Job) => {
    setError(null);

    const warning =
      job.applicantCount > 0
        ? `Delete “${job.title}”? Its ${job.applicantCount} application(s) will be permanently removed too.`
        : `Delete “${job.title}”?`;

    if (window.confirm(warning)) {
      remove.mutate(job._id);
    }
  };

  const jobs = data?.data ?? [];
  const openJobs = jobs.filter((job) => job.status === 'open').length;
  const closedJobs = jobs.filter((job) => job.status === 'closed').length;
  const totalApplicants = jobs.reduce(
    (sum, job) => sum + job.applicantCount,
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
              My job postings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage your roles, review applicants, and keep your hiring
              pipeline moving.
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

        {/* Error */}
        <div className="mt-5">
          <FormError message={error} />
        </div>

        {/* Overview */}
        {!isLoading && !isError && jobs.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <JobIcon />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total postings
                  </p>

                  <p className="text-xl font-bold text-slate-950">
                    {jobs.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Open positions
                  </p>

                  <p className="text-xl font-bold text-slate-950">
                    {openJobs}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <UsersIcon />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total applicants
                  </p>

                  <p className="text-xl font-bold text-slate-950">
                    {totalApplicants}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <Spinner label="Loading your jobs" />
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <ErrorState
              message={
                queryError instanceof Error
                  ? queryError.message
                  : 'Could not load your jobs'
              }
              onRetry={refetch}
            />
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <EmptyState
              title="No jobs posted yet"
              description="Create your first posting and start receiving applications from candidates."
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
            {/* Jobs */}
            <div className="mt-8 space-y-4">
              {jobs.map((job) => (
                <article
                  key={job._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">
                    {/* Job heading */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                          <JobIcon />
                        </div>

                        <div className="min-w-0">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="block truncate text-lg font-bold text-slate-950 transition hover:text-brand-700"
                          >
                            {job.title}
                          </Link>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <LocationIcon />
                              {job.location}
                            </span>

                            <span>
                              {formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                              )}
                            </span>

                            <span>
                              {job.openings}{' '}
                              {job.openings === 1
                                ? 'opening'
                                : 'openings'}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            Posted {formatDate(job.createdAt)}
                          </p>
                        </div>
                      </div>

                      <JobStatus status={job.status} />
                    </div>

                    {/* Applicant summary */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">
                          Applicants
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-950">
                          {job.applicantCount}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">
                          Work mode
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                          {job.workMode.replace('-', ' ')}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">
                          Job type
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                          {job.type.replace('-', ' ')}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        <UsersIcon />
                        Applicants ({job.applicantCount})
                      </Link>

                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => toggleStatus.mutate(job)}
                        disabled={toggleStatus.isPending}
                      >
                        {toggleStatus.isPending
                          ? 'Updating...'
                          : job.status === 'open'
                            ? 'Close posting'
                            : 'Reopen posting'}
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
                        onClick={() => handleDelete(job)}
                        disabled={remove.isPending}
                      >
                        {remove.isPending
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-slate-950 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {openJobs} open · {closedJobs} closed
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your current hiring opportunities from this page.
                </p>
              </div>

              <Link
                to="/recruiter/jobs/new"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create another job
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}