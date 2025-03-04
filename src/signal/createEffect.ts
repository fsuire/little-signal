import { setCurrentEffect } from "./currentEffect"

export function createEffect(effect: () => void) {
  const selfRegisteringEffect = () => {
    setCurrentEffect(selfRegisteringEffect);
    effect();
  };

  selfRegisteringEffect();
}