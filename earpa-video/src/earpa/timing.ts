export const TIMING = {
  fps: 30,
  totalFrames: 1350, // 45.0 seconds at 30fps
  scene1: {
    from: 0,
    durationInFrames: 400, // 00:00.0 - 00:13.33 (13.33s)
  },
  scene2: {
    from: 400,
    durationInFrames: 260, // 00:13.33 - 00:22.00 (8.67s)
  },
  scene3: {
    from: 660,
    durationInFrames: 270, // 00:22.00 - 00:31.00 (9.00s)
  },
  scene4: {
    from: 930,
    durationInFrames: 235, // 00:31.00 - 00:38.83 (7.83s)
  },
  scene5: {
    from: 1165,
    durationInFrames: 185, // 00:38.83 - 00:45.00 (6.17s)
  },
} as const;


