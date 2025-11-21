import { useState } from "react";
import { Database, DatabaseField } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Database as DatabaseIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DatabasePanelProps {
  databases: Database[];
  onAddDatabase: (database: Database) => void;
  onUpdateDatabase: (id: string, updates: Partial<Database>) => void;
  onDeleteDatabase: (id: string) => void;
  onSaveRecord: (databaseId: string, data: Record<string, any>) => void;
}

export const DatabasePanel = ({
  databases,
  onAddDatabase,
  onUpdateDatabase,
  onDeleteDatabase,
  onSaveRecord,
}: DatabasePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDbName, setNewDbName] = useState("");
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<DatabaseField['type']>("text");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [imageInputType, setImageInputType] = useState<Record<string, 'url' | 'upload'>>({});

  const handleCreateDatabase = () => {
    if (!newDbName.trim()) {
      toast.error("Database name is required");
      return;
    }

    const newDb: Database = {
      id: crypto.randomUUID(),
      name: newDbName,
      fields: [],
      records: [],
    };

    onAddDatabase(newDb);
    setNewDbName("");
    toast.success("Database created");
  };

  const handleAddField = () => {
    if (!selectedDb || !newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    const db = databases.find(d => d.id === selectedDb);
    if (db) {
      const newField: DatabaseField = {
        name: newFieldName,
        type: newFieldType,
      };

      onUpdateDatabase(selectedDb, {
        fields: [...db.fields, newField],
      });

      setNewFieldName("");
      setNewFieldType("text");
      toast.success("Field added");
    }
  };

  const handleImageUpload = async (file: File, databaseId: string, fieldName: string) => {
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

      setNewRecordData(prev => ({
        ...prev,
        [fieldName]: data.publicUrl,
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveRecord = () => {
    if (!selectedDb) return;

    if (uploadingImage) {
      toast.error("Please wait for image upload to complete");
      return;
    }

    const db = databases.find(d => d.id === selectedDb);
    if (db) {
      const hasAllFields = db.fields.every(field => {
        const value = newRecordData[field.name];
        return value !== undefined && value !== null && value !== '';
      });
      
      if (!hasAllFields) {
        toast.error("Please fill all fields");
        return;
      }

      onSaveRecord(selectedDb, newRecordData);
      setNewRecordData({});
      setImageInputType({});
      toast.success("Record saved");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed bottom-4 right-4 shadow-lg">
          <DatabaseIcon className="w-4 h-4 mr-2" />
          Databases
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Database Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Create New Database</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Database name"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
              />
              <Button onClick={handleCreateDatabase}>
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {databases.length > 0 && (
            <div>
              <Label>Select Database</Label>
              <Select value={selectedDb || "none"} onValueChange={(value) => setSelectedDb(value === "none" ? null : value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a database</SelectItem>
                  {databases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDb && (
            <>
              <div>
                <Label>Add Field</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Field name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                  <Select value={newFieldType} onValueChange={(value: DatabaseField['type']) => setNewFieldType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddField}>Add</Button>
                </div>
              </div>

              {databases.find(d => d.id === selectedDb)?.fields.length! > 0 && (
                <div>
                  <Label>Add Record</Label>
                  <div className="space-y-3 mt-2">
                    {databases.find(d => d.id === selectedDb)?.fields.map((field) => (
                      <div key={field.name}>
                        <Label className="text-sm">{field.name}</Label>
                        {field.type === 'image' ? (
                          <div className="mt-1 space-y-2">
                            <Select
                              value={imageInputType[field.name] || 'url'}
                              onValueChange={(value: 'url' | 'upload') => setImageInputType(prev => ({ ...prev, [field.name]: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="url">Image URL</SelectItem>
                                <SelectItem value="upload">Upload File</SelectItem>
                              </SelectContent>
                            </Select>
                            {imageInputType[field.name] === 'upload' ? (
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && selectedDb) {
                                    handleImageUpload(file, selectedDb, field.name);
                                  }
                                }}
                                disabled={uploadingImage}
                              />
                            ) : (
                              <Input
                                type="text"
                                value={newRecordData[field.name] || ''}
                                onChange={(e) => setNewRecordData(prev => ({
                                  ...prev,
                                  [field.name]: e.target.value,
                                }))}
                                placeholder="https://..."
                              />
                            )}
                          </div>
                        ) : (
                          <Input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={newRecordData[field.name] || ''}
                            onChange={(e) => setNewRecordData(prev => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))}
                            className="mt-1"
                          />
                        )}
                      </div>
                    ))}
                    <Button 
                      onClick={handleSaveRecord} 
                      className="w-full"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? "Uploading..." : "Save Record"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label>Fields</Label>
                </div>
                <div className="space-y-2">
                  {databases.find(d => d.id === selectedDb)?.fields.map((field) => (
                    <div key={field.name} className="p-2 bg-muted rounded flex justify-between items-center">
                      <span className="text-sm">
                        {field.name} ({field.type})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label>Records ({databases.find(d => d.id === selectedDb)?.records?.length || 0})</Label>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {databases.find(d => d.id === selectedDb)?.records?.map((record, index) => (
                    <div key={record.id} className="p-2 bg-muted rounded flex justify-between items-center">
                      <span className="text-sm">Record {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const db = databases.find(d => d.id === selectedDb);
                          if (db) {
                            onUpdateDatabase(selectedDb, {
                              records: db.records?.filter(r => r.id !== record.id)
                            });
                            toast.success("Record deleted");
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
