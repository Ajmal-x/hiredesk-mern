import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  BriefcaseBusiness,
  LogOut,
  Menu,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(!!user);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    setNotificationOpen(false);
    navigate('/');
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const handleNotificationClick = async (
    notificationId: string,
    read: boolean,
    link?: string,
  ) => {
    if (!read) {
      await markAsRead(notificationId);
    }

    setNotificationOpen(false);

    if (link) {
      navigate(link);
    }
  };

  const handleDeleteNotification = async (
    event: React.MouseEvent,
    notificationId: string,
  ) => {
    event.stopPropagation();

    await deleteNotification(notificationId);
  };

  useEffect(() => {
    setNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-100 text-slate-950'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-100 text-slate-950'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobile}
          className="group flex items-center gap-3"
        >
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
            <span className="absolute inset-0 bg-brand-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="relative">HD</span>
          </span>

          <div className="hidden sm:block">
            <div className="text-[17px] font-bold tracking-tight text-slate-950">
              HireDesk
            </div>

            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Find · Apply · Grow
            </div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>

          {user?.role === 'candidate' && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/applications" className={linkClass}>
                Applications
              </NavLink>

              <NavLink to="/saved" className={linkClass}>
                Saved
              </NavLink>
            </>
          )}

          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <>
              <NavLink to="/recruiter" end className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/recruiter/jobs" end className={linkClass}>
                My Jobs
              </NavLink>

              <NavLink to="/recruiter/jobs/new" end className={linkClass}>
                Post a Job
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop account */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setNotificationOpen((current) => !current)
                  }
                  className="relative grid h-10 w-10 place-items-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                >
                  <Bell size={19} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-12 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">
                          Notifications
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {unreadCount > 0
                            ? `${unreadCount} unread notification${
                                unreadCount > 1 ? 's' : ''
                              }`
                            : 'You are all caught up'}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void markAllAsRead()}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                        >
                          <CheckCheck size={14} />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[380px] overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="space-y-3 p-4">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="flex gap-3"
                            >
                              <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-100" />

                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                            <Bell size={21} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No notifications yet
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            We&apos;ll let you know when something important
                            happens.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`group flex gap-3 border-b border-slate-100 px-4 py-3.5 transition last:border-b-0 ${
                              notification.read
                                ? 'bg-white hover:bg-slate-50'
                                : 'bg-brand-50/40 hover:bg-brand-50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                void handleNotificationClick(
                                  notification._id,
                                  notification.read,
                                  notification.link,
                                )
                              }
                              className="flex min-w-0 flex-1 gap-3 text-left"
                            >
                              <div
                                className={`relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                                  notification.read
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-brand-100 text-brand-700'
                                }`}
                              >
                                <Bell size={16} />

                                {!notification.read && (
                                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-white" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <p
                                    className={`text-sm ${
                                      notification.read
                                        ? 'font-medium text-slate-700'
                                        : 'font-bold text-slate-950'
                                    }`}
                                  >
                                    {notification.title}
                                  </p>

                                  <span className="shrink-0 text-[10px] text-slate-400">
                                    {formatNotificationTime(
                                      notification.createdAt,
                                    )}
                                  </span>
                                </div>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {notification.message}
                                </p>
                              </div>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(event) =>
                                void handleDeleteNotification(
                                  event,
                                  notification._id,
                                )
                              }
                              className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                              aria-label="Delete notification"
                              title="Delete notification"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link
                to="/profile"
                className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>

                <div className="hidden max-w-[140px] text-left lg:block">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user.name}
                  </p>

                  <p className="flex items-center gap-1 text-[11px] capitalize text-slate-400">
                    {user.role}
                    <ChevronDown size={11} />
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <LogOut size={15} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <nav className="space-y-1">
              <NavLink
                to="/jobs"
                onClick={closeMobile}
                className={mobileLinkClass}
              >
                <BriefcaseBusiness size={17} className="mr-3" />
                Jobs
              </NavLink>

              {user?.role === 'candidate' && (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/applications"
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    Applications
                  </NavLink>

                  <NavLink
                    to="/saved"
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    Saved
                  </NavLink>
                </>
              )}

              {(user?.role === 'recruiter' || user?.role === 'admin') && (
                <>
                  <NavLink
                    to="/recruiter"
                    end
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/recruiter/jobs"
                    end
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    My Jobs
                  </NavLink>

                  <NavLink
                    to="/recruiter/jobs/new"
                    end
                    onClick={closeMobile}
                    className={mobileLinkClass}
                  >
                    Post a Job
                  </NavLink>
                </>
              )}
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              {user ? (
                <div className="space-y-2">
                  {/* Mobile notifications */}
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationOpen((current) => !current)
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <Bell size={18} />

                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Notifications
                      </p>

                      <p className="text-xs text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : 'No new notifications'}
                      </p>
                    </div>
                  </button>

                  {/* Mobile notification list */}
                  {notificationOpen && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Recent notifications
                        </span>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => void markAllAsRead()}
                            className="text-xs font-semibold text-brand-600"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm font-medium text-slate-600">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-[320px] overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex gap-2 border-b border-slate-200 px-4 py-3 last:border-b-0 ${
                                notification.read
                                  ? 'bg-white'
                                  : 'bg-brand-50/50'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  void handleNotificationClick(
                                    notification._id,
                                    notification.read,
                                    notification.link,
                                  )
                                }
                                className="flex min-w-0 flex-1 gap-3 text-left"
                              >
                                <span
                                  className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                                    notification.read
                                      ? 'bg-slate-100 text-slate-500'
                                      : 'bg-brand-100 text-brand-700'
                                  }`}
                                >
                                  <Bell size={14} />
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="block text-xs font-bold text-slate-800">
                                    {notification.title}
                                  </span>

                                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    {notification.message}
                                  </span>

                                  <span className="mt-1 block text-[10px] text-slate-400">
                                    {formatNotificationTime(
                                      notification.createdAt,
                                    )}
                                  </span>
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={(event) =>
                                  void handleDeleteNotification(
                                    event,
                                    notification._id,
                                  )
                                }
                                className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                aria-label="Delete notification"
                                title="Delete notification"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile profile */}
                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-slate-50"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="text-xs capitalize text-slate-400">
                        {user.role}
                      </p>
                    </div>

                    <UserRound
                      size={17}
                      className="ml-auto text-slate-400"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}