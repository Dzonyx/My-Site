import { Screen } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Monitor, Home, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScreensPanelProps {
  screens: Screen[];
  currentScreenId: string;
  onSelectScreen: (id: string) => void;
  onAddScreen: (screen: Screen) => void;
  onDeleteScreen: (id: string) => void;
  onUpdateScreen: (id: string, updates: Partial<Screen>) => void;
}

export const ScreensPanel = ({
  screens,
  currentScreenId,
  onSelectScreen,
  onAddScreen,
  onDeleteScreen,
  onUpdateScreen,
}: ScreensPanelProps) => {
  const [newScreenName, setNewScreenName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddScreen = () => {
    if (!newScreenName.trim()) {
      toast.error("Screen name is required");
      return;
    }

    const newScreen: Screen = {
      id: crypto.randomUUID(),
      name: newScreenName,
      components: [],
    };

    onAddScreen(newScreen);
    setNewScreenName("");
    setIsAdding(false);
    toast.success("Screen added successfully");
  };

  return (
    <div className="w-64 bg-card border-r border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Screens</h2>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 space-y-2">
          <Input
            placeholder="Screen name"
            value={newScreenName}
            onChange={(e) => setNewScreenName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddScreen()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddScreen} className="flex-1">
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              currentScreenId === screen.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-muted/50'
            }`}
            onClick={() => onSelectScreen(screen.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span className="font-medium text-sm">{screen.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={screen.isDefaultLoggedIn ? "default" : "ghost"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateScreen(screen.id, { isDefaultLoggedIn: !screen.isDefaultLoggedIn });
                          toast.success(screen.isDefaultLoggedIn ? "Home screen unmarked" : "Set as home screen");
                        }}
                      >
                        <Home className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Home screen (when logged in)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={screen.isDefaultLoggedOut ? "default" : "ghost"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateScreen(screen.id, { isDefaultLoggedOut: !screen.isDefaultLoggedOut });
                          toast.success(screen.isDefaultLoggedOut ? "Login screen unmarked" : "Set as login screen");
                        }}
                      >
                        <LogIn className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Login screen (when logged out)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {screens.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScreen(screen.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
