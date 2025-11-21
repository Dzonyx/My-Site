import { CanvasComponent, Screen, Database } from "@/types/builder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Database as DatabaseIcon, Upload, Trash2 } from "lucide-react";
import { ActionEditor } from "./ActionEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface PropertiesPanelProps {
  selectedComponent: CanvasComponent | null;
  currentScreen: Screen | null;
  screens: Screen[];
  databases: Database[];
  onUpdateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateScreen?: (id: string, updates: Partial<Screen>) => void;
}

export const PropertiesPanel = ({
  selectedComponent,
  currentScreen,
  screens,
  databases,
  onUpdateComponent,
  onDeleteComponent,
  onUpdateScreen,
}: PropertiesPanelProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');

  const handleImageUpload = async (file: File) => {
    if (!selectedComponent) return;
    
    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('builder-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('builder-images').getPublicUrl(filePath);

      onUpdateComponent(selectedComponent.id, { content: data.publicUrl });
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (!selectedComponent) {
    return (
      <div className="w-72 bg-card border-l border-border p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Screen Properties</h2>
        </div>
        
        {currentScreen && onUpdateScreen ? (
          <div className="space-y-6">
            <div>
              <Label>Screen Name</Label>
              <Input
                value={currentScreen.name}
                onChange={(e) => onUpdateScreen(currentScreen.id, { name: e.target.value })}
                placeholder="Enter screen name..."
              />
            </div>

            <div>
              <Label>Background Color</Label>
              <Input
                type="color"
                value={currentScreen.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdateScreen(currentScreen.id, { backgroundColor: e.target.value })}
              />
            </div>

            <div>
              <Label>Background Image URL</Label>
              <Input
                value={currentScreen.backgroundImage || ''}
                onChange={(e) => onUpdateScreen(currentScreen.id, { backgroundImage: e.target.value })}
                placeholder="https://..."
              />
              {currentScreen.backgroundImage && (
                <p className="text-xs text-muted-foreground mt-1">
                  Background image will overlay the background color
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        )}
      </div>
    );
  }

  const updateStyles = (styleUpdates: Partial<CanvasComponent['styles']>) => {
    onUpdateComponent(selectedComponent.id, {
      styles: { ...selectedComponent.styles, ...styleUpdates }
    });
  };

  const updateDatabaseConnection = (updates: Partial<CanvasComponent['databaseConnection']>) => {
    onUpdateComponent(selectedComponent.id, {
      databaseConnection: { ...selectedComponent.databaseConnection, ...updates } as any
    });
  };

  return (
    <div className="w-72 bg-card border-l border-border p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Properties</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteComponent(selectedComponent.id)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-6">
        {(selectedComponent.type === 'text' || selectedComponent.type === 'button' || selectedComponent.type === 'input') && (
          <div>
            <Label>Content</Label>
            <Input
              value={selectedComponent.content || ''}
              onChange={(e) => onUpdateComponent(selectedComponent.id, { content: e.target.value })}
              placeholder="Enter text..."
            />
          </div>
        )}

        {selectedComponent.type === 'image' && (
          <div className="space-y-2">
            <Label>Image Source</Label>
            <Select
              value={imageInputType}
              onValueChange={(value: 'url' | 'upload') => setImageInputType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">Image URL</SelectItem>
                <SelectItem value="upload">Upload File</SelectItem>
              </SelectContent>
            </Select>
            {imageInputType === 'upload' ? (
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={uploadingImage}
              />
            ) : (
              <Input
                value={selectedComponent.content || ''}
                onChange={(e) => onUpdateComponent(selectedComponent.id, { content: e.target.value })}
                placeholder="https://..."
              />
            )}
          </div>
        )}

        <div>
          <Label>Background Color</Label>
          <Input
            type="color"
            value={selectedComponent.styles?.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
          />
        </div>

        {selectedComponent.type !== 'image' && (
          <div>
            <Label>Text Color</Label>
            <Input
              type="color"
              value={selectedComponent.styles?.color || '#000000'}
              onChange={(e) => updateStyles({ color: e.target.value })}
            />
          </div>
        )}

        <div>
          <Label>Font Size: {selectedComponent.styles?.fontSize || 16}px</Label>
          <Slider
            value={[selectedComponent.styles?.fontSize || 16]}
            onValueChange={([value]) => updateStyles({ fontSize: value })}
            min={8}
            max={72}
            step={1}
          />
        </div>

        <div>
          <Label>Border Radius: {selectedComponent.styles?.borderRadius || 0}px</Label>
          <Slider
            value={[selectedComponent.styles?.borderRadius || 0]}
            onValueChange={([value]) => updateStyles({ borderRadius: value })}
            min={0}
            max={50}
            step={1}
          />
        </div>

        {(selectedComponent.type === 'text' || selectedComponent.type === 'image') && databases.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <DatabaseIcon className="w-4 h-4 text-primary" />
              <Label>Database Connection</Label>
            </div>

            <Select
              value={selectedComponent.databaseConnection?.databaseId || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  onUpdateComponent(selectedComponent.id, { databaseConnection: undefined });
                } else {
                  updateDatabaseConnection({ databaseId: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No database</SelectItem>
                {databases.map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    {db.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedComponent.databaseConnection && (
              <Select
                value={selectedComponent.databaseConnection.fieldName || "none"}
                onValueChange={(value) => updateDatabaseConnection({ fieldName: value === "none" ? "" : value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select field</SelectItem>
                  {databases
                    .find(db => db.id === selectedComponent.databaseConnection?.databaseId)
                    ?.fields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {(selectedComponent.type === 'button') && (
          <div className="pt-4 border-t border-border">
            <ActionEditor
              actions={selectedComponent.actions || []}
              screens={screens}
              onUpdate={(actions) => onUpdateComponent(selectedComponent.id, { actions })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
