import type { NewUserType, UserType } from "../types/user.types";

export interface IUserService {
  login(email: string, password: string): Promise<UserType>;
  create(user: NewUserType): Promise<string>;
  findByEmail(email: string): Promise<UserType>;
  find(id: string): Promise<UserType>;
  delete(id: string): Promise<UserType>;
  update(id: string, fields: any): Promise<void>;
}

import type { FirebaseService } from "../resources/firebase";
import passwords from "../resources/utils/passwords";

export class UserService implements IUserService {
  constructor(private firebaseService: FirebaseService) {}

  private readonly COLLECTION = "users";

  async create(user: NewUserType): Promise<string> {
    const users = await this.firebaseService.findAll<UserType>({
      collection: this.COLLECTION,
      query: [{ field: "email", condition: "==", value: user.email }],
    });

    if (users.length > 0) {
      throw new Error("This user is already registered");
    }

    const hashedPassword = await passwords.hashPassword(user.password);

    return this.firebaseService.create({
      collection: this.COLLECTION,
      payload: {
        ...user,
        hashedPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<UserType> {
    const users = await this.firebaseService.findAll<UserType>({
      collection: this.COLLECTION,
      query: [{ field: "email", condition: "==", value: email }],
    });
    if (!users || users.length === 0) throw new Error("User not found");
    return users[0]!;
  }

  async find(id: string): Promise<UserType> {
    const user = await this.firebaseService.findOne<UserType>({
      collection: this.COLLECTION,
      id,
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  async delete(id: string): Promise<UserType> {
    // Buscar o user para retornar após deleção
    const user = await this.find(id);
    await this.firebaseService.deleteOne({
      collection: this.COLLECTION,
      id,
    });
    return user;
  }

  async update(id: string, fields: Partial<NewUserType>): Promise<void> {
    await this.firebaseService.updateOne({
      collection: this.COLLECTION,
      id,
      payload: fields,
    });
  }

  async login(email: string, password: string): Promise<UserType> {
    const user = await this.findByEmail(email);

    if (!passwords.comparePassword(password, user.password)) {
      throw new Error("The provider password does not match");
    }

    return user;
  }
}
