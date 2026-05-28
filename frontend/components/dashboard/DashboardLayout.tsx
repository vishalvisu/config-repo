import type { ReactNode } from "react";

interface DashboardLayoutProps {
  form: ReactNode;
  results: ReactNode;
}

export function DashboardLayout({ form, results }: DashboardLayoutProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <section aria-label="Grader form">{form}</section>
      <section aria-label="Analysis results">{results}</section>
    </div>
  );
}
