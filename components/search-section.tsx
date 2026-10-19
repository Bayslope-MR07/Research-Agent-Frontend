"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

interface SearchSectionProps {
  onSearch: (params: {
    query: string
    instructions: string
    websites: string[]
    dateRange: { start: string; end: string }
  }) => void
}

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("")
  const [instructions, setInstructions] = useState("")
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>(["all"])
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [isExpanded, setIsExpanded] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)

  const websiteOptions = [
    { id: "all", label: "All Websites" },
    { id: "government", label: "Government & Legal" },
    { id: "patent", label: "Patent & Intellectual Property" },
    { id: "news", label: "News & Media" },
    { id: "research", label: "Research & Education" },
    { id: "business", label: "Business & Professional Networking" },
    { id: "blogs", label: "Blogs & Personal Publishing" },
    { id: "technology", label: "Technology & Development" },
    { id: "social", label: "Social Media & Community" },
    { id: "ecommerce", label: "E-commerce & Marketplaces" },
    { id: "multimedia", label: "Multimedia & Creative Portfolios" },
    { id: "data", label: "Data, Health & Local Services" },
  ]

  const toggleWebsite = (id: string) => {
    if (id === "all") {
      setSelectedWebsites(["all"])
    } else {
      setSelectedWebsites((prev) => {
        if (prev.includes("all")) return [id]
        if (prev.includes(id)) {
          const filtered = prev.filter((w) => w !== id)
          return filtered.length === 0 ? ["all"] : filtered
        }
        return [...prev, id]
      })
    }
  }

  const getSelectedLabels = () => {
    if (selectedWebsites.includes("all")) return "All Websites"
    return selectedWebsites.map(id => websiteOptions.find(o => o.id === id)?.label).join(", ")
  }

  const handleSearch = () => {
    onSearch({ query, instructions, websites: selectedWebsites, dateRange })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <section className="w-full mb-16">
      <div className="space-y-4">
        <div className="relative group">
          <Input
            type="text"
            placeholder="What do you want to research?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            className="relative w-full h-14 px-6 text-base bg-[#32533B] border-[0.5px] border-white rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/70 transition-all duration-300"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 text-xs font-medium opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
            Enter to search
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <textarea
              placeholder="Add specific instructions or refine your search (optional)..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-4 min-h-24 bg-[#32533B] border-[0.5px] border-white rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/70 resize-none transition-all duration-200"
            />

            <div>
              <label className="text-xs font-semibold text-white/80 mb-3 block tracking-wider uppercase">
                Website Types
              </label>
              <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDropdown}
                    className="w-full justify-between h-12 bg-[#32533B] border-white/50 text-white hover:bg-[#32533B]/80"
                  >
                    <span className="truncate">{getSelectedLabels() || "Select website types..."}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search website types..." />
                    <CommandEmpty>No website type found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {websiteOptions.map((option) => (
                        <CommandItem
                          key={option.id}
                          onSelect={() => toggleWebsite(option.id)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedWebsites.includes(option.id) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 mb-3 block tracking-wider uppercase">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="h-11 text-sm bg-[#32533B] border-[0.5px] border-white rounded-lg text-white focus:border-white/70 transition-all"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="h-11 text-sm bg-[#32533B] border-[0.5px] border-white rounded-lg text-white focus:border-white/70 transition-all"
                />
              </div>
            </div>

            <div className="pt-3">
              <Button
                onClick={handleSearch}
                className="w-full h-11 font-semibold border-[0.5px] border-white rounded-lg bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
              >
                Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}