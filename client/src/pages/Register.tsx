import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiRequestError } from '../lib/api';
import { FieldError, FormError } from '../components/ui';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate' as 'candidate' | 'recruiter',
    company: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...patch }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'recruiter' && form.company
          ? { company: form.company }
          : {}),
      });

      navigate(
        user.role === 'candidate'
          ? '/dashboard'
          : '/recruiter',
        { replace: true },
      );
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not create your account. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-2">
          {/* Brand panel */}
          <div className="relative hidden overflow-hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
                  HD
                </span>

                <span className="text-lg font-bold tracking-tight text-white">
                  HireDesk
                </span>
              </Link>

              <div className="mt-20 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">
                  Start here
                </p>

                <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white">
                  Build your next professional chapter.
                </h2>

                <p className="mt-5 text-base leading-7 text-slate-400">
                  Create your HireDesk account and connect with opportunities,
                  candidates, and teams around the world.
                </p>
              </div>
            </div>

            <div className="relative space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  For candidates
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Discover roles, apply quickly, and track your applications.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  For recruiters
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Publish jobs and manage your candidate pipeline in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Register panel */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              {/* Mobile logo */}
              <div className="mb-8 lg:hidden">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                    HD
                  </span>

                  <span className="text-lg font-bold tracking-tight text-slate-950">
                    HireDesk
                  </span>
                </Link>
              </div>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Create account
                </span>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                  Join HireDesk
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create an account and start using HireDesk today.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <FormError message={error} />

                {/* Role selection */}
                <fieldset>
                  <legend className="label">
                    I am joining as
                  </legend>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['candidate', 'recruiter'] as const).map(
                      (role) => {
                        const selected = form.role === role;

                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => update({ role })}
                            className={`rounded-2xl border p-4 text-left transition ${
                              selected
                                ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            aria-pressed={selected}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p
                                  className={`text-sm font-bold ${
                                    selected
                                      ? 'text-brand-700'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {role === 'candidate'
                                    ? 'Candidate'
                                    : 'Recruiter'}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {role === 'candidate'
                                    ? 'Find and apply to jobs.'
                                    : 'Post jobs and manage applicants.'}
                                </p>
                              </div>

                              <span
                                className={`mt-0.5 h-4 w-4 rounded-full border ${
                                  selected
                                    ? 'border-brand-600 bg-brand-600 ring-4 ring-brand-100'
                                    : 'border-slate-300'
                                }`}
                              />
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </fieldset>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="label">
                    Full name
                  </label>

                  <input
                    id="name"
                    className="input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) =>
                      update({ name: e.target.value })
                    }
                    required
                    autoComplete="name"
                  />

                  <FieldError message={fieldErrors.name} />
                </div>

                {/* Company */}
                {form.role === 'recruiter' && (
                  <div>
                    <label htmlFor="company" className="label">
                      Company
                    </label>

                    <input
                      id="company"
                      className="input"
                      value={form.company}
                      onChange={(e) =>
                        update({ company: e.target.value })
                      }
                      placeholder="Company name"
                      autoComplete="organization"
                    />

                    <FieldError message={fieldErrors.company} />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="label">
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      update({ email: e.target.value })
                    }
                    required
                    autoComplete="email"
                  />

                  <FieldError message={fieldErrors.email} />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    className="input"
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={(e) =>
                      update({ password: e.target.value })
                    }
                    required
                    autoComplete="new-password"
                  />

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    At least 8 characters, including a letter and a number.
                  </p>

                  <FieldError message={fieldErrors.password} />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Creating account…'
                    : 'Create account'}
                </button>
              </form>

              {/* Login */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-brand-700 transition hover:text-brand-800 hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}