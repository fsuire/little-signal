import littleSignal from './little-signal'
import { SignalType } from './little-signal/types'
import './style.scss'

// === SIGNALS AND COMPUTEDS === //

const amountSignal = littleSignal(0, { name: 'amountSignal' })
const commentSignal = littleSignal(
  () => {
    if (amountSignal() < 1) {
      return 'Zéro ♥'
    }
    if (amountSignal() < 3) {
      return "c'est peu"
    }
    if (amountSignal() < 6) {
      return "c'est mieux"
    }
    if (amountSignal() < 10) {
      return "c'est pas mal"
    }
    return `c'est beaucoup`
  },
  { name: 'commentSignal' },
)

littleSignal(
  () => {
    const amountElement = document.querySelector('#amountSignal')!
    amountElement.innerHTML = `amount: ${amountSignal()}`
    amountElement.classList.toggle('alternateColor')
    const commentElement = document.querySelector('#commentSignal')!
    commentElement.innerHTML = `comment: ${commentSignal()}`
    commentElement.classList.toggle('alternateColor')
  },
  { name: 'renderSignalAndComputeds' },
)

const renderSignalAndComputedsLoopId = setInterval(() => {
  amountSignal(amountSignal() + 1)
  if (amountSignal() >= 10) {
    clearInterval(renderSignalAndComputedsLoopId)
  }
}, 1000)

// // === DEEP STATE WITH OBJECT === //

function getRandomNumber(max = 10): number {
  return Math.floor(Math.random() * max)
}

const randomNumbersState = littleSignal(
  {
    randomNumber: -1,
    anotherRandomNumber: -1,
    innerState: {
      innerRandomNumber: -1,
    },
    justAString: 'test',
  },
  { name: 'randomNumbersState', deepness: 2 },
)

littleSignal(
  () => {
    const element = document.querySelector('#randomNumbersState-all')!
    element.innerHTML = JSON.stringify(randomNumbersState(), null, 2)
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithObject-all' },
)

littleSignal(
  () => {
    const element = document.querySelector('#randomNumbersState-randomNumber')!
    element.innerHTML = randomNumbersState.randomNumber().toString()
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithObject-randomNumber' },
)
littleSignal(
  () => {
    const element = document.querySelector('#randomNumbersState-anotherRandomNumber')!
    element.innerHTML = randomNumbersState.anotherRandomNumber().toString()
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithObject-anotherRandomNumber' },
)
littleSignal(
  () => {
    const element = document.querySelector('#randomNumbersState-innerRandomNumber')!
    element.innerHTML = randomNumbersState.innerState.innerRandomNumber().toString()
    element.classList.toggle('alternateColor')
    if (randomNumbersState.innerState.innerRandomNumber() === 0) {
      randomNumbersState.justAString('♥')
    }
    if (randomNumbersState.innerState.innerRandomNumber() === 9) {
      randomNumbersState.justAString('⚓')
    }
  },
  { name: 'renderStateWithObject-innerRandomNumber' },
)

setInterval(() => {
  let newRandomNumber = getRandomNumber()
  while (newRandomNumber === randomNumbersState.randomNumber()) {
    newRandomNumber = getRandomNumber()
  }
  randomNumbersState.randomNumber(newRandomNumber)
}, 2000)
setInterval(() => {
  let newRandomNumber = getRandomNumber()
  while (newRandomNumber === randomNumbersState.anotherRandomNumber()) {
    newRandomNumber = getRandomNumber()
  }
  randomNumbersState.anotherRandomNumber(newRandomNumber)
}, 1000)
setInterval(() => {
  let newRandomNumber = getRandomNumber()
  while (newRandomNumber === randomNumbersState.innerState.innerRandomNumber()) {
    newRandomNumber = getRandomNumber()
  }
  randomNumbersState.innerState.innerRandomNumber(newRandomNumber)
}, 3000)

// === STATE WITH ARRAY === //

const randomNumbersArray = littleSignal([-1, -1, 'test', [-1, -1]], { name: 'randomNumbersArray', deepness: 2 })

littleSignal(
  () => {
    const element = document.querySelector('#stateWithArray-all')!
    element.innerHTML = JSON.stringify(randomNumbersArray(), null, 2)
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithArray-all' },
)
littleSignal(
  () => {
    const element = document.querySelector('#stateWithArray-number')!
    element.innerHTML = randomNumbersArray[1]().toString()
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithArray-number' },
)
littleSignal(
  () => {
    const element = document.querySelector('#stateWithArray-string')!
    element.innerHTML = randomNumbersArray[2]() as string
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithArray-string' },
)
littleSignal(
  () => {
    const element = document.querySelector('#stateWithArray-innerNumber')!
    element.innerHTML = ((randomNumbersArray[3] as SignalType<Array<unknown>>)[0]() as number).toString()
    element.classList.toggle('alternateColor')
  },
  { name: 'renderStateWithArray-innerNumber' },
)

setInterval(() => {
  let newRandomNumber = getRandomNumber()
  const signal = randomNumbersArray[1] as SignalType<number>
  while (newRandomNumber === signal()) {
    newRandomNumber = getRandomNumber()
  }

  const signalString = randomNumbersArray[2] as SignalType<string>
  if (newRandomNumber === 0) {
    signalString('♥')
  }
  if (newRandomNumber === 9) {
    signalString('⚓')
  }
  signal(newRandomNumber)
}, 2000)
setInterval(() => {
  const newRandomNumber = getRandomNumber()
  if (newRandomNumber === 9) {
    const wholeSubArraySignals = randomNumbersArray[3] as SignalType<number[]>
    const previousValues = wholeSubArraySignals()
    wholeSubArraySignals([newRandomNumber, (previousValues[1] as number) + 1])
  } else {
    ;((randomNumbersArray[3] as SignalType<Array<unknown>>)[0] as SignalType<number>)(newRandomNumber)
  }
}, 500)

// === STATE WITH OBJECTS AND ARRAYS === //
