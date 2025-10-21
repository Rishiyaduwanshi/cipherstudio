 'use client';
import IDE from '@/components/IDE';
import { initialFiles as demoInitialFiles } from '@/data/initialProject-react';
import React, { useEffect, useState } from 'react';

export default function IDEPage() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    try {
      const temp = typeof window !== 'undefined' && localStorage.getItem('cipherstudio-temp');
      if (temp) {
        const parsed = JSON.parse(temp);
        setInitial(parsed.files || demoInitialFiles);
        return;
      }
    } catch (e) {
      // ignore parse errors
    }
    setInitial(demoInitialFiles);
  }, []);

  if (!initial) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <IDE initialFiles={initial} />
    </div>
  );
}
