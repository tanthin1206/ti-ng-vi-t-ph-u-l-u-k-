import math, struct, subprocess, os, wave

def generate_bgm():
    sample_rate = 44100
    bpm = 74
    sec_per_beat = 60.0 / bpm
    total_beats = 32  # 8 bars of 4/4
    total_duration = total_beats * sec_per_beat
    total_samples = int(total_duration * sample_rate)

    left = [0.0] * total_samples
    right = [0.0] * total_samples

    # Note frequencies
    NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    def freq(name, octave):
        idx = NOTE_NAMES.index(name)
        midi = 12 * (octave + 1) + idx
        return 440.0 * (2.0 ** ((midi - 69) / 12.0))

    # Chords: Cmaj7 -> Am9 -> Fmaj7 -> Gsus4 / G7 -> Em7 -> Am7 -> Dm7 -> G7
    chord_prog = [
        # Bar 1: Cmaj7 (C3, G3, B3, E4)
        [('C', 3), ('G', 3), ('B', 3), ('E', 4)],
        # Bar 2: Am9 (A2, E3, G3, C4, B4)
        [('A', 2), ('E', 3), ('G', 3), ('C', 4)],
        # Bar 3: Fmaj7 (F2, C3, E3, A3)
        [('F', 2), ('C', 3), ('E', 3), ('A', 3)],
        # Bar 4: Gsus4 -> G (G2, D3, G3, C4 -> B3)
        [('G', 2), ('D', 3), ('G', 3), ('B', 3)],
        # Bar 5: Em7 (E2, B2, D3, G3)
        [('E', 2), ('B', 2), ('D', 3), ('G', 3)],
        # Bar 6: Am7 (A2, E3, G3, C4)
        [('A', 2), ('E', 3), ('G', 3), ('C', 4)],
        # Bar 7: Dm7 (D2, A2, C3, F3)
        [('D', 2), ('A', 2), ('C', 3), ('F', 3)],
        # Bar 8: G7 (G2, D3, F3, B3)
        [('G', 2), ('D', 3), ('F', 3), ('B', 3)],
    ]

    # Melody notes (beat_pos, note, oct, dur_beats, vel, pan)
    melody = [
        # Bar 1: C - E - G - B
        (0.0, 'E', 5, 2.0, 0.45, -0.2),
        (2.0, 'G', 5, 1.5, 0.40, -0.1),
        (3.5, 'E', 5, 0.5, 0.35, -0.15),
        # Bar 2: A - C - B
        (4.0, 'C', 6, 2.0, 0.42, 0.2),
        (6.0, 'B', 5, 1.0, 0.38, 0.15),
        (7.0, 'A', 5, 1.0, 0.35, 0.1),
        # Bar 3: A - G - F - E
        (8.0, 'G', 5, 2.5, 0.42, -0.2),
        (10.5, 'F', 5, 0.5, 0.35, -0.1),
        (11.0, 'E', 5, 1.0, 0.38, -0.15),
        # Bar 4: D - E - D
        (12.0, 'D', 5, 3.0, 0.40, 0.1),
        (15.0, 'D', 5, 1.0, 0.32, 0.05),
        # Bar 5: G - B - D
        (16.0, 'G', 5, 2.0, 0.44, -0.15),
        (18.0, 'B', 5, 1.5, 0.38, -0.05),
        (19.5, 'A', 5, 0.5, 0.32, -0.1),
        # Bar 6: C - E - D - C
        (20.0, 'E', 5, 2.0, 0.42, 0.2),
        (22.0, 'D', 5, 1.0, 0.36, 0.1),
        (23.0, 'C', 5, 1.0, 0.38, 0.05),
        # Bar 7: D - F - A
        (24.0, 'F', 5, 2.0, 0.40, -0.1),
        (26.0, 'A', 5, 1.5, 0.38, -0.05),
        (27.5, 'G', 5, 0.5, 0.32, -0.1),
        # Bar 8: E - D - C
        (28.0, 'E', 5, 2.0, 0.42, 0.15),
        (30.0, 'D', 5, 2.0, 0.38, 0.1),
    ]

    # Add soft warm chord pads
    for bar_idx, chord in enumerate(chord_prog):
        start_t = bar_idx * 4.0 * sec_per_beat
        dur_t = 4.0 * sec_per_beat
        start_sample = int(start_t * sample_rate)
        num_s = int(dur_t * sample_rate)

        for n_name, octv in chord:
            f = freq(n_name, octv)
            for i in range(num_s):
                pos = start_sample + i
                if pos >= total_samples:
                    pos -= total_samples
                t = i / sample_rate
                # smooth envelope
                env = math.sin(math.pi * (i / num_s)) ** 2
                val = 0.07 * env * (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t))
                left[pos] += val * 0.7
                right[pos] += val * 0.7

    # Add gentle celesta / harp arpeggio (16th notes or 8th notes)
    for bar_idx, chord in enumerate(chord_prog):
        base_beat = bar_idx * 4.0
        # 8th note arpeggios
        for step in range(8):
            note_idx = step % len(chord)
            n_name, octv = chord[note_idx]
            f = freq(n_name, octv + 1)
            b_pos = base_beat + step * 0.5
            start_t = b_pos * sec_per_beat
            start_s = int(start_t * sample_rate)
            dur_s = int(1.2 * sample_rate)
            pan = -0.3 + 0.6 * (step / 7.0)

            for i in range(dur_s):
                pos = start_s + i
                if pos >= total_samples:
                    pos -= total_samples
                t = i / sample_rate
                # celesta decay
                env = math.exp(-3.2 * t)
                val = 0.09 * env * (
                    math.sin(2 * math.pi * f * t) +
                    0.25 * math.sin(4 * math.pi * f * t) +
                    0.08 * math.sin(6 * math.pi * f * t)
                )
                left[pos] += val * (0.5 - 0.5 * pan)
                right[pos] += val * (0.5 + 0.5 * pan)

    # Add cute melody (music box / warm bell)
    for b_pos, n_name, octv, dur_b, vel, pan in melody:
        f = freq(n_name, octv)
        start_t = b_pos * sec_per_beat
        start_s = int(start_t * sample_rate)
        dur_s = int(dur_b * sec_per_beat * sample_rate * 1.5)

        for i in range(dur_s):
            pos = start_s + i
            if pos >= total_samples:
                pos -= total_samples
            t = i / sample_rate
            # music box envelope (crisp attack, warm ringing decay)
            env = math.exp(-2.2 * t)
            # bell harmonics
            val = vel * env * (
                1.0 * math.sin(2 * math.pi * f * t) +
                0.35 * math.sin(4 * math.pi * f * t) +
                0.12 * math.sin(6 * math.pi * f * t) +
                0.05 * math.sin(8 * math.pi * f * t)
            )
            left[pos] += val * (0.5 - 0.5 * pan)
            right[pos] += val * (0.5 + 0.5 * pan)

    # Normalize gently and soft-clip to avoid clipping
    max_amp = max(max(abs(x) for x in left), max(abs(x) for x in right), 0.001)
    scale = 0.85 / max_amp

    # Write WAV
    wav_path = "assets/audio/bgm.wav"
    os.makedirs("assets/audio", exist_ok=True)
    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = bytearray()
        for l, r in zip(left, right):
            sl = int(max(-1.0, min(1.0, l * scale)) * 32767)
            sr = int(max(-1.0, min(1.0, r * scale)) * 32767)
            frames.extend(struct.pack("<hh", sl, sr))
        wf.writeframes(frames)

    # Convert to MP3
    mp3_path = "assets/audio/bgm.mp3"
    subprocess.run(["C:\\ffmpeg\\bin\\ffmpeg.EXE", "-y", "-i", wav_path, "-b:a", "128k", mp3_path], check=True)
    print("BGM generated successfully:", mp3_path)

if __name__ == "__main__":
    generate_bgm()
