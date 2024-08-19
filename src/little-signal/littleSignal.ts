import createArrayState from './createArrayState'
import createComputed from './createComputed'
import createSignal from './createSignal'
import createState from './createState'
import SignalInterface from './SignalInterface'
import { ComputedType, SignalType } from './types'

export default function littleSignal<T>(
  value: T | ComputedType<T>,
  name?: string,
): SignalType<T> {
  if (typeof value === 'function') {
    return createComputed(value as ComputedType<T>, name) as T extends () => infer R ? SignalInterface<R> : never
  }

  if (Array.isArray(value)) {
    return createArrayState(value, name) as T extends () => infer _R
    ? never
    : T extends unknown[]
      ? Array<SignalType<T[number]>> & SignalInterface<T>
      : never
  }

  if (typeof value === 'object') {
    return createState(value as T extends Record<string, unknown> ? T : never, name) as T extends () => infer _R
    ? never
    : T extends unknown[]
      ? never
      : T extends Record<string, unknown>
        ? { [K in keyof T]: SignalType<T[K]> } & SignalInterface<T>
        : never
  }

  return createSignal(value, name) as T extends () => infer _R
  ? never
  : T extends unknown[]
    ? never
    : T extends Record<string, unknown>
      ? never
      : SignalInterface<T>
}
