---
title: ByteTrack Multi-Object Tracking
banner: /works/bytetrack-mot/demo.mp4
poster: /works/bytetrack-mot/thumb.jpg
role: YOLOv8 + ByteTrack
tags: [ByteTrack, YOLOv8, Multi-Object Tracking, MOT20, TrackEval]
---

<div class="wk-stats">
<div><b>YOLOv8</b><span>Detector</span></div>
<div><b>ByteTrack</b><span>Tracker</span></div>
<div><b>MOT20</b><span>Benchmark</span></div>
<div><b>HOTA · CLEAR</b><span>Evaluation</span></div>
</div>

Pedestrian tracking on the crowded **MOT20** street scene using **YOLOv8** detections and the **ByteTrack** association algorithm. It runs on the same sequence as my [DeepSORT tracker](#/work/deepsort-mot), so the two approaches can be compared side by side.

## How it works

- **Detect.** YOLOv8 proposes person boxes with confidence scores in every frame.
- **Associate high-confidence boxes.** Confident detections are matched to existing tracks first, using predicted positions and box overlap.
- **Recover with low-confidence boxes.** Instead of throwing weak detections away, ByteTrack uses them in a second matching pass for tracks that are still unmatched. That's what keeps IDs alive through occlusions in a dense crowd.
- **Evaluate.** I scored the tracking output against MOT20 ground truth with **motmetrics** and **TrackEval** (HOTA and CLEAR MOT metrics).

<figure>
<video src="/works/bytetrack-mot/demo.mp4" poster="/works/bytetrack-mot/thumb.jpg" controls muted playsinline preload="metadata"></video>
<figcaption>YOLOv8 + ByteTrack on MOT20-08 with persistent track IDs</figcaption>
</figure>
