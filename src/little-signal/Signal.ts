import AbstractSignal from "./AbstractSignal"

export default class Signal<T> extends AbstractSignal<T> {

  constructor(value: T, name?: string) {
    super(name)
    this._value = value
  }
}
