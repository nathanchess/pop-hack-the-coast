import PageHeader from "@/components/page-header";

export default function ExportPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Export & Reports"
        description="Generate and export reports in various formats"
        icon="📤"
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <p className="text-neutral-600">Export & Reports content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
