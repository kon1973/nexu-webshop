import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="pt-16 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
