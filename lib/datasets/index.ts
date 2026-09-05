import { company } from "./company";
import { consulting } from "./consulting";
import { ecommerce } from "./ecommerce";
import { university } from "./university";
import type { Dataset } from "./types";

export type { Dataset, DatasetSchema, TableInfo, ColumnInfo } from "./types";

export const datasets: Record<string, Dataset> = {
  [company.id]: company,
  [ecommerce.id]: ecommerce,
  [university.id]: university,
  [consulting.id]: consulting,
};

export function getDataset(id: string): Dataset | undefined {
  return datasets[id];
}

export const datasetIds = Object.keys(datasets);
