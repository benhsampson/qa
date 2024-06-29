/* eslint-disable @typescript-eslint/no-floating-promises */

import test from 'node:test';
import assert from 'assert/strict';

import { userService } from './user';

test('hash password', async () => {
  const hash = await userService.hashPassword('test');
  assert.strictEqual(await userService.comparePassword('test', hash), true);
  assert.strictEqual(await userService.comparePassword('tesT', hash), false);
});
