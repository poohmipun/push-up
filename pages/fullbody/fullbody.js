let detector;
let detectorConfig;
let poses;
let video;
let skeleton = true;
let model;
let fps;
async function init() {
  detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
  edges = {
    "5,7": "m",
    "7,9": "m",
    "6,8": "c",
    "8,10": "c",
    "5,6": "y",
    "5,11": "m",
    "6,12": "c",
    "11,12": "y",
    "11,13": "m",
    "13,15": "m",
    "12,14": "c",
    "14,16": "c",
  };
  await getPoses();
}

async function videoReady() {
  // console.log('video ready');
}

let loader;

async function setup() {
  fps = 0;
  frameRate(60);
  var w = window.innerWidth - 100;
  var h = window.innerHeight - 100;

  // Create a loading text element with styles
  loader = createDiv(`
    <div class="loading loading01">
      <span>L</span>
      <span>O</span>
      <span>A</span>
      <span>D</span>
      <span>I</span>
      <span>N</span>
      <span>G</span>
    </div>
  `);
  loader.position(w / 2 - 200, h / 2);

  createCanvas(w, h);
  video = createCapture(VIDEO, videoReady);
  video.hide();

  await init();

  // Remove the loader after setup is complete
  loader.remove();
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
  setTimeout(getPoses, 0);
  console.log(poses);
}

function draw() {
  // Add this line to show the video frame
  image(video, 0, 0, width, height); // Use width and height directly
  fps = frameRate();
  fill(0, 255, 0);
  textSize(32);
  stroke(0);
  text("FPS: " + fps.toFixed(2), 100, 50);
  // Draw keypoints and skeleton
  drawKeypoints();
  if (skeleton) {
    drawSkeleton();
  }
}

function drawKeypoints() {
  var count = 0;
  if (poses && poses.length > 0) {
    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.3) {
        count = count + 1;
        fill(255);
        stroke(0);
        strokeWeight(1);

        // Normalize coordinates
        const normX = x / video.width;
        const normY = y / video.height;

        // Transform to canvas coordinates
        const canvasX = normX * width;
        const canvasY = normY * height;

        circle(canvasX, canvasY, 8);
      }
    }
  }
}

// Draws lines between the keypoints
function drawSkeleton() {
  confidence_threshold = 0.5;

  if (poses && poses.length > 0) {
    for (const [key, value] of Object.entries(edges)) {
      const p = key.split(",");
      const p1 = p[0];
      const p2 = p[1];

      const y1 = poses[0].keypoints[p1].y;
      const x1 = poses[0].keypoints[p1].x;
      const c1 = poses[0].keypoints[p1].score;
      const y2 = poses[0].keypoints[p2].y;
      const x2 = poses[0].keypoints[p2].x;
      const c2 = poses[0].keypoints[p2].score;

      if (c1 > confidence_threshold && c2 > confidence_threshold) {
        strokeWeight(2);
        stroke("rgb(0, 255, 0)");

        // Normalize coordinates
        const normX1 = x1 / video.width;
        const normY1 = y1 / video.height;
        const normX2 = x2 / video.width;
        const normY2 = y2 / video.height;

        // Transform to canvas coordinates
        const canvasX1 = normX1 * width;
        const canvasY1 = normY1 * height;
        const canvasX2 = normX2 * width;
        const canvasY2 = normY2 * height;

        line(canvasX1, canvasY1, canvasX2, canvasY2);
      }
    }
  }
}
