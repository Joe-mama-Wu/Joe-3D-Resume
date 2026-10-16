---
title: Stereo Depth & Point Cloud
banner: /works/stereo-camera/point-cloud.jpg
role: ROS · RViz
tags: [Stereo Vision, Depth Map, Point Cloud, ROS, RViz, Docker]
---

<div class="wk-stats">
<div><b>Stereo</b><span>Depth camera</span></div>
<div><b>Disparity</b><span>Depth map</span></div>
<div><b>PointCloud2</b><span>ROS output</span></div>
<div><b>RViz</b><span>Visualization</span></div>
</div>

I brought up a stereo depth camera end to end, from raw disparity to a 3D point cloud streamed into **ROS** and visualized in **RViz**. Along the way I worked through the camera's on-device pipelines: colorized depth, edge detection, and spatial object detection that measures the distance to a target.

<figure>
<img src="/works/stereo-camera/point-cloud.jpg" alt="Stereo point cloud in RViz">
<figcaption>Point cloud of the room in RViz, with the live camera feed bottom left</figcaption>
</figure>

<div class="wk-grid natural">
<figure>
<img src="/works/stereo-camera/depth-map.jpg" alt="Stereo depth map with spatial ROI">
<figcaption>Depth map with spatial ROIs measuring the XYZ distance of objects</figcaption>
</figure>
<figure>
<img src="/works/stereo-camera/depth-rviz.jpg" alt="Depth to point cloud in RViz">
<figcaption>Depth stream published as a ROS point cloud</figcaption>
</figure>
</div>

<details>
<summary>Development log · 22 screenshots</summary>
<div class="wk-grid cols-3">
<img src="/works/stereo-camera/log/01.jpg" alt="Colorized disparity map" loading="lazy">
<img src="/works/stereo-camera/log/02.jpg" alt="Disparity and depth outputs" loading="lazy">
<img src="/works/stereo-camera/log/03.jpg" alt="Depth with spatial ROI" loading="lazy">
<img src="/works/stereo-camera/log/04.jpg" alt="Mono camera streams" loading="lazy">
<img src="/works/stereo-camera/log/05.jpg" alt="Left / right mono streams" loading="lazy">
<img src="/works/stereo-camera/log/06.jpg" alt="Spatial location calculator" loading="lazy">
<img src="/works/stereo-camera/log/07.jpg" alt="Edge detection" loading="lazy">
<img src="/works/stereo-camera/log/08.jpg" alt="Edge detection, multiple streams" loading="lazy">
<img src="/works/stereo-camera/log/09.jpg" alt="Edge detection, tuning" loading="lazy">
<img src="/works/stereo-camera/log/10.jpg" alt="Spatial object detection" loading="lazy">
<img src="/works/stereo-camera/log/11.jpg" alt="Spatial object detection with distance" loading="lazy">
<img src="/works/stereo-camera/log/12.jpg" alt="Object detection run" loading="lazy">
<img src="/works/stereo-camera/log/13.jpg" alt="Object detection run" loading="lazy">
<img src="/works/stereo-camera/log/14.jpg" alt="ROS + Docker setup" loading="lazy">
<img src="/works/stereo-camera/log/15.jpg" alt="ROS + Docker setup" loading="lazy">
<img src="/works/stereo-camera/log/16.jpg" alt="Point cloud in RViz" loading="lazy">
<img src="/works/stereo-camera/log/17.jpg" alt="Point cloud in RViz" loading="lazy">
<img src="/works/stereo-camera/log/18.jpg" alt="Point cloud with camera feed" loading="lazy">
<img src="/works/stereo-camera/log/19.jpg" alt="Point cloud with camera feed" loading="lazy">
<img src="/works/stereo-camera/log/20.jpg" alt="ROS launch and point cloud" loading="lazy">
<img src="/works/stereo-camera/log/21.jpg" alt="ROS launch and point cloud" loading="lazy">
<img src="/works/stereo-camera/log/22.jpg" alt="Dense point cloud" loading="lazy">
</div>
</details>
