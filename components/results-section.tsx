// components/results-section.tsx - Fixed typing and grouping errors
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import ResultCard from "./result-card";

import { API_BASE } from "@/lib/config";

interface MappedResult {
  id: number;
  title: string;
  url: string;
  description: string;
  score?: number;
  sourceQuery?: string;
}

interface ResultsSectionProps {
  results: any[]; // Raw accumulated from backend
  summary: string;
  isLoading: boolean;
  onRerun: () => void; // Required
  userQuery?: string; // New: Pass from parent to highlight user query group
}

export default function ResultsSection({
  results: rawResults,
  summary,
  isLoading,
  onRerun,
  userQuery = "", // Default empty
}: ResultsSectionProps) {
  const [mappedResults, setMappedResults] = useState<MappedResult[]>([]);
  const [animatingIds, setAnimatingIds] = useState<number[]>([]);

  // Map raw backend data to frontend format
  useEffect(() => {
    if (rawResults.length > 0) {
      const mapped = rawResults.map((doc: any, index: number) => ({
        id: index + 1,
        title: doc.English_Title || doc.Original_Title,
        url: doc.URL || "",
        description: doc.English_Snippet || doc.Original_Snippet,
        score: doc.Score,
        sourceQuery: doc.source_query,
      }));
      setMappedResults(mapped);

      // Animation
      mapped.forEach((_, index) => {
        setTimeout(() => {
          setAnimatingIds((prev) => [...prev, mapped[index].id]);
        }, index * 80);
      });
    } else {
      setMappedResults([]);
      setAnimatingIds([]);
    }
  }, [rawResults]);

  // Group by sourceQuery with proper typing
  useEffect(() => {
    if (mappedResults.length === 0) return;

    const groups: { [key: string]: MappedResult[] } = {};
    mappedResults.forEach((result) => {
      const key = result.sourceQuery || "Unknown";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(result);
    });

    // No need for Map conversion; use Object.entries directly
    // But for the map below, it's fine
  }, [mappedResults]); // This useEffect just ensures grouping logic is sound

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_BASE}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "search_results.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Build groups in render for simplicity
  const groups = mappedResults.reduce(
    (acc: { [key: string]: MappedResult[] }, result: MappedResult) => {
      const key = result.sourceQuery || "Unknown";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(result);
      return acc;
    },
    {},
  );

  if (Object.keys(groups).length === 0 && !isLoading) {
    return (
      <section className="w-full py-32 text-center">
        <div className="space-y-4">
          <div className="inline-block p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <svg
              className="w-12 h-12 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-foreground">
            Ready to search
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter your research query above to explore intelligent results
            powered by advanced AI analysis
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full opacity-75 animate-pulse" />
              <div className="absolute inset-1 bg-background rounded-full" />
              <div className="absolute inset-2 border-2 border-transparent border-t-accent border-r-primary rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Searching...
            </p>
          </div>
        </div>
      )}

      {/* Summary Card with HTML support
      {summary && (
        <div className="mb-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl">
          <h2 className="text-base font-semibold text-foreground mb-2">AI Summary</h2>
          <div 
            className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </div>
      )} */}

      {/* Grouped Results (by source_query, highlight user query if present) */}
      <div className="space-y-6 mb-12">
        {Object.entries(groups).map(([key, list], groupIndex) => (
          <div
            key={groupIndex}
            className={`query-block ${key === userQuery ? "highlight" : ""}`}
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">
              🔍 Query: {key}
            </h3>
            <div className="space-y-4">
              {list.map((result: MappedResult) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  isAnimating={animatingIds.includes(result.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {mappedResults.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border/50">
          <Button
            onClick={onRerun}
            disabled={isLoading}
            className="flex-1 sm:flex-initial h-11 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-border/50 text-foreground hover:from-primary/30 hover:to-secondary/30 font-semibold transition-all duration-200"
          >
            {isLoading ? "Re-running..." : "Re-run Search"}
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial h-11 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-border/50 text-foreground hover:from-primary/30 hover:to-secondary/30 font-semibold transition-all duration-200"
          >
            Download Excel
          </Button>
        </div>
      )}
    </section>
  );
}
