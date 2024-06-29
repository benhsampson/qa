export class AlreadyAddedToDojoError extends Error {
  constructor(message?: string) {
    super(message ?? 'User already added to dojo.');
  }
}

export class DojoNotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Dojo not found.');
  }
}
