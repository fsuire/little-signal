import type { ComputedType } from './Computed'
import debounce from './debounce'
import getRandomId from './getRandomId'
import getSignalStack from './getSignalStack'
import SignalInterface from './SignalInterface'

type ExecuteOptionsType<T> = Parameters<SignalInterface<T>['execute']>[0]

export default abstract class AbstractSignal<T> implements SignalInterface<T> {
  #identifier = getRandomId(20)
  #freshCache: Record<string, unknown> = {}
  #oldCache: Record<string, unknown> = {}
  #executionLocks: SignalInterface<unknown>[] = []

  protected _value!: T
  protected _subscribers: SignalInterface<unknown>[] = []
  protected _computed?: ComputedType<T>

  name?: string

  get identifier(): string {
    return this.#identifier
  }

  get value(): T {
    const signalStack = getSignalStack()
    if (signalStack.length) {
      const signal = signalStack[signalStack.length - 1]
      this.subscribe(signal)
    }
    return this._value
  }

  set value(value: T) {
    if (this._value === value) {
      return
    }
    this._value = value
    this._askSubscribersExecution()
  }

  constructor(name?: string) {
    this.name = name
  }

  protected _askSubscribersExecution(): void {
    queueMicrotask(() => {
      for (const subscriber of this._subscribers) {
        subscriber.execute({ demanderName: this.name })
      }
    })
  }

  #doExecution(willAskSubscribersExecution: boolean, _demanderName?: string): void {
    const signalStack = getSignalStack()
    if (this.#executionLocks.length) {
      return
    }

    signalStack.push(this)
    const result = this._computed!()

    if (result && result !== this.value) {
      if (willAskSubscribersExecution) {
        this.value = result
      } else {
        this._value = result
      }
    }
    signalStack.pop()
    this.#unlockSubscribersExecution()
  }

  #execute({
    willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack = false,
    willAskSubscribersExecution = true,
    demanderName = undefined
  }: ExecuteOptionsType<T> = {}): void {
    if (!this._computed) {
      return
    }

    if (willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack) {
      this.#doExecution(willAskSubscribersExecution, demanderName)
      return
    }

    const cacheKeys = Object.keys(this.#freshCache)

    const areThereData = !!Object.keys(this.#freshCache).length
    const isDataFresh = !cacheKeys.reduce((isSameData, key) => {
      if (this.#freshCache[key] !== this.#oldCache[key]) {
        return false
      }
      return isSameData
    }, true)

    if (areThereData && !isDataFresh) {
      return
    }

    this.#lockSubscribersExecution()
    queueMicrotask(() => {
      this.#doExecution(willAskSubscribersExecution, demanderName)
    })
  }

  #lockSubscribersExecution(): void {
    for (const subscriber of this._subscribers) {
      subscriber.lockExecution(this)
    }
  }

  #unlockSubscribersExecution(): void {
    queueMicrotask(() => {
      for (const subscriber of this._subscribers) {
        subscriber.unlockExecution(this, this.#identifier, this._value)
      }
    })
  }

  execute = debounce((options: ExecuteOptionsType<T> = {}) => this.#execute(options), 1)

  lockExecution(executionLock: SignalInterface<unknown>): void {
    if (!this._computed) {
      return
    }
    this.#executionLocks.push(executionLock)
  }

  subscribe(subscriber: SignalInterface<unknown>): void {
    if (subscriber === this) {
      return
    }
    const isAlreadyRegistered = !!this._subscribers.find((candidate) => {
      return candidate === subscriber
    })
    if (isAlreadyRegistered) {
      return
    }
    this._subscribers.push(subscriber)
  }

  unlockExecution(
    executionLock: SignalInterface<unknown>,
    dependencyIdentifier: string,
    dependencyValue: unknown,
  ): void {
    if (!this._computed) {
      return
    }
    if (this.#freshCache[dependencyIdentifier]) {
      this.#oldCache[dependencyIdentifier] = this.#freshCache[dependencyIdentifier]
    }
    this.#freshCache[dependencyIdentifier] = dependencyValue
    this.#executionLocks = this.#executionLocks.filter((lockCandidate) => {
      return lockCandidate !== executionLock
    })
  }
}
