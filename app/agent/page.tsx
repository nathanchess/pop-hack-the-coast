import PageHeader from "@/components/page-header";

export default function AgentPage() {
  return (
    <div className="p-8 animate-fade-up">
      <PageHeader
        title="AI Agent"
        description="Monitor AI agent execution, reasoning, and recommendations"
      />
      <div className="grid grid-cols-1 gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="glass-panel rounded-2xl p-8 border border-neutral-200/50">
          <p className="text-neutral-600">AI Agent dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}
