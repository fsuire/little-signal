/* eslint-disable no-unused-vars */
export default interface SignalInterface<T> {
  value: T
  name?: string

  get identifier(): string

  execute(
    options?: {
      willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack?: boolean
      willAskSubscribersExecution?: boolean
      demanderName?: string
    }
  ): void
  lockExecution(executionLock: SignalInterface<unknown>): void
  subscribe(subscriber: SignalInterface<unknown>): void
  unlockExecution(executionLock: SignalInterface<unknown>, dependencyIdentifier: string, dependencyValue: unknown): void
}
