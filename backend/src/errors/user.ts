export class EmailTakenError extends Error {
  constructor(message?: string) {
    super(message ?? 'Email taken.');
  }
}

export class UserNotExistsError extends Error {
  constructor(message?: string) {
    super(message ?? 'User does not exist.');
  }
}

export class IncorrectPasswordError extends Error {
  constructor(message?: string) {
    super(message ?? 'Incorrect password.');
  }
}

export class UserHasNoPassword extends Error {
  constructor(message?: string) {
    super(message ?? 'User has no password.');
  }
}
