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

  // Create a Whammy video
  const video = new Whammy.Video(1); // 1 frame per second

  for (const file of imageFiles) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        video.add(canvas);
        resolve();
      };
    });
  }

  const output = video.compile();
  const videoBlob = new Blob([output], { type: 'video/webm' });
  const videoURL = URL.createObjectURL(videoBlob);

  // Automatically download the video
  const downloadLink = document.createElement('a');
  downloadLink.href = videoURL;
  downloadLink.download = 'output.webm';
  downloadLink.click();

  // Display the video
  videoOutput.src = videoURL;
});
