export default function TourDetailLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero image skeleton */}
      <div className="h-[60vh] bg-gray-200" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-3/4 bg-gray-200 rounded" />
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
            {/* Tabs */}
            <div className="flex gap-2 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="h-48 bg-gray-100 rounded-2xl" />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-gray-100 rounded-3xl p-6 space-y-4">
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded-xl" />
              <div className="h-12 w-full bg-gray-200 rounded-xl" />
              <div className="h-14 w-full bg-gray-300 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
