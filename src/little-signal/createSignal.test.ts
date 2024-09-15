import { describe, expect, test } from 'vitest'
import createSignal from './createSignal'

describe('createSignal', () => {
  test('create a simple signal', () => {
    // given
    const signal = createSignal(1, { name: 'simple-signal' })

    // when
    signal(2)

    // then
    expect(signal()).toBe(2)
    expect(signal._ls_.name).toBe('simple-signal')
  })

  test('do not change value ref if it is the same', () => {
    // given
    const originalValue = { one: 1 }
    const signal = createSignal(originalValue)

    // when
    signal(originalValue)

    // then
    expect(signal()).toBe(originalValue)
  })
})
