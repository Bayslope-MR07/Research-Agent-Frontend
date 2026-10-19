import { Button } from "@/components/ui/button"

interface HeaderProps {
  onNewChat: () => void
}

export default function Header({ onNewChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#172D13]/90 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white">
              SearchAI
            </h1>
            <p className="text-xs text-white/70">Powered by Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button
            onClick={onNewChat}
            variant="outline"
            className="h-9 px-4 font-medium border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          >
            New Chat
          </Button>
        </div>
      </div>
    </header>
  )
}