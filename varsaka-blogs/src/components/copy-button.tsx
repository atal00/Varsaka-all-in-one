"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  content: string;
  label?: string;
  className?: string;
}

export function CopyButton({ content, label = "Copy", className = "" }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

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
    <button 
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`flex items-center justify-center transition-colors ${className}`}
    >
      {isCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />} 
      {isCopied ? "Copied!" : label}
    </button>
  );
}
