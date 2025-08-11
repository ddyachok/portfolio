//
//  script.js
//  
//
//  Created by Danylo Dyachok on 11.08.2025.
//

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

// Image Viewer with Glitch Transition
const portrait = document.getElementById('portrait');
const imageViewer = document.getElementById('imageViewer');
const closeViewer = document.getElementById('closeViewer');
const glitchTransition = document.getElementById('glitchTransition');
const viewerImage = imageViewer.querySelector('img');
const viewerContent = imageViewer.querySelector('.image-viewer-content');

function openImageViewer() {
  // Trigger glitch effect
  glitchTransition.classList.add('active');
  
  // Open viewer with slight delay for glitch effect
  setTimeout(() => {
    imageViewer.classList.add('active');
    setupImageScrolling();
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
    removeImageScrolling();
  }, 200);
  
  // Remove glitch effect
  setTimeout(() => {
    glitchTransition.classList.remove('active');
  }, 600);
}

function setupImageScrolling() {
  viewerContent.addEventListener('mousemove', handleImageScroll);
}

function removeImageScrolling() {
  viewerContent.removeEventListener('mousemove', handleImageScroll);
  // Reset image position
  viewerImage.style.transform = 'translate(0%, 0%)';
}

function handleImageScroll(e) {
  const rect = viewerContent.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Calculate relative position (0 to 1)
  const relativeX = x / rect.width;
  const relativeY = y / rect.height;
  
  // Calculate scroll amounts (adjust these values to control scroll sensitivity)
  const scrollX = (relativeX - 0.5) * 30; // 30% max scroll
  const scrollY = (relativeY - 0.5) * 30; // 30% max scroll
  
  // Apply transform to image
  viewerImage.style.transform = `translate(${-scrollX}%, ${-scrollY}%)`;
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
