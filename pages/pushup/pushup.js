let detector;
let detectorConfig;
let poses;
let video;
let skeleton = true;
let model;
let elbowAngle = 999;
let backAngle = 0;
let reps = 0;
let upPosition = false;
let downPosition = false;
let highlightBack = false;
let backWarningGiven = false;

const colors = {
  nose: [255, 0, 0], // Red
  left_eye: [0, 0, 255], // Blue
  right_eye: [0, 255, 0], // Green
  left_ear: [255, 165, 0], // Orange
  right_ear: [128, 0, 128], // Purple
  left_shoulder: [255, 255, 0], // Yellow
  right_shoulder: [255, 192, 203], // Pink
  left_elbow: [0, 255, 255], // Cyan
  right_elbow: [255, 0, 255], // Magenta
  left_wrist: [0, 255, 0], // Lime
  right_wrist: [75, 0, 130], // Indigo
  left_hip: [0, 128, 128], // Teal
  right_hip: [238, 130, 238], // Violet
  left_knee: [255, 215, 0], // Gold
  right_knee: [192, 192, 192], // Silver
  left_ankle: [165, 42, 42], // Brown
  right_ankle: [0, 0, 0], // Black
};

async function init() {
  detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
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
  /* console.log(poses); */
}

//set up canvas
function draw() {
  // Add this line to show the video frame
  image(video, 0, 0, width, height); // Use width and height directly

  // Draw keypoints and skeleton
  drawKeypoints();
  if (skeleton) {
    drawSkeleton();
  }
  // Assuming you have a <h1> element with id "pushup-counter" in your HTML
  const pushupCounter = document.getElementById("pushup-counter");

  // Update the inner text of the <h1> element with the value of reps
  pushupCounter.innerText = `Push-ups completed: ${reps}`;
}

function drawKeypoints() {
  var count = 0;
  if (poses && poses.length > 0) {
    for (let kp of poses[0].keypoints) {
      const { x, y, score, name } = kp; // Added 'name' to get the keypoint name

      updateArmAngle();
      inUpPosition();
      inDownPosition();
      if (score > 0.3) {
        count = count + 1;
        const color = colors[name];
        fill(color);
        stroke(0);
        strokeWeight(1);
        // Normalize coordinates
        const normX = x / video.width;
        const normY = y / video.height;
        // Transform to canvas coordinates
        const canvasX = normX * width;
        const canvasY = normY * height;

        circle(canvasX, canvasY, 10);
      }
      if (count == 17) {
        /*   console.log("Whole body visible!"); */
      } else {
        /* console.log("Not fully visible!"); */
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
function updateArmAngle() {
  let wrist, shoulder, elbow;
  rightWrist = poses[0].keypoints[10];
  rightShoulder = poses[0].keypoints[6];
  rightElbow = poses[0].keypoints[8];
  leftWrist = poses[0].keypoints[9];
  leftShoulder = poses[0].keypoints[5];
  leftElbow = poses[0].keypoints[7];

  // Check if all keypoints of the left arm are visible
  if (
    leftWrist.score > 0.3 &&
    leftElbow.score > 0.3 &&
    leftShoulder.score > 0.3
  ) {
    wrist = leftWrist;
    elbow = leftElbow;
    shoulder = leftShoulder;
    /* console.log("we using Left arm for counter"); */
  }
  // Check if all keypoints of the right arm are visible
  else if (
    rightWrist.score > 0.3 &&
    rightElbow.score > 0.3 &&
    rightShoulder.score > 0.3
  ) {
    wrist = rightWrist;
    elbow = rightElbow;
    shoulder = rightShoulder;
    //console.log("we using Right arm for counter")
  } else {
    // Both arms are not fully visible, exit the function
    //console.log("Both arms are not fully visible");
    return;
  }

  // Calculate the angle using the visible arm keypoints
  const angle =
    (Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) -
      Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x)) *
    (180 / Math.PI);

  if (angle < 0) {
    //angle = angle + 360;
  }

  elbowAngle = angle;
  /* console.log(angle); */
}

function inUpPosition() {
  if (elbowAngle > 100 && elbowAngle < 200) {
    //console.log('In up position')
    if (downPosition == true) {
      console.log(elbowAngle);
      var msg = new SpeechSynthesisUtterance(str(reps + 1));
      window.speechSynthesis.speak(msg);
      reps = reps + 1;
    }
    upPosition = true;
    downPosition = false;
  }
}

function inDownPosition() {
  var elbowAboveNose = false;
  if (poses[0].keypoints[0].y > poses[0].keypoints[7].y) {
    elbowAboveNose = true;
  } else {
    /*  console.log("Elbow is not above nose"); */
  }

  if (elbowAboveNose && abs(elbowAngle) > 0 && abs(elbowAngle) < 100) {
    /*   console.log("In down position"); */
    downPosition = true;
    upPosition = false;
  }
}
