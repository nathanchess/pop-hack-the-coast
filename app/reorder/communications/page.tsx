import PageHeader from "@/components/page-header";

export default function CommunicationsPage() {
  return (
    <div className="p-8 animate-fade-up">
      <PageHeader
        title="Communications"
        description="Send alerts and notifications via SMS, Email, and Slack"
      />
      <div className="grid grid-cols-1 gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="glass-panel rounded-2xl p-8 border border-neutral-200/50">
          <p className="text-neutral-600">Communications dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}
