import PrivateSignal from './PrivateSignal'
import { SignalType } from './types'

export default function createSignal<T>(value: T, name?: string): SignalType<T> {
  const privateSignal = new PrivateSignal(
    function (value?: T): T {
      if (typeof value === 'undefined') {
        return this.getValue()
      }
      this.setValue(value)

      return value
    },

    { value, name },
  )

  return privateSignal.publicSignal as SignalType<T>
}
