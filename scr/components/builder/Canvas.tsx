import { useState } from "react";
import { CanvasComponent, ComponentType, Database, Screen } from "@/types/builder";
import { CanvasComponentItem } from "./CanvasComponentItem";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasProps {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  isPreviewMode: boolean;
  draggedType: ComponentType | null;
  canvasSize: 'mobile' | 'tablet' | 'desktop';
  clickToPlaceType: ComponentType | null;
  databases: Database[];
  screens: Screen[];
  currentScreen?: Screen | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  onAddComponent: (component: CanvasComponent) => void;
  onNavigateToScreen: (screenId: string) => void;
  onCanvasSizeChange: (size: 'mobile' | 'tablet' | 'desktop') => void;
  onCancelClickToPlace: () => void;
}

export const Canvas = ({
  components,
  selectedComponentId,
  isPreviewMode,
  draggedType,
  canvasSize,
  clickToPlaceType,
  databases,
  screens,
  currentScreen,
  onSelectComponent,
  onUpdateComponent,
  onAddComponent,
  onNavigateToScreen,
  onCanvasSizeChange,
  onCancelClickToPlace,
}: CanvasProps) => {
  const canvasSizes = {
    mobile: { width: 375, height: 667, icon: Smartphone },
    tablet: { width: 768, height: 1024, icon: Tablet },
    desktop: { width: 1200, height: 800, icon: Monitor },
  };

  const currentSize = canvasSizes[canvasSize];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }

    if (clickToPlaceType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const defaultSizes = {
        button: { width: 120, height: 40 },
        text: { width: 200, height: 30 },
        input: { width: 200, height: 40 },
        image: { width: 150, height: 150 },
        container: { width: 300, height: 200 },
      };

      const size = defaultSizes[clickToPlaceType];
      
      onAddComponent({
        id: crypto.randomUUID(),
        type: clickToPlaceType,
        x: x - size.width / 2,
        y: y - size.height / 2,
        width: size.width,
        height: size.height,
        content: clickToPlaceType === 'button' ? 'Button' : clickToPlaceType === 'text' ? 'Text' : '',
        styles: {
          backgroundColor: clickToPlaceType === 'button' ? '#8B5CF6' : '#ffffff',
          color: clickToPlaceType === 'button' ? '#ffffff' : '#000000',
          fontSize: 16,
          borderRadius: clickToPlaceType === 'button' ? 6 : 0,
        },
      });

      onCancelClickToPlace();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!draggedType) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const defaultSizes = {
      button: { width: 120, height: 40 },
      text: { width: 200, height: 30 },
      input: { width: 200, height: 40 },
      image: { width: 150, height: 150 },
      container: { width: 300, height: 200 },
    };

    const size = defaultSizes[draggedType];

    onAddComponent({
      id: crypto.randomUUID(),
      type: draggedType,
      x: x - size.width / 2,
      y: y - size.height / 2,
      width: size.width,
      height: size.height,
      content: draggedType === 'button' ? 'Button' : draggedType === 'text' ? 'Text' : '',
      styles: {
        backgroundColor: draggedType === 'button' ? '#8B5CF6' : '#ffffff',
        color: draggedType === 'button' ? '#ffffff' : '#000000',
        fontSize: 16,
        borderRadius: draggedType === 'button' ? 6 : 0,
      },
    });
  };

  return (
    <div className="flex-1 bg-muted/30 p-4 overflow-auto">
      <div className="flex justify-center gap-2 mb-4">
        {(Object.keys(canvasSizes) as Array<keyof typeof canvasSizes>).map((size) => {
          const Icon = canvasSizes[size].icon;
          return (
            <Button
              key={size}
              variant={canvasSize === size ? "default" : "outline"}
              size="sm"
              onClick={() => onCanvasSizeChange(size)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <div
          className="bg-white shadow-lg relative overflow-hidden"
          style={{
            width: currentSize.width,
            height: currentSize.height,
            cursor: clickToPlaceType ? 'crosshair' : 'default',
            backgroundColor: currentScreen?.backgroundColor || '#ffffff',
            backgroundImage: currentScreen?.backgroundImage 
              ? `url(${currentScreen.backgroundImage})` 
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {components.map((component) => (
            <CanvasComponentItem
              key={component.id}
              component={component}
              isSelected={component.id === selectedComponentId}
              isPreview={isPreviewMode}
              databases={databases}
              screens={screens}
              onSelect={() => onSelectComponent(component.id)}
              onUpdate={(updates) => onUpdateComponent(component.id, updates)}
              onNavigate={onNavigateToScreen}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
