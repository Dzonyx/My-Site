import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Screen, Database, CanvasComponent, DatabaseRecord, ComponentType } from "@/types/builder";
import { toast } from "sonner";

export const useBuilderData = (projectId?: string) => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      
      const { data: screensData, error: screensError } = await (supabase as any)
        .from('builder_screens')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (screensError) throw screensError;

      const screensWithComponents: Screen[] = await Promise.all(
        (screensData || []).map(async (screen: any) => {
          const { data: components, error: componentsError } = await (supabase as any)
            .from('builder_components')
            .select('*')
            .eq('screen_id', screen.id);

          if (componentsError) throw componentsError;

           return {
             id: screen.id,
             name: screen.name,
             isDefaultLoggedIn: screen.is_default_logged_in,
             isDefaultLoggedOut: screen.is_default_logged_out,
             isHome: screen.is_home,
             components: (components || []).map((c: any) => ({
               id: c.component_id,
               type: c.type as ComponentType,
               content: c.content || undefined,
               x: c.x,
               y: c.y,
               width: c.width,
               height: c.height,
               styles: c.styles as any,
               actions: c.actions as any,
               databaseConnection: c.database_connection as any,
             })),
           };
        })
      );

      if (screensWithComponents.length === 0) {
        const defaultScreen: Screen = {
          id: crypto.randomUUID(),
          name: 'Home',
          components: [],
        };
        setScreens([defaultScreen]);
        if (projectId) {
          await saveScreen(defaultScreen, projectId);
        }
      } else {
        setScreens(screensWithComponents);
      }

       const { data: dbData, error: dbError } = await (supabase as any)
         .from('builder_databases')
         .select('*')
         .eq('project_id', projectId);

       if (dbError) throw dbError;

       const databasesWithRecords: Database[] = await Promise.all(
         (dbData || []).map(async (db: any) => {
           const { data: records, error: recordsError } = await (supabase as any)
             .from('builder_database_records')
             .select('*')
             .eq('database_id', db.database_id);

          if (recordsError) throw recordsError;

           return {
             id: db.database_id,
             name: db.name,
             fields: db.fields as any,
             records: (records || []).map((r: any) => ({
               id: r.record_id,
               data: r.data as any,
             })),
           };
        })
      );

      setDatabases(databasesWithRecords);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      
      const defaultScreen: Screen = {
        id: crypto.randomUUID(),
        name: 'Home',
        components: [],
      };
      setScreens([defaultScreen]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveScreen = async (screen: Screen, projectId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('builder_screens')
        .upsert({
          id: screen.id,
          name: screen.name,
          project_id: projectId,
          is_default_logged_in: screen.isDefaultLoggedIn || false,
          is_default_logged_out: screen.isDefaultLoggedOut || false,
          is_home: screen.isHome || false,
        });

      if (error) throw error;

      await (supabase as any)
        .from('builder_components')
        .delete()
        .eq('screen_id', screen.id);

      if (screen.components.length > 0) {
        await (supabase as any)
          .from('builder_components')
          .insert(
            screen.components.map(component => ({
              component_id: component.id,
              screen_id: screen.id,
              type: component.type,
              content: component.content || null,
              x: component.x,
              y: component.y,
              width: component.width,
              height: component.height,
              styles: (component.styles || null) as any,
              actions: (component.actions || null) as any,
              database_connection: (component.databaseConnection || null) as any,
            }))
          );
      }
    } catch (error) {
      console.error("Error saving screen:", error);
      throw error;
    }
  };

  const saveDatabase = async (database: Database, projectId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('builder_databases')
        .upsert({
          database_id: database.id,
          name: database.name,
          project_id: projectId,
          fields: (database.fields || []) as any,
        });

      if (error) throw error;

      await (supabase as any)
        .from('builder_database_records')
        .delete()
        .eq('database_id', database.id);

      if (database.records && database.records.length > 0) {
        await (supabase as any)
          .from('builder_database_records')
          .insert(
            database.records.map(record => ({
              record_id: record.id,
              database_id: database.id,
              data: record.data as any,
            }))
          );
      }
    } catch (error) {
      console.error("Error saving database:", error);
      throw error;
    }
  };

  return {
    screens,
    databases,
    isLoading,
    setScreens,
    setDatabases,
    saveScreen,
    saveDatabase,
    reloadData: loadData,
  };
};
