import littleSignal from './littleSignal'
import PrivateSignal from './PrivateSignal'
import { LittleSignalCreationOptionsType, SignalType } from './types'

export default function createState<T extends Record<string, unknown>>(
  value: T,
  options: LittleSignalCreationOptionsType = {},
): { [K in keyof T]: SignalType<T[K]> } & SignalType<T> {
  const name = options.name
  const deepness = options.deepness ?? 0

  const computed = (): T => {
    const valueState = { ...privateSignal.publicSignal() } as T
    for (const key in valueState) {
      valueState[key] = state[key]() as T[Extract<keyof T, string>]
    }

    return valueState
  }

  const privateSignal = new PrivateSignal<T>(
    function (value?: T): T {
      if (typeof value === 'undefined') {
        return this.getValue()
      }
      this.setValue(value)

      return value
    },

    { value, name, computed },
  )

  const signal = new Proxy(privateSignal.publicSignal, {
    get(target: SignalType<T>, key: string, receiver: unknown): unknown {
      if (key === '_ls_') {
        return target._ls_ as PrivateSignal<T>
      }
      if (key in state) {
        return state[key as keyof T]
      }
      return Reflect.get(target, key, receiver)
    },
  })

  const state: { [K in keyof T]: SignalType<T[K]> } = Object.keys(value).reduce(
    (acc, key) => {
      const subValue = value[key as keyof T]
      const subSignal = littleSignal<typeof subValue>(subValue, {
        name: key,
        deepness
      })
      subSignal._ls_.subscribe(signal as SignalType<unknown>)
      acc[key as keyof T] = subSignal
      return acc
    },
    {} as { [K in keyof T]: SignalType<T[K]> },
  )

  return signal as { [K in keyof T]: SignalType<T[K]> } & SignalType<T>
}
