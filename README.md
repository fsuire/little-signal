# Little-signal

## What we want

We want to build the "second counter" component we saw in the first commit. Eventually, we’d like it to look like this:

```ts
// get the target HTML element
const appElement = document.querySelector<HTMLDivElement>('#app')!;

// create a signal
const counter = createSignal(0);

// create an effect that will run on our signal update
createEffect(() => appElement.innerHTML = `second count: ${counter.get()}`);

// Increment the value of our signal every 1 second.
setInterval(() => count.set(count.get() + 1), 1000);
```

What we call an "effect" is a function that automatically runs when a signal it depends on is updated. The main question here is: 'How does the createEffect function know when the counter signal has been updated?', and that won’t be answered just yet. We need to make it work without that magic first, before adding some. Therefore we’ll explicitly declare the signals to the effect:

```ts
// for now, the createEffect function will use the first argument
// as "the callback", and all others will be signals to watch
createEffect(() => {
  appElement.innerHTML = `second count: ${counter.get()}`;
}, counter);
```

We can place that code in our `src/main.ts` file. Of course, it won’t work and your IDE will display a lot of red. Don’t forget to import the files that haven’t been created yet: ```import { createSignal } from "./signal/createSignal";``` and ```import { createEffect } from "./signal/createEffect";```

Don’t forget that you can refer to the actual `src/main.ts` file of this commit at any time.

## The `createEffect` function

Why do we start with the createEffect function and not the createSignal function? If you think about how it should work, you’d concede that the effect listens to its registered signals, and therefore we need to implement an event system. And yes, it would work.  

However, we need to use a different approach to set up a solid foundation for the future magic to perform (no, the trick won’t be revealed in this commit). Therefore, it’s not the effect that will register its used signals, but the signals that will register their effects.

Let’s create the `src/signal/createEffect.ts` file and fill it like this:
```ts
import { SignalInterface } from "./types";

export function createEffect<T>(effect: () => void, ...signals: SignalInterface<T>[]) {
  // each used signal must register the effect
  for (const signal of signals) {
    signal.registerEffect(effect);
  }
}
```
Yes, that’s all. The signals are responsible for running the registered effects when their value changes, so we don’t need to worry about it here.
By the way, have you noticed we’re importing a non-existing interface yet?

## The `SignalInterface`

Since I’m using TypeScript, I’m going to use an interface for the signals. If you’re using JavaScript, you can skip this part, but I think it’s important to at least consider what the structure we’ll manipulate will look like.  

Based on what we wrote in the `src/main.ts` file, we know that our `signal` interface must declare a `set` function that can take an argument of `any` type, and a `get` function that should return a value of the same type. However, we won’t use the `any` type; instead, we’ll use generic typing.  
We also need to declare the `registerEffect`.

So let’s create the `src/signal/types.ts` file and fill it like this:
```ts
export interface SignalInterface<T> {
  set: (value: T) => void
  get: () => T
  registerEffect: (effect: () => void) => void
}
```
Yes, I could have created a `src/signal/types/SignalInterface.ts` instead, expecting a single type per file, but since we’re not focusing on clean code or scalable architecture here, a single file for all types will do the job.

## The `createSignal` function

AH! We’re at the core of the subject! Let’s create that `src/signal/createSignal.ts` file and start filling it.  

I’ve chosen not to have a `Signal` class. Instead, the `createSignal` function will create the signal and return it: 

```ts
import { SignalInterface } from "./types";

export function createSignal<T>(initialValue: T): SignalInterface<T> {
  // the "value" variable is only accessible within the body of this function.
  // if our signal object, described within the body of this function, can
  // use it, it cannot be accessed from elsewhere.
  // Therefore, we can consider "value" as a private member of our signal object.
  let value: T = initialValue;
  
  const signal: SignalInterface<T> = {
    get() {
      return value;
    },
    
    set(newValue: T) {
      value = newValue;
    }
  }
  
  return signal;
}
```

### The `registerEffect` function

We’re going to add this function to our `signal` object. It’s quite easy:

```ts
export function createSignal<T>(initialValue: T): SignalInterface<T> {
  let value: T = initialValue;
  // add a Set to store the effects
  const effectList: Set<() => void> = new Set();
  
  const signal: SignalInterface<T> = {
    // ... get and set function we already wrote

    registerEffect(effect: () => void) {
      effectList.add(effect);
    }
  }
  
  return signal
}
```
I should mention that an `unregisterEffect` should also be added, but implementing it would lead to complexities that go beyond our scope.  

That being said, have you noticed we’re using a Set instead of an array to store the effects? A Set is a standard JavaScript data structure that is often underused, and that’s a pity. That’s why I’m making this aside.  
It’s basically an array that cannot contain the same element twice. And we don’t want an effect to be registered more than once. You can read [the doc on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) to learn more about `Set`!

### Automatically run the effects when the signal’s value is updated

Not really difficult either. We just need to modify the `set` function of our signal object so it loops through the effects and run them all:

```ts
const signal: SignalInterface<T> = {

  // ... get function

  set(newValue: T) {
    value = newValue;
    for (const effect of effectList) {
      effect();
    }
  }

  // registerEffect function
}
```

Everything should work now, and your IDE should no longer be showing red. Have you tried it in your browser?

### One last thing to notice

Have you noticed that our counter never displays « 0 »? At the very beginning, nothing is displayed… We have one second of suspense.
That’s because effects are only triggered when a signal is updated. To fix this, we could add an option to the `createEffect` signature that forces an initial execution of the effect, but we’re not going to do that, as this function will become more complex later. I’d rather keep it simple for now.
Instead, we can modify our `src/main.ts` file by creating a `render` function. This function will be used both by `createEffect` and immediatly after its declaration, acting as an initializer:

```ts
function render() {
  appElement.innerHTML = `second count: ${counter.get()}`;
  if (counter.get() === 10) stopEffect();
}
render();

createEffect(render, counter);
```
And because I think calling `render` right after its declaration looks ugly, I’ve placed it at the end of the file instead. But feel free to do as you prefer, we’ll change that in the next commit anyway.

That’s all for now. Remember, all this code is available in this commit, if you need to refer to it.  
In the next commit, we’ll talk a bit about the magic that makes a real « signal » and implement it.