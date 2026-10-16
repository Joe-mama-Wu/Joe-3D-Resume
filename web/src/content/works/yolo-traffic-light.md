---
title: YOLO Traffic Light Detection
banner: /works/yolo-traffic-light/demo.mp4
poster: /works/yolo-traffic-light/thumb.jpg
role: Autonomous Driving
tags: [YOLO, Object Detection, Dashcam]
---

<div class="wk-stats">
<div><b>YOLO</b><span>Detector</span></div>
<div><b>Real road</b><span>Dashcam footage</span></div>
<div><b>Light state</b><span>Output</span></div>
</div>

Real-time traffic-light detection on dashcam footage. A **YOLO** model finds the signal heads at an intersection and labels their state (for example *Red Light*). A downstream controller can use that state to make stop / go decisions.

<figure>
<video src="/works/yolo-traffic-light/demo.mp4" autoplay muted loop playsinline></video>
<figcaption>Approaching an intersection: signals detected and classified frame by frame</figcaption>
</figure>
