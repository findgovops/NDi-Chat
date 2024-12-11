// src/hooks/useSessionTimeout.tsx

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

const useSessionTimeout = (timeout: number = 60 * 60 ) => { // default 1 hour
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: '/login' }); // Redirect to login page after sign out
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [status, timeout, router]);

  return null;
};

export default useSessionTimeout;