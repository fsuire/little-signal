import { setCurrentSignalUserFunc } from "./currentSignalUserFunc"

export function createEffect(effect: () => void) {
  const decoratedEffect = () => {
    setCurrentSignalUserFunc(decoratedEffect);
    effect();
  };

  decoratedEffect();
}