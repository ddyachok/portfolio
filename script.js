// Detect if device supports hover (desktop) or touch (mobile)
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Custom cursor - only for desktop
if (isDesktop) {
  const cursor = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursor && cursorRing) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      
      cursorRing.style.left = e.clientX + 'px';
      cursorRing.style.top = e.clientY + 'px';
    });

    // Cursor hover effects
    const interactiveElements = document.querySelectorAll('.btn, .project, .tag, .skill, .portrait, .nav-item');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('hover');
      });
      
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('hover');
      });
    });
  }
}

// Image Viewer with Advanced Scrolling and Touch Support
const portrait = document.getElementById('portrait');
const imageViewer = document.getElementById('imageViewer');
const closeViewer = document.getElementById('closeViewer');
const glitchTransition = document.getElementById('glitchTransition');
const navItems = document.querySelectorAll('.nav-item');

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

// Touch handling variables
let lastTouchDistance = 0;
let lastTouchCenter = { x: 0, y: 0 };
let isDragging = false;
let lastTouchPos = { x: 0, y: 0 };

function openImageViewer() {
  // Trigger glitch effect
  if (glitchTransition) {
    glitchTransition.classList.add('active');
  }
  
  // Open viewer with slight delay for glitch effect
  setTimeout(() => {
    imageViewer.classList.add('active');
    setupImageViewer();
    if (isDesktop && document.querySelector('.cursor-ring')) {
      document.querySelector('.cursor-ring').classList.add('viewing');
    }
  }, 100);
  
  // Remove glitch effect after animation
  setTimeout(() => {
    if (glitchTransition) {
      glitchTransition.classList.remove('active');
    }
  }, 600);
}

function closeImageViewer() {
  // Trigger glitch effect
  if (glitchTransition) {
    glitchTransition.classList.add('active');
  }
  
  // Close viewer
  setTimeout(() => {
    imageViewer.classList.remove('active');
    cleanupImageViewer();
    if (isDesktop && document.querySelector('.cursor-ring')) {
      document.querySelector('.cursor-ring').classList.remove('viewing');
    }
  }, 200);
  
  // Remove glitch effect
  setTimeout(() => {
    if (glitchTransition) {
      glitchTransition.classList.remove('active');
    }
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
  if (isDesktop) {
    // Desktop: mouse events
    viewerViewport.addEventListener('mousemove', handleImageScroll);
    viewerViewport.addEventListener('wheel', handleZoom, { passive: false });
  } else {
    // Mobile: touch events
    viewerViewport.addEventListener('touchstart', handleTouchStart, { passive: false });
    viewerViewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewerViewport.addEventListener('touchend', handleTouchEnd, { passive: false });
  }
}

function cleanupImageViewer() {
  if (viewerViewport) {
    // Remove desktop events
    viewerViewport.removeEventListener('mousemove', handleImageScroll);
    viewerViewport.removeEventListener('wheel', handleZoom);
    
    // Remove mobile events
    viewerViewport.removeEventListener('touchstart', handleTouchStart);
    viewerViewport.removeEventListener('touchmove', handleTouchMove);
    viewerViewport.removeEventListener('touchend', handleTouchEnd);
  }
  
  // Reset image transform
  if (viewerImage) {
    viewerImage.style.transform = 'translate(-50%, -50%) scale(1)';
  }
  
  hideZoomIndicator();
}

// Touch event handlers
function handleTouchStart(e) {
  e.preventDefault();
  
  if (e.touches.length === 1) {
    // Single touch - start dragging
    isDragging = true;
    lastTouchPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  } else if (e.touches.length === 2) {
    // Two fingers - start pinch zoom
    isDragging = false;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    lastTouchDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    lastTouchCenter = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  
  if (e.touches.length === 1 && isDragging) {
    // Single touch - drag image
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchPos.x;
    const deltaY = touch.clientY - lastTouchPos.y;
    
    imageData.translateX += deltaX;
    imageData.translateY += deltaY;
    
    // Clamp translation
    const scaledWidth = imageData.naturalWidth * imageData.scale;
    const scaledHeight = imageData.naturalHeight * imageData.scale;
    const maxTranslateX = Math.max(0, (scaledWidth - imageData.viewportWidth) / 2);
    const maxTranslateY = Math.max(0, (scaledHeight - imageData.viewportHeight) / 2);
    
    imageData.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, imageData.translateX));
    imageData.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, imageData.translateY));
    
    updateImageTransform();
    
    lastTouchPos = {
      x: touch.clientX,
      y: touch.clientY
    };
  } else if (e.touches.length === 2) {
    // Two fingers - pinch zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    if (lastTouchDistance > 0) {
      const scaleChange = currentDistance / lastTouchDistance;
      const oldScale = imageData.scale;
      imageData.scale *= scaleChange;
      
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
    
    lastTouchDistance = currentDistance;
  }
}

