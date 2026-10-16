---
title: ORCA Dexterous Hand · VLA / RL Prototype
banner: /works/orca-robotic-hand/teleop-banner.jpg
role: Hardware + Simulation
tags: [Dexterous Manipulation, Teleoperation, MuJoCo, Franka Panda, 3D Printing]
---

<div class="wk-stats">
<div><b>ORCA</b><span>Tendon-driven hand</span></div>
<div><b>Franka Panda</b><span>Arm</span></div>
<div><b>MuJoCo</b><span>Simulation</span></div>
<div><b>Live teleop</b><span>Data collection</span></div>
</div>

A dexterous-manipulation prototype built around the **ORCA tendon-driven robotic hand**, covering the full loop from 3D-printed hardware to simulated manipulation tasks. It's the groundwork for vision-language-action (VLA) and reinforcement-learning (RL) experiments.

## Real-time teleoperation

<div class="wk-split">
<video src="/works/orca-robotic-hand/teleop.mp4" poster="/works/orca-robotic-hand/teleop-poster.jpg" controls playsinline preload="metadata"></video>
<div>

A camera tracks my hand pose and retargets it onto the physical ORCA hand in real time. The monitor shows the tracked hand skeleton, and the robot hand mirrors the grasp on the desk.

Teleoperation like this is how demonstration data gets collected for imitation learning and VLA policies.

</div>
</div>

## Simulation tasks

<div class="wk-grid">
<figure>
<video src="/works/orca-robotic-hand/cube-picking.mp4" autoplay muted loop playsinline></video>
<figcaption>Franka Panda + ORCA hand: tabletop pick-and-place in MuJoCo</figcaption>
</figure>
<figure>
<video src="/works/orca-robotic-hand/cube-reorientation.mp4" autoplay muted loop playsinline></video>
<figcaption>In-hand cube reorientation task, a classic dexterous RL benchmark</figcaption>
</figure>
</div>

## Hardware build

<div class="wk-grid cols-3">
<figure>
<img src="/works/orca-robotic-hand/print-layout.jpg" alt="ORCA parts laid out for 3D printing">
<figcaption>Parts laid out for 3D printing</figcaption>
</figure>
<figure>
<img src="/works/orca-robotic-hand/actuators.jpg" alt="ORCA internal actuators">
<figcaption>Internal actuator pack in the forearm</figcaption>
</figure>
<figure>
<img src="/works/orca-robotic-hand/tendon-drive.jpg" alt="ORCA tendon drive">
<figcaption>Tendon-driven finger actuation</figcaption>
</figure>
</div>
