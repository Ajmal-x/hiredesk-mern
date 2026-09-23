import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, Spinner } from '../components/ui';
import type { Job } from '../types';

export function SavedJobs() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get<{ data: Job[] }>('/jobs/saved'),
  });

  const savedCount = data?.data.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Your shortlist
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Saved jobs
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Keep interesting opportunities here and come back when you&apos;re
              ready to apply.
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
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Find more jobs
          </Link>
        </div>

        {/* Saved count */}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Your saved opportunities
                </p>
                <p className="text-xs text-slate-500">
                  {savedCount} {savedCount === 1 ? 'job' : 'jobs'} saved
                </p>
              </div>
            </div>

            <Link
              to="/applications"
              className="hidden text-xs font-semibold text-brand-700 transition hover:text-brand-800 sm:block"
            >
              View applications →
            </Link>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <Spinner label="Loading saved jobs" />
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : 'Could not load saved jobs'
              }
              onRetry={refetch}
            />
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <EmptyState
              title="Nothing saved yet"
              description="When you find a job you like, save it from the job details page and it will appear here."
              action={
                <Link to="/jobs" className="btn-primary">
                  Browse jobs
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid gap-5 md:grid-cols-2">
              {data?.data.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 text-white shadow-sm sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold">
                  Ready to find your next opportunity?
                </p>
                <p className="mt-1 max-w-lg text-sm leading-6 text-slate-400">
                  Explore new roles and save the ones that match your goals.
                </p>
              </div>

              <Link
                to="/jobs"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Browse jobs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}