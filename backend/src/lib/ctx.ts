import { type User } from '../schema/users';

export interface Context {
  user: User | null;
}
