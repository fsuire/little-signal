# Little-signal

## Computeds

Our exploration of « signal » wouldn’t be complete without discussing computeds. And that’s perfect because computeds will allow us to encounter some "easy difficulties" when developing our own version of « signal ».

Basically, a computed is an effect that returns a value. It can use the value of some signals to generate a new value and automatically re-compute it when any of its used signals change. We could use such a tool in our `src/main.js` like this :
```ts
const counter = createSignal(0);
const evenOrOdd = createComputed(() => {
    return counter.get() % 2 ? 'odd' : 'even';
});

function render() {
  appElement.innerHTML = `second count: ${counter.get()} - ${evenOrOdd.get()}`;
};
createEffect(render);
```

### The `createComputed` function

Let’s create the file `src/signal/createComputed.ts`, copy/paste the code from `src/signal/createEffect.ts` into it then carrefuly observe how the names have evolved :
```ts
import { setCurrentSignalUserFunc } from "./currentSignalUserFunc"

export function createComputed<T>(computed: () => T): SignalInterface<T> {
  const decoratedComputed = () => {
    setCurrentSignalUserFunc(decoratedComputed);
    computed();
  };

  decoratedComputed();
}
```
On the first line, we modified the name of the `setCurrentEffect` function to the more accurate `setCurrentSignalUserFunc`, as it needs to register both effects and computeds. Consequently, the filename had to be changed from `currentEffect.ts` to `currentSignalUserFunc`, and all the resulting renaming has been done inside our app. We won’t show these changes here, but you can check them directly in this commit.  

We also added a `<T>` in the function signature. This is because a computed holds a value, and consequently, the argument type has evolved. The last change in this signature is the return type: `SignalInterface<T>`. Since the `createComputed` function needs to return something that can be used like a signal, wether in an effect or another computed, using the `SignalInterface` is the natural choice.  

To implement it, we can simply use… a signal! And it can be updated at the same time as the computed value is recalculated, meaning within the `decoratedComputed` function :
```ts
export function createComputed<T>(computed: () => T): SignalInterface<T> {
  let signal: SignalInterface<T>;

  const decoratedComputed = () => {
    setCurrentSignalUserFunc(decoratedComputed);
    const computedValue = computed();

    if (!signal) {
      signal = createSignal(computedValue);
    } else {
      signal.set(computedValue);
    }
    
    return signal;
  };

  return decoratedComputed();
}
```
We could have made it more complicated by making the signal’s `set` function throw an error when used outside the `createComputed.ts` file, to inform the developper that a computed value cannot be set this way.  

And that’s it, our app is working! From now on, we won’t be coding anymore, we’ll just discuss the challenges inherent to such a concept.

## The "easy difficulties"

### Too much call

Do you know that our `render` function is called twice as much as expected? To be sure of that, just modify it like that:
```ts
let renderCount = 0;

function render() {
  renderCount++;
  console.log(renderCount)
  appElement.innerHTML = `second count: ${counter.get()} - ${evenOrOdd.get()}`;
};
createEffect(render);
```
When that code runs in your browser, you’ll notice that the number output in the console is roughly twice the one in the counter. That is something we didn’t expect. Why?  

Well, our render effects uses two signals: `counter` and `evenOrOdd`, both of which are updated at the same time, triggering a refresh of their `signalUserFunc` :  
1. counter is updated
2. This triggers the re-execution of the effects and computeds that depend on it: first, the `evenOrOdd` computed (because it’s declared first in the code), then the `render` effect.
3. `evenOrOdd` is updated. This, in turn, triggers the re-execution of the only effect that depends on it: `render`
4. The `render` effect is re-executed due to the `counter` update (triggered in step 2)
5. The `render` effect is re-re-executed due to the `evenOrOdd` update (triggered in step 3)

The problem is that the `render` function is being called too many times in a short period. The solution is quite easy (remember this is the "easy difficulties" section): we can debounce the execution of an effect or a computed.

### useless effect/computed recalculation
Look at this simple code:
```ts
const counter = createSignal(1);
let renderCount = 0;

function render() {
  renderCount++;
  console.log(renderCount)
  appElement.innerHTML = `second count: ${counter.get()}`;
};
createEffect(render);

counter.set(1);
```
We just initialized the `counter` to 1, then set its value to 1 again. Technically, nothing changed, yet when the code runs, we notice in the console that the `render` effect has been executed twice.  
Once again, the solution is straightforward: we need to cache the signal’s value. When the `set` method is called, it should only update dependant effects/computeds if the new value differs from the cached one.

OK. So, coding our own signal implementation seems easy, right? Well, in the next commit, we’ll see why that’s not entirely true…