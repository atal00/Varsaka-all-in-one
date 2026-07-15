"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function GenerateArticleButton({ topicId, type = 'blog' }: { topicId: string, type?: 'blog' | 'case-study' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const endpoint = type === 'blog' ? 'articles/generate' : 'case-studies/generate';
      const redirectBase = type === 'blog' ? 'articles' : 'case-studies';
      
      const res = await fetch(`http://127.0.0.1:3001/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      
      if (res.ok) {
        const item = await res.json();
        // Redirect to the newly created item's page
        router.push(`/dashboard/${redirectBase}/${item.id}`);
      } else {
        console.error(`Failed to generate ${type}`);
      }
    } catch (err) {
      console.error(`Error generating ${type}`, err);
    } finally {
      setIsGenerating(false);
    }
  };

  const label = type === 'blog' ? 'Blog' : 'Case Study';

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating {label}...
        </>
      ) : (
        `Generate ${label}`
      )}
    </button>
  );
}
