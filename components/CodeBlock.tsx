"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

const CodeBlock = ({ language, value, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group", className)}>
      <pre
        className="mt-2 p-4 bg-slate-900 text-slate-50 rounded-md overflow-x-auto"
        style={{ tabSize: 2 }}
      >
        {/* Language badge */}
        {language && (
          <div className="absolute top-0 right-0 bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200 rounded-bl">
            {language}
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="absolute right-2 top-2 text-slate-300 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 p-1 rounded-md"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        <code>{value}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;