import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Bell } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { SearchInvoices } from "@/components/SearchInvoices";
import { TopNavLoader } from "@/components/TopNavLoader";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.email === 'invoice@varsaka.com';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <TopNavLoader />
      <Sidebar isAdmin={isAdmin} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          background: 'var(--bg-surface)', 
          borderBottom: '1px solid var(--border-light)', 
          padding: '1rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Debounced Search Invoices */}
          <SearchInvoices />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div 
              style={{ 
                background: '#f3f4f6', 
                padding: '0.45rem', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
              title="Notifications"
            >
              <Bell size={18} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {session.user?.email?.[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {session.user?.name || session.user?.email}
              </span>
              <div style={{ marginLeft: '1rem' }}>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
