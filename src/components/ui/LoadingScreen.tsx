export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-surface-800" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-primary-500" />
        </div>
        <span className="font-display text-lg font-medium text-surface-400">
          SUBHASISH
        </span>
      </div>
    </div>
  );
}
