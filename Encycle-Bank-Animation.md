# Encycle Bank — assembly film

Open `Encycle-Bank-Assembly.mp4` to watch the film. Open
`Encycle-Bank-Assembly.blend` in Blender to edit the models, materials, camera,
labels and animation. The source generator is `encycle-animation.py`.

## Film structure

- **0–8 seconds:** eight separately displayed, labelled assemblies.
- **8–17 seconds:** the container, controller, servo, trapdoor, sensor, camera,
  touchscreen and enclosure move into their assembled positions.
- **17–28 seconds:** assembled kiosk reveal with a gentle camera move and the
  complete user workflow.

The workflow includes Gmail and phone sign-in, OTP verification, category and
damage selection, a verification photograph, a 15-second deposit window,
tracking and a paperless receipt, and a certificate after consistent deposits.
The 15-second window is described on screen; this is an assembly film, not a
real-time simulation of a deposit or working kiosk software.

## Reference interpretation

All three supplied `Encycle Bank1.mp4`, `Encycle Bank2.mp4` and
`Encycle Bank3.mp4` videos were inspected. The compact dark enclosure, inclined
display and elevated camera inform the exterior. The supplied
`IMG-20261022-WA0046.jpg` shows an electronic-component sculpture on a PC
motherboard; it supplies project context rather than verified kiosk internals.

The Raspberry Pi 4, touchscreen, Pi camera, ultrasonic module and MG90S servo
are simplified visual models based on the requested component list. Mounting
positions, dimensions, cable routing and mechanical clearances are conceptual.
The secure container is represented as an enclosed collection compartment;
the model is not a fabrication-ready or security-tested design. Black PLA
with fine printed-layer bump texture is a requested material assumption.

The eight assembly roots are numbered in Blender's Outliner. Fonts and the
original NOVARA plaque image are packed in the blend file for portability.

## Rebuild

The generator was created with Blender 5.2.3 LTS. Run from this directory:

```sh
mkdir -p /tmp/encycle-render
XDG_CACHE_HOME=/tmp/encycle-cache ALSOFT_DRIVERS=null blender -b -noaudio --threads 8 --python encycle-animation.py -- --preview
XDG_CACHE_HOME=/tmp/encycle-cache ALSOFT_DRIVERS=null blender -b -noaudio --threads 8 --python encycle-animation.py -- --render
python encode-encycle.py
```

The first command renders three checkpoints; the second renders the stationary
opening and alternate frames during motion. The editable scene retains the
complete 24-fps timeline. The delivery video uses interpolated intermediate
frames for 24-fps playback, plus light temporal denoising. It is silent.
For native-frame or higher-resolution output, open the blend file, select an
output directory and render the full animation in Blender.

Add `--resume` after `--render` to skip existing checkpoint frames when
continuing an interrupted render. Remove old checkpoint frames before rendering
after any design change. The encoder checks that all required frames exist
before creating the MP4 and the assembled-view JPEG poster.
