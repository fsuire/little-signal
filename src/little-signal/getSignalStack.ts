import { SignalType } from './types'

const signalStack: SignalType<unknown>[] = []

export default function getSignalStack(): SignalType<unknown>[] {
  return signalStack
}
