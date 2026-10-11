import { ConfigService, ServiceProvider } from "@veap/kernel";
import { LocalFileProvider } from "./providers/local.js";
import { StorageService } from "./storage.service.js";
import { STORAGE_SERVICE } from "./types.js";

export class StorageServiceProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: StorageService,
      useClass: StorageService,
      singleton: true,
    });

    this.container.register({
      token: STORAGE_SERVICE,
      useFactory: (service: StorageService) => service,
      inject: [StorageService],
      singleton: true,
    });
  }

  async boot(): Promise<void> {
    const storageService = await this.container.resolve(StorageService);
    const config = await this.container.resolve(ConfigService);
    if (storageService.getProviders().length === 0) {
      const local = new LocalFileProvider(config);
      storageService.registerProvider(local);
      storageService.setDefaultProvider(local.id);
    }
  }
}
