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
let armAngle = 0; // Variable to store the arm angle
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
/*   drawKeypoints(); */

  // Assuming you have a <h1> element with id "pushup-counter" in your HTML
  const pushupCounter = document.getElementById("pushup-counter");

  // Update the inner text of the <h1> element with the value of reps
  pushupCounter.innerText = `Push-ups completed: ${reps}`;

  // Draw the arm angle gauge
/*   drawArmAngleGauge(); */
}
