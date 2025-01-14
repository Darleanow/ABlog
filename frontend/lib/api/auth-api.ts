import { AuthRepository } from "../repositories/auth-repository";
import { User } from "../models/user";

export class AuthApi {
  private readonly repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async signUp(
    email: string,
    password: string,
    username: string,
    fullName: string,
  ): Promise<User> {
    return this.repository.signUp(email, password, username, fullName);
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    return this.repository.signIn(email, password);
  }

  async signOut(token: string): Promise<void> {
    return this.repository.signOut(token);
  }
}
