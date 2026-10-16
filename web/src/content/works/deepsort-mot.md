---
title: DeepSORT Multi-Object Tracking
banner: /works/deepsort-mot/demo.mp4
poster: /works/deepsort-mot/thumb.jpg
role: Multi-Object Tracking
tags: [DeepSORT, Kalman Filter, Multi-Object Tracking, MOT20]
---

<div class="wk-stats">
<div><b>MOT20-08</b><span>Benchmark sequence</span></div>
<div><b>DeepSORT</b><span>Tracker</span></div>
<div><b>Kalman</b><span>Motion model</span></div>
<div><b>Persistent IDs</b><span>Output</span></div>
</div>

Pedestrian tracking on a dense, crowded street scene from the **MOT20** benchmark. Every person gets a bounding box and an ID that stays with them from frame to frame, even when the crowd overlaps and people occlude each other. For comparison, I also ran [YOLOv8 + ByteTrack](#/work/bytetrack-mot) on the same sequence.

## How it works

- **Detect.** A detector proposes person boxes in every frame.
- **Predict.** A **Kalman filter** models each track's position and velocity, so it predicts where every person will be in the next frame.
- **Associate.** Detections are matched to predicted tracks using both motion (box overlap) and an appearance embedding, which lets a person keep their ID after a short occlusion.
- **Manage tracks.** New tracks are confirmed after a few hits, and lost tracks age out.

<figure>
<video src="/works/deepsort-mot/demo.mp4" poster="/works/deepsort-mot/thumb.jpg" controls muted playsinline preload="metadata"></video>
<figcaption>Full run with Kalman-filtered tracks and persistent IDs</figcaption>
</figure>
