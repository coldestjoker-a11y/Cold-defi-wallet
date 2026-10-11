import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAdminToken } from '../lib/adminApiClient';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}
