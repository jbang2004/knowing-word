import { AsyncLocalStorage } from "node:async_hooks";

export type RuntimeEnv = Partial<Pick<Env, "DB" | "MEDIA">> & {
  WECHAT_APP_ID?: string;
  WECHAT_APP_SECRET?: string;
};

const storageKey = Symbol.for("knowing-word.runtime-env.als");
const runtimeGlobal = globalThis as typeof globalThis & {
  [storageKey]?: AsyncLocalStorage<RuntimeEnv>;
};
const runtimeEnvStorage = runtimeGlobal[storageKey] ??= new AsyncLocalStorage<RuntimeEnv>();

export function runWithRuntimeEnv<T>(env: RuntimeEnv, callback: () => T): T {
  return runtimeEnvStorage.run(env, callback);
}

export function getRuntimeEnv() {
  return runtimeEnvStorage.getStore();
}
