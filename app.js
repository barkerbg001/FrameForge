const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const dropzone = document.getElementById('dropzone');
const generateButton = document.getElementById('generate-video');
const videoOutput = document.getElementById('video-output');
const downloadLink = document.getElementById('download-link');
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

function updatePreview() {
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  imageFiles.forEach((file, index) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.width = '100px';
    img.style.margin = '5px';
    preview.appendChild(img);
  });
}

// Handle video generation
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

  // Generate the video
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

  // Display the video
  videoOutput.src = videoURL;
  videoOutput.style.display = 'block';

  // Add download link
  downloadLink.href = videoURL;
  downloadLink.style.display = 'block';
});
