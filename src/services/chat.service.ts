import type { ChatType, NewChatType } from "../types/chat.types";
import type { MessageType, NewMessageType } from "../types/message.types";

export interface IChatServices {
  create(newChat: NewChatType, messages: NewMessageType[]): Promise<string>;
  delete(id: string): Promise<void>;
  findMany(userId: string): Promise<ChatType[]>;
  seedMessages(messages: NewMessageType[], chatId: string): Promise<void>;
  findMessages(chatId: string): Promise<MessageType[]>;
}

import type { FirebaseService } from "../resources/firebase";

export class ChatServices implements IChatServices {
  constructor(private firebaseService: FirebaseService) {}

  private readonly COLLECTION = "chats";

  private async find(id: string): Promise<ChatType> {
    const chat = await this.firebaseService.findOne<ChatType>({
      collection: this.COLLECTION,
      id,
    });
    if (!chat) throw new Error("Chat not found");
    return chat;
  }

  async create(
    newChat: NewChatType,
    messages: NewMessageType[]
  ): Promise<string> {
    const chatId = await this.firebaseService.create({
      collection: this.COLLECTION,
      payload: newChat,
    });

    await this.seedMessages(messages, chatId);

    return chatId;
  }

  async delete(id: string): Promise<void> {
    await this.find(id);
    await this.firebaseService.deleteOne({
      collection: this.COLLECTION,
      id,
    });
  }

  async findMany(userId: string): Promise<ChatType[]> {
    const chats = await this.firebaseService.findAll<ChatType>({
      collection: this.COLLECTION,
      query: [{ field: "userId", condition: "==", value: userId }],
    });

    return chats;
  }

  async seedMessages(
    messages: NewMessageType[],
    chatId: string
  ): Promise<void> {
    let promisses: Promise<any>[] = [];

    for (const message of messages) {
      promisses.push(
        this.firebaseService.create({
          collection: `${this.COLLECTION}/${chatId}/messages`,
          payload: message,
        })
      );
    }

    await Promise.all(promisses);
  }

  async findMessages(chatId: string): Promise<MessageType[]> {
    const chats = await this.firebaseService.findAll<MessageType>({
      collection: `${this.COLLECTION}/${chatId}/messages`,
    });

    return chats;
  }
}
