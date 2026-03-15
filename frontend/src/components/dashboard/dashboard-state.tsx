interface DashboardStateProps {
  title: string;
  message: string;
}

export function DashboardState({ title, message }: DashboardStateProps) {
  return (
    <section className="dashboard-state">
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
