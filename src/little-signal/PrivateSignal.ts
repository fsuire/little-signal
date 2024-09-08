import debounce from '../debounce'
import getRandomId from '../getRandomId'
import getSignalStack from './getSignalStack'
import SignalInterface from './SignalInterface'
import { ComputedType, SignalFunctionType, SetSignalInstanceOptionsType, ExecuteOptionsType, SignalType } from './types'

export default class PrivateSignal<T> {
  #value!: T
  #computed?: ComputedType<T>
  #executionLocks: SignalInterface<unknown>[] = []
  #freshCache: Record<string, unknown> = {}
  #oldCache: Record<string, unknown> = {}

  identifier = getRandomId(20)
  name?: string
  publicSignal!: SignalType<T> | { [K in keyof T]: SignalInterface<T[K]> } & SignalInterface<T>
  subscribers: SignalType<unknown>[] = []

  constructor(signalFunction: SignalFunctionType<T>, options: SetSignalInstanceOptionsType<T> = {}) {
    if (options.value !== undefined) {
      this.#value = options.value
    }
    this.publicSignal = signalFunction.bind(this) as SignalType<T>
    if (options.computed) {
      this.#computed = options.computed
    }
    if (options.name) {
      this.name = options.name
    }
    this.publicSignal._ls_ = this
  }

  getValue(): T {
    const signalStack = getSignalStack()
    if (signalStack.length) {
      const currentlyExecutedComputed = signalStack[signalStack.length - 1]
      this.subscribe(currentlyExecutedComputed)
    }
    return this.#value
  }

  setValue(value: T): void {
    if (this.#value === value) {
      return
    }

    this.#value = value
    this.#updateSubscribers()
  }

  #doExecution(willAskSubscribersExecution: boolean, _demanderName?: string): void {
    const signalStack = getSignalStack()
    if (this.#executionLocks.length) {
      return
    }

    signalStack.push(this.publicSignal as SignalInterface<unknown>)
    const result = this.#computed!()

    if (result && result !== this.publicSignal()) {
      if (willAskSubscribersExecution) {
        this.setValue(result)
      } else {
        this.#value = result
      }
    }
    signalStack.pop()
    this.#unlockSubscribersExecution()
  }

  #updateSubscribers(): void {
    queueMicrotask(() => {
      for (const subscriber of this.publicSignal._ls_.subscribers) {
        subscriber._ls_.updateCache(this.identifier, this.#value, this.name)
        subscriber._ls_.execute({ demanderName: this.publicSignal._ls_.name })
      }
    })
  }

  #lockSubscribersExecution(): void {
    for (const subscriber of this.publicSignal._ls_.subscribers) {
      subscriber._ls_.lockExecution(this.publicSignal as SignalInterface<unknown>)
    }
  }

  #unlockSubscribersExecution(): void {
    queueMicrotask(() => {
      for (const subscriber of this.publicSignal._ls_.subscribers) {
        subscriber._ls_.unlockExecution(
          this.publicSignal as SignalInterface<unknown>,
          this.identifier,
          this.#value,
          this.name,
        )
      }
    })
  }

  #executeWithoutDebounce({
    willExecuteDirectlyWithoutAnyControlsNorRegistrationInSignalStack = false,
    willAskSubscribersExecution = true,
    demanderName = undefined,
  }: ExecuteOptionsType = {}): void {
    if (!this.#computed) {
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

  subscribe(subscriber: SignalType<unknown>): void {
    if (subscriber === this.publicSignal || subscriber._ls_ === undefined) {
      return
    }
    const isAlreadyRegistered = !!this.publicSignal._ls_.subscribers.find((candidate) => {
      return candidate === subscriber
    })
    if (isAlreadyRegistered) {
      return
    }
    this.publicSignal._ls_.subscribers.push(subscriber)
  }

  execute = debounce((options: ExecuteOptionsType = {}) => {
    this.#executeWithoutDebounce(options)
  }, 1)

  #debouncedUpdateCacheFunctions: Record<
    string,
    (_dependencyIdentifier: string, _dependencyValue: unknown, _dependencyName?: string) => void
  > = {}
  updateCache(dependencyIdentifier: string, dependencyValue: unknown, _dependencyName?: string): void {
    if (!this.#debouncedUpdateCacheFunctions[dependencyIdentifier]) {
      this.#debouncedUpdateCacheFunctions[dependencyIdentifier] = debounce(
        (dependencyIdentifier, dependencyValue, _dependencyName) => {
          if (this.#freshCache[dependencyIdentifier]) {
            this.#oldCache[dependencyIdentifier] = this.#freshCache[dependencyIdentifier]
          }
          this.#freshCache[dependencyIdentifier] = dependencyValue
        },
        1,
      )
    }
    this.#debouncedUpdateCacheFunctions[dependencyIdentifier](dependencyIdentifier, dependencyValue, _dependencyName)
  }

  lockExecution(executionLock: SignalInterface<unknown>): void {
    if (!this.#computed) {
      return
    }
    this.#executionLocks.push(executionLock)
  }

  unlockExecution(
    executionLock: SignalInterface<unknown>,
    dependencyIdentifier: string,
    dependencyValue: unknown,
    dependencyName?: string,
  ): void {
    if (!this.#computed) {
      return
    }
    this.updateCache(dependencyIdentifier, dependencyValue, dependencyName)
    this.#executionLocks = this.#executionLocks.filter((lockCandidate) => {
      return lockCandidate !== executionLock
    })
  }
}
