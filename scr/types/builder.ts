export type ComponentType = 'button' | 'text' | 'input' | 'image' | 'container';

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    borderRadius?: number;
  };
  actions?: ComponentAction[];
  databaseConnection?: DatabaseConnection;
}

export interface ComponentAction {
  type: 'navigate' | 'submit' | 'login' | 'logout';
  targetScreenId?: string;
}

export interface DatabaseConnection {
  databaseId: string;
  fieldName: string;
  recordIndex?: number;
}

export interface Screen {
  id: string;
  name: string;
  components: CanvasComponent[];
  isDefaultLoggedIn?: boolean;
  isDefaultLoggedOut?: boolean;
  isHome?: boolean;
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface DatabaseField {
  name: string;
  type: 'text' | 'number' | 'image';
}

export interface DatabaseRecord {
  id: string;
  data: Record<string, any>;
}

export interface Database {
  id: string;
  name: string;
  fields: DatabaseField[];
  records?: DatabaseRecord[];
}
