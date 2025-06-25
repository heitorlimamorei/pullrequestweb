import type { FirebaseService } from "../resources/firebase";

export interface IApiKeysSvc {
  getKey(id: string): Promise<string>;
}

export class ApiKeyService implements IApiKeysSvc {
  constructor(private firebaseService: FirebaseService) {}

  private readonly COLLECTION = "api-keys";

  async getKey(id: string): Promise<string> {
    const document = await this.firebaseService.findOne<{
      id: string;
      apikey: string;
    }>({
      collection: this.COLLECTION,
      id,
    });

    if (!document) throw new Error("ApiKey not found");

    return document.apikey;
  }
}
