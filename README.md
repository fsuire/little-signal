# Little-signal

## Setting up our dev environment

### Node.js

What?! You don’t have Node.js installed yet? Please install it now using the method of your choice, depending on your OS.
At the time of writing this, I’m using Node.js 22 (LTS/Jod), so don’t use anything too outdated.

### Vite

Vite installs itself quite easily through its CLI initializer, offers a comfortable environment with HMR and other features, and thanks to its low-dependency approach, I shouldn’t encounter any difficulties updating this repository (if needed).

```shell
$ npm create vite@latest
```

The initializer will ask you for the project name (I chose « little-signal »), the framework you want to use (« Vanilla »), and the language variant (« TypeScript », but you can just use JavaScript instead if you prefer).  
Once done, go to your project directory, install the dependencies, and start the server:

```shell
$ cd <your project name>
$ npm i
$ npm run dev
```

### Delete what’s not needed

I’ve deleted:
- the `src/counter.ts` file.
- some of the `src/style.css` content (feel free to adjust as you like; this is not our focus).
- the `src/typescript.svg` logo

I’ve kept the `public/vite.svg` logo, because it’s used as the favicon and I think it’s usefull when finding your dev tab among the numerous tabs already opened in your browser.

I’ve also rewritten the `src/main.ts` to make it a bare-bones base for our future developments:

```ts
import './style.css'

const appElement = document.querySelector<HTMLDivElement>('#app')!
appElement.innerHTML = `
  hello little-signal
`
```

In the next commit, we’ll start building a "non-magic" version of « signal ».