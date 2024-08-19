import AbstractSignal from './AbstractSignal'

export type ComputedType<T> = () => T | void

export default class Computed<T> extends AbstractSignal<T> {
  constructor(value: ComputedType<T>, name?: string) {
    super(name)
    this._computed = value as ComputedType<T>
    this.execute({
      willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack: true,
      willAskSubscribersExecution: false,
    })
  }
}
