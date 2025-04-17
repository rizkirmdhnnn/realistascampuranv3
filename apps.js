document.addEventListener('DOMContentLoaded', function() {
  const upload = document.getElementById('upload');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const processButton = document.getElementById('process');
  const operationSelect = document.getElementById('operation');
  const channelsContainer = document.getElementById('channels');
  const downloadButton = document.getElementById('download');
  let originalImageData = null;
  let resultImageData = null;

  // Load gambar dan tampilkan pada canvas
  upload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        channelsContainer.innerHTML = ''; // Bersihkan hasil sebelumnya
        
        // Add responsive styling to canvas after image is loaded
        canvas.classList.add('mx-auto', 'rounded-lg', 'shadow-md');
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(file);
  });

  // Download button functionality
  downloadButton.addEventListener('click', function() {
    if (!originalImageData) {
      showNotification('Silakan upload gambar terlebih dahulu', 'error');
      return;
    }
    
    const dataURL = canvas.toDataURL('image/jpeg');
    const filename = 'processed_image.jpg';
    
    const element = document.createElement('a');
    element.setAttribute('href', dataURL);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showNotification('Gambar berhasil diunduh', 'success');
  });

  // Proses gambar sesuai pilihan operasi
  processButton.addEventListener('click', function() {
    if (!originalImageData) {
      showNotification('Silakan upload gambar terlebih dahulu', 'error');
      return;
    }
    const op = operationSelect.value;
    channelsContainer.innerHTML = ''; // Hapus tampilan channel sebelumnya

    switch(op) {
      // Filter operations
      case 'grayscale': {
        resultImageData = toGrayscale(new ImageData(
          new Uint8ClampedArray(originalImageData.data),
          originalImageData.width,
          originalImageData.height
        ));
        ctx.putImageData(resultImageData, 0, 0);
        showNotification('Filter grayscale diterapkan', 'success');
        break;
      }
      case 'edgeRight': {
        let imgData = toGrayscale(new ImageData(
          new Uint8ClampedArray(originalImageData.data),
          originalImageData.width,
          originalImageData.height
        ));
        const kernelRight = [
          -1, 0, 1,
          -2, 0, 2,
          -1, 0, 1
        ];
        resultImageData = convolveGrayscale(imgData, kernelRight, 'right');
        ctx.putImageData(resultImageData, 0, 0);
        showNotification('Deteksi garis kanan diterapkan', 'success');
        break;
      }
      case 'edgeTop': {
        let imgData = toGrayscale(new ImageData(
          new Uint8ClampedArray(originalImageData.data),
          originalImageData.width,
          originalImageData.height
        ));
        const kernelTop = [
          -1, -2, -1,
          0, 0, 0,
          1, 2, 1
        ];
        resultImageData = convolveGrayscale(imgData, kernelTop, 'top');
        ctx.putImageData(resultImageData, 0, 0);
        showNotification('Deteksi garis atas diterapkan', 'success');
        break;
      }
      case 'blur': {
        const kernelBlur = [
          1/9, 1/9, 1/9,
          1/9, 1/9, 1/9,
          1/9, 1/9, 1/9
        ];
        resultImageData = convolveColor(originalImageData, kernelBlur);
        ctx.putImageData(resultImageData, 0, 0);
        showNotification('Blur diterapkan', 'success');
        break;
      }
      case 'separate': {
        separateChannels(originalImageData);
        showNotification('Channel RGB dipisahkan', 'success');
        break;
      }
      
      // Transform operations
      case 'translate':
      case 'scale':
      case 'rotate':
      case 'flipH':
      case 'flipV':
        geometricTransform(op);
        break;
      default:
        return;
    }
  });

  // Fungsi Transformasi Geometri
  async function geometricTransform(type) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    
    switch (type) {
      case 'translate': {
        const result = await Swal.fire({
          title: 'Translasi',
          html: `
            <div class="mb-4">
              <label for="dx" class="block mb-2 text-sm font-medium text-gray-300">Geser horizontal:</label>
              <input type="number" id="dx" value="50" class="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2">
            </div>
            <div>
              <label for="dy" class="block mb-2 text-sm font-medium text-gray-300">Geser vertikal:</label>
              <input type="number" id="dy" value="50" class="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2">
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Terapkan',
          cancelButtonText: 'Batal',
          preConfirm: () => {
            const dx = document.getElementById('dx').value;
            const dy = document.getElementById('dy').value;
            return { dx, dy };
          }
        });
        
        if (result.isConfirmed) {
          const dx = parseFloat(result.value.dx) || 0;
          const dy = parseFloat(result.value.dy) || 0;
          offCtx.translate(dx, dy);
          showNotification(`Translasi diterapkan: (${dx}, ${dy})`, 'success');
        } else {
          return; // User canceled
        }
        break;
      }
      case 'scale': {
        const result = await Swal.fire({
          title: 'Skala',
          html: `
            <div class="mb-4">
              <label for="sx" class="block mb-2 text-sm font-medium text-gray-300">Skala horizontal:</label>
              <input type="number" id="sx" step="0.1" value="1.5" class="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2">
            </div>
            <div>
              <label for="sy" class="block mb-2 text-sm font-medium text-gray-300">Skala vertikal:</label>
              <input type="number" id="sy" step="0.1" value="1.5" class="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2">
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Terapkan',
          cancelButtonText: 'Batal',
          preConfirm: () => {
            const sx = document.getElementById('sx').value;
            const sy = document.getElementById('sy').value;
            return { sx, sy };
          }
        });
        
        if (result.isConfirmed) {
          const sx = parseFloat(result.value.sx) || 1;
          const sy = parseFloat(result.value.sy) || 1;
          offCtx.scale(sx, sy);
          showNotification(`Skala diterapkan: (${sx}, ${sy})`, 'success');
        } else {
          return; // User canceled
        }
        break;
      }
      case 'rotate': {
        const result = await Swal.fire({
          title: 'Rotasi',
          html: `
            <div class="mb-2">
              <label for="deg" class="block mb-2 text-sm font-medium text-gray-300">Sudut rotasi (°):</label>
              <input type="number" id="deg" value="45" class="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2">
            </div>
            <div class="mt-4">
              <input id="slider" type="range" min="-180" max="180" value="45" class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer">
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Terapkan',
          cancelButtonText: 'Batal',
          didOpen: () => {
            const slider = document.getElementById('slider');
            const input = document.getElementById('deg');
            slider.addEventListener('input', () => {
              input.value = slider.value;
            });
            input.addEventListener('input', () => {
              slider.value = input.value;
            });
          },
          preConfirm: () => {
            const deg = document.getElementById('deg').value;
            return { deg };
          }
        });
        
        if (result.isConfirmed) {
          const deg = parseFloat(result.value.deg) || 0;
          const rad = deg * Math.PI / 180;
          // rotasi di pusat gambar
          offCtx.translate(canvas.width/2, canvas.height/2);
          offCtx.rotate(rad);
          offCtx.translate(-canvas.width/2, -canvas.height/2);
          showNotification(`Rotasi diterapkan: ${deg}°`, 'success');
        } else {
          return; // User canceled
        }
        break;
      }
      case 'flipH':
        offCtx.translate(canvas.width, 0);
        offCtx.scale(-1, 1);
        showNotification('Gambar dibalik horizontal', 'success');
        break;
      case 'flipV':
        offCtx.translate(0, canvas.height);
        offCtx.scale(1, -1);
        showNotification('Gambar dibalik vertikal', 'success');
        break;
    }
    
    /* gambar ulang ke kanvas baru, lalu salin kembali */
    offCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, 0, 0);
  }
  
  // Fungsi untuk menampilkan notifikasi dengan SweetAlert2 dan Tailwind
  function showNotification(message, type = 'info') {
    // Definisikan class dan warna berdasarkan jenis notifikasi
    let iconType, bgClass, textClass, iconClass;
    
    switch(type) {
      case 'error':
        iconType = 'error';
        bgClass = 'bg-red-800';
        textClass = 'text-red-100';
        iconClass = 'text-red-100';
        break;
      case 'success':
        iconType = 'success';
        bgClass = 'bg-primary-800';
        textClass = 'text-primary-100';
        iconClass = 'text-primary-100';
        break;
      default:
        iconType = 'info';
        bgClass = 'bg-gray-800';
        textClass = 'text-gray-100';
        iconClass = 'text-gray-100';
    }
    
    // Definisikan toast dengan Tailwind classes
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: `${bgClass} p-2 rounded-lg shadow-lg border border-gray-700`,
        title: `${textClass} text-sm font-medium ml-2`,
        timerProgressBar: 'bg-primary-500',
        icon: iconClass
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    
    Toast.fire({
      icon: iconType,
      title: message
    });
  }
  
  // Toggle dark mode
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'fixed bottom-4 right-4 p-2 bg-gray-700 rounded-full shadow-lg hover:bg-gray-600 focus:outline-none transition-colors';
  darkModeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
  document.body.appendChild(darkModeToggle);
  
  // Check initial state
  const isDarkMode = document.documentElement.classList.contains('dark');
  updateDarkModeButton(isDarkMode);
  
  darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.add('bg-gray-100');
      updateDarkModeButton(false);
    } else {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-gray-100');
      document.body.classList.add('bg-gray-900');
      updateDarkModeButton(true);
    }
  });
  
  function updateDarkModeButton(isDark) {
    if (isDark) {
      // Moon icon - currently in dark mode
      darkModeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
      darkModeToggle.classList.remove('bg-gray-200');
      darkModeToggle.classList.add('bg-gray-700');
    } else {
      // Sun icon - currently in light mode
      darkModeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 9.003 0 008.354-5.646z" /></svg>';
      darkModeToggle.classList.remove('bg-gray-700');
      darkModeToggle.classList.add('bg-gray-200');
    }
  }
  
  // Image Filter Functions
  
  function toGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
  }
  
  function convolveGrayscale(imageData, kernel, directional) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const output = new ImageData(width, height);
    const dst = output.data;
    const kernelSize = Math.sqrt(kernel.length);
    const half = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const posX = x + kx;
            const posY = y + ky;
            if (posX >= 0 && posX < width && posY >= 0 && posY < height) {
              const i = (posY * width + posX) * 4;
              const pixel = src[i]; // Karena sudah grayscale, R=G=B
              const k = kernel[(ky + half) * kernelSize + (kx + half)];
              sum += pixel * k;
            }
          }
        }
        const idx = (y * width + x) * 4;
        if (directional === 'right') {
          sum = sum > 0 ? sum : 0;
        } else if (directional === 'top') {
          sum = sum < 0 ? -sum : 0;
        } else {
          sum = Math.abs(sum);
        }
        dst[idx] = dst[idx + 1] = dst[idx + 2] = (sum > 255 ? 255 : sum);
        dst[idx + 3] = 255;
      }
    }
    return output;
  }
  
  function convolveColor(imageData, kernel) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const output = new ImageData(width, height);
    const dst = output.data;
    const kernelSize = Math.sqrt(kernel.length);
    const half = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0, sumG = 0, sumB = 0;
        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const posX = x + kx;
            const posY = y + ky;
            if (posX >= 0 && posX < width && posY >= 0 && posY < height) {
              const i = (posY * width + posX) * 4;
              const k = kernel[(ky + half) * kernelSize + (kx + half)];
              sumR += src[i] * k;
              sumG += src[i + 1] * k;
              sumB += src[i + 2] * k;
            }
          }
        }
        const idx = (y * width + x) * 4;
        dst[idx] = Math.min(Math.max(sumR, 0), 255);
        dst[idx + 1] = Math.min(Math.max(sumG, 0), 255);
        dst[idx + 2] = Math.min(Math.max(sumB, 0), 255);
        dst[idx + 3] = 255;
      }
    }
    return output;
  }
  
  function separateChannels(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const redData = new ImageData(width, height);
    const greenData = new ImageData(width, height);
    const blueData = new ImageData(width, height);
    
    for (let i = 0; i < src.length; i += 4) {
      // Red channel: tampilkan komponen merah saja
      redData.data[i] = src[i];
      redData.data[i + 1] = 0;
      redData.data[i + 2] = 0;
      redData.data[i + 3] = src[i + 3];

      // Green channel: tampilkan komponen hijau saja
      greenData.data[i] = 0;
      greenData.data[i + 1] = src[i + 1];
      greenData.data[i + 2] = 0;
      greenData.data[i + 3] = src[i + 3];

      // Blue channel: tampilkan komponen biru saja
      blueData.data[i] = 0;
      blueData.data[i + 1] = 0;
      blueData.data[i + 2] = src[i + 2];
      blueData.data[i + 3] = src[i + 3];
    }

    // Create channel containers with Tailwind styling
    function createChannelCanvas(channelName, data, color) {
      const channelCanvas = document.createElement('canvas');
      channelCanvas.width = width;
      channelCanvas.height = height;
      channelCanvas.className = 'channel-canvas w-full rounded-lg';
      const context = channelCanvas.getContext('2d');
      context.putImageData(data, 0, 0);
      
      const container = document.createElement('div');
      container.className = 'bg-gray-700 p-4 rounded-lg';
      
      const title = document.createElement('p');
      title.className = `text-${color}-300 font-medium mb-2 text-center`;
      title.innerText = channelName;
      
      container.appendChild(title);
      container.appendChild(channelCanvas);
      return container;
    }

    // Display each channel with styled containers
    channelsContainer.appendChild(createChannelCanvas('Red Channel', redData, 'red'));
    channelsContainer.appendChild(createChannelCanvas('Green Channel', greenData, 'green'));
    channelsContainer.appendChild(createChannelCanvas('Blue Channel', blueData, 'blue'));
  }
});
