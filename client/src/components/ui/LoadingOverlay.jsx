export const LoadingOverlay = ({ message = "Authenticating..." }) => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-orange-100 border-t-orange-600"></div>
        {/* Inner Logo or Icon */}
        <span className="text-2xl font-bold text-orange-600">Q</span>
      </div>
      <p className="mt-4 animate-pulse font-medium text-gray-600 tracking-wide">{message}</p>
    </div>
  );
};