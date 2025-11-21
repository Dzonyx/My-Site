import { ComponentType } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Type, Square, Image, Box, MousePointerClick } from "lucide-react";

interface ComponentLibraryProps {
  onDragStart: (type: ComponentType) => void;
  onClickToPlace: (type: ComponentType) => void;
}

export const ComponentLibrary = ({ onDragStart, onClickToPlace }: ComponentLibraryProps) => {
  const components: { type: ComponentType; label: string; icon: React.ReactNode }[] = [
    { type: 'button', label: 'Button', icon: <MousePointerClick className="w-5 h-5" /> },
    { type: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
    { type: 'input', label: 'Input', icon: <Square className="w-5 h-5" /> },
    { type: 'image', label: 'Image', icon: <Image className="w-5 h-5" /> },
    { type: 'container', label: 'Container', icon: <Box className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-card border-r border-border p-4">
      <h2 className="font-semibold mb-4 text-lg">Components</h2>
      <div className="space-y-2">
        {components.map((comp) => (
          <Button
            key={comp.type}
            variant="outline"
            className="w-full justify-start h-12 hover:bg-primary/10 transition-colors"
            onMouseDown={() => onDragStart(comp.type)}
            onClick={() => onClickToPlace(comp.type)}
          >
            <div className="flex items-center gap-3">
              {comp.icon}
              <span className="font-medium">{comp.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
