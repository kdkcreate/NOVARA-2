"""Encode the Blender checkpoint frames as a 28-second, 24-fps H.264 film."""
from pathlib import Path
import subprocess
import tempfile
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--segment", type=int, choices=range(7))
parser.add_argument("--join", action="store_true")
args = parser.parse_args()

root = Path(__file__).resolve().parent
frames = Path('/tmp/encycle-render')
sequence = [frames / 'frame_0001.png'] * 96
sequence += [frames / f'frame_{frame:04d}.png' for frame in range(193, 673, 2)]
missing = [str(path) for path in sequence if not path.is_file()]
if missing:
    raise SystemExit(f'Render is incomplete: {len(missing)} frames missing; first: {missing[0]}')

segments = [args.segment] if args.segment is not None else ([] if args.join else range(7))
for segment in segments:
    # Include two look-ahead frames for interpolation at each segment boundary.
    padded = sequence + [sequence[-1]] * 2
    chunk = padded[segment * 48:segment * 48 + 50]
    with tempfile.TemporaryDirectory(prefix='encycle-sequence-') as directory:
        for index, source in enumerate(chunk):
            (Path(directory) / f'{index:04d}.png').symlink_to(source)
        subprocess.run([
            'ffmpeg', '-hide_banner', '-y', '-framerate', '12',
            '-i', str(Path(directory) / '%04d.png'),
            '-vf', 'hqdn3d=2:2:3:3,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,tpad=stop_mode=clone:stop_duration=1,trim=duration=4,setpts=PTS-STARTPTS',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
            '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
            str(frames / f'segment-{segment}.mp4'),
        ], check=True)

if args.segment is not None:
    raise SystemExit(0)

concat = frames / 'segments.txt'
concat.write_text(''.join(f"file 'segment-{i}.mp4'\n" for i in range(7)))
subprocess.run([
    'ffmpeg', '-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat),
    '-c', 'copy', '-movflags', '+faststart', str(root / 'Encycle-Bank-Assembly.mp4'),
], check=True)

subprocess.run([
    'ffmpeg', '-hide_banner', '-y', '-i', str(frames / 'frame_0601.png'),
    '-frames:v', '1', '-q:v', '2', str(root / 'Encycle-Bank-Assembly.jpg'),
], check=True)
