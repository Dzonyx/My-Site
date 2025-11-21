import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ComponentLibrary } from "@/components/builder/ComponentLibrary";
import { Canvas } from "@/components/builder/Canvas";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { Toolbar } from "@/components/builder/Toolbar";
import { ScreensPanel } from "@/components/builder/ScreensPanel";
import { DatabasePanel } from "@/components/builder/DatabasePanel";
import { ComponentType, CanvasComponent, Screen, Database } from "@/types/builder";
import { useBuilderData } from "@/hooks/useBuilderData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Builder = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { screens, databases, isLoading, setScreens, setDatabases, saveScreen, saveDatabase } = useBuilderData(projectId);
  
  const [currentScreenId, setCurrentScreenId] = useState<string>("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [canvasSize, setCanvasSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [clickToPlaceType, setClickToPlaceType] = useState<ComponentType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setIsLoggedIn(!!session);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsLoggedIn(true);
      }
    });

    return () => subscription.unsubscribe();
  };

  useEffect(() => {
    if (screens.length > 0 && !currentScreenId) {
      setCurrentScreenId(screens[0].id);
    }
  }, [screens, currentScreenId]);

  const currentScreen = screens.find(s => s.id === currentScreenId);
  const selectedComponent = currentScreen?.components.find(c => c.id === selectedComponentId) || null;

  const handleDragStart = (type: ComponentType) => {
    setDraggedType(type);
    setClickToPlaceType(null);
  };

  const handleClickToPlace = (type: ComponentType) => {
    setClickToPlaceType(type);
    setDraggedType(null);
  };

  const handleAddComponent = (component: CanvasComponent) => {
    if (!currentScreen) return;
    
    const updatedScreens = screens.map(s =>
      s.id === currentScreenId
        ? { ...s, components: [...s.components, component] }
        : s
    );
    setScreens(updatedScreens);
    setSelectedComponentId(component.id);
    setHasUnsavedChanges(true);
  };

  const handleUpdateComponent = (id: string, updates: Partial<CanvasComponent>) => {
    if (!currentScreen) return;
    
    const updatedScreens = screens.map(s =>
      s.id === currentScreenId
        ? {
            ...s,
            components: s.components.map(c =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }
        : s
    );
    setScreens(updatedScreens);
    setHasUnsavedChanges(true);
  };

  const handleDeleteComponent = (id: string) => {
    if (!currentScreen) return;
    
    const updatedScreens = screens.map(s =>
      s.id === currentScreenId
        ? {
            ...s,
            components: s.components.filter(c => c.id !== id),
          }
        : s
    );
    setScreens(updatedScreens);
    setSelectedComponentId(null);
    setHasUnsavedChanges(true);
  };

  const handleAddScreen = (screen: Screen) => {
    setScreens([...screens, screen]);
    setCurrentScreenId(screen.id);
    setHasUnsavedChanges(true);
  };

  const handleDeleteScreen = (id: string) => {
    if (screens.length === 1) {
      toast.error("Cannot delete the last screen");
      return;
    }
    
    const updatedScreens = screens.filter(s => s.id !== id);
    setScreens(updatedScreens);
    
    if (currentScreenId === id) {
      setCurrentScreenId(updatedScreens[0].id);
    }
    
    setHasUnsavedChanges(true);
    toast.success("Screen deleted");
  };

  const handleUpdateScreen = (id: string, updates: Partial<Screen>) => {
    setScreens(screens.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasUnsavedChanges(true);
  };

  const handleAddDatabase = (database: Database) => {
    setDatabases([...databases, database]);
    setHasUnsavedChanges(true);
  };

  const handleUpdateDatabase = (id: string, updates: Partial<Database>) => {
    setDatabases(databases.map(db => db.id === id ? { ...db, ...updates } : db));
    setHasUnsavedChanges(true);
  };

  const handleDeleteDatabase = (id: string) => {
    setDatabases(databases.filter(db => db.id !== id));
    setHasUnsavedChanges(true);
    toast.success("Database deleted");
  };

  const handleSaveRecord = (databaseId: string, data: Record<string, any>) => {
    const recordId = crypto.randomUUID();
    setDatabases(databases.map(db =>
      db.id === databaseId
        ? {
            ...db,
            records: [...(db.records || []), { id: recordId, data }],
          }
        : db
    ));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    try {
      for (const screen of screens) {
        await saveScreen(screen, projectId);
      }
      for (const db of databases) {
        await saveDatabase(db, projectId);
      }
      setHasUnsavedChanges(false);
      toast.success("Saved successfully");
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleBackToProjects = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("/projects");
      setShowUnsavedDialog(true);
    } else {
      navigate("/projects");
    }
  };

  const handleSaveAndNavigate = async () => {
    await handleSave();
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleDiscardAndNavigate = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
  };

  const handleNavigateToScreen = (screenId: string) => {
    setCurrentScreenId(screenId);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  const handleTogglePreview = () => {
    if (!isPreviewMode) {
      let defaultScreen;
      
      if (isLoggedIn) {
        defaultScreen = screens.find(s => s.isDefaultLoggedIn);
      } else {
        defaultScreen = screens.find(s => s.isDefaultLoggedOut) || 
                       screens.find(s => s.isDefaultLoggedIn);
      }
      
      if (defaultScreen) {
        setCurrentScreenId(defaultScreen.id);
      }
    }
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBackToProjects}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
        </div>
        
        <Toolbar
          isPreviewMode={isPreviewMode}
          onTogglePreview={handleTogglePreview}
          onSave={handleSave}
        />

        <div className="flex flex-1 overflow-hidden">
          {!isPreviewMode && (
            <>
              <ScreensPanel
                screens={screens}
                currentScreenId={currentScreenId}
                onSelectScreen={setCurrentScreenId}
                onAddScreen={handleAddScreen}
                onDeleteScreen={handleDeleteScreen}
                onUpdateScreen={handleUpdateScreen}
              />
              <ComponentLibrary
                onDragStart={handleDragStart}
                onClickToPlace={handleClickToPlace}
              />
            </>
          )}

          <Canvas
            components={currentScreen?.components || []}
            selectedComponentId={selectedComponentId}
            isPreviewMode={isPreviewMode}
            draggedType={draggedType}
            canvasSize={canvasSize}
            clickToPlaceType={clickToPlaceType}
            databases={databases}
            screens={screens}
            currentScreen={currentScreen}
            onSelectComponent={setSelectedComponentId}
            onUpdateComponent={handleUpdateComponent}
            onAddComponent={handleAddComponent}
            onNavigateToScreen={handleNavigateToScreen}
            onCanvasSizeChange={setCanvasSize}
            onCancelClickToPlace={() => setClickToPlaceType(null)}
          />

          {!isPreviewMode && (
            <PropertiesPanel
              selectedComponent={selectedComponent}
              currentScreen={currentScreen || null}
              screens={screens}
              databases={databases}
              onUpdateComponent={handleUpdateComponent}
              onDeleteComponent={handleDeleteComponent}
              onUpdateScreen={handleUpdateScreen}
            />
          )}
        </div>

        {!isPreviewMode && (
          <DatabasePanel
            databases={databases}
            onAddDatabase={handleAddDatabase}
            onUpdateDatabase={handleUpdateDatabase}
            onDeleteDatabase={handleDeleteDatabase}
            onSaveRecord={handleSaveRecord}
          />
        )}
      </div>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardAndNavigate}>
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndNavigate}>
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Builder;
