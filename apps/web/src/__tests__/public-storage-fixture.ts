import {vi} from "vitest";

/** Node 26 native WebStorage may be undefined; model browser storage explicitly.
 * Real storage and reload behavior is covered separately by Chromium E2E.
 */
class BrowserStorageFixture implements Storage {
  private values = new Map<string, string>();
  get length() {return this.values.size;}
  key(index: number) {return [...this.values.keys()][index] ?? null;}
  getItem(key: string) {return this.values.get(String(key)) ?? null;}
  setItem(key: string, value: string) {this.values.set(String(key), String(value));}
  removeItem(key: string) {this.values.delete(String(key));}
  clear() {this.values.clear();}
}

export function installPublicBrowserStorage() {
  vi.stubGlobal("Storage", BrowserStorageFixture);
  vi.stubGlobal("localStorage", new BrowserStorageFixture());
}
