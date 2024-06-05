'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import React from 'react';
import { LogOut } from 'lucide-react';

function LogoutButton() {
  const { setCurrentUser } = useAuth();
  const router = useRouter();

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    
    setCurrentUser(null);
    localStorage.removeItem('user');
    router.push('/sign-in'); // Redirect to the sign-in page
  };

  return (
    <button
      className="rounded-md bg-red-100 w-full px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-white shadow flex items-center gap-2 hover:bg-red-600"
      onClick={handleLogout}
    >
      <LogOut />
      Logout
    </button>
  );
}

export default LogoutButton;
