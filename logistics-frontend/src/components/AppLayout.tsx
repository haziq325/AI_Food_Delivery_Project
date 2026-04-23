import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto focus:outline-none focus:ring-0">
        <div className="py-8 px-8 sm:px-10 lg:px-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
