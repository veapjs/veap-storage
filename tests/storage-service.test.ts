import { Container, type ILogger, LOGGER } from "@veap/kernel";
import { describe, expect, it, vi } from "vitest";
import { StorageServiceProvider } from "../src/provider.js";
import { StorageService } from "../src/storage.service.js";
import {
  type IStorageProvider,
  STORAGE_SERVICE,
  type StorageResult,
} from "../src/types.js";

function createMockLogger(): ILogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("StorageService", () => {
  it("manages provider registration and default provider selection", () => {
    const logger = createMockLogger();
    const service = new StorageService(logger);

    expect(service.getProviders()).toEqual([]);
    expect(service.getDefaultProviderId()).toBeNull();

    const mockProvider1: IStorageProvider = {
      id: "s3",
      name: "Amazon S3",
      upload: vi.fn(),
    };

    service.registerProvider(mockProvider1);
    expect(service.getProviders()).toEqual([{ id: "s3", name: "Amazon S3" }]);
    expect(service.getDefaultProviderId()).toBe("s3");

    const mockProvider2: IStorageProvider = {
      id: "vercel-blob",
      name: "Vercel Blob",
      upload: vi.fn(),
    };

    service.registerProvider(mockProvider2);
    expect(service.getProviders()).toHaveLength(2);

    service.setDefaultProvider("vercel-blob");
    expect(service.getDefaultProviderId()).toBe("vercel-blob");

    service.unregisterProvider("vercel-blob");
    expect(service.getProviders()).toEqual([{ id: "s3", name: "Amazon S3" }]);
    expect(service.getDefaultProviderId()).toBe("s3");
  });

  it("delegates upload to the specified or default provider", async () => {
    const logger = createMockLogger();
    const service = new StorageService(logger);

    const s3Upload = vi.fn().mockResolvedValue({
      name: "file.png",
      url: "https://s3.amazonaws.com/bucket/file.png",
      type: "image/png",
      size: 1024,
      service: "s3",
      serviceId: "s3-key-1",
    } satisfies StorageResult);

    const s3Provider: IStorageProvider = {
      id: "s3",
      name: "Amazon S3",
      upload: s3Upload,
    };

    service.registerProvider(s3Provider);

    const testFile = new File(["bytes"], "file.png", { type: "image/png" });
    const result = await service.upload(testFile);

    expect(s3Upload).toHaveBeenCalledWith(testFile);
    expect(result).toHaveProperty("serviceId", "s3-key-1");
  });

  it("returns error result when no provider is available", async () => {
    const logger = createMockLogger();
    const service = new StorageService(logger);

    const testFile = new File(["bytes"], "file.png", { type: "image/png" });
    const result = await service.upload(testFile);

    expect(result).toHaveProperty("error");
    expect((result as any).error).toContain("No storage provider available");
  });

  it("delegates delete to the matching provider and handles providers without delete", async () => {
    const logger = createMockLogger();
    const service = new StorageService(logger);

    const deleteMock = vi.fn().mockResolvedValue(true);
    const fullProvider: IStorageProvider = {
      id: "custom",
      name: "Custom",
      upload: vi.fn(),
      delete: deleteMock,
    };

    service.registerProvider(fullProvider);

    const deleteSuccess = await service.delete("custom-key-123");
    expect(deleteSuccess).toBe(true);
    expect(deleteMock).toHaveBeenCalledWith("custom-key-123");

    const readOnlyProvider: IStorageProvider = {
      id: "readonly",
      name: "ReadOnly",
      upload: vi.fn(),
    };

    service.registerProvider(readOnlyProvider);
    service.setDefaultProvider("readonly");

    const deleteBlocked = await service.delete("some-key");
    expect(deleteBlocked).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "veap:storage",
      expect.stringContaining("does not support deletion"),
    );
  });
});

describe("StorageServiceProvider", () => {
  it("registers StorageService and STORAGE_SERVICE token in IoC container and boots local provider", async () => {
    const container = new Container();
    const logger = createMockLogger();
    container.register({ token: LOGGER, useValue: logger });

    const provider = new StorageServiceProvider(container);
    provider.register();

    expect(container.has(StorageService)).toBe(true);
    expect(container.has(STORAGE_SERVICE)).toBe(true);

    const resolvedService = await container.resolve(StorageService);
    const resolvedByToken = await container.resolve(STORAGE_SERVICE);
    expect(resolvedService).toBe(resolvedByToken);

    await provider.boot();

    expect(resolvedService.getProviders()).toHaveLength(1);
    expect(resolvedService.getProviders()[0]?.id).toBe("local");
    expect(resolvedService.getDefaultProviderId()).toBe("local");
  });
});