function handleTouchEnd(e) {
  if (e.touches.length === 0) {
    isDragging = false;
    lastTouchDistance = 0;
  } else if (e.touches.length === 1) {
    // Switch back to drag mode if one finger remains
    isDragging = true;
    lastTouchPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }
}

// Desktop mouse scroll handler
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

// Event listeners
if (portrait) {
  portrait.addEventListener('click', openImageViewer);
}

if (closeViewer) {
  closeViewer.addEventListener('click', closeImageViewer);
}

// Close on escape key or clicking outside
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && imageViewer && imageViewer.classList.contains('active')) {
    closeImageViewer();
  }
  // Close socials panel with ESC
  if (e.key === 'Escape') {
    const panel = document.getElementById('socialsPanel');
    if (panel && panel.classList.contains('active')) {
      panel.classList.remove('active');
    }
  }
});

if (imageViewer) {
  imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer) {
      closeImageViewer();
    }
  });
}

/* ASCII glitch effect on hover/interaction - Enhanced for mobile */
const buttons = document.querySelectorAll('.btn');
const asciiChars = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?[]{}()-_=+\\/|");

// helper to generate random ascii string of same length
function randAscii(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += asciiChars[Math.floor(Math.random() * asciiChars.length)];
  return s;
}

function triggerGlitchEffect(btn, span, original) {
  let frames = 0;
  const maxFrames = 12;
  
  const glitchInterval = setInterval(() => {
    frames++;
    span.textContent = randAscii(original.length);
    span.style.opacity = 0.95;
    
    if (frames > maxFrames) {
      clearInterval(glitchInterval);
      // type back original with small flicker
      let idx = 0;
      const reveal = setInterval(() => {
        idx++;
        span.textContent = original.slice(0, idx) + randAscii(Math.max(0, original.length - idx));
        if (idx >= original.length) {
          clearInterval(reveal);
          span.textContent = original;
        }
      }, 45);
    }
  }, 35);
  
  return glitchInterval;
}

buttons.forEach(btn => {
  const span = btn.querySelector('.ascii');
  if (!span) return;
  
  const original = span.textContent;
  let hoverTimeout;

  if (isDesktop) {
    // Desktop: hover effects
    btn.addEventListener('mouseenter', () => {
      clearInterval(hoverTimeout);
      hoverTimeout = triggerGlitchEffect(btn, span, original);
    });

    btn.addEventListener('mouseleave', () => {
      clearInterval(hoverTimeout);
      span.textContent = original;
    });
  } else {
    // Mobile: add active state for touch feedback
    btn.addEventListener('touchstart', () => {
      btn.classList.add('active');
    });
    
    btn.addEventListener('touchend', () => {
      btn.classList.remove('active');
    });
  }

  // Click/tap handler
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Trigger glitch effect on click
    const prev = span.textContent;
    span.textContent = randAscii(prev.length);
    setTimeout(() => span.textContent = prev, 300);
    
    // Button actions
    if (btn.dataset.ascii === 'CONTACT') {
      if ('navigator' in window && 'share' in navigator) {
        // Use native share on mobile if available
        navigator.share({
          title: 'Contact Danylo Dyachok',
          text: 'iOS Developer - Contact Information',
          url: window.location.href
        }).catch(() => {
          // Fallback to alert
          alert('Email: danylo.dyachok@example.com\nLinkedIn: linkedin.com/in/danylo');
        });
      } else {
        alert('Email: danylo.dyachok@example.com\nLinkedIn: linkedin.com/in/danylo');
      }
    } else if (btn.dataset.ascii === 'RESUME') {
      alert('Resume request — send me an email to get a PDF.');
    } else if (btn.dataset.ascii === 'WORK') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  });
});

