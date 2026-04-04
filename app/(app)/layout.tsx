import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen dot-grid">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen" style={{ maxWidth: 'calc(100vw - 240px)' }}>
        {children}
      </main>
    </div>
  )
}
