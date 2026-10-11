import type { Token } from "@veap/kernel";

export interface StorageData {
  name: string;
  url: string;
  type: string;
  size: number;
  service: string;
  serviceId: string;
}

export interface StorageError {
  error: string;
}

export type StorageResult = StorageData | StorageError;

export interface IStorageProvider {
  id: string;
  name: string;
  upload(file: File, options?: any): Promise<StorageResult>;
  delete?(serviceId: string): Promise<boolean>;
}

export interface IStorageService {
  registerProvider(provider: IStorageProvider): void;
  unregisterProvider(id: string): void;
  setDefaultProvider(id: string): void;
  getDefaultProviderId(): string | null;
  upload(file: File, providerId?: string): Promise<StorageResult>;
  delete(keyOrUrl: string, providerId?: string): Promise<boolean>;
  getProviders(): Array<{ id: string; name: string }>;
}

export const STORAGE_SERVICE: Token<IStorageService> = Symbol.for(
  "veap:storage:service",
);
