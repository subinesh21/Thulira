'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/sections/Sidebar';
import MobileNav from '@/components/MobileNav';
import AccountDashboard from '@/components/account/AccountDashboard';
import AuthForm from '@/components/account/AuthForm';

export default function AccountPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <MobileNav />
        <div className="lg:ml-[280px] flex flex-col min-h-screen">
          <div className="h-14 lg:hidden"></div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-[#52dd28ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {user ? <AccountDashboard /> : <AuthForm />}
    </div>
  );
}