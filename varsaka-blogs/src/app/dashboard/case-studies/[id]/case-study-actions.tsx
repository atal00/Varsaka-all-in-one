"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, CheckCircle2, Loader2, Copy, Check } from "lucide-react";

export function CaseStudyActions({ caseStudyId, isPublished, content }: { caseStudyId: string, isPublished: boolean, content?: string }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`http://127.0.0.1:3001/case-studies/${caseStudyId}/publish`, {
        method: 'POST'
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error publishing case study", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy content", err);
    }
  };

  return (
    <div className="flex space-x-3">
      {content && (
        <button 
          onClick={handleCopy}
          className="flex items-center px-4 py-2 bg-surface hover:bg-surface2 text-foreground rounded-lg text-sm font-medium transition-colors border border-border"
        >
          {isCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />} 
          {isCopied ? "Copied!" : "Copy"}
        </button>
      )}
      <button className="flex items-center px-4 py-2 bg-surface hover:bg-surface2 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">
        <Share2 className="w-4 h-4 mr-2" /> Share
      </button>
      {!isPublished ? (
        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Publish</>
          )}
        </button>
      ) : (
        <button 
          disabled
          className="flex items-center px-4 py-2 bg-[#E5F3EC] text-[#2F6F4E] rounded-lg text-sm font-medium transition-colors cursor-default"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> Published
        </button>
      )}
    </div>
  );
}
