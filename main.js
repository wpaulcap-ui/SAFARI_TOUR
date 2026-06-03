
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

 
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}


const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));


function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === path);
  });
}
setActiveNav();


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    const original = btn.textContent;
    const formData = new FormData(this);
    const payload = {
      firstName: formData.get('first_name')?.toString().trim() || '',
      lastName: formData.get('last_name')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      tourInterest: formData.get('tour_interest')?.toString().trim() || '',
      groupSize: formData.get('group_size')?.toString().trim() || '',
      travelDate: formData.get('travel_date')?.toString().trim() || '',
      budget: formData.get('budget')?.toString().trim() || '',
      message: formData.get('message')?.toString().trim() || '',
      newsletter: formData.get('newsletter') === 'on'
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.message) {
      showNotification('Please complete your name, email, and message.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to send message.');
      }
      showNotification('Message sent! Peter will be in touch within 24 hours.', 'success');
      this.reset();
    } catch (error) {
      console.error('Safari contact form failed:', error);
      showNotification('Message could not be sent. Please try WhatsApp or email Peter directly.', 'error');
    } finally {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.opacity = '';
    }
  });
}


function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem; left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? '#2d5a27' : '#8b1a1a'};
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    opacity: 0;
    transition: all 0.4s ease;
    max-width: 90vw;
    text-align: center;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}


const filterBtns = document.querySelectorAll('.tour-filter-btn');
const tourCards  = document.querySelectorAll('.tour-card-filterable');

if (filterBtns.length && tourCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      tourCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}


const galleryItems = document.querySelectorAll('.gallery-item');
if (galleryItems.length) {
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const emoji   = item.querySelector('.tour-emoji, .gallery-emoji')?.textContent || '🌍';
      const caption = item.querySelector('.gallery-caption')?.textContent || '';

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(15,8,2,0.92);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
      `;
      const box = document.createElement('div');
      box.style.cssText = `
        text-align: center; color: #fff;
        padding: 3rem; max-width: 500px;
      `;
      box.innerHTML = `
        <div style="font-size:8rem;margin-bottom:1.5rem">${emoji}</div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#c9962a">${caption}</p>
        <p style="font-size:0.8rem;margin-top:1.5rem;color:rgba(255,255,255,0.4)">Click anywhere to close</p>
      `;
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      overlay.addEventListener('click', () => {
        overlay.remove();
        document.body.style.overflow = '';
      });
    });
  });
}


function animateNumber(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
 }

const statNums = document.querySelectorAll('.stat-num');
if (statNums.length) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el   = entry.target;
        const text = el.textContent;
        const num  = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/[\d]/g, '');
        if (!isNaN(num)) animateNumber(el, num, suffix);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statsObserver.observe(el));
}
