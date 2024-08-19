import PrivateSignal from "./PrivateSignal"
import SignalInterface from "./SignalInterface"

export type ExecuteOptionsType = {
  willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack?: boolean,
  willAskSubscribersExecution?: boolean,
  demanderName?: string,
}
export type ComputedType<T> = () => T
export type SetSignalInstanceOptionsType<T> = {
  computed?: ComputedType<T>
  name?: string
  value?: T
}
// eslint-disable-next-line no-unused-vars
export type SignalFunctionType<T> = (this: PrivateSignal<T>, _value?: T) => T

export type SignalType<T> = T extends () => infer R
  ? SignalInterface<R>
  : T extends unknown[]
    ? Array<SignalType<T[number]>> & SignalInterface<T>
    : T extends Record<string, unknown>
      ? { [K in keyof T]: SignalType<T[K]> } & SignalInterface<T>
      : SignalInterface<T>