let audioContext;
let isMuted = false;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playTone(frequency, duration, type = "square") {
    if (isMuted) return;
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
}

export function setMuted(value) {
    isMuted = value;
}

export function playEatSound() {
    playTone(880, 0.1);
}

export function playGameOverSound() {
    playTone(220, 0.15);
    setTimeout(() => playTone(150, 0.25), 120);
}
