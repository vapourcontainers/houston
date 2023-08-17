export interface IStorageInfo {
  capacityUsed: number;
  capacityTotal: number | undefined;
  objects: number;
}

export interface IStorageItem {
  name: string;
  size: number;
  modifiedAt: string;
}
