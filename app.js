const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const generateButton = document.getElementById('generate-video');
const preview = document.getElementById('preview');
const videoOutput = document.getElementById('video-output');

let imageFiles = [];

// Handle drag-and-drop
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = 'blue';
});

dropzone.addEventListener('dragleave', () => {
  dropzone.style.borderColor = '#ccc';
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = '#ccc';
  const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
  imageFiles = [...imageFiles, ...files];
  updatePreview();
});

// Handle file input
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files).filter((file) => file.type.startsWith('image/'));
  imageFiles = [...imageFiles, ...files];
  updatePreview();
});

// Update preview
function updatePreview() {
  preview.innerHTML = '';
  imageFiles.forEach((file) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
}

// Generate video
generateButton.addEventListener('click', async () => {
  if (!imageFiles.length) {
    alert('Please upload at least one image.');
    return;
  }

  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  // Write files to FFmpeg
  imageFiles.forEach((file, index) => {
    ffmpeg.FS('writeFile', `image${index}.png`, fetchFile(file));
  });

  // Generate video
  await ffmpeg.run(
    '-framerate', '1', // 1 frame per second
    '-i', 'image%d.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  );

  // Get the output video
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
  const videoURL = URL.createObjectURL(videoBlob);

  // Automatically download the video
  const downloadLink = document.createElement('a');
  downloadLink.href = videoURL;
  downloadLink.download = 'output.mp4';
  downloadLink.click();

  // Display the video preview
  videoOutput.src = videoURL;
});
