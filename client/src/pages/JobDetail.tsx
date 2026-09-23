import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit3,
  FileText,
  MapPin,
  Send,
  Users,
  X,
} from 'lucide-react';

import { api, ApiRequestError } from '../lib/api';
import { formatDate, formatSalary, titleCase } from '../lib/format';
import { ErrorState, FormError, Spinner, Tag } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types';

function CompanyAvatar({ company }: { company: string }) {
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xl font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl">
      {company.charAt(0).toUpperCase()}
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-400">
          {label}
        </dt>

        <dd className="mt-1 text-sm font-semibold text-slate-900">
          {value}
        </dd>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showApply, setShowApply] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: Boolean(id),
  });

  const job = data?.data;

  const toggleSave = useMutation({
    mutationFn: () =>
      job?.isSaved
        ? api.delete(`/jobs/${id}/save`)
        : api.post(`/jobs/${id}/save`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['job', id],
      });

      queryClient.invalidateQueries({
        queryKey: ['saved-jobs'],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <Spinner label="Loading job" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Job not found'
            }
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  const canApply =
    user?.role === 'candidate' &&
    job.status === 'open' &&
    !job.hasApplied;

  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Back */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
        >
          <ArrowLeft size={16} />
          Back to jobs
        </Link>

        {/* Hero */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-slate-50 via-white to-brand-50/40 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <CompanyAvatar company={job.company} />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {job.status === 'open' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Open for applications
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Closed
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                    {job.title}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold text-slate-700">
                      {job.company}
                    </span>

                    <span className="text-slate-300">•</span>

                    <span className="text-slate-500">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isRecruiter && (
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}
                  >
                    <Edit3 size={16} />
                    Edit job
                  </button>
                )}

                {user?.role === 'candidate' && (
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={() => toggleSave.mutate()}
                    disabled={toggleSave.isPending}
                  >
                    {job.isSaved ? (
                      <>
                        <Check size={16} />
                        Saved
                      </>
                    ) : (
                      'Save job'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Main facts */}
            <dl className="mt-8 grid gap-5 border-t border-slate-200/80 pt-7 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                label="Location"
                value={job.location}
                icon={<MapPin size={18} />}
              />

              <DetailItem
                label="Work mode"
                value={titleCase(job.workMode)}
                icon={<Building2 size={18} />}
              />

              <DetailItem
                label="Job type"
                value={titleCase(job.type)}
                icon={<BriefcaseBusiness size={18} />}
              />

              <DetailItem
                label="Salary"
                value={formatSalary(job.salaryMin, job.salaryMax)}
                icon={<DollarSign size={18} />}
              />
            </dl>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main column */}
          <main className="space-y-6">
            {/* About */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    About the role
                  </h2>

                  <p className="text-sm text-slate-500">
                    Role description and responsibilities
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {job.description}
                </p>
              </div>
            </section>

            {/* Skills */}
            {job.skills.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Skills & technologies
                    </h2>

                    <p className="text-sm text-slate-500">
                      Skills mentioned for this role
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </div>
              </section>
            )}

            {/* Quick stats */}
            <section className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Experience"
                value={
                  job.experienceMin === 0
                    ? 'Entry level'
                    : `${job.experienceMin}+ years`
                }
                icon={<Clock3 size={17} />}
              />

              <StatCard
                label="Openings"
                value={String(job.openings)}
                icon={<Users size={17} />}
              />

              <StatCard
                label="Applicants"
                value={String(job.applicantCount)}
                icon={<Send size={17} />}
              />
            </section>
          </main>

          {/* Sidebar */}
          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            {/* Overview */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Job overview
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Experience
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {job.experienceMin === 0
                      ? 'Fresher friendly'
                      : `${job.experienceMin}+ years`}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Openings
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {job.openings}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Applicants
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {job.applicantCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Posted
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Apply / Recruiter card */}
            <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
              {job.hasApplied ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <CheckCircle2 size={18} />
                    </span>

                    <span className="text-sm font-semibold">
                      Application submitted
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Your application has already been submitted for this role.
                  </p>

                  <Link
                    to="/applications"
                    className="mt-5 inline-flex text-sm font-semibold text-white transition hover:text-slate-300"
                  >
                    Track application
                    <span className="ml-1">→</span>
                  </Link>
                </>
              ) : canApply ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Interested?
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Apply for this role
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Submit your resume and let the recruiter know why you are
                    a good fit.
                  </p>

                  <button
                    type="button"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    onClick={() => setShowApply(true)}
                  >
                    <Send size={16} />
                    Apply now
                  </button>
                </>
              ) : !user ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ready to apply?
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Join HireDesk
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Log in with a candidate account to apply for this
                    opportunity.
                  </p>

                  <button
                    type="button"
                    className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    onClick={() =>
                      navigate('/login', {
                        state: {
                          from: `/jobs/${id}`,
                        },
                      })
                    }
                  >
                    Log in to apply
                  </button>
                </>
              ) : job.status === 'closed' ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Applications closed
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    This role is no longer accepting applications
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Explore other opportunities that may be a better match.
                  </p>

                  <Link
                    to="/jobs"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Explore jobs
                  </Link>
                </>
              ) : isRecruiter ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Recruiter workspace
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Manage this job
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Update the posting or review candidates who applied to this
                    opportunity.
                  </p>

                  <div className="mt-6 grid gap-2">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      onClick={() =>
                        navigate(`/recruiter/jobs/${job._id}/edit`)
                      }
                    >
                      <Edit3 size={16} />
                      Edit job
                    </button>

                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                      onClick={() =>
                        navigate(
                          `/recruiter/jobs/${job._id}/applicants`,
                        )
                      }
                    >
                      <Users size={16} />
                      View applicants
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-6 text-slate-400">
                  Recruiter accounts cannot apply to jobs.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>

      {showApply && (
        <ApplyDialog
          jobId={job._id}
          onClose={() => setShowApply(false)}
        />
      )}
    </div>
  );
}

