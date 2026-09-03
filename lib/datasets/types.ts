export interface Dataset {
  id: string;
  name: string;
  description: string;
  /** Full seed script: CREATE TABLE + INSERT statements. Executed once per sandbox. */
  seed: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  primaryKey: boolean;
  /** "table.column" when this column references another table. */
  references: string | null;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  /** First few rows, for the "View data" explorer. */
  sample: (string | number | null)[][];
}

export interface DatasetSchema {
  id: string;
  name: string;
  description: string;
  tables: TableInfo[];
}
