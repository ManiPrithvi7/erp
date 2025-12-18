function isJsonString(str: string | null): boolean {
  try {
    if (!str) return false;
    JSON.parse(str);
  } catch (e) {
    console.error((e as Error).message);
    return false;
  }
  return true;
}

export const localStorageHealthCheck = async (): Promise<void> => {
  for (var i = 0; i < localStorage.length; ++i) {
    try {
      const key = localStorage.key(i);
      if (!key) continue;
      const result = window.localStorage.getItem(key);
      if (!isJsonString(result)) {
        window.localStorage.removeItem(key);
      }
      if (result && Object.keys(key).length == 0) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      window.localStorage.clear();
      // Handle the exception here
      console.error('window.localStorage Exception occurred:', error);
      // You can choose to ignore certain exceptions or take other appropriate actions
    }
  }
};

interface StorePersist {
  set: (key: string, state: any) => void;
  get: (key: string) => any;
  remove: (key: string) => void;
  getAll: () => Storage;
  clear: () => void;
}

export const storePersist: StorePersist = {
  set: (key: string, state: any): void => {
    window.localStorage.setItem(key, JSON.stringify(state));
  },
  get: (key: string): any => {
    const result = window.localStorage.getItem(key);
    if (!result) {
      return false;
    } else {
      if (!isJsonString(result)) {
        window.localStorage.removeItem(key);
        return false;
      } else return JSON.parse(result);
    }
  },
  remove: (key: string): void => {
    window.localStorage.removeItem(key);
  },
  getAll: (): Storage => {
    return window.localStorage;
  },
  clear: (): void => {
    window.localStorage.clear();
  },
};

export default storePersist;

