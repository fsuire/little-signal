import PrivateSignal from "./PrivateSignal"

export default interface SignalInterface<T = undefined> {
  (_value?: T): T

  _ls_: PrivateSignal<T>
}
