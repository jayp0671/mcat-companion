import { DaysToExam } from "@/components/dashboard/DaysToExam";
import { MasteryBar } from "@/components/dashboard/MasteryBar";
import { ReadinessGauge } from "@/components/dashboard/ReadinessGauge";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { WeakTopicsList } from "@/components/dashboard/WeakTopicsList";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-slate-600">Your current MCAT prep signal, based on logged mistakes and practice activity.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><DaysToExam /><ReadinessGauge value={42} /><TodayCard /></div>
      <div className="grid gap-4 lg:grid-cols-2"><MasteryBar /><WeakTopicsList /></div>
      <RecentActivity />
    </div>
  );
}
