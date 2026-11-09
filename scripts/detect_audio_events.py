import os
import numpy as np
from scipy.io import wavfile

DIR_INSPECT = r"earpa-video\out\gameplay_inspection"

def analyze_audio(wav_name):
    wav_path = os.path.join(DIR_INSPECT, wav_name)
    sr, data = wavfile.read(wav_path)
    if data.ndim == 2:
        data = data.mean(axis=1) # stereo to mono
    
    # Normalize to -1.0 .. 1.0
    data = data.astype(np.float32) / (np.max(np.abs(data)) + 1e-6)
    
    # Calculate energy envelope in 50ms windows
    window_samples = int(0.05 * sr)
    hop_samples = int(0.02 * sr)
    
    times = []
    energies = []
    for i in range(0, len(data) - window_samples, hop_samples):
        chunk = data[i:i+window_samples]
        energy = np.sqrt(np.mean(chunk**2))
        t = i / sr
        times.append(t)
        energies.append(energy)
        
    times = np.array(times)
    energies = np.array(energies)
    
    # Find onset peaks
    threshold = 0.08
    peaks = []
    for i in range(1, len(energies)-1):
        if energies[i] > threshold and energies[i] > energies[i-1] and energies[i] > energies[i+1]:
            # Minimum distance between onsets: 0.15s
            if not peaks or (times[i] - peaks[-1][0]) > 0.15:
                peaks.append((times[i], energies[i]))
                
    print(f"\n==========================================")
    print(f"AUDIO ONSETS IN {wav_name} (Duration: {len(data)/sr:.2f}s)")
    print(f"Detected {len(peaks)} audio event peaks:")
    for t, e in peaks:
        print(f"  {t:6.2f}s : peak energy={e:.3f}")

analyze_audio("WhatsApp_Video_2026-11-09_at_8.34.40_PM.wav")
analyze_audio("WhatsApp_Video_2026-11-09_at_8.36.32_PM.wav")
