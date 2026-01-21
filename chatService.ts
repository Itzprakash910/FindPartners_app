import { Message } from '../types';

const DB_NAME = 'FindPartnersDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';
const KEY = 'all_messages';

// Helper to open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
        reject(new Error("IndexedDB is not supported in this browser."));
        return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
    };

    request.onsuccess = (event) => {
        resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
        }
    };
  });
};

// Async function to get messages
export const getMessages = async (): Promise<Record<number, Message[]>> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY);

      request.onerror = () => {
          console.error("Error fetching messages from DB:", request.error);
          reject(request.error);
      };

      request.onsuccess = () => {
          resolve(request.result || {});
      };
    });
  } catch (error) {
    console.error("Failed to open DB for reading:", error);
    return {};
  }
};

// Async function to save messages
export const saveMessages = async (messages: Record<number, Message[]>): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(messages, KEY);

      request.onerror = () => {
          console.error("Error saving messages to DB:", request.error);
          reject(request.error);
      };

      request.onsuccess = () => {
          resolve();
      };
    });
  } catch (error) {
    console.error("Failed to open DB for writing:", error);
  }
};