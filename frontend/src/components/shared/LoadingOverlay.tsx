import { Loader2 } from 'lucide-react';

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-slate-900 border border-slate-800 rounded-lg shadow-lg text-white animate-in fade-in zoom-in-95 duration-150">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-medium">Processing your decision...</p>
      </div>
    </div>
  );
};
