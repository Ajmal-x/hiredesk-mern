import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Mail,
  MapPin,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';

import { api, ApiRequestError, getAccessToken, toQuery } from '../lib/api';
import { formatDate, formatExperience } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  FormError,
  Pager,
  Spinner,
  StatusBadge,
  Tag,
} from '../components/ui';
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type Job,
  type Paginated,
} from '../types';

/**
 * Mirrors STATUS_TRANSITIONS on the server.
 * The API remains the final authority.
 */
const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: [],
  rejected: [],
};

export function JobApplicants() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const query = toQuery({
    status: statusFilter,
    page,
    limit: 10,
  });

  const jobQuery = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: Boolean(id),
  });

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['job-applicants', id, query],
    queryFn: () =>
      api.get<Paginated<Application>>(
        `/jobs/${id}/applications${query}`,
      ),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

  const updateStatus = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: ApplicationStatus;
    }) =>
      api.patch(`/applications/${applicationId}/status`, {
        status,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['job-applicants', id],
      });

      queryClient.invalidateQueries({
        queryKey: ['recruiter-stats'],
      });

      queryClient.invalidateQueries({
        queryKey: ['job', id],
      });
    },

    onError: (err) =>
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not update the application status',
      ),
  });

  const job = jobQuery.data?.data;

  const totalApplicants = data?.pagination.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my jobs
        </Link>

        {/* Hero */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Users className="h-3.5 w-3.5" />
                      Recruiter workspace
                    </span>

                    {job?.status && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          job.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status === 'open'
                          ? 'Position open'
                          : 'Position closed'}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {job?.title ?? 'Applicants'}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    {job?.company && (
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {job.company}
                      </span>
                    )}

                    {job?.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-medium text-slate-500">
                      Applications
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {data ? totalApplicants : '—'}
                    </p>
                  </div>

                  <Link
                    to={`/jobs/${id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    View job
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="mt-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Candidate pipeline
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Review applicants and move them through the hiring process.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="status-filter"
                className="hidden text-sm font-medium text-slate-600 sm:block"
              >
                Status
              </label>

              <select
                id="status-filter"
                className="input min-w-44"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                  setError(null);
                }}
              >
                <option value="">All statuses</option>

                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <FormError message={error} />
          </div>
        </section>

        {/* Content */}
        <section className="mt-5">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-16">
              <Spinner label="Loading applicants" />
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <ErrorState
                message={
                  queryError instanceof Error
                    ? queryError.message
                    : 'Could not load applicants'
                }
                onRetry={refetch}
              />
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <EmptyState
                title={
                  statusFilter
                    ? `No ${statusFilter} applicants`
                    : 'No applications yet'
                }
                description={
                  statusFilter
                    ? 'Try another status filter to see more candidates.'
                    : 'Once candidates apply to this role, their applications will appear here.'
                }
              />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data?.data.map((application) => (
                  <ApplicantCard
                    key={application._id}
                    application={application}
                    onStatusChange={(status) => {
                      setError(null);

                      updateStatus.mutate({
                        applicationId: application._id,
                        status,
                      });
                    }}
                    pending={updateStatus.isPending}
                  />
                ))}
              </div>

              <div className="mt-6">
                <Pager
                  page={page}
                  totalPages={data?.pagination.totalPages ?? 1}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ApplicantCard({
  application,
  onStatusChange,
  pending,
}: {
  application: Application;
  onStatusChange: (status: ApplicationStatus) => void;
  pending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const candidate = application.applicant;
  const nextStatuses = NEXT_STATUSES[application.status];

  const candidateName = candidate?.name ?? 'Candidate removed';

  const initials = candidate?.name
    ? candidate.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : '?';

  /**
   * Resume endpoint requires Authorization header.
   */
  const downloadResume = async () => {
    try {
      const res = await fetch(
        `/api/applications/${application._id}/resume`,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
          credentials: 'include',
        },
      );

      if (!res.ok) {
        window.alert('Could not download this resume.');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidateName}-resume`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      window.alert('Could not download this resume.');
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="p-5 sm:p-6">
        {/* Candidate header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-bold text-slate-950">
                  {candidateName}
                </h2>

                <StatusBadge status={application.status} />
              </div>

              {candidate?.headline && (
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {candidate.headline}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                {candidate?.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {candidate.email}
                  </span>
                )}

                {candidate?.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {candidate.location}
                  </span>
                )}

                {candidate && (
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {formatExperience(candidate.experienceYears)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Candidate skills */}
        {candidate?.skills && candidate.skills.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Skills
            </p>

            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Application meta */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Applied
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {formatDate(application.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <UserRound className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Current stage
              </p>
              <p className="mt-0.5 text-sm font-semibold capitalize text-slate-700">
                {application.status}
              </p>
            </div>
          </div>
        </div>

        {/* Cover letter */}
        {application.coverLetter && (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-brand-700"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              <FileText className="h-4 w-4" />

              {expanded ? 'Hide cover letter' : 'Read cover letter'}

              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expanded && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                  {application.coverLetter}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            className="btn-secondary inline-flex items-center justify-center gap-2"
            onClick={downloadResume}
          >
            <Download className="h-4 w-4" />
            Download resume
          </button>

          {nextStatuses.length === 0 ? (
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
              {application.status === 'offered' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}

              This application is final and cannot be changed.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => {
                const isReject = status === 'rejected';

                return (
                  <button
                    key={status}
                    type="button"
                    className={
                      isReject ? 'btn-danger' : 'btn-primary'
                    }
                    onClick={() => onStatusChange(status)}
                    disabled={pending}
                  >
                    {isReject
                      ? 'Reject'
                      : `Move to ${status}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}