"""Original quiet instrument-only UI tones. CC0. Python standard library only."""
import math, wave, struct
from pathlib import Path
RATE = 22050
ROOT = Path(__file__).parent

def save(name, duration, notes):
    samples = []
    for i in range(int(duration * RATE)):
        t = i / RATE
        value = 0
        for start, frequency, length, amplitude in notes:
            x = t - start
            if 0 <= x < length:
                envelope = min(x / .012, 1) * (1 - x / length) ** 2
                value += amplitude * envelope * (math.sin(2 * math.pi * frequency * x) + .12 * math.sin(4 * math.pi * frequency * x))
        samples.append(struct.pack('<h', int(max(-1, min(1, value)) * 32767)))
    with wave.open(str(ROOT / (name + '.wav')), 'wb') as out:
        out.setnchannels(1); out.setsampwidth(2); out.setframerate(RATE)
        out.writeframes(b''.join(samples))

save('success', 1.45, [(0,523.25,.5,.16),(.16,659.25,.5,.16),(.32,783.99,.6,.16),(.50,1046.5,.85,.10),(.50,659.25,.85,.08)])
save('error', .30, [(0,330,.16,.10),(.13,293.66,.16,.08)])
save('click', .09, [(0,740,.075,.07)])
