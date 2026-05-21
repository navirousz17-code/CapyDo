export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-20 bg-cream-200 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-cream-200 rounded-2xl" />)}
      </div>
      <div className="h-40 bg-cream-200 rounded-2xl" />
      <div className="flex flex-col gap-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-cream-200 rounded-2xl" />)}
      </div>
    </div>
  );
}
