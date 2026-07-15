"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Download } from "lucide-react";

export function CaseStudyImageClient({ caseStudyId, imageUrls, alt }: { caseStudyId: string, imageUrls: string[], alt: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`http://127.0.0.1:3001/case-studies/${caseStudyId}/refresh-image`, {
        method: 'POST'
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to refresh image", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `social-media-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  };

  return (
    <div className="border-b border-border bg-surface2">
      <div className="flex justify-end p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-border">
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground border border-border rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Generating...' : 'Refresh All Images'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 p-1">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative h-64 md:h-80 group overflow-hidden bg-zinc-200 dark:bg-zinc-900 rounded-lg">
            <img 
              src={url} 
              alt={`${alt} - option ${index + 1}`}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isRefreshing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleDownload(url, index)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg text-sm font-semibold transition-transform transform scale-95 group-hover:scale-100 shadow-lg"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
