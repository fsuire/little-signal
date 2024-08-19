import AbstractSignal from './AbstractSignal'
import createSignal from './createSignal'
import type SignalInterface from './SignalInterface'

export default class State<T extends unknown[] | Record<string, unknown>> extends AbstractSignal<T> {
  state!: T extends unknown[] ? SignalInterface<T[number]>[] : { [K in keyof T]: SignalInterface<T[K]> }

  constructor(value: T, name?: string) {
    super(name)
    this._value = value

    if (Array.isArray(value)) {
      this.state = value.map((item) => {
        const signal = createSignal(item)
        // this.subscribe(signal)
        signal.subscribe(this)
        return signal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
      return
    }

    if (typeof value === 'object') {
      this.state = Object.keys(value).reduce(
        (acc, key) => {
          const signal = createSignal(value[key as keyof T], key)
          // this.subscribe(signal)
          signal.subscribe(this)
          acc[key as keyof T] = signal
          return acc
        },
        {} as { [K in keyof T]: SignalInterface<T[K]> },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any
      return
    }

    throw new Error(
      `Wrong initialization value given to new State ("${typeof value}" given to ${name ? `a state named "${name}"` : 'an anonymous state'})`,
    )
  }

  protected _computed = (): void => {
    if (Array.isArray(this.state)) {
      this.value = this.state.map((signal) => {
        return signal.value
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
      return
    }

    if (typeof this.state === 'object') {
      this.value = Object.keys(this.state).reduce(
        (acc, key) => {
          const signal = (this.state as { [K in keyof T]: SignalInterface<T[K]> })[key as keyof T]
          acc[key as keyof T] = signal.value as SignalInterface<T[keyof T]>
          return acc
        },
        {} as { [K in keyof T]: SignalInterface<T[K]> },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any
      return
    }
  }
}
