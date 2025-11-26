export default function Loader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-neon-blue rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-neon-purple rounded-full animate-spin animation-delay-150"></div>
      </div>
    </div>
  );
}