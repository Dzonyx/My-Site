import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Code, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DownloadDialog = ({ open, onOpenChange }: DownloadDialogProps) => {
  const { toast } = useToast();

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCode = async () => {
    try {
      toast({
        title: "Preparing Download",
        description: "Fetching your app configuration...",
      });

      // Fetch screens with components
      const { data: screensData, error: screensError } = await (supabase as any)
        .from('builder_screens')
        .select('*');

      if (screensError) throw screensError;

      const screensWithComponents = await Promise.all(
        (screensData || []).map(async (screen: any) => {
          const { data: components } = await (supabase as any)
            .from('builder_components')
            .select('*')
            .eq('screen_id', screen.id);

          return {
            ...screen,
            components: components || []
          };
        })
      );

      // Fetch databases with records
      const { data: dbData, error: dbError } = await (supabase as any)
        .from('builder_databases')
        .select('*');

      if (dbError) throw dbError;

      const databasesWithRecords = await Promise.all(
        (dbData || []).map(async (db: any) => {
          const { data: records } = await (supabase as any)
            .from('builder_database_records')
            .select('*')
            .eq('database_id', db.database_id);

          return {
            ...db,
            records: records || []
          };
        })
      );

      const appConfig = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        screens: screensWithComponents,
        databases: databasesWithRecords
      };

      downloadFile(
        JSON.stringify(appConfig, null, 2),
        `app-config-${Date.now()}.json`,
        'application/json'
      );

      toast({
        title: "Download Complete",
        description: "Your app configuration has been downloaded",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download app configuration",
        variant: "destructive"
      });
    }
  };

  const handleDownloadApp = async () => {
    try {
      toast({
        title: "Preparing Download",
        description: "Building your app...",
      });

      // Fetch screens with components
      const { data: screensData, error: screensError } = await (supabase as any)
        .from('builder_screens')
        .select('*');

      if (screensError) throw screensError;

      const screensWithComponents = await Promise.all(
        (screensData || []).map(async (screen: any) => {
          const { data: components } = await (supabase as any)
            .from('builder_components')
            .select('*')
            .eq('screen_id', screen.id);

          return {
            ...screen,
            components: components || []
          };
        })
      );

      // Generate HTML
      const html = generateAppHTML(screensWithComponents);

      downloadFile(
        html,
        `app-bundle-${Date.now()}.html`,
        'text/html'
      );

      toast({
        title: "Download Complete",
        description: "Your app has been downloaded as an HTML file",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to build app",
        variant: "destructive"
      });
    }
  };

  const generateAppHTML = (screens: any[]) => {
    const screensHTML = screens.map(screen => {
      const componentsHTML = (screen.components || []).map((comp: any) => {
        const styles = `
          position: absolute;
          left: ${comp.x}px;
          top: ${comp.y}px;
          width: ${comp.width}px;
          height: ${comp.height}px;
          ${comp.styles?.backgroundColor ? `background-color: ${comp.styles.backgroundColor};` : ''}
          ${comp.styles?.color ? `color: ${comp.styles.color};` : ''}
          ${comp.styles?.fontSize ? `font-size: ${comp.styles.fontSize}px;` : ''}
          ${comp.styles?.borderRadius ? `border-radius: ${comp.styles.borderRadius}px;` : ''}
        `;

        switch (comp.type) {
          case 'text':
            return `<div style="${styles}">${comp.content || 'Text'}</div>`;
          case 'button':
            return `<button style="${styles}">${comp.content || 'Button'}</button>`;
          case 'input':
            return `<input style="${styles}" placeholder="${comp.content || 'Input'}" />`;
          case 'image':
            return `<img style="${styles}" src="${comp.content || ''}" alt="Image" />`;
          case 'container':
            return `<div style="${styles}"></div>`;
          default:
            return '';
        }
      }).join('\n');

      return `
        <div class="screen" data-screen-id="${screen.id}" style="display: none; position: relative; width: 100%; height: 100vh;">
          <h2 style="padding: 20px;">${screen.name}</h2>
          ${componentsHTML}
        </div>
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>No Code Builder App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    button { cursor: pointer; border: 1px solid #ccc; }
    input { border: 1px solid #ccc; padding: 8px; }
  </style>
</head>
<body>
  ${screensHTML}
  <script>
    const screens = document.querySelectorAll('.screen');
    if (screens.length > 0) {
      screens[0].style.display = 'block';
    }

    function navigateToScreen(screenId) {
      screens.forEach(s => s.style.display = 'none');
      const target = document.querySelector('[data-screen-id="' + screenId + '"]');
      if (target) target.style.display = 'block';
    }
  </script>
</body>
</html>`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Download Your App</DialogTitle>
          <DialogDescription>
            Choose what you want to download
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            onClick={handleDownloadCode}
            className="h-24 flex-col gap-2"
            variant="outline"
          >
            <Code className="w-8 h-8" />
            <div className="text-center">
              <div className="font-semibold">Download Code</div>
              <div className="text-sm text-muted-foreground">
                Get the source code of your app
              </div>
            </div>
          </Button>

          <Button
            onClick={handleDownloadApp}
            className="h-24 flex-col gap-2"
            variant="outline"
          >
            <Package className="w-8 h-8" />
            <div className="text-center">
              <div className="font-semibold">Download App</div>
              <div className="text-sm text-muted-foreground">
                Get the built app ready to use
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
