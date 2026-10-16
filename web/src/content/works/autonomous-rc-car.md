---
title: Autonomous RC Car
banner: /works/autonomous-rc-car/preview.mp4
poster: /works/autonomous-rc-car/thumb.jpg
role: Perception + Speed Control
tags: [Lane Detection, Object Detection, Traffic Signs, Embedded Vision]
---

<div class="wk-stats">
<div><b>Lane lines</b><span>Track detection</span></div>
<div><b>Traffic lights</b><span>Red light → stop</span></div>
<div><b>Road signs</b><span>STOP · Speed limit</span></div>
<div><b>0 / 50 / 100 rpm</b><span>Speed control</span></div>
</div>

A remote-control car that reacts to the road on its own. Its onboard camera feeds a vision pipeline that finds the lane boundaries of the taped track and recognizes **traffic lights**, **STOP signs** and **speed-limit signs**. The detections then set the drive speed in real time.

## Behavior

| What the camera sees | What the car does |
| --- | --- |
| Clear lane | Cruises at **100 rpm** |
| Red light | Stops (**0 rpm**) |
| STOP sign | Stops (**0 rpm**) |
| Speed Limit 50 sign | Slows to **50 rpm** |

## Onboard camera

<div class="wk-grid natural">
<figure>
<img src="/works/autonomous-rc-car/red-light.jpg" alt="Red light detected, speed 0 rpm">
<figcaption>Red light detected: speed drops to 0 rpm</figcaption>
</figure>
<figure>
<img src="/works/autonomous-rc-car/stop-sign.jpg" alt="STOP sign ahead, speed 0 rpm">
<figcaption>STOP sign: the car holds at 0 rpm</figcaption>
</figure>
<figure>
<img src="/works/autonomous-rc-car/speed-limit.jpg" alt="Speed Limit 50 detected, speed 50 rpm">
<figcaption>Speed Limit 50 detected: slows to 50 rpm</figcaption>
</figure>
<figure>
<img src="/works/autonomous-rc-car/lane-following.jpg" alt="Lane lines detected, speed 100 rpm">
<figcaption>Lane lines tracked in green at cruising speed</figcaption>
</figure>
</div>

## Full run

The video shows the whole run from three angles: my view with the controller, the track (top left), and the car's onboard camera with live detections and speed (top right).

<figure>
<video src="/works/autonomous-rc-car/demo.mp4" poster="/works/autonomous-rc-car/thumb.jpg" controls playsinline preload="metadata"></video>
<figcaption>Full demo run with sound, about 2 minutes</figcaption>
</figure>

Related: [Lane Keep Assist](#/work/lane-keep-assist) · [YOLO Traffic Light Detection](#/work/yolo-traffic-light)
