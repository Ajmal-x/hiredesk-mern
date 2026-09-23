import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  BriefcaseBusiness,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { api, toQuery } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, Pager, Spinner } from '../components/ui';
import type { Job, JobType, Paginated, WorkMode } from '../types';

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

const LOCATION_OPTIONS = {
  unitedStates: [
    'United States',
    'New York, NY',
    'San Francisco, CA',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Los Angeles, CA',
    'Chicago, IL',
  ],
  russia: [
    'Russia',
    'Moscow',
    'Saint Petersburg',
    'Kazan',
    'Novosibirsk',
  ],
  remote: ['Remote'],
};

const SALARY_OPTIONS = [
  { value: '50000', label: '$50k+' },
  { value: '80000', label: '$80k+' },
  { value: '100000', label: '$100k+' },
  { value: '150000', label: '$150k+' },
  { value: '200000', label: '$200k+' },
];

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '2', label: '2+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '7', label: '7+ years' },
  { value: '10', label: '10+ years' },
];

const POPULAR_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'MongoDB',
  'Figma',
  'AWS',
  'Cybersecurity',
];

function formatOption(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get('q') ?? '',
  );

  const debouncedSearch = useDebounce(searchInput, 400);

  const page = Number(searchParams.get('page') ?? 1);
  const location = searchParams.get('location') ?? '';
  const type = searchParams.get('type') ?? '';
  const workMode = searchParams.get('workMode') ?? '';
  const minSalary = searchParams.get('minSalary') ?? '';
  const maxExperience = searchParams.get('maxExperience') ?? '';
  const skills = searchParams.get('skills') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';

  useEffect(() => {
    const current = searchParams.get('q') ?? '';

    if (debouncedSearch === current) return;

    const next = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      next.set('q', debouncedSearch);
    } else {
      next.delete('q');
    }

    next.delete('page');

    setSearchParams(next, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    if (key !== 'page') {
      next.delete('page');
    }

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = skills
      ? skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const exists = currentSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase(),
    );

    const nextSkills = exists
      ? currentSkills.filter(
          (item) => item.toLowerCase() !== skill.toLowerCase(),
        )
      : [...currentSkills, skill];

    setFilter('skills', nextSkills.join(','));
  };

  const selectedSkills = skills
    ? skills
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const queryString = toQuery({
    q: searchParams.get('q') ?? '',
    location,
    type,
    workMode,
    skills,
    minSalary,
    maxExperience,
    sort,
    page,
    limit: 10,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['jobs', queryString],
    queryFn: () => api.get<Paginated<Job>>(`/jobs${queryString}`),
    placeholderData: keepPreviousData,
  });

  const hasFilters = Array.from(searchParams.keys()).some(
    (key) => key !== 'page',
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Explore opportunities
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Find your next opportunity
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-500">
              Discover roles from companies hiring across the US, Russia, and
              remote teams worldwide.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="search"
                className="h-12 w-full rounded-2xl border-0 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                placeholder="Search jobs, skills, or companies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="relative lg:w-64">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="location"
                className="h-12 w-full appearance-none rounded-2xl border-0 bg-slate-50 pl-11 pr-10 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-100"
                value={location}
                onChange={(e) => setFilter('location', e.target.value)}
              >
                <option value="">All locations</option>

                <optgroup label="United States">
                  {LOCATION_OPTIONS.unitedStates.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Russia">
                  {LOCATION_OPTIONS.russia.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Remote">
                  {LOCATION_OPTIONS.remote.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* Filters */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <SlidersHorizontal size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">
                      Filters
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Refine your search
                    </p>
                  </div>
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-5">
                {/* Job type */}
                <div>
                  <label htmlFor="filter-type" className="label">
                    Job type
                  </label>

                  <select
                    id="filter-type"
                    className="input"
                    value={type}
                    onChange={(e) => setFilter('type', e.target.value)}
                  >
                    <option value="">Any type</option>

                    {JOB_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {formatOption(item)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Work mode */}
                <div>
                  <label htmlFor="filter-work-mode" className="label">
                    Work mode
                  </label>

                  <select
                    id="filter-work-mode"
                    className="input"
                    value={workMode}
                    onChange={(e) =>
                      setFilter('workMode', e.target.value)
                    }
                  >
                    <option value="">Any mode</option>

                    {WORK_MODES.map((item) => (
                      <option key={item} value={item}>
                        {formatOption(item)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Salary */}
                <div>
                  <label htmlFor="filter-salary" className="label">
                    Minimum salary
                  </label>

                  <select
                    id="filter-salary"
                    className="input"
                    value={minSalary}
                    onChange={(e) =>
                      setFilter('minSalary', e.target.value)
                    }
                  >
                    <option value="">Any salary</option>

                    {SALARY_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label htmlFor="filter-experience" className="label">
                    Maximum experience
                  </label>

                  <select
                    id="filter-experience"
                    className="input"
                    value={maxExperience}
                    onChange={(e) =>
                      setFilter(
                        'maxExperience',
                        e.target.value === '0' ? '' : e.target.value,
                      )
                    }
                  >
                    {EXPERIENCE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skills */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="label mb-0">Popular skills</label>

                    {selectedSkills.length > 0 && (
                      <span className="text-[11px] font-semibold text-brand-700">
                        {selectedSkills.length} selected
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((skill) => {
                      const selected = selectedSkills.some(
                        (item) =>
                          item.toLowerCase() === skill.toLowerCase(),
                      );

                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                            selected
                              ? 'border-brand-200 bg-brand-50 text-brand-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {data ? (
                    <>
                      <span className="font-semibold text-slate-950">
                        {data.pagination.total}
                      </span>{' '}
                      {data.pagination.total === 1 ? 'job' : 'jobs'} found

                      {isFetching && (
                        <span className="ml-2 text-slate-400">
                          Updating...
                        </span>
                      )}
                    </>
                  ) : (
                    'Searching...'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <BriefcaseBusiness
                  size={16}
                  className="hidden text-slate-400 sm:block"
                />

                <select
                  className="input w-full sm:w-auto"
                  value={sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  aria-label="Sort jobs"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="salary">Highest salary</option>
                  <option value="relevance">Most relevant</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10">
                <Spinner label="Loading jobs" />
              </div>
            ) : isError ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <ErrorState
                  message={
                    error instanceof Error
                      ? error.message
                      : 'Could not load jobs'
                  }
                  onRetry={refetch}
                />
              </div>
            ) : data && data.data.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <EmptyState
                  title="No jobs match those filters"
                  description="Try removing a filter or searching for a broader term."
                  action={
                    hasFilters && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    )
                  }
                />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {data?.data.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>

                <div className="mt-8">
                  <Pager
                    page={page}
                    totalPages={data?.pagination.totalPages ?? 1}
                    onChange={(nextPage) =>
                      setFilter('page', String(nextPage))
                    }
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}