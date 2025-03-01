# Little-signal

## Intro

Do you know what « signal » is?  
In short, it’s what most (if not all) modern frontend frameworks use to automatically update the browser’s display when data changes. For instance:  
- React 18:
    ```js
    import { useState } from 'react';

    function SecondCounter() {
        const [count, setCount] = useState(0);
        
        setInterval(() => setCount(count + 1), 1000);
        
        return (
            <div>second count: {count}</div>
        );
    }
    ```
- Vue 3:
    ```html
    <template>
        <div>second count: {{count}}</div>
    </template>

    <script setup>
        import { ref } from 'vue'

        const count = ref(0)

        setInterval(() => count.value = count.value + 1, 1000);
    </script>
    ```

What’s cool about a « signal » is that you can export one from a file, modify it inside a component, and have any function (such as a `render` function) that uses it anywhere in your app run again.  

Have you ever wondered how it works? This GitHub repo is here to answer that question by developing a little implementation of « signal » with typescript, step by step, commit by commit, demystifying the magic.  

We’ll keep it simple, avoiding the approaches used by React, Vue, or Angular. While they offer a good developer experience in the end, following their methods would lead to complex structures that aren’t necessary to understand « signal ». Instead, we’ll create something closer to the existing proposal (because yes, there is a proposal! We’ll talk about it later).  

One more thing: what we’re building is for educational purposes only. It will lack many of the features that make existing framework implementations or the proposal reliable. Don’t use it in a production environment!

In the next commit, we’ll set up a dev environment using Vite. See you there!