# Little-signal

## The magic trick

Now we have something that looks like a « signal », but it’s still not one. To make a real one, we need to transform this:

```ts
function render() {
  appElement.innerHTML = `second count: ${counter.get()}`;
}

createEffect(render, counter);
```

into this:

```ts
function render() {
  appElement.innerHTML = `second count: ${counter.get()}`;
}

createEffect(render);
```

As you can see, we’ve removed the second argument of the createEffect function in the last line. This means an effect has to discover « signals » on its own — both those used in its body and those used by the functions within it. We can achieve that in two steps: by approaching the problem from a different angle and leveraging the way JavaScript works.

## Approaching the problem from a different angle

In the last commit, we designed our « signal » so that signals register the effects that use them, rather than the other way around. This means it’s not the effects’ responsibility to discover the signals they use, but rather the signals’ responsibility to discover which effects use them. More precisely, they must determine which effects *read* them — because, if you think about it, only functions that read a signal are re-executed when the signal updates.  
Now we have that in head, we can easily imagine how a signal can use a service/tool/callItHowYouLike that will give him the currently executing effect:

```ts
// in src/signal/createSignal.ts
import { getCurrentEffect } from "./currentEffect";

export function createSignal<T>(initialValue: T): SignalInterface<T> {
  // ...
  
  const signal: SignalInterface<T> = {
    get() {
      const effect = getCurrentEffect();
      this.registerEffect(effect);

      return value;
    },
    
    // ...
  }
  
  return signal;
}
```

Of course, your IDE is showing red again because we need to create the `getCurrentEffect` function and, as you might have guessed, its counterpart, `setCurrentEffect`.

## Leveraging the way JavaScript works

Did you know that JavaScript is a single-threaded language? Unlike multi-threaded languages, a single-threaded language can only execute one task at a time. This means we can determine which function (in our case, which effect) is currently being executed. An effect simply needs to register itself in a `currentEffect` variable stored somewhere — like in a `src/signal/currentEffect.ts` file, which we already mentioned in the last paragraph. Let’s create this file and fill it as follows:

```ts
let currentEffect: () => void;

export function setCurrentEffect(effect: () => void) {
    currentEffect = effect;
}

export function getCurrentEffect(): () => void {
    return currentEffect;
}
```

Now that this is done, let’s talk about effect self-registration. To do so, we’ll work on the `src/signal/createEffect.ts` function, which will undergo significant changes. First, we no longer want the effect’s related signals in its signature. Since they are used almost everywhere in the function, we’ll end up removing a lot of lines.

```ts
export function createEffect(effect: () => void) {
}
```

Now, it’s time to mention something important: if we want our effect to be registered by our signals, we need to run it once. In fact, the effect gets registered by a signal when it accesses the signal’s value. This means we won’t keep the call to the render function I placed at the end of the src/main.ts file.  
We also need to set an effect as the currentEffect when it is executed. To achieve this, we will wrap our effect with additional functionality:

```ts
import { setCurrentEffect } from "./currentEffect"

export function createEffect(effect: () => void) {
  
  // decorate the effect
  const selfRegisteringEffect = () => {
    setCurrentEffect(selfRegisteringEffect);
    effect();
  };

  // run it once
  selfRegisteringEffect();
}
```
And that’s it. It’s functional—you can see it working in your browser. You now know the magic behind it.

In the next commit, we’ll talk about computed.