let detector;
let detectorConfig;
let poses;
let video;
let skeleton = true;
let model;
let elbowAngle = 999;
let reps = 0;
let upPosition = false;
let downPosition = false;
let loader;
let armAngle = 0;
let fps;
let fpsValues = []; // Array to store FPS values
let startTime; // Start time of the FPS measurement
let totalTime = 60000; // Duration in milliseconds (1 minute)
let interval = 1000; // Interval to update FPS (1 second)

const colors = {
  nose: [255, 0, 0], // Red 0
  left_eye: [0, 0, 255], // Blue 1
  right_eye: [0, 255, 0], // Green 2
  left_ear: [255, 165, 0], // Orange 3
  right_ear: [128, 0, 128], // Purple 4
  left_shoulder: [255, 255, 0], // Yellow 5
  right_shoulder: [255, 192, 203], // Pink 6
  left_elbow: [0, 255, 255], // Cyan 7
  right_elbow: [255, 0, 255], // Magenta 8
  left_wrist: [0, 255, 0], // Lime 9
  right_wrist: [75, 0, 130], // Indigo 10
  left_hip: [0, 128, 128], // Teal 11
  right_hip: [238, 130, 238], // Violet 12
  left_knee: [255, 215, 0], // Gold 13
  right_knee: [192, 192, 192], // Silver 14
  left_ankle: [165, 42, 42], // Brown 15
  right_ankle: [0, 0, 0], // Black 16
};

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
  console.log("video ready");
}

async function setup() {
  startTime = millis(); // Initialize start time
  setInterval(updateFPS, interval); // Update FPS every second
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

  async function measureInitTime() {
    const startTime = performance.now();

    await init();

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(`init() function took ${totalTime} milliseconds to load.`);
  }

  await measureInitTime(); // Call measureInitTime() to measure initialization time

  // Remove the loader after setup is complete
  loader.remove();
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
  setTimeout(getPoses, 0);
  /* console.log(poses); */
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
  drawKeypoints(poses);
  if (skeleton) {
    drawSkeleton(poses);
  }
  // Assuming you have a <h1> element with id "pushup-counter" in your HTML
  const pushupCounter = document.getElementById("pushup-counter");

  // Update the inner text of the <h1> element with the value of reps
  pushupCounter.innerText = `Push-ups completed: ${reps}`;

  // Draw the arm angle gauge
  drawArmAngleGauge(width, height);
}

function updateFPS() {
  let elapsedTime = millis() - startTime;
  if (elapsedTime < totalTime) {
    let currentFPS = frameRate();
    fpsValues.push(currentFPS); // Store current FPS value
  } else {
    // Calculate average FPS
    let sum = fpsValues.reduce((acc, val) => acc + val, 0);
    let averageFPS = sum / fpsValues.length;
    console.log("Average FPS over 1 minute:", averageFPS.toFixed(2));

    // Stop updating FPS
    clearInterval(updateFPS);
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
    console.log("we using Left arm for counter");
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
    console.log("we using Right arm for counter");
  } else {
    // Both arms are not fully visible, exit the function
    //console.log("Both arms are not fully visible");
    return;
  }

  // Calculate the angle using the visible arm keypoints
  const angle =
    (Math.atan2(wrist.x - elbow.x, wrist.y - elbow.y) -
      Math.atan2(shoulder.x - elbow.x, shoulder.y - elbow.y)) *
    (180 / Math.PI);
  const positiveArmAngle = angle < 0 ? 360 + angle : angle;
  if (angle < 0) {
    //angle = angle + 360;
  }
  armAngle = angle;
  elbowAngle = angle;
  /* console.log(angle); */
}

