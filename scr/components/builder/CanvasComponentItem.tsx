import { CanvasComponent, Database, Screen } from "@/types/builder";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CanvasComponentItemProps {
  component: CanvasComponent;
  isSelected: boolean;
  isPreview: boolean;
  databases: Database[];
  screens: Screen[];
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasComponent>) => void;
  onNavigate: (screenId: string) => void;
}

export const CanvasComponentItem = ({
  component,
  isSelected,
  isPreview,
  databases,
  screens,
  onSelect,
  onUpdate,
  onNavigate,
}: CanvasComponentItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [displayContent, setDisplayContent] = useState(component.content || '');

  useEffect(() => {
    const loadDatabaseContent = async () => {
      if (component.databaseConnection && (component.type === 'text' || component.type === 'image')) {
        const db = databases.find(d => d.id === component.databaseConnection!.databaseId);
        if (db && db.records && db.records.length > 0) {
          const recordIndex = component.databaseConnection.recordIndex || 0;
          const record = db.records[recordIndex];
          if (record) {
            const fieldValue = record.data[component.databaseConnection.fieldName];
            setDisplayContent(fieldValue || component.content || '');
          }
        }
      } else {
        setDisplayContent(component.content || '');
      }
    };

    loadDatabaseContent();
  }, [component, databases]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - component.x, y: e.clientY - component.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onUpdate]);

  const handleClick = async () => {
    if (isPreview && component.actions) {
      for (const action of component.actions) {
        if (action.type === 'navigate' && action.targetScreenId) {
          onNavigate(action.targetScreenId);
        } else if (action.type === 'login') {
          // Sign in anonymously and navigate to home screen
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            toast.error("Login failed");
          } else {
            const homeScreen = screens.find(s => s.isDefaultLoggedIn);
            if (homeScreen) {
              onNavigate(homeScreen.id);
            }
            toast.success("Logged in");
          }
        } else if (action.type === 'logout') {
          // Sign out and navigate to login screen
          const { error } = await supabase.auth.signOut();
          if (error) {
            toast.error("Logout failed");
          } else {
            const loginScreen = screens.find(s => s.isDefaultLoggedOut);
            if (loginScreen) {
              onNavigate(loginScreen.id);
            }
            toast.success("Logged out");
          }
        }
      }
    }
  };

  const baseStyles = {
    position: 'absolute' as const,
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
    backgroundColor: component.styles?.backgroundColor,
    color: component.styles?.color,
    fontSize: component.styles?.fontSize,
    borderRadius: component.styles?.borderRadius,
    border: isSelected && !isPreview ? '2px solid #8B5CF6' : 'none',
    cursor: isPreview ? (component.actions?.length ? 'pointer' : 'default') : 'move',
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'button':
        return (
          <button
            style={baseStyles}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            className="flex items-center justify-center font-medium"
          >
            {displayContent || 'Button'}
          </button>
        );

      case 'text':
        return (
          <div
            style={baseStyles}
            onMouseDown={handleMouseDown}
            className="flex items-center justify-center"
          >
            {displayContent || 'Text'}
          </div>
        );

      case 'input':
        return (
          <input
            style={baseStyles}
            onMouseDown={handleMouseDown}
            placeholder={displayContent || 'Input'}
            className="px-3"
            disabled={!isPreview}
          />
        );

      case 'image':
        return (
          <img
            src={displayContent || 'https://via.placeholder.com/150'}
            alt="Component"
            style={baseStyles}
            onMouseDown={handleMouseDown}
            className="object-cover"
          />
        );

      case 'container':
        return (
          <div
            style={baseStyles}
            onMouseDown={handleMouseDown}
            className="border-2 border-dashed border-gray-300"
          />
        );

      default:
        return null;
    }
  };

  return renderComponent();
};
