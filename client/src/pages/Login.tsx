import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiRequestError } from '../lib/api';
import { FormError } from '../components/ui';

const DEMO_PASSWORD = 'Demo12345!';

const DEMO_ACCOUNTS = {
  candidate: {
    email: 'candidate@hiredesk.demo',
    label: 'Candidate',
    description: 'Explore jobs and manage applications',
  },
  recruiter: {
    email: 'recruiter@hiredesk.demo',
    label: 'Recruiter',
    description: 'Post jobs and review candidates',
  },
} as const;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'candidate' | 'recruiter' | null>(
    null,
  );

  const redirectAfterLogin = (role: 'candidate' | 'recruiter') => {
    const from = (location.state as { from?: string } | null)?.from;

    navigate(
      from ??
        (role === 'candidate'
          ? '/dashboard'
          : '/recruiter'),
      { replace: true },
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);

      redirectAfterLogin(
        user.role === 'candidate'
          ? 'candidate'
          : 'recruiter',
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not log in. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (
    role: 'candidate' | 'recruiter',
  ) => {
    const account = DEMO_ACCOUNTS[role];

    setError(null);
    setDemoLoading(role);

    try {
      const user = await login(
        account.email,
        DEMO_PASSWORD,
      );

      redirectAfterLogin(
        user.role === 'candidate'
          ? 'candidate'
          : 'recruiter',
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not log in to the demo account.',
      );
    } finally {
      setDemoLoading(null);
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
                  Welcome back
                </p>

                <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white">
                  Keep building the career you want.
                </h2>

                <p className="mt-5 text-base leading-7 text-slate-400">
                  Sign in to discover opportunities, manage
                  applications, and stay connected with the hiring
                  process.
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-bold text-white">
                  Jobs
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Find opportunities
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-bold text-white">
                  Apply
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  One simple flow
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-bold text-white">
                  Grow
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Track your progress
                </p>
              </div>
            </div>
          </div>

          {/* Login panel */}
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

              {/* Header */}
              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Account access
                </span>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Log in to continue to your HireDesk account.
                </p>
              </div>

              {/* Error */}
              <div className="mt-6">
                <FormError message={error} />
              </div>

              {/* Demo accounts */}
              <div className="mt-7">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Explore the demo
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choose a role to enter the demo instantly.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">

                  {/* Candidate demo */}
                  <button
                    type="button"
                    disabled={
                      submitting ||
                      demoLoading !== null
                    }
                    onClick={() =>
                      handleDemoLogin('candidate')
                    }
                    className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                        <UserRound size={19} />
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-brand-50 group-hover:text-brand-600">
                        {demoLoading === 'candidate' ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                        ) : (
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        )}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-900">
                      Candidate demo
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {DEMO_ACCOUNTS.candidate.description}
                    </p>

                    <p className="mt-3 truncate text-[11px] font-medium text-slate-400">
                      {DEMO_ACCOUNTS.candidate.email}
                    </p>
                  </button>

                  {/* Recruiter demo */}
                  <button
                    type="button"
                    disabled={
                      submitting ||
                      demoLoading !== null
                    }
                    onClick={() =>
                      handleDemoLogin('recruiter')
                    }
                    className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                        <BriefcaseBusiness size={19} />
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-brand-50 group-hover:text-brand-600">
                        {demoLoading === 'recruiter' ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                        ) : (
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        )}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-900">
                      Recruiter demo
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {DEMO_ACCOUNTS.recruiter.description}
                    </p>

                    <p className="mt-3 truncate text-[11px] font-medium text-slate-400">
                      {DEMO_ACCOUNTS.recruiter.email}
                    </p>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  or sign in manually
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Login form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="label"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="label"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    className="input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={
                    submitting ||
                    demoLoading !== null
                  }
                >
                  {submitting
                    ? 'Logging in…'
                    : 'Log in'}
                </button>
              </form>

              {/* Register */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-brand-700 transition hover:text-brand-800 hover:underline"
                  >
                    Create an account
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