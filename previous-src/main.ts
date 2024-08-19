import { Computed, Signal, State } from './little-signal'
import './style.scss'

const firstSignal = new Signal(0)

const getAmountTemplate = new Computed(() => {
  return `amount: ${firstSignal.value}`
})

const getCommentTemplate = new Computed(() => {
  if (firstSignal.value < 2) {
    return "comment: that's not much"
  }
  if (firstSignal.value < 5) {
    return "comment: it's better"
  }
  if (firstSignal.value < 8) {
    return 'comment: not bad'
  }
  return 'comment: amazing'
})

new Computed(() => {
  const amountElement = document.querySelector<HTMLDivElement>('#amount')!
  amountElement.innerHTML = getAmountTemplate.value
  amountElement.classList.toggle('alternateColor')
  const commentElement = document.querySelector<HTMLDivElement>('#comment')!
  commentElement.innerHTML = getCommentTemplate.value
  commentElement.classList.toggle('alternateColor')
})

const loopId = setInterval(() => {
  firstSignal.value++
  if (firstSignal.value >= 10) {
    clearInterval(loopId)
  }
}, 1000)

// -----------------------------

function getRandomNumber(max = 10): number {
  return Math.floor(Math.random() * max);
}

type StateObjectType = {
  randomNumber: number
  anotherRandomNumber: number
}

const stateObject = new State<StateObjectType>({
  randomNumber: getRandomNumber(),
  anotherRandomNumber: getRandomNumber()
})

new Computed(() => {
  const element = document.querySelector<HTMLDivElement>('#fullStateObject')!
  element.innerHTML = JSON.stringify(stateObject.value, null, 2)
  element.classList.toggle('alternateColor')
}, 'renderFullStateObject')
new Computed(() => {
  const element = document.querySelector<HTMLDivElement>('#fullStateObject-randomNumber')!
  element.innerHTML = `${stateObject.state.randomNumber.name}: ${stateObject.state.randomNumber.value}`
  element.classList.toggle('alternateColor')
}, 'renderRandomNumber')
new Computed(() => {
  const element = document.querySelector<HTMLDivElement>('#fullStateObject-anotherRandomNumber')!
  element.innerHTML = `${stateObject.state.anotherRandomNumber.name}: ${stateObject.state.anotherRandomNumber.value}`
  element.classList.toggle('alternateColor')
}, 'renderAnotherRandomNumber')

setInterval(() => {
  stateObject.state.randomNumber.value = getRandomNumber()
}, 3000)
setInterval(() => {
  stateObject.state.anotherRandomNumber.value = getRandomNumber()
}, 5000)
