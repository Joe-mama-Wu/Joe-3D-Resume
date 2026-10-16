---
title: SiamFC Single-Object Tracking
banner: /works/siamfc-sot/demo.mp4
poster: /works/siamfc-sot/thumb.jpg
role: Siamese Network · PyTorch
tags: [SiamFC, Siamese Network, Single-Object Tracking, OTB100]
---

<div class="wk-stats">
<div><b>SiamFC</b><span>Siamese tracker</span></div>
<div><b>OTB100</b><span>Training data</span></div>
<div><b>Response map</b><span>Localization</span></div>
<div><b>1 target</b><span>Any object</span></div>
</div>

A fully-convolutional **Siamese** tracker that follows a single target chosen in the first frame, here a skier on a busy slope. I trained the model on image pairs from the **OTB100** dataset and then ran it frame by frame on video.

## How it works

- **Shared backbone.** The same convolutional network embeds both the exemplar (the target from the first frame) and a larger search region around its last known position.
- **Cross-correlation.** Sliding the exemplar embedding over the search embedding produces a response map, and the peak of that map is the target's new location.
- **No class labels.** The tracker only learns how to match appearance, so it can follow any object, not just the categories a detector was trained on.

<figure>
<video src="/works/siamfc-sot/demo.mp4" poster="/works/siamfc-sot/thumb.jpg" controls muted playsinline preload="metadata"></video>
<figcaption>Tracking a single skier through camera motion and changing scale</figcaption>
</figure>
