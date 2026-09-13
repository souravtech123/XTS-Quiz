'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quiz');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-300 flex items-center justify-center font-mono text-sm">
      Redirecting directly to Quiz Arena...
    </div>
  );
}
