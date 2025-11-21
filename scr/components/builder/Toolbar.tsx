import { Button } from "@/components/ui/button";
import { Play, Square, Save, Upload, Download } from "lucide-react";
import { useState } from "react";
import { PublishDialog } from "./PublishDialog";
import { DownloadDialog } from "./DownloadDialog";

interface ToolbarProps {
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
}

export const Toolbar = ({ isPreviewMode, onTogglePreview, onSave }: ToolbarProps) => {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  return (
    <>
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          No Code Builder
        </h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button variant="outline" onClick={() => setDownloadDialogOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button variant="outline" onClick={() => setPublishDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>
          
          <Button onClick={onTogglePreview}>
            {isPreviewMode ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>
      
      <PublishDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen} />
      <DownloadDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen} />
    </>
  );
};

