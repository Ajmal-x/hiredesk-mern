import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { MyApplications } from './pages/MyApplications';
import { SavedJobs } from './pages/SavedJobs';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { RecruiterJobs } from './pages/RecruiterJobs';
import { JobForm } from './pages/JobForm';
import { JobApplicants } from './pages/JobApplicants';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Home as HomeIcon,
  Search,
} from 'lucide-react';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Any signed-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Candidates only */}
          <Route element={<ProtectedRoute roles={['candidate']} />}>
            <Route path="/dashboard" element={<CandidateDashboard />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/saved" element={<SavedJobs />} />
          </Route>

          {/* Recruiters and admins */}
          <Route element={<ProtectedRoute roles={['recruiter', 'admin']} />}>
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/jobs/new" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
            <Route
              path="/recruiter/jobs/:id/applicants"
              element={<JobApplicants />}
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          HireDesk — a MERN job portal and applicant tracking system.
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-145px)] bg-slate-50 px-6 py-16">
      <div className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center">
        <div className="w-full text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200">
            <BriefcaseBusiness size={34} strokeWidth={1.8} />
          </div>

          {/* Eyebrow */}
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Page not found
          </p>

          {/* 404 */}
          <h1 className="text-7xl font-black tracking-tight text-slate-950 sm:text-8xl">
            404
          </h1>

          {/* Heading */}
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            This page doesn’t exist.
          </h2>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
            The page you’re looking for may have been moved, removed, or the
            address might be incorrect.
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <HomeIcon size={17} />
              Go home
            </a>

            <a
              href="/jobs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Search size={17} />
              Browse jobs
            </a>
          </div>

          {/* Back link */}
          <a
            href="/"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to HireDesk
          </a>
        </div>
      </div>
    </div>
  );
}