function ApplyDialog({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useMutation({
    mutationFn: (formData: FormData) =>
      api.postForm(`/jobs/${jobId}/apply`, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['job', jobId],
      });

      queryClient.invalidateQueries({
        queryKey: ['my-applications'],
      });

      queryClient.invalidateQueries({
        queryKey: ['candidate-stats'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      onClose();
    },

    onError: (err) => {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not submit your application',
      );
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resume) {
      setError(
        'Please attach your resume (PDF or Word, max 5 MB).',
      );
      return;
    }

    const formData = new FormData();

    formData.append('resume', resume);

    if (coverLetter.trim()) {
      formData.append('coverLetter', coverLetter.trim());
    }

    apply.mutate(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Application
              </p>

              <h2
                id="apply-title"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Apply to this role
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Submit your resume and optional cover letter.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close application dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <FormError message={error} />

            <div>
              <label htmlFor="resume" className="label">
                Resume <span className="text-red-500">*</span>
              </label>

              <div className="mt-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-brand-300 hover:bg-brand-50/30">
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Upload your resume
                    </p>

                    <p className="text-xs text-slate-400">
                      PDF or Word document, up to 5 MB
                    </p>
                  </div>
                </div>

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="input file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                  onChange={(e) =>
                    setResume(e.target.files?.[0] ?? null)
                  }
                  required
                />

                {resume && (
                  <p className="mt-2 truncate text-xs font-medium text-emerald-600">
                    Selected: {resume.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="coverLetter" className="label">
                Cover letter{' '}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="coverLetter"
                className="input mt-1 min-h-[140px] resize-y"
                maxLength={3000}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Briefly explain why you are a good fit for this role..."
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {coverLetter.length}/3000
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={apply.isPending}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary inline-flex items-center justify-center gap-2"
              disabled={apply.isPending}
            >
              {apply.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}