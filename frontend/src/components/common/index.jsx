export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">{description}</p>}
    {action && action}
  </div>
);

export const Loading = ({ rows = 3 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-14 w-full" />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-4 w-24" />
    <div className="skeleton h-8 w-16" />
    <div className="skeleton h-3 w-32" />
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
      <span className="text-3xl">⚠️</span>
    </div>
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Something went wrong</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">Try Again</button>
    )}
  </div>
);

export const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    gray: 'badge-gray',
    green: 'badge-green',
    red: 'badge-red',
    yellow: 'badge-yellow',
    blue: 'badge-blue',
    purple: 'badge-purple',
  };
  return <span className={variants[variant] || 'badge-gray'}>{children}</span>;
};

export default { EmptyState, Loading, SkeletonCard, ErrorState, Badge };
