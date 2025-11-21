import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PublishDialog = ({ open, onOpenChange }: PublishDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-5 h-5" />
            Publish to App Stores
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Publishing functionality coming soon
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center space-y-4">
          <div className="text-6xl">🚀</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Direct publishing to Google Play and App Store will be available soon.
            </p>
            <p className="text-xs text-muted-foreground">
              For now, use the Download option to get your app files.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
