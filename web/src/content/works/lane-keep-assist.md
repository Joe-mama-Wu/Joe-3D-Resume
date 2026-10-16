---
title: Lane Keep Assist · Hough Transform
banner: /works/lane-keep-assist/demo.mp4
poster: /works/lane-keep-assist/thumb.jpg
role: Computer Vision
tags: [OpenCV, Canny, Hough Transform, Lane Detection]
---

<div class="wk-stats">
<div><b>Canny</b><span>Edges</span></div>
<div><b>Hough</b><span>Line fitting</span></div>
<div><b>Left / right</b><span>Lane boundaries</span></div>
</div>

A classical computer-vision lane detector, the perception front end of a lane-keep-assist system. It runs on in-car footage through a tunnel and overlays the detected lane boundaries in green.

## Pipeline

1. Grayscale and Gaussian blur to suppress noise
2. **Canny** edge detection
3. Region-of-interest mask over the road ahead
4. **Probabilistic Hough transform** to extract line segments
5. Filter by slope and average the segments into one left and one right lane line

<figure>
<video src="/works/lane-keep-assist/demo.mp4" autoplay muted loop playsinline></video>
<figcaption>Lane lines tracked through a tunnel, a tough case for lighting and contrast</figcaption>
</figure>
