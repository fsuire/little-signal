import littleSignal from './littleSignal'
import PrivateSignal from './PrivateSignal'
import { LittleSignalCreationOptionsType, SignalType } from './types'

export default function createArrayState<T extends Array<T[number]>>(
  value: T,
  options: LittleSignalCreationOptionsType = {},
): Array<SignalType<T[number]>> & SignalType<T> {
  const name = options.name
  const deepness = options.deepness ?? 0
  const signals: Array<SignalType<T[number]>> = value.map((item, index) => littleSignal(item, {
    name: `${name}[${index}]`,
    deepness
  }))

  const computed = (): T => {
    return signals.map((signal) => signal()) as T
  }

  const privateSignal = new PrivateSignal<T>(
    function (newValue?: T): T {
      if (newValue === undefined) {
        return computed()
      }

      newValue.forEach((item, index) => {
        const creationOptions = {
          name: `${name}[${index}]`,
          deepness
        }
        if (signals[index]) {
          const previousSignalSubscribers = [...signals[index]._ls_.subscribers]
          signals[index]._ls_.subscribers = []
          const newSignal = littleSignal(item, creationOptions)
          newSignal._ls_.subscribers = previousSignalSubscribers
          signals[index] = newSignal
        } else {
          signals[index] = littleSignal(item, creationOptions)
        }
      })
      if (newValue.length > signals.length) {
        signals.splice(signals.length, newValue.length - signals.length)
      }

      return newValue
    },
    { value, name, computed },
  )

  const arrayState = new Proxy(privateSignal.publicSignal, {
    get(target: SignalType<T>, key: string | symbol, receiver): unknown {
      if (key === '_ls_') {
        return target._ls_
      }
      const index = Number(key)
      if (!isNaN(index)) {
        return signals[index]
      }
      return Reflect.get(target, key, receiver)
    },
  })

  return arrayState as Array<SignalType<T[number]>> & SignalType<T>
}
