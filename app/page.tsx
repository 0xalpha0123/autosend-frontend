import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ScheduleList } from "@/components/schedule-list";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function DashboardPage() {
  return (
    <>
      <div className="flex-col">
        <Navbar />
        <div className="h-full flex-1 flex-col space-y-8 py-8 px-8 max-w-[1000px] m-auto">
          <ScheduleList />
        </div>
      </div>
    </>
  );
}
