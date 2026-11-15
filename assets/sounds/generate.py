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

# Bright ascending arpeggio with a short major-chord resolution; original composition.
save('success', 1.60, [(0,523.25,.28,.16),(.11,659.25,.28,.17),(.22,783.99,.3,.17),(.35,1046.5,.34,.15),(.52,1318.51,.33,.10),(.69,1046.5,.88,.10),(.69,783.99,.88,.09),(.69,659.25,.88,.08)])
save('error', .30, [(0,330,.16,.10),(.13,293.66,.16,.08)])
# A quiet high-to-low electronic blip, distinct from the melodic success cue.
save('click', .09, [(0,1320,.04,.06),(.025,660,.055,.045)])
