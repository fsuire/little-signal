# Little-signal

## Computeds

Our exploration of « signal » wouldn’t be complete without discussing computeds.  

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

And that’s it, our app is working!  

With that done, we can now start imagining complex structures, such as the following:
```ts
const complexStructure = createComplexStructure([
    {
        name: 'Joe',
        friends: ['Jack', 'William', 'Averell']
    }
]);
```

We won’t implement that here because we have already achieved our goal of creating a small « signal » implementation to better understand how it works. If you want to try it for fun, go ahead. But before you start, we will take a moment in the next commit to talk about some of the challenges you will encounter.
