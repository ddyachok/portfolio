// Custom cursor
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  
  cursorRing.style.left = e.clientX + 'px';
  cursorRing.style.top = e.clientY + 'px';
});

// Cursor hover effects
const interactiveElements = document.querySelectorAll('.btn, .project, .tag, .skill, .portrait');

interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.classList.add('hover');
  });
  
  el.addEventListener('mouseleave', () => {
    cursorRing.classList.remove('hover');
  });
});

// Image Viewer with Advanced Scrolling
const portrait = document.getElementById('portrait');
const imageViewer = document.getElementById('imageViewer');
const closeViewer = document.getElementById('closeViewer');
const glitchTransition = document.getElementById('glitchTransition');

let viewerImage = null;
let viewerViewport = null;
let imageData = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  naturalWidth: 0,
  naturalHeight: 0,
  viewportWidth: 0,
  viewportHeight: 0
};

function openImageViewer() {
  // Trigger glitch effect
  glitchTransition.classList.add('active');
  
  // Open viewer with slight delay for glitch effect
  setTimeout(() => {
    imageViewer.classList.add('active');
    setupImageViewer();
    cursorRing.classList.add('viewing');
  }, 100);
  
  // Remove glitch effect after animation
  setTimeout(() => {
    glitchTransition.classList.remove('active');
  }, 600);
}

function closeImageViewer() {
  // Trigger glitch effect
  glitchTransition.classList.add('active');
  
  // Close viewer
  setTimeout(() => {
    imageViewer.classList.remove('active');
    cleanupImageViewer();
    cursorRing.classList.remove('viewing');
  }, 200);
  
  // Remove glitch effect
  setTimeout(() => {
    glitchTransition.classList.remove('active');
  }, 600);
}

function setupImageViewer() {
  viewerImage = imageViewer.querySelector('img');
  viewerViewport = imageViewer.querySelector('.image-viewer-viewport');
  
  if (!viewerViewport) {
    // Create viewport if it doesn't exist
    const content = imageViewer.querySelector('.image-viewer-content');
    const viewport = document.createElement('div');
    viewport.className = 'image-viewer-viewport';
    const img = content.querySelector('img');
    content.appendChild(viewport);
    viewport.appendChild(img);
    viewerViewport = viewport;
  }
  
  // Wait for image to load and get dimensions
  viewerImage.onload = function() {
    calculateImageDimensions();
    setupScrolling();
  };
  
  // If image is already loaded
  if (viewerImage.complete) {
    calculateImageDimensions();
    setupScrolling();
  }
}

function calculateImageDimensions() {
  imageData.naturalWidth = viewerImage.naturalWidth;
  imageData.naturalHeight = viewerImage.naturalHeight;
  imageData.viewportWidth = viewerViewport.clientWidth;
  imageData.viewportHeight = viewerViewport.clientHeight;
  
  // Calculate initial scale to fit image
  const scaleX = imageData.viewportWidth / imageData.naturalWidth;
  const scaleY = imageData.viewportHeight / imageData.naturalHeight;
  imageData.scale = Math.max(scaleX, scaleY) * 1.2; // 20% larger than viewport
  
  // Reset position
  imageData.translateX = 0;
  imageData.translateY = 0;
  
  updateImageTransform();
  updateZoomIndicator();
}

function setupScrolling() {
  viewerViewport.addEventListener('mousemove', handleImageScroll);
  viewerViewport.addEventListener('wheel', handleZoom, { passive: false });
}

function cleanupImageViewer() {
  if (viewerViewport) {
    viewerViewport.removeEventListener('mousemove', handleImageScroll);
    viewerViewport.removeEventListener('wheel', handleZoom);
  }
  
  // Reset image transform
  if (viewerImage) {
    viewerImage.style.transform = 'translate(-50%, -50%) scale(1)';
  }
  
  hideZoomIndicator();
}

function handleImageScroll(e) {
  const rect = viewerViewport.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  // Get mouse position relative to center
  const mouseX = e.clientX - rect.left - centerX;
  const mouseY = e.clientY - rect.top - centerY;
  
  // Calculate maximum translation based on scale
  const scaledWidth = imageData.naturalWidth * imageData.scale;
  const scaledHeight = imageData.naturalHeight * imageData.scale;
  
  const maxTranslateX = Math.max(0, (scaledWidth - imageData.viewportWidth) / 2);
  const maxTranslateY = Math.max(0, (scaledHeight - imageData.viewportHeight) / 2);
  
  // Calculate translation based on cursor position (more responsive)
  const translateFactorX = maxTranslateX / centerX;
  const translateFactorY = maxTranslateY / centerY;
  
  imageData.translateX = -mouseX * translateFactorX * 0.8; // 0.8 for smoother movement
  imageData.translateY = -mouseY * translateFactorY * 0.8;
  
  // Clamp translation
  imageData.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, imageData.translateX));
  imageData.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, imageData.translateY));
  
  updateImageTransform();
  showZoomIndicator();
}