/* Subtle animation - flicker header (reduced on mobile for performance) */
const flickerInterval = isDesktop ? 2200 : 4500; // Less frequent on mobile
setInterval(() => {
  document.querySelectorAll('h1, h2').forEach(el => {
    el.style.opacity = (Math.random() > 0.2) ? 1 : 0.85;
  });
}, flickerInterval);

// Mobile-specific optimizations
if (!isDesktop) {
  // Reduce scanline intensity on mobile for better performance
  document.documentElement.style.setProperty('--scanline-opacity', '0.01');
  
  // Add touch feedback class to body
  document.body.classList.add('touch-device');
  
  // Optimize animations for mobile
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    // Disable animations if user prefers reduced motion
    document.documentElement.style.setProperty('--animation-duration', '0s');
  }
}

// Viewport height fix for mobile browsers
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeight, 100); // Small delay for orientation change
});

// ASCII Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
  const navItems = document.querySelectorAll('.nav-item');
  const currentPath = document.getElementById('currentPath');
  initCtosGrid();
  
  // ASCII characters for glitch effect
  const asciiChars = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?[]{}()-_=+\\/|");
  
  function randAscii(len) {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += asciiChars[Math.floor(Math.random() * asciiChars.length)];
    }
    return s;
  }
  
  function triggerAsciiGlitch(element) {
    const originalText = element.textContent;
    let frames = 0;
    const maxFrames = 12;
    
    const glitchInterval = setInterval(() => {
      frames++;
      element.textContent = randAscii(originalText.length);
      
      if (frames > maxFrames) {
        clearInterval(glitchInterval);
        let idx = 0;
        const reveal = setInterval(() => {
          idx++;
          element.textContent = originalText.slice(0, idx) + randAscii(Math.max(0, originalText.length - idx));
          if (idx >= originalText.length) {
            clearInterval(reveal);
            element.textContent = originalText;
          }
        }, 45);
      }
    }, 35);
  }
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Only prevent default if it's not a real link
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
      }
      
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      triggerAsciiGlitch(this);
      
      this.classList.add('glitch-active');
      setTimeout(() => {
        this.classList.remove('glitch-active');
      }, 300);
      
      const page = this.dataset.page;
      if (currentPath) {
        currentPath.textContent = `portfolio/${page}`;
      }
      
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });
});

// Mobile menu functions
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  const toggleButton = document.querySelector('.mobile-menu-toggle');
  
  if (mobileNav.classList.contains('active')) {
    mobileNav.classList.remove('active');
    toggleButton.classList.remove('active');
    toggleButton.textContent = '≡ MENU';
  } else {
    mobileNav.classList.add('active');
    toggleButton.classList.add('active');
    toggleButton.textContent = '× CLOSE';
  }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
  const mobileNav = document.getElementById('mobileNav');
  const toggleButton = document.querySelector('.mobile-menu-toggle');
  
  if (!mobileNav.contains(e.target) && !toggleButton.contains(e.target)) {
    if (mobileNav.classList.contains('active')) {
      toggleMobileMenu();
    }
  }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav.classList.contains('active')) {
      toggleMobileMenu();
    }
  }
});

// MARK: - CV -

