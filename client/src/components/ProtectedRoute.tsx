import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';

function SessionLoading() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-200">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-900">
          Checking your session
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert size={30} strokeWidth={1.8} />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Access restricted
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          You don’t have access to this page
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your current account role does not have permission to view this
          section.
        </p>

        <a
          href="/"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go to homepage
        </a>
      </div>
    </div>
  );
}

/**
 * Gate for authenticated routes.
 *
 * This is a UX guard, not a security boundary — every protected endpoint is
 * independently authorised on the server.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the refresh attempt to settle before deciding whether
  // the user should be redirected.
  if (loading) {
    return <SessionLoading />;
  }

  // Remember the current destination so login can send the user back.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  // The user is authenticated but does not have the required role.
  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
}