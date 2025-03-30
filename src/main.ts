import { createComputed } from "./signal/createComputed";
import { createEffect } from "./signal/createEffect";
import { createSignal } from "./signal/createSignal";
import "./style.css";

const appElement = document.querySelector<HTMLDivElement>('#app')!;
const counter = createSignal(0);
const evenOrOdd = createComputed(() => {
    return counter.get() % 2 ? 'odd' : 'even';
});
let renderCount = 0;

function render() {
  renderCount++;
  console.log(renderCount)
  appElement.innerHTML = `second count: ${counter.get()} - ${evenOrOdd.get()}`;
};

createEffect(render);

setInterval(() => counter.set(counter.get() + 1), 1000);
