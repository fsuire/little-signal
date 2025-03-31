# Little-signal

## Real difficulties

Computeds allowed us to observe some simple issues inherent to a « signal » implementation. Of course, there are challenges that are much more, significantly more complex than the ones we encountered. We will briefly discuss some of them and then conclude our exploration of « signal ».

### Glitches and topological sorting

Some of you may argue that the following section constitutes plagiarism of Wikipedia (https://en.wikipedia.org/wiki/Reactive_programming#Glitches), and you would be right. But their exemple is perfect, so let’s use it.

Imagine that (pseudo) code:
```
seconds = signal that updates itself
t = computed that returns second + 1
g = computed that returns true if t > second
```

`t` should always be greater than `seconds`, and `g` should always be true. Since `t` was declared before `g`, we might assume that `t` will always be evaluated before `g`. Sorry to disappoint you, but we have no guarantee of that. So, if on a `seconds` update `g` is evaluated before `t`, then it will be false. That’s what is called, in the context of reactive programming, "a glitch".  

To solve this, a signal implementation must organize its signals, effects, and computeds into a hierarchy where the first depends on nothing, the second depends on the first, and so on.  
To achieve such a hierarchy, a topological sorting algorithm could be used. We won’t go into detail about it, but if you want to learn more, reading the [Wikipedia article](https://en.wikipedia.org/wiki/Topological_sorting) or watching [a youtube video on the subject](https://www.youtube.com/results?search_query=topological+sorting) would be a good choice.