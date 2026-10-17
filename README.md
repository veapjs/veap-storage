[![CI](https://github.com/veapjs/veap-storage/actions/workflows/CI.yml/badge.svg)](https://github.com/veapjs/veap-storage/actions/workflows/CI.yml)
[![Release](https://github.com/veapjs/veap-storage/actions/workflows/RELEASE.yml/badge.svg)](https://github.com/veapjs/veap-storage/actions/workflows/RELEASE.yml)
[![Version](https://img.shields.io/npm/v/@veap%2Fstorage?style=flat-square&color=181717&logo=npm&logoColor=959da5)](https://www.npmjs.com/package/@veap/storage)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=959da5)](https://discord.gg/qTkrCwpMW)

# @veap/storage

Unified file storage abstraction supporting local filesystem and cloud object
storage providers for Veap and Next.js applications.

## Overview

`@veap/storage` simplifies file uploads, media management, and asset delivery.
It abstracts physical disk storage and cloud bucket drivers behind a consistent
`StorageService` API. It includes filename sanitization, automatic MIME-type
and extension validation, deduplication hashing, and driver routing.

## Features

- **Multi-driver architecture**: Pluggable `IStorageProvider` interface
  allowing concurrent drivers (for example, local disk for uploads, S3 for archives).
- **Default local provider**: Ready-to-use `LocalFileProvider` saving files to
  configurable public or private application directories.
- **Security & validation**: Built-in file extension sanitization, MIME-type
  checks, and path traversal protection.
- **Clean IoC integration**: `StorageServiceProvider` automatically registers
  the default provider and binds `StorageService` into the kernel container.
- **Next.js & standard web `File` support**: Works seamlessly with web standard
  `File` and `FormData` objects from Server Actions and Route Handlers.

## Installation

```bash
# Using bun
bun add @veap/storage @veap/kernel

# Using pnpm
pnpm add @veap/storage @veap/kernel

# Using npm
npm install @veap/storage @veap/kernel
```

## Configuration

Configure the local storage directory using environment variables or
`ConfigService`:

| Environment Variable  | Description                            | Default          |
| --------------------- | -------------------------------------- | ---------------- |
| `FILE_STORAGE_FOLDER` | Destination folder on disk for uploads | `public/uploads` |

## Usage

### Register in Application Builder

Include `StorageServiceProvider` in your application composition root:

```ts
import { Application } from "@veap/kernel";
import { StorageServiceProvider } from "@veap/storage";

export const app = Application.configure().use(StorageServiceProvider).create();
```

### Handling Uploads in Next.js Server Actions

Upload files directly from forms using `StorageService` resolved via IoC:

```ts
"use server";

import { app } from "@veap/kernel";
import { StorageService } from "@veap/storage";

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const storage = await app(StorageService);
  const result = await storage.upload(file, "local");

  if ("error" in result) {
    throw new Error(result.error);
  }

  return { url: result.url, serviceId: result.serviceId };
}
```

### Implementing a Custom Storage Driver

Create custom cloud storage drivers (for example, AWS S3 or Cloudflare R2) by
implementing the `IStorageProvider` interface:

```ts
import type { IStorageProvider, StorageResult } from "@veap/storage";

export class S3StorageProvider implements IStorageProvider {
  public id = "s3";

  async upload(file: File): Promise<StorageResult> {
    // Perform upload to S3 bucket
    return {
      name: file.name,
      url: `https://my-bucket.s3.amazonaws.com/${file.name}`,
      type: file.type,
      size: file.size,
      service: "s3",
      serviceId: `uploads/${file.name}`,
    };
  }

  async delete(serviceId: string): Promise<boolean> {
    // Delete file from S3 bucket
    return true;
  }
}
```

## Subpath Exports

| Export Path                     | Content                                                                    |
| ------------------------------- | -------------------------------------------------------------------------- |
| `@veap/storage`                 | `StorageService`, `StorageServiceProvider`, `LocalFileProvider`, and types |
| `@veap/storage/providers/local` | `LocalFileProvider` implementation                                         |
| `@veap/storage/types`           | `IStorageProvider`, `StorageData`, `StorageError`, and `StorageResult`     |

## Documentation

For full guides and storage driver configuration, visit:

- **Official Website**: [https://veap.pl](https://veap.pl)
- **Documentation**: [https://veap.pl/docs](https://veap.pl/docs)
- **GitHub Repository**: [https://github.com/veapjs/veap-storage](https://github.com/veapjs/veap-storage)

## License

MIT
