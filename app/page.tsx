"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/header";
import SearchSection from "@/components/search-section";
import ResultsSection from "@/components/results-section";
import CanvasBackground from "@/components/canvas-background";

import { API_BASE } from "@/lib/config";

export default function Home() {
  const [sessionId] = useState(Date.now().toString()); // Simple session ID (per browser/tab)
  const [allResults, setAllResults] = useState<any[]>([]);
  const [summary, setSummary] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Safely fetch results – backend down ho toh error mat dikhao
  const fetchAllResults = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/all_results`, {
        params: { session_id: sessionId },
      });
      setAllResults(data.all_results || []);
    } catch (err) {
      // Backend down hai? Chup raho, console mein log karo bas
      console.warn(
        "Backend not reachable yet (all_results) – this is normal during development.",
      );
      setAllResults([]); // Empty results dikhao
    }
  };

  // On mount, try to fetch once
  useEffect(() => {
    fetchAllResults();
  }, [sessionId]); // Depend on sessionId

  const handleSearch = async (searchParams: {
    query: string;
    instructions: string;
    websites: string[];
    dateRange: { start: string; end: string };
  }) => {
    if (!searchParams.query.trim()) {
      setError("Please enter a query.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const fullSiteTypes = searchParams.websites.map((w) => {
        const map: { [key: string]: string } = {
          all: "all",
          government: "Government & Legal",
          patent: "Patent & Intellectual Property",
          news: "News & Media",
          research: "Research & Education",
          business: "Business & Professional Networking",
          blogs: "Blogs & Personal Publishing",
          technology: "Technology & Development",
          social: "Social Media & Community",
          ecommerce: "E-commerce & Marketplaces",
          multimedia: "Multimedia & Creative Portfolios",
          data: "Data, Health & Local Services",
        };
        return map[w] || w;
      });

      const response = await axios.post(`${API_BASE}/search`, {
        query: searchParams.query,
        instruction: searchParams.instructions,
        site_types: fullSiteTypes,
        start_date: searchParams.dateRange.start,
        end_date: searchParams.dateRange.end,
        session_id: sessionId, // Pass session_id
      });

      setUserQuery(searchParams.query);
      setSummary(response.data.final_answer || "No summary available.");
      await fetchAllResults();
    } catch (err: any) {
      // Agar backend nahi chal raha, toh user ko mat dikhao error
      const isNetworkError =
        err.code === "ERR_NETWORK" || err.message?.includes("Network Error");
      if (isNetworkError) {
        setError(
          "Backend server is not running. Start your FastAPI server on port 8000.",
        );
      } else {
        setError(err.response?.data?.detail || "Search failed. Try again.");
      }
      console.error("Search Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ye function ab backend pe depend nahi karega full reset ke liye
  const handleNewChat = async () => {
    // Frontend ko turant clean kar do
    setAllResults([]);
    setSummary("");
    setUserQuery("");
    setIsLoading(false);
    setError("");

    // Backend ko try karo new chat karne ke liye – fail ho toh bhi frontend clean rahega
    try {
      await axios.post(`${API_BASE}/new_chat`, {
        session_id: sessionId, // Pass session_id
      });
      console.log("New chat started on backend.");
    } catch (err: any) {
      console.warn(
        "Could not connect to backend for new_chat – continuing with frontend reset only.",
      );
      // User ko error nahi dikhayenge kyunki frontend already clean hai
    }

    // Optional: Agar strict reset chahiye toh reload kar sakte ho
    // Lekin better hai bina reload ke clean ho jaye
    // window.location.reload()  // Remove this line
  };

  const handleRerun = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/rerun`, {
        session_id: sessionId, // Pass session_id
      });
      await fetchAllResults();
    } catch (err: any) {
      console.warn("Rerun failed – backend not available.");
    } finally {
      setIsLoading(false);
    }
  };

  // Global Loading Overlay
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-8 bg-background/90 rounded-xl border border-border/50 max-w-sm text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full opacity-75 animate-pulse" />
            <div className="absolute inset-2 bg-background rounded-full" />
            <div className="absolute inset-4 border-2 border-transparent border-t-accent border-r-primary rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Searching...
            </p>
            <p className="text-sm text-muted-foreground">
              Gathering intelligent results. This may take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-background text-foreground overflow-hidden">
      <CanvasBackground />

      <div className="relative z-10">
        <Header onNewChat={handleNewChat} />

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 lg:py-20">
          <SearchSection onSearch={handleSearch} />

          {error && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/50 rounded-lg text-orange-300 text-center font-medium">
              ⚠ {error}
            </div>
          )}

          <ResultsSection
            results={allResults}
            summary={summary}
            isLoading={isLoading}
            onRerun={handleRerun}
            userQuery={userQuery}
          />
        </div>
      </div>
    </main>
  );
}
