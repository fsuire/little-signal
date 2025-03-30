import { SignalInterface } from "./types";
import { getCurrentSignalUserFunc } from "./currentSignalUserFunc";

export function createSignal<T>(initialValue: T): SignalInterface<T> {
  let value: T = initialValue;
  const signalUserFuncList: Set<() => void> = new Set();
  
  const signal: SignalInterface<T> = {
    get() {
      const signalUserFunc = getCurrentSignalUserFunc();
      this.registerSignalUserFunc(signalUserFunc);

      return value;
    },
    
    set(newValue: T) {
      value = newValue;
      for (const signalUserFunc of signalUserFuncList) {
        signalUserFunc();
      }
    },
    
    registerSignalUserFunc(signalUserFunc: () => void) {
      signalUserFuncList.add(signalUserFunc);
    }
  }

  return signal;
}