function handleZoom(e) {
  e.preventDefault();
  
  const zoomFactor = 0.1;
  const oldScale = imageData.scale;
  
  if (e.deltaY < 0) {
    // Zoom in
    imageData.scale *= (1 + zoomFactor);
  } else {
    // Zoom out
    imageData.scale *= (1 - zoomFactor);
  }
  
  // Limit zoom range
  const minScale = Math.min(
    imageData.viewportWidth / imageData.naturalWidth,
    imageData.viewportHeight / imageData.naturalHeight
  );
  const maxScale = 3;
  
  imageData.scale = Math.max(minScale, Math.min(maxScale, imageData.scale));
  
  // Adjust translation based on zoom change
  const scaleRatio = imageData.scale / oldScale;
  imageData.translateX *= scaleRatio;
  imageData.translateY *= scaleRatio;
  
  updateImageTransform();
  updateZoomIndicator();
}

function updateImageTransform() {
  if (viewerImage) {
    viewerImage.style.transform =
      `translate(calc(-50% + ${imageData.translateX}px), calc(-50% + ${imageData.translateY}px)) scale(${imageData.scale})`;
  }
}

function updateZoomIndicator() {
  const indicator = imageViewer.querySelector('.image-viewer-zoom-indicator');
  if (indicator) {
    const percentage = Math.round(imageData.scale * 100);
    indicator.textContent = `${percentage}%`;
  }
}

function showZoomIndicator() {
  const indicator = imageViewer.querySelector('.image-viewer-zoom-indicator');
  if (indicator) {
    indicator.style.opacity = '1';
    clearTimeout(indicator.hideTimeout);
    indicator.hideTimeout = setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }
}

function hideZoomIndicator() {
  const indicator = imageViewer.querySelector('.image-viewer-zoom-indicator');
  if (indicator) {
    indicator.style.opacity = '0';
  }
}

portrait.addEventListener('click', openImageViewer);
closeViewer.addEventListener('click', closeImageViewer);

// Close on escape key or clicking outside
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
    closeImageViewer();
  }
});

imageViewer.addEventListener('click', (e) => {
  if (e.target === imageViewer) {
    closeImageViewer();
  }
});

/* ASCII glitch effect on hover/interaction.
   On hover, the button text briefly becomes random ascii characters, then resolves to the target label.
*/
const buttons = document.querySelectorAll('.btn');
const asciiChars = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?[]{}()-_=+\\/|" );

// helper to generate random ascii string of same length
function randAscii(len){
  let s='';
  for(let i=0;i<len;i++) s += asciiChars[Math.floor(Math.random()*asciiChars.length)];
  return s;
}

buttons.forEach(btn=>{
  const span = btn.querySelector('.ascii');
  const original = span.textContent;
  let hoverTimeout;

  btn.addEventListener('mouseenter', ()=>{
    // start glitch
    let frames = 0;
    const maxFrames = 12;
    clearInterval(hoverTimeout);
    hoverTimeout = setInterval(()=>{
      frames++;
      span.textContent = randAscii(original.length);
      span.style.opacity = 0.95;
      if(frames>maxFrames){
        clearInterval(hoverTimeout);
        // type back original with small flicker
        let idx=0;
        const reveal = setInterval(()=>{
          idx++;
          span.textContent = original.slice(0, idx) + randAscii(Math.max(0, original.length-idx));
          if(idx>=original.length){
            clearInterval(reveal);
            span.textContent = original;
          }
        }, 45);
      }
    }, 35);
  });

  btn.addEventListener('mouseleave', ()=>{
    clearInterval(hoverTimeout);
    span.textContent = original;
  });

  // on focus / click quick glitch
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const prev = span.textContent;
    span.textContent = randAscii(prev.length);
    setTimeout(()=> span.textContent = prev, 300);
    // simple actions for demo: scroll to sections or download resume (not implemented)
    if(btn.dataset.ascii === 'CONTACT'){
      alert('Email: danylo.dyachok@example.com\\nLinkedIn: linkedin.com/in/danylo');
    } else if(btn.dataset.ascii === 'RESUME'){
      alert('Resume request — send me an email to get a PDF.');
    } else if(btn.dataset.ascii === 'WORK'){
      window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
    }
  });
});

/* small subtle animation - flicker header */
setInterval(()=>{
  document.querySelectorAll('h1, h2').forEach(el=>{
    el.style.opacity = (Math.random()>.2)?1:0.85;
  });
}, 2200);
