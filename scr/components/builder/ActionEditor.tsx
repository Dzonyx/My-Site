import { ComponentAction, Screen } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface ActionEditorProps {
  actions: ComponentAction[];
  screens: Screen[];
  onUpdate: (actions: ComponentAction[]) => void;
}

export const ActionEditor = ({ actions, screens, onUpdate }: ActionEditorProps) => {
  const handleAddAction = () => {
    onUpdate([...actions, { type: 'navigate' }]);
  };

  const handleUpdateAction = (index: number, updates: Partial<ComponentAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    onUpdate(newActions);
  };

  const handleDeleteAction = (index: number) => {
    onUpdate(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Actions</label>
        <Button size="sm" variant="outline" onClick={handleAddAction}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {actions.map((action, index) => (
        <div key={index} className="flex gap-2 p-3 border border-border rounded-lg bg-muted/30">
          <div className="flex-1 space-y-2">
            <Select value={action.type} onValueChange={(value: ComponentAction['type']) => handleUpdateAction(index, { type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="navigate">Navigate</SelectItem>
                <SelectItem value="submit">Submit</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>

            {action.type === 'navigate' && (
              <Select 
                value={action.targetScreenId || "none"} 
                onValueChange={(value) => handleUpdateAction(index, { targetScreenId: value === "none" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select screen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select screen</SelectItem>
                  {screens.map((screen) => (
                    <SelectItem key={screen.id} value={screen.id}>
                      {screen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button size="sm" variant="ghost" onClick={() => handleDeleteAction(index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
