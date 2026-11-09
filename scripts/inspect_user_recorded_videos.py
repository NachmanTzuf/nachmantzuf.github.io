import os
import subprocess
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

DIR_PATH = r"C:\Users\Hp\Pictures\EARPA ui potos"

print(f"Inspecting directory: {DIR_PATH}")
files = [f for f in os.listdir(DIR_PATH) if f.lower().endswith(('.mp4', '.mov', '.mkv', '.webm'))]
print(f"Found {len(files)} video files:")

for f in files:
    full = os.path.join(DIR_PATH, f)
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration,size,bit_rate',
        '-show_entries', 'stream=index,codec_type,codec_name,width,height,r_frame_rate,duration',
        '-of', 'json', full
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, text=True)
    try:
        data = json.loads(res.stdout)
        fmt = data.get('format', {})
        streams = data.get('streams', [])
        v_stream = next((s for s in streams if s.get('codec_type') == 'video'), {})
        a_stream = next((s for s in streams if s.get('codec_type') == 'audio'), {})
        dur = float(fmt.get('duration', 0))
        size = int(fmt.get('size', 0))
        w = v_stream.get('width')
        h = v_stream.get('height')
        fps = v_stream.get('r_frame_rate')
        v_codec = v_stream.get('codec_name')
        a_codec = a_stream.get('codec_name', 'none')
        print(f"\n--- {f} ---")
        print(f"  Duration: {dur:.2f}s ({int(dur*30)} frames @ 30fps)")
        print(f"  Resolution: {w}x{h} (Aspect: {w/h if h else 0:.3f})")
        print(f"  FPS: {fps}")
        print(f"  Video Codec: {v_codec}, Audio Codec: {a_codec}")
        print(f"  Size: {size:,} bytes ({size/1024/1024:.2f} MB)")
    except Exception as e:
        print(f"Error probing {f}: {e}")
