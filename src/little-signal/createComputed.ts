import PrivateSignal from './PrivateSignal'
import { ComputedType, LittleSignalCreationOptionsType, SignalType } from './types'

type ComputedCreationOptionsType = Omit<
  LittleSignalCreationOptionsType,
  'isDeepState' | 'shouldInnerFunctionsBeComputed'
>

export default function createComputed<T>(
  computed: ComputedType<T>,
  options: ComputedCreationOptionsType = {},
): SignalType<T> {
  const privateSignal = new PrivateSignal(
    function (): T {
      return this.getValue()
    },

    { computed, name: options.name },
  )

  privateSignal.execute({
    willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack: true,
    willAskSubscribersExecution: false,
    demanderName: '_ls_computedConstruction',
  })

  return privateSignal.publicSignal as SignalType<T>
}
