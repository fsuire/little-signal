/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-unused-vars
type DebounceFuncType = (...args: any[]) => void

export default function debounce(func: DebounceFuncType, delay: number): DebounceFuncType {
    let timeoutId: ReturnType<typeof setTimeout>

    return function (...args: any[]) {
        clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
            func(...args)
        }, delay)
    }
}
