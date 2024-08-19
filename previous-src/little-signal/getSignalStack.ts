import SignalInterface from "./SignalInterface";

const signalStack: SignalInterface<unknown>[] = []

export default function getSignalStack(): SignalInterface<unknown>[] {
    return signalStack
}