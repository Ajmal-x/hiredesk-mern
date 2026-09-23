import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Database,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '../lib/api';
import { JobCard } from '../components/JobCard';
import { Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job, Paginated } from '../types';

const categories = [
  'Frontend',
  'Backend',
  'Full Stack',
  'UI/UX Design',
  'AI & Machine Learning',
  'Cybersecurity',
];

const careerPaths = [
  {
    title: 'Software Engineering',
    description: 'Build products, platforms, and scalable applications.',
    query: 'Software Engineer',
    icon: Code2,
  },
  {
    title: 'Frontend Development',
    description: 'Create modern interfaces and exceptional web experiences.',
    query: 'Frontend',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Backend Development',
    description: 'Design APIs, services, databases, and reliable systems.',
    query: 'Backend',
    icon: Database,
  },
  {
    title: 'Design',
    description: 'Shape intuitive digital products through thoughtful design.',
    query: 'UI/UX Design',
    icon: Palette,
  },
  {
    title: 'AI & Machine Learning',
    description: 'Work on intelligent systems and the future of technology.',
    query: 'AI',
    icon: Sparkles,
  },
  {
    title: 'Cybersecurity',
    description: 'Protect systems, networks, data, and digital products.',
    query: 'Cybersecurity',
    icon: ShieldCheck,
  },
];

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'latest'],
    queryFn: () => api.get<Paginated<Job>>('/jobs?limit=6&sort=newest'),
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    const value = query.trim();

    navigate(
      `/jobs${value ? `?q=${encodeURIComponent(value)}` : ''}`,
    );
  };

  const searchCategory = (value: string) => {
    navigate(`/jobs?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={13} />
              </span>
              Find work that moves you forward
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Your next opportunity
              <span className="block text-brand-600">
                starts here.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Discover meaningful opportunities, connect with growing teams,
              and manage your entire job search from one place.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 sm:flex-row"
            >
              <div className="flex flex-1 items-center rounded-xl bg-slate-50 px-4 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-50">
                <Search
                  size={19}
                  className="mr-3 shrink-0 text-slate-400"
                />

                <input
                  className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Job title, skill, or company"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search jobs"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Search jobs
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Categories */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => searchCategory(category)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Live stats */}
          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-3">
              <Stat
                value={data?.pagination.total ?? '—'}
                label="Open opportunities"
              />

              <Stat
                value="5"
                label="Application stages"
              />

              <div className="col-span-2 mt-6 border-t border-slate-200 pt-6 sm:col-span-1 sm:mt-0 sm:border-t-0 sm:pt-0">
                <Stat
                  value="1"
                  label="Simple application flow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          POPULAR CAREER PATHS
      ========================================================= */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Explore careers"
            title="Find a path that fits your skills"
            description="Explore popular areas and discover opportunities that match the direction you want to take."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {careerPaths.map((path) => {
              const Icon = path.icon;

              return (
                <button
                  key={path.title}
                  type="button"
                  onClick={() => searchCategory(path.query)}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-brand-50 group-hover:text-brand-700">
                      <Icon size={21} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 transition group-hover:text-brand-600"
                    />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-slate-950">
                    {path.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {path.description}
                  </p>

                  <span className="mt-5 inline-flex text-xs font-semibold text-brand-700">
                    Explore roles
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          LATEST JOBS
      ========================================================= */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
                Fresh opportunities
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Latest openings
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Explore the newest roles added to HireDesk and find your next
                opportunity.
              </p>
            </div>

            <Link
              to="/jobs"
              className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
            >
              Explore all jobs
              <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Spinner label="Loading jobs" />
            </div>
          ) : data?.data.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <BriefcaseBusiness size={22} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                No jobs available yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                New opportunities will appear here when companies start
                hiring.
              </p>

              {!user && (
                <Link
                  to="/register"
                  className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create an account
                </Link>
              )}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              Explore all jobs
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How HireDesk works"
            title="From discovery to decision"
            description="A simple workflow designed to keep your job search clear and organized."
          />

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <StepCard
              number="01"
              title="Discover"
              description="Search opportunities by role, skill, company, and location."
              icon={<Search size={21} />}
            />

            <StepCard
              number="02"
              title="Apply"
              description="Send your application, resume, and cover letter in one simple flow."
              icon={<ArrowUpRight size={21} />}
            />

            <StepCard
              number="03"
              title="Track"
              description="Follow your application as it moves through the hiring process."
              icon={<CheckCircle2 size={21} />}
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY HIREDESK
      ========================================================= */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
                Built for the journey
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Everything you need to manage the job search.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                HireDesk brings job discovery, applications, saved roles,
                and hiring progress together in one focused experience.
              </p>

              <Link
                to="/jobs"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Explore opportunities
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BenefitCard
                icon={<Search size={20} />}
                title="Focused discovery"
                description="Search and filter opportunities by the things that matter to you."
              />

              <BenefitCard
                icon={<CheckCircle2 size={20} />}
                title="Simple applications"
                description="Apply without unnecessary steps or complicated workflows."
              />

              <BenefitCard
                icon={<BriefcaseBusiness size={20} />}
                title="Application tracking"
                description="Know where every application stands throughout the process."
              />

              <BenefitCard
                icon={<Users size={20} />}
                title="Built for both sides"
                description="Candidates and recruiters each get a focused workspace."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CANDIDATE / RECRUITER
      ========================================================= */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">

            {/* Candidate */}
            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-100/70 blur-3xl" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <BriefcaseBusiness size={21} />
                </div>

                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
                  For candidates
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Find work worth applying for.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                  Discover roles, save opportunities, apply with your resume,
                  and keep track of every application from your dashboard.
                </p>

                <Link
                  to="/jobs"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Find jobs
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Recruiter */}
            <div className="relative overflow-hidden bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
              <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                  <Users size={21} />
                </div>

                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-brand-300">
                  For recruiters
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Build a better hiring pipeline.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                  Publish jobs, review applicants, manage application stages,
                  and keep your recruitment workflow organized.
                </p>

                <Link
                  to={
                    user?.role === 'recruiter'
                      ? '/recruiter/jobs/new'
                      : '/register'
                  }
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {user?.role === 'recruiter'
                    ? 'Post a job'
                    : 'Start hiring'}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
              <Sparkles size={23} />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next opportunity starts here.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Explore open roles and take the next step in your career
              with HireDesk.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Explore jobs
                <ArrowRight size={16} />
              </Link>

              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Create an account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ===============================================================
   SMALL COMPONENTS
================================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function Stat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
          {icon}
        </div>

        <span className="text-sm font-bold text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-lg font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}