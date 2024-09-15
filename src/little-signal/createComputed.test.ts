import { describe, expect, test } from 'vitest'
import createComputed from './createComputed'
import createSignal from './createSignal'
import getDeferredPromise from '../getDeferredPromise'

describe('createSignal', () => {
  test('create a simple computed', async () => {
    // given
    const deferredPromise = getDeferredPromise()
    const signal = createSignal('goodbye')
    const computed = createComputed(
      () => {
        deferredPromise.resolve()
        return `${signal()} world`
      },
      { name: 'simple-computed' },
    )

    // when
    signal('hello')
    await deferredPromise

    // then
    expect(computed()).toBe('hello world')
    expect(computed._ls_.name).toBe('simple-computed')
  })

  test('cascading computeds', async () => {
    // given
    const deferredPromise = getDeferredPromise()
    const signal1 = createSignal(1)
    const signal2 = createSignal(2)
    const signal3 = createSignal(3)
    let computed1CallCount = 0
    const computed1 = createComputed(() => {
      computed1CallCount++
      return signal1() + signal2()
    })
    let computed2CallCount = 0
    const computed2 = createComputed(() => {
      computed2CallCount++
      return signal1() + signal3()
    })
    let computed3CallCount = 0
    const computed3 = createComputed(() => {
      computed3CallCount++
      return computed1() + computed2()
    })
    let computed4CallCount = 0
    const computed4 = createComputed(() => {
      computed4CallCount++
      deferredPromise.resolve()
      return `result is ${computed3()}`
    })

    // when
    signal1(2)
    signal2(3)
    signal3(4)
    await deferredPromise

    // then
    expect(computed4()).toBe('result is 11')
    expect(computed1CallCount).toBe(1)
    expect(computed2CallCount).toBe(1)
    expect(computed3CallCount).toBe(1)
    expect(computed4CallCount).toBe(1)
  })
})
