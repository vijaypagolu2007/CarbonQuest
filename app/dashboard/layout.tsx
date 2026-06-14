'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { BottomNav } from '@/components/dashboard/BottomNav'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div style={{ 
        minHeight: '100vh', 
        paddingBottom: 160,
        fontFamily: "'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* Global Top Right Actions */}
        <div style={{ position: 'absolute', top: 24, right: 20, zIndex: 50 }}>
          <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
            <div style={{ 
              width: 44, height: 44, borderRadius: '50%', 
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              🏅
            </div>
          </Link>
        </div>
        
        {children}
        <div style={{ 
          position: 'fixed', 
          bottom: 24, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: 400, 
          zIndex: 100 
        }}>
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}
