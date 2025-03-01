export interface SignalInterface<T> {
  set: (value: T) => void
  get: () => T
  registerEffect: (callback: () => void) => void
}
