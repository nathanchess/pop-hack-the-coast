import PageHeader from "@/components/page-header";

export default function DemandPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Demand Intelligence"
        description="Analyze demand patterns across SKUs and channels"
        icon="📈"
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <p className="text-neutral-600">Demand Intelligence overview coming soon...</p>
        </div>
      </div>
    </div>
  );
}
