"""Cue a narration take for film 4: where each script line sits in the file
and when each word is spoken.

    python cue_vo.py narration.mp3 script.txt vo-cues.json

script.txt has one line per narration line, `id|text`; audio tags in
[brackets] are ignored. Needs ffmpeg and faster-whisper (small.en). The
recognizer gives word times; the script gives the words (so spelling and
punctuation are ours). Line edges are moved to where the voice actually
starts and stops (energy over 10 ms frames), never into a neighbour line.
"""
import json
import re
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

SR = 16000


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def norm(w):
    w = w.lower().replace('virzyguns', 'virzy guns')
    return re.sub(r'[^a-z0-9]', '', w)


def align(ref, hyp):
    """Edit-distance alignment; returns, for each ref index, a hyp index or None."""
    n, m = len(ref), len(hyp)
    d = np.zeros((n + 1, m + 1), dtype=np.int32)
    d[:, 0] = np.arange(n + 1)
    d[0, :] = np.arange(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (0 if ref[i - 1] == hyp[j - 1] else 1))
    out = [None] * n
    i, j = n, m
    while i > 0 and j > 0:
        if d[i, j] == d[i - 1, j - 1] + (0 if ref[i - 1] == hyp[j - 1] else 1):
            out[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif d[i, j] == d[i - 1, j] + 1:
            i -= 1
        else:
            j -= 1
    return out


def main(audio_path, script_path, out_path):
    x = load(audio_path)
    lines = []
    for row in open(script_path, encoding='utf-8'):
        row = row.strip()
        if not row:
            continue
        lid, text = row.split('|', 1)
        text = re.sub(r'\[[^\]]*\]', '', text).strip()
        text = re.sub(r'\s+', ' ', text)
        lines.append({'id': lid.strip(), 'text': text, 'words': text.split()})
    model = WhisperModel('small.en', device='cpu', compute_type='int8')
    segs, _ = model.transcribe(x, word_timestamps=True, beam_size=5, language='en')
    hyp = [w for s in segs for w in s.words]
    # Split recognizer words like "Virzy Guns" consistently with the script.
    hw = []
    for w in hyp:
        for part in w.word.strip().replace('virzyguns', 'virzy guns').split():
            hw.append({'w': norm(part), 's': w.start, 'e': w.end})
    ref = [norm(w) for ln in lines for w in ln['words']]
    owner = [k for k, ln in enumerate(lines) for _ in ln['words']]
    match = align(ref, [h['w'] for h in hw])
    # Times per script word, interpolating any the recognizer missed.
    t = [None] * len(ref)
    for i, j in enumerate(match):
        if j is not None:
            t[i] = (hw[j]['s'], hw[j]['e'])
    for i in range(len(t)):
        if t[i] is None:
            prev = next((t[k] for k in range(i - 1, -1, -1) if t[k]), (0.0, 0.0))
            nxt = next((t[k] for k in range(i + 1, len(t)) if t[k]), (len(x) / SR, len(x) / SR))
            t[i] = (prev[1], max(prev[1], nxt[0]))
    # Energy in 10 ms frames, to find where speech really starts and stops.
    hop = SR // 100
    frames = len(x) // hop
    e = np.array([np.sqrt((x[k * hop:(k + 1) * hop] ** 2).mean()) for k in range(frames)])
    edb = 20 * np.log10(e + 1e-9)
    floor = np.percentile(edb, 10)
    voiced = edb > max(floor + 18, -45)
    # Each boundary goes in the longest silent run between the last word of
    # one line and the first word of the next (recognizer word edges are
    # approximate), so no line is cut mid-word.
    first = [min(t[i][0] for i in range(len(ref)) if owner[i] == li) for li in range(len(lines))]
    last_s = [max(t[i][0] for i in range(len(ref)) if owner[i] == li) for li in range(len(lines))]
    last_e = [max(t[i][1] for i in range(len(ref)) if owner[i] == li) for li in range(len(lines))]
    cuts = []
    for li in range(len(lines) - 1):
        a0 = int(last_s[li] * 100)
        b0 = min(frames - 1, int((first[li + 1] + 0.6) * 100))
        best, run, start = (None, 0), 0, None
        for f in range(a0, b0):
            if not voiced[f]:
                run += 1
                if start is None:
                    start = f
                if run > best[1]:
                    best = (start, run)
            else:
                run, start = 0, None
        if best[0] is None:
            mid = (last_e[li] + first[li + 1]) / 2
            cuts.append((mid, mid))
        else:
            cuts.append((best[0] / 100, (best[0] + best[1]) / 100))
    out = []
    for li, ln in enumerate(lines):
        idx = [i for i in range(len(ref)) if owner[i] == li]
        lo = cuts[li - 1][1] if li > 0 else 0.0
        hi = cuts[li][0] if li < len(lines) - 1 else len(x) / SR
        # Trim silence at the outer edges of the first and last line.
        fs = int(lo * 100)
        while li == 0 and fs < frames - 1 and not voiced[fs]:
            fs += 1
        fe = int(hi * 100)
        while li == len(lines) - 1 and fe > fs and not voiced[fe - 1]:
            fe -= 1
        start = fs / 100 if li == 0 else lo
        end = fe / 100 + (0.02 if li == len(lines) - 1 else 0) if li == len(lines) - 1 else hi
        words = [{'w': w, 's': round(min(max(0.0, t[i][0] - start), end - start), 3), 'e': round(min(end, max(t[i][1], t[i][0])) - start, 3)} for w, i in zip(ln['words'], idx)]
        out.append({'id': ln['id'], 'text': ln['text'], 'from': round(start, 3), 'to': round(end, 3), 'words': words})
    missed = sum(1 for j in match if j is None)
    doc = {
        'source': 'assets/vo/narration.mp3',
        'note': 'from/to: seconds in the source file, cut where the voice starts and stops (10 ms energy frames). Word times s/e are relative to `from`, from a local faster-whisper small.en pass aligned to the script; words the recognizer missed are interpolated.',
        'missed_words': missed,
        'segments': out,
    }
    json.dump(doc, open(out_path, 'w'), indent=1, ensure_ascii=False)
    print(f'{len(out)} lines, {len(ref)} words, {missed} interpolated')
    for s in out:
        print(f"{s['id']:<12} {s['from']:7.2f} {s['to']:7.2f}  {s['text']}")


if __name__ == '__main__':
    main(*sys.argv[1:4])
