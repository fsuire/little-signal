export type DeferredPromiseType = Promise<unknown> & {
    resolve: (..._args: unknown[]) => void
    reject: (..._args: unknown[]) => void
}

export default function getDeferredPromise(): DeferredPromiseType {
    let resolvePromise!: () => void
    let rejectPromise!: () => void

    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve as (..._args: unknown[]) => void
        rejectPromise = reject as (..._args: unknown[]) => void
    }) as DeferredPromiseType

    promise.resolve = resolvePromise
    promise.reject = rejectPromise

    return promise
}
