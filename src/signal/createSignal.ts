import { SignalInterface } from "./types";
import { getCurrentEffect } from "./currentEffect";

export function createSignal<T>(initialValue: T): SignalInterface<T> {
  let value: T = initialValue;
  const effectList: Set<() => void> = new Set();
  
  const signal: SignalInterface<T> = {
    get() {
      const effect = getCurrentEffect();
      this.registerEffect(effect);

      return value;
    },
    
    set(newValue: T) {
      value = newValue;
      console.log('set', effectList.size)
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