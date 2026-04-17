import PageHeader from "@/components/page-header";

export default function AlertsPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Alerts & Actions"
        description="Critical reorder alerts and recommended actions"
        icon="🚨"
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <p className="text-neutral-600">Alerts & Actions content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
