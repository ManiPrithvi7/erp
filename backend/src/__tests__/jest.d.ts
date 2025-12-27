/// <reference types="jest" />

declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }
}

export {};

