---
title: LiDAR Perception
banner: /works/lidar-perception/rviz-scan.jpg
role: ROS · RViz
tags: [LiDAR, ROS, RViz, rqt_graph, Ubuntu]
---

<div class="wk-stats">
<div><b>2D LiDAR</b><span>Sensor</span></div>
<div><b>ROS</b><span>Middleware</span></div>
<div><b>LaserScan</b><span>Topic</span></div>
</div>

Bringing up a LiDAR on Ubuntu with ROS. I launched the driver node, checked the node and topic wiring with `rqt_graph`, and visualized the live laser scan in **RViz**. It started with the classic turtlesim teleop exercise to get comfortable with ROS nodes, topics and launch files.

<figure>
<img src="/works/lidar-perception/rviz-scan.jpg" alt="LiDAR scan in RViz">
<figcaption>Live laser scan returns rendered in RViz</figcaption>
</figure>

<div class="wk-grid natural">
<figure>
<img src="/works/lidar-perception/driver-graph.jpg" alt="LiDAR driver and rqt_graph">
<figcaption>Driver bring-up logs and the node graph from rqt_graph</figcaption>
</figure>
<figure>
<img src="/works/lidar-perception/turtlesim.jpg" alt="TurtleSim teleop">
<figcaption>Warm-up: turtlesim keyboard teleop over ROS topics</figcaption>
</figure>
</div>
