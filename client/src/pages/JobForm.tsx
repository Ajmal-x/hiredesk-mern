import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  DollarSign,
  MapPin,
  Save,
  Sparkles,
  Users,
} from 'lucide-react';

import { api, ApiRequestError } from '../lib/api';
import { FieldError, FormError, Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job, JobType, WorkMode } from '../types';

const JOB_TYPES: JobType[] = [
  'full-time',
  'part-time',
  'internship',
  'contract',
];

const WORK_MODES: WorkMode[] = [
  'on-site',
  'remote',
  'hybrid',
];

const EMPTY = {
  title: '',
  company: '',
  description: '',
  location: '',
  workMode: 'on-site' as WorkMode,
  type: 'full-time' as JobType,
  skills: '',
  salaryMin: '',
  salaryMax: '',
  experienceMin: '0',
  openings: '1',
};

const LOCATION_GROUPS = [
  {
    label: 'United States',
    options: [
      'New York, NY',
      'San Francisco, CA',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
      'Los Angeles, CA',
      'Chicago, IL',
    ],
  },
  {
    label: 'Russia',
    options: [
      'Moscow',
      'Saint Petersburg',
      'Kazan',
      'Novosibirsk',
    ],
  },
  {
    label: 'Remote',
    options: ['Remote'],
  },
];

