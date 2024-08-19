import PrivateSignal from './PrivateSignal'
import { ComputedType, SignalType } from './types'

export default function createComputed<T>(computed: ComputedType<T>, name?: string): SignalType<T> {
  const privateSignal = new PrivateSignal(
    function (): T {
      return this.getValue()
    },

    { computed, name },
  )

  privateSignal.execute({
    willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack: true,
    willAskSubscribersExecution: false,
    demanderName: '_ls_computedConstruction'
  })

  return privateSignal.publicSignal as SignalType<T>
}
