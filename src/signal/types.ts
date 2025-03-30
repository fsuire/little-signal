export interface SignalInterface<T> {
  set: (value: T) => void
  get: () => T
  registerSignalUserFunc: (callback: () => void) => void
}
