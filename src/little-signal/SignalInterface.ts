import PrivateSignal from "./PrivateSignal"

export default interface SignalInterface<T> {
  (_value?: T | null): T

  _ls_: PrivateSignal<T>
}
