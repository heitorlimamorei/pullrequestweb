import type { FirebaseService } from "../resources/firebase";
import type {
  ChatSettingsType,
  NewChatSettingsType,
} from "../types/chat.types";

export interface IChatSettingsService {
  create(payload: NewChatSettingsType): Promise<ChatSettingsType>;
  find(userId: string): Promise<ChatSettingsType>;
  update(payload: ChatSettingsType): Promise<void>;
}

export default class ChatSettingsService implements IChatSettingsService {
  private readonly COLLECTION = "chat-settings";

  constructor(private firebaseSvc: FirebaseService) {}

  async create(payload: NewChatSettingsType): Promise<ChatSettingsType> {
    const resp = await this.firebaseSvc.create({
      collection: this.COLLECTION,
      payload,
    });

    if (resp.length == 0) {
      throw new Error("Cannot create a new chat settings");
    }

    return {
      ...payload,
      id: resp,
    };
  }

  async find(userId: string): Promise<ChatSettingsType> {
    const settings = await this.firebaseSvc.findOne<ChatSettingsType>({
      collection: this.COLLECTION,
      query: [{ field: "userId", condition: "==", value: userId }],
    });

    if (!settings) {
      throw new Error("Cannot find the requested chat settings");
    }

    return settings;
  }

  async update(payload: ChatSettingsType): Promise<void> {
    await this.firebaseSvc.updateOne({
      collection: this.COLLECTION,
      payload: payload,
      id: payload.id,
    });
  }
}