function formatOptionLabel(value: string) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Handles both creating a new posting and editing an existing one. */
export function JobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data?.data) {
      const job = data.data;

      setForm({
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        workMode: job.workMode,
        type: job.type,
        skills: job.skills.join(', '),
        salaryMin: String(job.salaryMin || ''),
        salaryMax: String(job.salaryMax || ''),
        experienceMin: String(job.experienceMin),
        openings: String(job.openings),
      });
    } else if (!isEdit && user?.company) {
      setForm((current) => ({
        ...current,
        company: user.company ?? '',
      }));
    }
  }, [data, isEdit, user?.company]);

  const update = (patch: Partial<typeof form>) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      isEdit
        ? api.patch(`/jobs/${id}`, payload)
        : api.post('/jobs', payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });

      if (isEdit) {
        queryClient.invalidateQueries({
          queryKey: ['job', id],
        });
      }

      navigate('/recruiter/jobs');
    },

    onError: (err) => {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not save the job.');
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});

    save.mutate({
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      location: form.location,
      workMode: form.workMode,
      type: form.type,

      skills: form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),

      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      experienceMin: Number(form.experienceMin) || 0,
      openings: Number(form.openings) || 1,
    });
  };

  if (isEdit && isLoading) {
    return <Spinner label="Loading job" />;
  }

  if (isEdit && isError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
            <BriefcaseBusiness size={26} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Unable to load this job
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The job may no longer exist or you may not have permission to edit it.
          </p>

          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => navigate('/recruiter/jobs')}
          >
            Back to my jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to my jobs
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                <Sparkles size={14} />
                {isEdit ? 'Manage opportunity' : 'Recruiter workspace'}
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {isEdit ? 'Edit job posting' : 'Post a new job'}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {isEdit
                  ? 'Keep your opportunity accurate and up to date for candidates.'
                  : 'Create a clear, professional job listing and reach qualified candidates.'}
              </p>
            </div>

            {isEdit && (
              <div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex">
                <CheckCircle2 size={15} />
                Editing existing job
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-0">
              <FormError message={error} />

              {/* Basic information */}
              <section className="p-6 sm:p-8">
                <div className="mb-6 flex gap-4">
                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 sm:grid">
                    <BriefcaseBusiness size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Basic information
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Give candidates a clear first impression of the opportunity.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="title" className="label">
                      Job title <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="title"
                      className="input"
                      placeholder="Senior Full Stack Developer"
                      value={form.title}
                      onChange={(e) => update({ title: e.target.value })}
                      required
                      maxLength={120}
                    />

                    <FieldError message={fieldErrors.title} />
                  </div>

                  <div>
                    <label htmlFor="company" className="label">
                      Company <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Building2
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="company"
                        className="input pl-10"
                        placeholder="Acme Technologies"
                        value={form.company}
                        onChange={(e) => update({ company: e.target.value })}
                        required
                        maxLength={100}
                      />
                    </div>

                    <FieldError message={fieldErrors.company} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor="description" className="label">
                        Job description <span className="text-red-500">*</span>
                      </label>

                      <span
                        className={`text-xs ${
                          form.description.length > 7600
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {form.description.length}/8000
                      </span>
                    </div>

                    <textarea
                      id="description"
                      className="input min-h-[220px] resize-y"
                      placeholder="Describe the role, responsibilities, requirements, and what the candidate will work on..."
                      value={form.description}
                      onChange={(e) =>
                        update({ description: e.target.value })
                      }
                      required
                      minLength={30}
                      maxLength={8000}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Minimum 30 characters. Include responsibilities,
                      requirements, and useful context about the role.
                    </p>

                    <FieldError message={fieldErrors.description} />
                  </div>
                </div>
              </section>

              {/* Location & employment */}
              <section className="border-t border-slate-100 p-6 sm:p-8">
                <div className="mb-6 flex gap-4">
                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 sm:grid">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Location & employment
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Help candidates understand where and how they will work.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label htmlFor="location" className="label">
                      Location <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="location"
                      className="input"
                      value={form.location}
                      onChange={(e) =>
                        update({ location: e.target.value })
                      }
                      required
                    >
                      <option value="">Select location</option>

                      {LOCATION_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    <FieldError message={fieldErrors.location} />
                  </div>

                  <div>
                    <label htmlFor="workMode" className="label">
                      Work mode
                    </label>

                    <select
                      id="workMode"
                      className="input"
                      value={form.workMode}
                      onChange={(e) =>
                        update({
                          workMode: e.target.value as WorkMode,
                        })
                      }
                    >
                      {WORK_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {formatOptionLabel(mode)}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-400">
                      Choose how the candidate will work.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="type" className="label">
                      Job type
                    </label>

                    <select
                      id="type"
                      className="input"
                      value={form.type}
                      onChange={(e) =>
                        update({
                          type: e.target.value as JobType,
                        })
                      }
                    >
                      {JOB_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatOptionLabel(type)}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-400">
                      Select the employment arrangement.
                    </p>
                  </div>
                </div>
              </section>

              {/* Compensation */}
              <section className="border-t border-slate-100 p-6 sm:p-8">
                <div className="mb-6 flex gap-4">
                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 sm:grid">
                    <DollarSign size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Compensation
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Enter the annual salary range in US dollars.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="salaryMin" className="label">
                      Minimum salary
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        $
                      </span>

                      <input
                        id="salaryMin"
                        type="number"
                        min={0}
                        step={1000}
                        className="input pl-8"
                        placeholder="80000"
                        value={form.salaryMin}
                        onChange={(e) =>
                          update({
                            salaryMin: e.target.value,
                          })
                        }
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      USD per year
                    </p>

                    <FieldError message={fieldErrors.salaryMin} />
                  </div>

                  <div>
                    <label htmlFor="salaryMax" className="label">
                      Maximum salary
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        $
                      </span>

                      <input
                        id="salaryMax"
                        type="number"
                        min={0}
                        step={1000}
                        className="input pl-8"
                        placeholder="120000"
                        value={form.salaryMax}
                        onChange={(e) =>
                          update({
                            salaryMax: e.target.value,
                          })
                        }
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      USD per year
                    </p>

                    <FieldError message={fieldErrors.salaryMax} />
                  </div>
                </div>
              </section>

              {/* Requirements */}
              <section className="border-t border-slate-100 p-6 sm:p-8">
                <div className="mb-6 flex gap-4">
                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600 sm:grid">
                    <Users size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Requirements
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Define the experience and skills required for the role.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="experienceMin" className="label">
                      Minimum experience
                    </label>

                    <div className="relative">
                      <input
                        id="experienceMin"
                        type="number"
                        min={0}
                        max={40}
                        className="input pr-16"
                        value={form.experienceMin}
                        onChange={(e) =>
                          update({
                            experienceMin: e.target.value,
                          })
                        }
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        years
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Use 0 for entry-level roles.
                    </p>

                    <FieldError message={fieldErrors.experienceMin} />
                  </div>

                  <div>
                    <label htmlFor="openings" className="label">
                      Number of openings
                    </label>

                    <input
                      id="openings"
                      type="number"
                      min={1}
                      className="input"
                      value={form.openings}
                      onChange={(e) =>
                        update({
                          openings: e.target.value,
                        })
                      }
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      How many candidates are you hiring for this role?
                    </p>

                    <FieldError message={fieldErrors.openings} />
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="skills" className="label">
                    Required skills
                  </label>

                  <input
                    id="skills"
                    className="input"
                    placeholder="React, TypeScript, Node.js, MongoDB"
                    value={form.skills}
                    onChange={(e) =>
                      update({
                        skills: e.target.value,
                      })
                    }
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Separate each skill with a comma.
                  </p>

                  <FieldError message={fieldErrors.skills} />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs leading-5 text-slate-400">
                  {isEdit
                    ? 'Your changes will be applied to the existing job posting.'
                    : 'Review the information before publishing your job.'}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/recruiter/jobs')}
                    disabled={save.isPending}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center justify-center gap-2"
                    disabled={save.isPending}
                  >
                    {save.isPending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        {isEdit ? 'Save changes' : 'Post job'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}