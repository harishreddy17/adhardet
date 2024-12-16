const video = document.getElementById('video');

// Load face-api.js models
async function loadModels() {
  // Correct path format using forward slashes or double backslashes
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('models');
    await faceapi.nets.faceExpressionNet.loadFromUri('models');
    console.log('Models loaded');
  } catch (error) {
    console.error('Error loading models:', error);
  }
}

// Start video stream
async function startVideo() {
  try {
    // Request webcam access
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error('Error accessing webcam:', err);
    alert('Webcam access denied or failed.');
  }
}

// Event listener when video starts playing
video.addEventListener('play', async () => {
  // Create canvas from the video element for drawing detections
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // Set an interval to detect faces continuously
  setInterval(async () => {
    // Detect faces, landmarks, and expressions
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // Resize detections to match the canvas size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Clear previous drawings and draw the new results
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100); // Update every 100ms
})

// Initialize face-api.js models and start the video stream
(async function() {
  await loadModels();
  startVideo();
})();
