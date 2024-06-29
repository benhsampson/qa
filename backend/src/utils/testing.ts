import assert from 'assert/strict';
import { before, after } from 'node:test';

type BeforeParams = Required<Parameters<typeof before>>;
type AfterParams = Required<Parameters<typeof after>>;

const logIfError =
  (cb: (...args: any[]) => Promise<any>, message?: string) =>
  async (...args: any[]) => {
    try {
      // we need to 'return await' here otherwise errors won't be caught
      return await cb(...args);
    } catch (err) {
      console.error(message, err);
      throw err;
    }
  };

const before_ = (fn: BeforeParams[0], options?: BeforeParams[1]) =>
  before(logIfError(fn, 'error in before:'), options);

const after_ = (fn: AfterParams[0], options?: AfterParams[1]) =>
  after(logIfError(fn, 'error in after:'), options);

const assert_ = {
  nullOrUndefined: (val: unknown) => {
    assert.equal(val, null);
    assert.equal(val, undefined);
  },
  notNullOrUndefined: (val: unknown) => {
    assert.notEqual(val, null);
    assert.notEqual(val, undefined);
  },
};

export const testUtils = {
  logIfError,
  before_,
  after_,
  assert_,
};
