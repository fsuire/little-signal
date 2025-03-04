import { createEffect } from "./signal/createEffect";
import { createSignal } from "./signal/createSignal";
import "./style.css"

const appElement = document.querySelector<HTMLDivElement>('#app')!;
const counter = createSignal(0);

function render() {
  appElement.innerHTML = `second count: ${counter.get()}`;
}

createEffect(render);

setInterval(() => counter.set(counter.get() + 1), 1000);