function printCV() {
  // Add print-specific styles
  const printStyles = `
    <style media="print">
      .ascii-navbar, .scanlines::before, .cursor, .cursor-ring { display: none !important; }
      .main-content { margin-top: 0 !important; }
      .container { max-width: 100% !important; margin: 0 !important; padding: 20px !important; }
      .card { break-inside: avoid; margin-bottom: 20px; }
      .cv-actions { display: none !important; }
      body { background: white !important; color: black !important; }
      * { color: black !important; background: white !important; border-color: #ccc !important; }
    </style>
  `;
  
  const head = document.head.innerHTML;
  document.head.innerHTML = head + printStyles;
  
  setTimeout(() => {
    window.print();
    // Restore original styles after print dialog
    setTimeout(() => {
      document.head.innerHTML = head;
    }, 1000);
  }, 100);
}

// MARK: - CtOS Socials Grid
function initCtosGrid(){
  const grid = document.getElementById('ctosGrid');
  const linesSvg = document.getElementById('ctosLines');
  if (!grid || !linesSvg) return;

  const panel = document.getElementById('socialsPanel');
  const panelClose = document.getElementById('socialsPanelClose');
  if (panelClose){ panelClose.addEventListener('click', ()=> panel.classList.remove('active')); }

  const width = grid.clientWidth;
  const height = grid.clientHeight;
  linesSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Build nodes layout
  const nodePositions = [
    { x: width*0.18, y: height*0.68 },
    { x: width*0.30, y: height*0.52 },
    { x: width*0.42, y: height*0.60 },
    { x: width*0.54, y: height*0.48 },
    { x: width*0.68, y: height*0.56 },
    { x: width*0.82, y: height*0.42 },
  ];

  // Draw connections
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  const d = nodePositions.map((p,i)=> `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  path.setAttribute('d', d);
  path.setAttribute('stroke', 'rgba(255,255,255,0.35)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap','round');
  linesSvg.appendChild(path);

  // Add nodes
  nodePositions.forEach((p,idx)=>{
    const el = document.createElement('div');
    el.className = 'ctos-node' + (idx===nodePositions.length-1 ? ' core pulse' : '');
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.title = idx===nodePositions.length-1 ? 'CORE: SOCIALS' : `NODE ${idx+1}`;

    el.addEventListener('click', ()=>{
      // progress effect: highlight path up to the clicked node
      const subPath = document.createElementNS('http://www.w3.org/2000/svg','path');
      const d2 = nodePositions.slice(0, idx+1).map((np,i)=> `${i===0?'M':'L'} ${np.x} ${np.y}`).join(' ');
      subPath.setAttribute('d', d2);
      subPath.setAttribute('stroke', 'rgba(58,46,71,0.9)');
      subPath.setAttribute('stroke-width', '3');
      subPath.setAttribute('fill', 'none');
      subPath.setAttribute('stroke-linecap','round');
      subPath.style.filter = 'drop-shadow(0 0 6px rgba(58,46,71,0.9))';
      linesSvg.appendChild(subPath);

      if (idx === nodePositions.length-1) {
        // Core reached: reveal socials panel
        setTimeout(()=> panel.classList.add('active'), 120);
      }
    });

    // touch support visual feedback
    el.addEventListener('touchstart', ()=> el.classList.add('pulse'), {passive:true});
    el.addEventListener('touchend', ()=> el.classList.remove('pulse'), {passive:true});

    grid.appendChild(el);
  });
}

// Add glitch effect to CV buttons
const cvButtons = document.querySelectorAll('.cv-actions .btn');
cvButtons.forEach(btn => {
  const span = btn.querySelector('.ascii');
  if (!span) return;
  
  const original = span.textContent;
  const asciiChars = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?[]{}()-_=+\\/|");

  function randAscii(len) {
    let s = '';
    for (let i = 0; i < len; i++) s += asciiChars[Math.floor(Math.random() * asciiChars.length)];
    return s;
  }

  btn.addEventListener('mouseenter', () => {
    let frames = 0;
    const maxFrames = 8;
    
    const glitchInterval = setInterval(() => {
      frames++;
      span.textContent = randAscii(original.length);
      
      if (frames > maxFrames) {
        clearInterval(glitchInterval);
        span.textContent = original;
      }
    }, 40);
  });
});

// CV Download functionality
function downloadCV(event) {
  if (event) {
    event.preventDefault();
  }
  
  // Create a temporary link element for download
  const link = document.createElement('a');
  
  // You'll need to replace this with your actual CV file path
  // Options for CV file location:
  // 1. Place CV.pdf in the same directory as your HTML files
  // 2. Create a 'files' or 'assets' folder and place it there
  // 3. Host it externally and use full URL
  
  link.href = 'files/Danylo_Middle_iOS_Developer_CV.pdf';
  link.download = 'Danylo_Middle_iOS_Developer_CV.pdf';
  link.target = '_blank';
  
  // Trigger glitch effect on the clicked nav item
  const navItem = event.target;
  if (navItem && navItem.classList.contains('nav-item')) {
    triggerAsciiGlitch(navItem);
    navItem.classList.add('glitch-active');
    setTimeout(() => {
      navItem.classList.remove('glitch-active');
    }, 300);
  }
  
  // Show download feedback
  showDownloadFeedback();
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Update nav path
  const currentPath = document.getElementById('currentPath');
  if (currentPath) {
    currentPath.textContent = 'portfolio/cv-download';
    setTimeout(() => {
      currentPath.textContent = 'portfolio/home';
    }, 2000);
  }
}

// Download feedback function
function showDownloadFeedback() {
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = 'download-feedback';
  feedback.innerHTML = `
    <div class="feedback-content">
      <span class="feedback-icon">📄</span>
      <span class="feedback-text">CV Download Started</span>
    </div>
  `;
  
  document.body.appendChild(feedback);
  
  // Show feedback
  setTimeout(() => {
    feedback.classList.add('active');
  }, 10);
  
  // Hide and remove feedback
  setTimeout(() => {
    feedback.classList.remove('active');
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 300);
  }, 2500);
}

// Alternative method: Open CV in new tab if download fails
function openCVInNewTab() {
  window.open('files/Danylo_Middle_iOS_Developer_CV.pdf', '_blank');
}

// Enhanced CV download with fallback
function downloadCVWithFallback(event) {
  if (event) {
    event.preventDefault();
  }
  
  const cvPath = 'files/Danylo_Middle_iOS_Developer_CV.pdf';
  
  // Try download first
  try {
    const link = document.createElement('a');
    link.href = cvPath;
    link.download = 'Danylo_Middle_iOS_Developer_CV.pdf';
    
    // Test if file exists by attempting to fetch it
    fetch(cvPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // File exists, proceed with download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showDownloadFeedback();
        } else {
          // File doesn't exist, show alternative
          showCVAlternative();
        }
      })
      .catch(() => {
        // Fetch failed, show alternative
        showCVAlternative();
      });
      
  } catch (error) {
    console.error('Download failed:', error);
    showCVAlternative();
  }
}

// Show alternative when CV file is not available
function showCVAlternative() {
  const modal = document.createElement('div');
  modal.className = 'cv-modal';
  modal.innerHTML = `
    <div class="cv-modal-content">
      <h3>CV Request</h3>
      <p>CV will be sent via email. Please contact me:</p>
      <div class="cv-contact-options">
        <a href="mailto:danieldyachok@gmail.com?subject=CV Request&body=Hi Danylo, I'd like to request your CV." 
           class="btn glow">
          <span class="ascii">EMAIL REQUEST</span>
        </a>
        <button onclick="closeCVModal()" class="btn">
          <span class="ascii">CLOSE</span>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

function closeCVModal() {
  const modal = document.querySelector('.cv-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
}
