import PageHeader from "@/components/page-header";

export default function ReorderPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Reorder Center"
        description="Manage inventory reorder points and purchase orders"
        icon="🎯"
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <p className="text-neutral-600">Reorder Center overview coming soon...</p>
        </div>
      </div>
    </div>
  );
}
