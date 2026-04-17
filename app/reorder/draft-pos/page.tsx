import PageHeader from "@/components/page-header";

export default function DraftPOsPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Draft Purchase Orders"
        description="AI-generated purchase order recommendations"
        icon="📝"
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <p className="text-neutral-600">Draft POs content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
