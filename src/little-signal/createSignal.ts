import PrivateSignal from './PrivateSignal'
import { LittleSignalCreationOptionsType, SignalType } from './types'

type ComputedCreationOptionsType = Omit<
  LittleSignalCreationOptionsType,
  'isDeepState' | 'shouldInnerFunctionsBeComputed'
>

export default function createSignal<T>(value: T, options: ComputedCreationOptionsType = {}): SignalType<T> {
  const privateSignal = new PrivateSignal(
    function (value?: T): T {
      if (typeof value === 'undefined') {
        return this.getValue()
      }
      this.setValue(value)

      return value
    },

    { value, name: options.name },
  )

  return privateSignal.publicSignal as SignalType<T>
}
