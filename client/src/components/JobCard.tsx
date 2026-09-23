import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  DollarSign,
  MapPin,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeDate, formatSalary, titleCase } from '../lib/format';
import { Tag } from './ui';
import type { Job } from '../types';

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          {/* Company avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white transition-colors duration-200 group-hover:bg-brand-600">
            {job.company.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <Link
              to={`/jobs/${job._id}`}
              className="line-clamp-1 text-base font-semibold tracking-tight text-slate-950 transition-colors hover:text-brand-700"
            >
              {job.title}
            </Link>

            <p className="mt-1 truncate text-sm text-slate-500">
              {job.company}
            </p>
          </div>
        </div>

        {/* Posted date */}
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          <CalendarDays size={12} />
          {formatRelativeDate(job.createdAt)}
        </span>
      </div>

      {/* Job information */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <InfoItem
          icon={<MapPin size={15} />}
          value={job.location}
        />

        <InfoItem
          icon={<BriefcaseBusiness size={15} />}
          value={titleCase(job.workMode)}
        />

        <InfoItem
          icon={<Clock3 size={15} />}
          value={titleCase(job.type)}
        />

        <InfoItem
          icon={<DollarSign size={15} />}
          value={formatSalary(job.salaryMin, job.salaryMax)}
        />
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}

          {job.skills.length > 4 && (
            <Tag>+{job.skills.length - 4}</Tag>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-600">
            {job.experienceMin === 0
              ? 'Fresher friendly'
              : `${job.experienceMin}+ yrs experience`}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {job.applicantCount} applicant
            {job.applicantCount === 1 ? '' : 's'}
          </p>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-600"
        >
          View job

          <ArrowUpRight
            size={14}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}

function InfoItem({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="shrink-0 text-slate-400">
        {icon}
      </span>

      <span className="truncate text-xs font-medium text-slate-600">
        {value}
      </span>
    </div>
  );
}