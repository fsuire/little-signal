import { SignalInterface } from "./types";

export function createEffect<T>(effect: () => void, ...signals: SignalInterface<T>[]) {
  for (const signal of signals) {
    signal.registerEffect(effect);
  }
}