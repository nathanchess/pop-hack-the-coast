import PageHeader from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Settings"
        description="Configure system preferences and user settings"
        icon="⚙️"
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <p className="text-neutral-600">Settings content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
