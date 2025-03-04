let currentEffect: () => void;

export function setCurrentEffect(effect: () => void) {
    currentEffect = effect;
}

export function getCurrentEffect(): () => void {
    return currentEffect;
}