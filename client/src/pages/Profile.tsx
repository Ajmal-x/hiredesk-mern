import { useRef, useState, type FormEvent } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MapPin,
  Paperclip,
  Trash2,
  Upload,
} from 'lucide-react';

import { api, ApiRequestError } from '../lib/api';
import { FieldError, FormError } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

const API_ORIGIN = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
).replace(/\/api\/?$/, '');

export function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    headline: user?.headline ?? '',
    location: user?.location ?? '',
    company: user?.company ?? '',
    experienceYears: user?.experienceYears ?? 0,
    skills: (user?.skills ?? []).join(', '),
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDeleting, setResumeDeleting] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const update = (patch: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...patch }));
    setStatus('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});
    setStatus('saving');

    try {
      const res = await api.patch<{ data: User }>('/auth/me', {
        name: form.name,
        headline: form.headline,
        location: form.location,
        experienceYears: Number(form.experienceYears),
        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        ...(user?.role === 'recruiter'
          ? { company: form.company }
          : {}),
      });

      updateUser(res.data);
      setStatus('saved');
    } catch (err) {
      setStatus('idle');

      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not save your profile.');
      }
    }
  };

  const handleResumeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setResumeError(null);
    setResumeUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.patch<{ data: User }>(
        '/auth/me/resume',
        formData,
      );

      updateUser(res.data);

      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setResumeError(err.message);
      } else {
        setResumeError('Could not upload your resume.');
      }
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    setResumeError(null);
    setResumeDeleting(true);

    try {
      const res = await api.delete<{ data: User }>('/auth/me/resume');

      updateUser(res.data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setResumeError(err.message);
      } else {
        setResumeError('Could not remove your resume.');
      }
    } finally {
      setResumeDeleting(false);
    }
  };

  if (!user) return null;

  const initials =
    user.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?';

  const roleLabel =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const skillList = form.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const resumeUrl = user.resumeUrl
    ? user.resumeUrl.startsWith('http')
      ? user.resumeUrl
      : `${API_ORIGIN}${user.resumeUrl}`
    : null;

  const resumeFilename = user.resumeUrl
    ? user.resumeUrl.split('/').pop() || 'Resume'
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Account settings
          </span>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Your profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Keep your professional information up to date so your HireDesk
            profile represents you accurately.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Profile summary */}
          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-slate-950 px-6 pb-7 pt-8">
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />

              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950 shadow-lg">
                  {initials}
                </div>

                <h2 className="mt-5 truncate text-lg font-bold text-white">
                  {user.name || 'Your name'}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {user.email}
                </p>

                <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-slate-200">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Profile status
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active account
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                  {roleLabel}
                </p>
              </div>

              {form.location && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {form.location}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Resume
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                  {user.resumeUrl ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-700">
                        Uploaded
                      </span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500">
                        Not uploaded
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <h2 className="text-lg font-bold text-slate-950">
                Professional information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the information visible across your HireDesk profile.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-7 px-6 py-6 sm:px-8">
                <FormError message={error} />

                {/* Basic information */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Basic information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Tell others who you are and what you do.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="label">
                        Full name
                      </label>

                      <input
                        id="name"
                        className="input"
                        value={form.name}
                        onChange={(e) =>
                          update({ name: e.target.value })
                        }
                        required
                      />

                      <FieldError message={fieldErrors.name} />
                    </div>

                    <div>
                      <label htmlFor="headline" className="label">
                        Professional headline
                      </label>

                      <input
                        id="headline"
                        className="input"
                        placeholder="Full-stack developer · React · Node.js"
                        value={form.headline}
                        onChange={(e) =>
                          update({ headline: e.target.value })
                        }
                        maxLength={140}
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        A short description that represents your professional
                        focus.
                      </p>

                      <FieldError message={fieldErrors.headline} />
                    </div>
                  </div>
                </section>

                {/* Location & experience */}
                <section className="border-t border-slate-100 pt-7">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Location & experience
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Help recruiters understand your background and location.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="location" className="label">
                        Location
                      </label>

                      <input
                        id="location"
                        className="input"
                        placeholder="Moscow, Russia"
                        value={form.location}
                        onChange={(e) =>
                          update({ location: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="experienceYears"
                        className="label"
                      >
                        Years of experience
                      </label>

                      <input
                        id="experienceYears"
                        type="number"
                        min={0}
                        max={60}
                        className="input"
                        value={form.experienceYears}
                        onChange={(e) =>
                          update({
                            experienceYears: Number(e.target.value),
                          })
                        }
                      />

                      <FieldError
                        message={fieldErrors.experienceYears}
                      />
                    </div>
                  </div>
                </section>

                {/* Recruiter company */}
                {user.role === 'recruiter' && (
                  <section className="border-t border-slate-100 pt-7">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        Company information
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Add the company you represent as a recruiter.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="company" className="label">
                        Company
                      </label>

                      <input
                        id="company"
                        className="input"
                        placeholder="Your company name"
                        value={form.company}
                        onChange={(e) =>
                          update({ company: e.target.value })
                        }
                      />
                    </div>
                  </section>
                )}

                {/* Skills */}
                <section className="border-t border-slate-100 pt-7">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Skills
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Add the technologies and skills you work with.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="skills" className="label">
                      Your skills
                    </label>

                    <input
                      id="skills"
                      className="input"
                      placeholder="React, TypeScript, Node.js, MongoDB"
                      value={form.skills}
                      onChange={(e) =>
                        update({ skills: e.target.value })
                      }
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Separate each skill with a comma.
                    </p>

                    <FieldError message={fieldErrors.skills} />

                    {skillList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skillList.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Resume */}
                {user.role === 'candidate' && (
                  <section className="border-t border-slate-100 pt-7">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Resume
                        </h3>

                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                          Candidate
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Upload your latest resume so recruiters can review
                        your experience when you apply for jobs.
                      </p>
                    </div>

                    {resumeError && (
                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {resumeError}
                      </div>
                    )}

                    {user.resumeUrl ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {resumeFilename}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Your current resume
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {resumeUrl && (
                              <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <FileText className="h-4 w-4" />
                                View
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                resumeInputRef.current?.click()
                              }
                              disabled={resumeUploading}
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Upload className="h-4 w-4" />
                              {resumeUploading
                                ? 'Uploading…'
                                : 'Replace'}
                            </button>

                            <button
                              type="button"
                              onClick={handleResumeDelete}
                              disabled={resumeDeleting}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              {resumeDeleting ? 'Removing…' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="group w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-brand-300 hover:bg-brand-50/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition group-hover:text-brand-600">
                          <Paperclip className="h-5 w-5" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-900">
                          {resumeUploading
                            ? 'Uploading your resume…'
                            : 'Upload your resume'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          PDF, DOC, or DOCX
                        </p>

                        <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                          <Upload className="h-4 w-4" />
                          Choose file
                        </span>
                      </button>
                    )}

                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                      Your resume can be used when applying for jobs.
                    </p>
                  </section>
                )}
              </div>

              {/* Form footer */}
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="text-xs text-slate-500">
                  {status === 'saved'
                    ? 'Your profile has been updated successfully.'
                    : 'Changes are saved to your HireDesk account.'}
                </div>

                <div className="flex items-center gap-3">
                  {status === 'saved' && (
                    <span className="text-sm font-semibold text-emerald-600">
                      Saved ✓
                    </span>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={status === 'saving'}
                  >
                    {status === 'saving'
                      ? 'Saving…'
                      : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}