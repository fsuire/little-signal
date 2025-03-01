import { SignalInterface } from "./types";

export function createSignal<T>(initialValue: T): SignalInterface<T> {
  let value: T = initialValue
  const effectList: Set<() => void> = new Set()
  
  const signal: SignalInterface<T> = {
    get() {
      return value;
    },
    
    set(newValue: T) {
      value = newValue;
      for (const effect of effectList) {
        effect();
      }
    },
    
    registerEffect(effect: () => void) {
      effectList.add(effect);
    }
  }
  
  return signal;
}