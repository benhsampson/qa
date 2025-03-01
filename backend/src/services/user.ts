import bcrypt from 'bcrypt';
import assert from 'assert/strict';
import { eq } from 'drizzle-orm';
import { PostgresError } from 'postgres';

import { db } from '../lib/db';
import { usersTable } from '../schema';
import { POSTGRES_ERROR_CODES } from '../errors/postgres';
import { EMAIL_UNIQUE_INDEX } from '../schema/users';
import {
  EmailTakenError,
  IncorrectPasswordError,
  UserHasNoPassword,
  UserNotExistsError,
} from '../errors/user';

const hashPassword = async (password: string) =>
  new Promise<string>((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });

const comparePassword = async (plaintext: string, hash: string) =>
  bcrypt.compare(plaintext, hash);

const signUp = async (email: string, password: string) => {
  const hash = await hashPassword(password);
  try {
    const [user] = await db
      .insert(usersTable)
      .values({ email, password: hash })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
      });
    assert.ok(user);
    return user;
  } catch (err) {
    if (
      err instanceof PostgresError &&
      err.code === POSTGRES_ERROR_CODES.unique_violation &&
      err.constraint_name === EMAIL_UNIQUE_INDEX
    ) {
      throw new EmailTakenError();
    }
    throw err;
  }
};

const login = async (email: string, password: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user) {
    throw new UserNotExistsError(`User with email ${email} does not exist.`);
  }
  if (!user.password) {
    throw new UserHasNoPassword();
  }
  if (!(await comparePassword(password, user.password))) {
    throw new IncorrectPasswordError();
  }
};

const getUserProfile = async (id: number) => {
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, id));
  if (!user) {
    throw new UserNotExistsError(`User not found`);
  }
  return user;
};

const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};

export const userService = {
  hashPassword,
  comparePassword,
  signUp,
  login,
  getUserProfile,
  getUserByEmail,
};