function isBackBending() {
  let shoulder, Hip, Knee;
  const leftShoulder = poses[0].keypoints[5];
  const rightShoulder = poses[0].keypoints[6];
  const leftHip = poses[0].keypoints[11];
  const rightHip = poses[0].keypoints[12];
  const leftKnee = poses[0].keypoints[13];
  const rightKnee = poses[0].keypoints[14];

  // Check if all keypoints of the left arm are visible
  if (leftShoulder.score > 0.3 && leftHip.score > 0.3 && leftKnee.score > 0.3) {
    shoulder = leftShoulder;
    Hip = leftHip;
    Knee = leftKnee;
  } else if (
    rightShoulder.score > 0.3 &&
    rightHip.score > 0.3 &&
    rightKnee.score > 0.3
  ) {
    shoulder = rightShoulder;
    Hip = rightHip;
    Knee = rightKnee;
  } else {
    // Both arms are not fully visible, exit the function
    //console.log("Both arms are not fully visible");
    return;
  }

  const angle =
    (Math.atan2(shoulder.y - Hip.y, shoulder.x - Hip.x) -
      Math.atan2(Knee.y - Hip.y, Knee.x - Hip.x)) *
    (180 / Math.PI);
  // Ensure the angle is positive
  const positiveAngle = angle < 0 ? 360 + angle : angle;
  /* console.log("positiveAngle:", positiveAngle); */
  return positiveAngle < 180; // Return true if angle is less than 180, indicating back bending
}

function inUpPosition() {
  if (elbowAngle > 150 && elbowAngle < 200) {
    //console.log('In up position')
    if (downPosition == true) {
      /* console.log(elbowAngle); */
      /* var msg = new SpeechSynthesisUtterance(str(reps + 1));
        window.speechSynthesis.speak(msg); */
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

function drawKeypoints(poses) {
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

function drawArmAngleGauge(width, height) {
  // Define gauge parameters
  let gaugeWidth = 200; // Width of the gauge
  let gaugeHeight = 100; // Height of the gauge
  let margin = 100; // Margin from the top-right corner
  let padding = 10; // Padding within the gauge
  let textOffset = -10; // Offset for text

  // Calculate coordinates for the gauge
  let gaugeX = width - gaugeWidth - margin;
  let gaugeY = margin;

  // Draw background rectangle
  fill(0);
  noStroke();
  rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

  // Add a class name to the gauge element
  let gaugeClassName = "arm-angle-gauge";

  // Define gauge parameters
  let cx = gaugeX + gaugeWidth / 2;
  let cy = gaugeY + gaugeHeight / 2;
  let circleRadius = gaugeHeight / 2 - padding;
  let numPoints = 360; // One point for each degree
  let angleStep = TWO_PI / numPoints;

  // Draw sine function circle
  stroke(255);
  noFill();
  beginShape();
  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, 360); // Map the angle to the range [0, 360] (in degrees)
    angle = radians(angle); // Convert degrees to radians
    let x = cx + cos(angle) * circleRadius;
    let y = cy + sin(angle) * circleRadius;
    vertex(x, y);
  }
  endShape(CLOSE);

  // Calculate arm angle indicator coordinates
  let indicatorAngle = map(armAngle, 0, 360, 0, TWO_PI); // Map the arm angle to the range [0, TWO_PI] (in radians)
  let indicatorX = cx + cos(indicatorAngle) * circleRadius;
  let indicatorY = cy - sin(indicatorAngle) * circleRadius; // Subtract sin() to match updateArmAngle()

  // Draw arm angle indicator
  stroke(255, 0, 0);
  line(cx, cy, indicatorX, indicatorY);

  // Draw arm angle text
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255);
  text("Arm Angle: " + nf(armAngle, 0, 1) + "°", cx, gaugeY + textOffset);

  // Return the class name for styling purposes
  return gaugeClassName;
}

function drawSkeleton(poses) {
  confidence_threshold = 0.5;

  if (!poses || poses.length === 0) return;

  const backBending = isBackBending();

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
        // Set default color
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

        // Change color if edge is between points 5-11 or 11-13 and back bending is detected
        if (
          (backBending && p1 === "5" && p2 === "11") || // Left side
          (p1 === "11" && p2 === "13") || // Left side
          (p1 === "6" && p2 === "12") || // Right side
          (p1 === "12" && p2 === "14") // Right side
        ) {
          stroke("rgb(255, 0, 0)"); // Set the color to red for the specified edges
        }

        line(canvasX1, canvasY1, canvasX2, canvasY2);
      }
    }
  }
}
