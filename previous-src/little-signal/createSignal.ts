import Computed, { ComputedType } from './Computed'
import Signal from './Signal'
import State from './State'

export default function createSignal<T>(
  value: T | ComputedType<T> | unknown[] | Record<string, unknown>,
  name?: string,
): Signal<T> | Computed<T> | State<T & (unknown[] | Record<string, unknown>)> {
  if (typeof value === 'function') {
    return new Computed(value as ComputedType<T>, name)
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return new State<T & (unknown[] | Record<string, unknown>)>(
      value as T & (unknown[] | Record<string, unknown>),
      name,
    )
  }

  return new Signal(value, name)
}
