# Little-signal

## Conclusion

Now that we’ve implemented the beginnings of « signal », we have a better understanding of how it works. Before we wrap up, you should know that the terms we've used—like `effect` or `computed`—don’t always have the exact same definition across different signal implementations. Each framework has faced the many challenges this kind of development presents and come up with its own unique solutions.

There is currently no standardized signal implementation. A [proposal](https://github.com/tc39/proposal-signals) is in progress, but as the authors wrote in the README, it won’t be available for "2–3 years at an absolute minimum." A usable [polyfill](https://github.com/proposal-signals/signal-polyfill) does exist, though it's still subject to change at any time.

We’ve reached the penultimate commit of this “little signal” repo—and the final one of this discussion. The next and last commit will contain only a README.md file explaining how to use the repo.

I hope you found this interesting. :)