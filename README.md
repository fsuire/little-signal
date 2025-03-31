# Little-signal

## Challenges

### Asynchronicity

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

The problem is that the `render` function is triggered too frequently in a short span of time. The solution is fairly straightforward: we can debounce the execution of an effect or a computed. However, doing so shifts their actual execution and resolution into a future phase of the event loop. This means we have to handle asynchronicity. And not just because of debouncing, but also because we may need to use promises within some effects or computeds anyway.

The main difficulty when dealing with promises is that you can’t be sure when they’ll resolve, which means you can’t guarantee the order in which they do. This can be problematic, especially when some promises depend on the resolution of others. To illustrate this, let’s look at an example [from Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming#Glitches). Imagine that (pseudo) code:
```
seconds = signal that updates itself
t = computed that returns second + 1
g = computed that returns true if t > second
```

`t` should always be greater than `seconds`, so `g` should always be true. However, even if `t` is declared before `g`, we can’t assume that `t` will always be evaluated before `g`. If, on a `seconds` update, `g` gets evaluated before `t`, then `g` will be false and will potentialy cause your algorythm to fail. That’s what is called, in the context of reactive programming, "a glitch".  

To solve this, a signal implementation must organize its signals, effects, and computeds into a hierarchy where the first depends on nothing, the second depends on the first, and so on.  
To achieve such a hierarchy, a topological sorting algorithm could be used. We won’t go into detail about it, but if you want to learn more, reading the [Wikipedia article](https://en.wikipedia.org/wiki/Topological_sorting) or watching [a youtube video on the subject](https://www.youtube.com/results?search_query=topological+sorting) would be a good choice.

### Cache and memory management

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
We just initialized the `counter` to `1`, then set its value to `1` again. Technically, nothing changed, yet when the code runs, we notice in the console that the `render` effect has been executed twice.  
Once again, the solution is straightforward: we need to cache the signal’s value. When the `set` method is called, it should only update dependant effects/computeds, given by a topological sorting algorithm, if the new value differs from the cached one.  

But when we talk about caching, we also need to consider how it should be cleaned up, in order to reduce memory usage. For instance, if we have a large number of rarely used signals, could we flush their caches after a certain period of inactivity? Or maybe disable caching for them altogether? Moreover, do you remember that we store what we called `signalUserFunc` (effects and computed) within each signals? The garbage collector will never target a computed or an effect since there’s a reference of them here… So, how do we clean that up?
