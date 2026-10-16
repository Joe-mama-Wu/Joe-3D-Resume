---
title: Gazebo SLAM Mapping
banner: /works/gazebo-slam/2.jpg
role: Mobile Robotics
tags: [Gazebo, SLAM, gmapping, RViz, ROS]
---

<div class="wk-stats">
<div><b>Gazebo</b><span>Simulator</span></div>
<div><b>slam_gmapping</b><span>SLAM</span></div>
<div><b>Keyboard teleop</b><span>Control</span></div>
<div><b>/map</b><span>Output</span></div>
</div>

A mobile robot in a simulated maze in **Gazebo**. I drove it with `teleop_twist_keyboard`, and `slam_gmapping` built an occupancy-grid map in real time from its laser scans and odometry.

<div class="wk-grid natural">
<figure>
<img src="/works/gazebo-slam/1.jpg" alt="Early SLAM map">
<figcaption>Early exploration: the first walls appear in RViz</figcaption>
</figure>
<figure>
<img src="/works/gazebo-slam/2.jpg" alt="Completed SLAM map">
<figcaption>Maze fully mapped next to the Gazebo world</figcaption>
</figure>
</div>

## System graph

Keyboard teleop publishes velocity commands to the base controller in Gazebo. The simulated laser publishes `/scan`, and `slam_gmapping` combines that with the `/tf` transforms to publish `/map`.

<div class="wk-grid natural">
<figure>
<img src="/works/gazebo-slam/3.jpg" alt="rqt_graph nodes only">
<figcaption>rqt_graph, nodes only</figcaption>
</figure>
<figure>
<img src="/works/gazebo-slam/4.jpg" alt="rqt_graph nodes and topics">
<figcaption>rqt_graph, nodes and topics</figcaption>
</figure>
</div>
