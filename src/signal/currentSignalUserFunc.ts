let currentSignalUserFunc: () => void;

export function setCurrentSignalUserFunc(signalUserFunc: () => void) {
    currentSignalUserFunc = signalUserFunc;
}

export function getCurrentSignalUserFunc(): () => void {
    return currentSignalUserFunc;
}