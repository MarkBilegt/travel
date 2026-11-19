export default function ToursLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[50vh] bg-gray-200" />

      {/* Filter bar skeleton */}
      <div className="relative z-20 px-4 lg:px-8 -translate-y-1/2">
        <div className="max-w-6xl mx-auto">
          <div className="h-16 bg-white rounded-2xl shadow-sm border border-gray-100" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-16">
        <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="w-full aspect-video bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
