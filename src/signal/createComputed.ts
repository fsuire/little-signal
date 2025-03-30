import { createSignal } from "./createSignal";
import { setCurrentSignalUserFunc } from "./currentSignalUserFunc";
import { SignalInterface } from "./types";

export function createComputed<T>(computed: () => T): SignalInterface<T> {
  let signal: SignalInterface<T>;

  const decoratedComputed = () => {
    setCurrentSignalUserFunc(decoratedComputed);
    const computedValue = computed();

    if (!signal) {
      signal = createSignal(computedValue);
    } else {
      signal.set(computedValue);
    }
    
    return signal;
  };

  return decoratedComputed();
}