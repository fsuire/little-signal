import createArrayState from './createArrayState'
import createComputed from './createComputed'
import createSignal from './createSignal'
import createState from './createState'
import SignalInterface from './SignalInterface'
import { ComputedType, LittleSignalCreationOptionsType, SignalType } from './types'

export default function littleSignal<T>(
  value: T | ComputedType<T>,
  options: LittleSignalCreationOptionsType = {},
): SignalType<T> {
  const deepness = options.deepness ?? 1

  if (typeof value === 'function') {
    return createComputed(value as ComputedType<T>, options) as T extends () => infer R ? SignalInterface<R> : never
  }

  if (Array.isArray(value) && deepness > 0) {
    return createArrayState(value, {
      ...options,
      deepness: deepness - 1,
    }) as T extends () => infer _R
      ? never
      : T extends unknown[]
        ? Array<SignalType<T[number]>> & SignalInterface<T>
        : never
  }

  if (typeof value === 'object' && deepness > 0) {
    return createState(value as T extends Record<string, unknown> ? T : never, {
      ...options,
      deepness: deepness - 1,
    }) as T extends () => infer _R
      ? never
      : T extends unknown[]
        ? never
        : T extends Record<string, unknown>
          ? { [K in keyof T]: SignalType<T[K]> } & SignalInterface<T>
          : never
  }

  return createSignal(value, options) as T extends () => infer _R
    ? never
    : T extends unknown[]
      ? never
      : T extends Record<string, unknown>
        ? never
        : SignalInterface<T>
}
