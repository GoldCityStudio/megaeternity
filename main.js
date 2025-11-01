gsap.registerPlugin(Observer);

let sections = document.querySelectorAll("section"),
  images = document.querySelectorAll(".bg"),
  contentWrappers = gsap.utils.toArray(".content-wrapper"),
  headings = gsap.utils.toArray(".section-heading"),
  outerWrappers = gsap.utils.toArray(".outer"),
  innerWrappers = gsap.utils.toArray(".inner"),
  currentIndex = -1,
  wrap = gsap.utils.wrap(0, sections.length),
  animating;

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
  index = wrap(index); // make sure it's valid
  animating = true;
  let fromTop = direction === -1,
      dFactor = fromTop ? -1 : 1,
      tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power1.inOut" },
        onComplete: () => animating = false
      });
  if (currentIndex >= 0) {
    // The first time this function runs, current is -1
    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(images[currentIndex], { yPercent: -15 * dFactor })
      .set(sections[currentIndex], { autoAlpha: 0 });
  }
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
  tl.fromTo([outerWrappers[index], innerWrappers[index]], { 
      yPercent: i => i ? -100 * dFactor : 100 * dFactor
    }, { 
      yPercent: 0 
    }, 0)
    .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
    .fromTo(contentWrappers[index] || headings[index], { 
        autoAlpha: 0, 
        yPercent: 100 * dFactor
    }, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1,
        ease: "power2"
      }, 0.2);

  currentIndex = index;
  
  // Update active navigation link
  updateActiveNav();
}

// Update active navigation link
function updateActiveNav() {
  const navLinks = document.querySelectorAll('header nav > a, header nav .nav-item > a');
  // Map sections to nav links: 
  // Section 0 (Hero) = no link
  // Section 1 (About - includes Mission/Vision) = link 0
  // Section 2 (Services) = link 1
  // Section 3 & 4 (Workshops) = link 2
  // Section 5 (Innovation) = link 3
  // Section 6 (Working Days) = link 4
  // Section 7 (Contact) = link 5
  
  const sectionToNavMap = {
    0: -1,  // Hero - no nav link
    1: 0,   // About (includes Mission/Vision)
    2: 1,   // Services
    3: 2,   // Workshop China
    4: 2,   // Workshop HK (same link)
    5: 3,   // Innovation (sixth class)
    6: -2,  // Our Clients (tenth class) - submenu item, handled separately
    7: 5,   // Working Days (eighth class)
    8: -2   // Contact (seventh class) - submenu item, handled separately
  };
  
  navLinks.forEach((link, index) => {
    link.classList.remove('active');
  });
  
  const activeNavIndex = sectionToNavMap[currentIndex];
  
  // Remove active from all nav links and submenu links
  document.querySelectorAll('header nav a, header nav .submenu a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Handle main navigation active state
  if (activeNavIndex !== undefined && activeNavIndex >= 0 && navLinks[activeNavIndex]) {
    navLinks[activeNavIndex].classList.add('active');
  }
  
  // Handle submenu active states
  const aboutLink = document.querySelector('header nav .nav-item.has-submenu > a[href="#about"]');
  
  if (currentIndex === 6) {
    // Our Clients section (tenth class, index 6)
    const clientsLink = document.querySelector('header nav .submenu a[href="#clients"]');
    if (clientsLink) {
      clientsLink.classList.add('active');
    }
    if (aboutLink) {
      aboutLink.classList.add('active');
    }
  } else if (currentIndex === 5) {
    // Innovation section (sixth class, index 5)
    const innovationLink = document.querySelector('header nav .submenu a[href="#innovation"]');
    if (innovationLink) {
      innovationLink.classList.add('active');
    }
    if (aboutLink) {
      aboutLink.classList.add('active');
    }
  } else if (currentIndex === 8) {
    // Contact section (seventh class, index 8)
    const contactLink = document.querySelector('header nav .submenu a[href="#contact"]');
    if (contactLink) {
      contactLink.classList.add('active');
    }
    if (aboutLink) {
      aboutLink.classList.add('active');
    }
  }
}

Observer.create({
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  onDown: () => !animating && gotoSection(currentIndex - 1, -1),
  onUp: () => !animating && gotoSection(currentIndex + 1, 1),
  tolerance: 10,
  preventDefault: true
});

// Add click navigation to header links
document.querySelectorAll('header nav a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Handle China Factory modal link separately
    if (link.classList.contains('china-factory-link')) {
      const modal = document.getElementById('chinaFactoryModal');
      if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        // Initialize slider when modal opens
        setTimeout(() => {
          const slider = modal.querySelector('.factory-images-slider');
          if (slider && !slider.dataset.initialized) {
            // Trigger initialization via event
            const initEvent = new Event('initSlider');
            slider.dispatchEvent(initEvent);
            slider.dataset.initialized = 'true';
          }
        }, 100);
      }
      return;
    }
    
    // Get all navigation links (excluding submenu links for counting)
    const allNavLinks = Array.from(document.querySelectorAll('header nav > a, header nav .nav-item > a'));
    const navIndex = allNavLinks.indexOf(link);
    
    // Map nav links to sections
    const navToSectionMap = {
      0: 1,  // About -> Section 1 (includes Mission/Vision)
      1: 2,  // Services -> Section 2
      2: 3,  // Workshops -> Section 3 (China workshop)
      3: 5,  // Innovation -> Section 5
      4: 7,  // China Factory -> Modal (handled separately above)
      5: 7,  // Working Days -> Section 7
      6: 8   // Contact -> Section 8
    };
    
    // Check if it's a submenu link
    const isSubmenuLink = link.closest('.submenu');
    if (isSubmenuLink) {
      // Handle submenu navigation
      const href = link.getAttribute('href');
      
      // Map submenu links to sections
      const submenuLinkMap = {
        '#clients': 6,      // Our Clients -> Section 6 (tenth class)
        '#innovation': 5,  // Innovation -> Section 5 (sixth class)
        '#contact': 8      // Contact -> Section 8 (seventh class)
      };
      
      const targetSection = submenuLinkMap[href];
      if (targetSection !== undefined && !animating) {
        const direction = targetSection > currentIndex ? 1 : -1;
        gotoSection(targetSection, direction);
        return;
      }
    }
    
    const targetSection = navToSectionMap[navIndex];
    if (targetSection !== undefined && !animating) {
      const direction = targetSection > currentIndex ? 1 : -1;
      gotoSection(targetSection, direction);
    }
  });
});

gotoSection(0, 1);

// Services Slider Functionality
function initServicesSlider() {
  const slider = document.querySelector('.services-slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slider-slide');
  const prevBtn = slider.querySelector('.slider-btn.prev');
  const nextBtn = slider.querySelector('.slider-btn.next');
  const dotsContainer = slider.querySelector('.slider-dots');
  
  let currentSlide = 0;
  const totalSlides = slides.length;

  function getSlidesPerView() {
    return window.innerWidth >= 768 ? 2 : 1;
  }

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider-dot');

  function updateSlider() {
    const slidesPerView = getSlidesPerView();
    const translateX = -(currentSlide * (100 / slidesPerView));
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update dots - show dots for each viewable group
    const maxSlide = totalSlides - slidesPerView;
    dots.forEach((dot, index) => {
      if (slidesPerView === 2 && index >= totalSlides - 1) {
        dot.style.display = 'none';
      } else {
        dot.style.display = 'block';
        dot.classList.toggle('active', index === currentSlide);
      }
    });

    // Update button states
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= maxSlide;
  }

  function goToSlide(index) {
    const slidesPerView = getSlidesPerView();
    const maxSlide = totalSlides - slidesPerView;
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    updateSlider();
  }

  function nextSlide() {
    const slidesPerView = getSlidesPerView();
    const maxSlide = totalSlides - slidesPerView;
    if (currentSlide < maxSlide) {
      currentSlide++;
      updateSlider();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    }
  }

  // Event listeners
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Touch/swipe support
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diffX = startX - currentX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  });

  // Handle window resize
  let resizeTimeout;
  let lastSlidesPerView = getSlidesPerView();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newSlidesPerView = getSlidesPerView();
      if (lastSlidesPerView !== newSlidesPerView) {
        lastSlidesPerView = newSlidesPerView;
        const maxSlide = totalSlides - newSlidesPerView;
        currentSlide = Math.min(currentSlide, maxSlide);
        updateSlider();
      }
    }, 250);
  });

  // Auto-play (optional - uncomment if desired)
  // let autoPlayInterval = setInterval(nextSlide, 5000);
  // slider.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
  // slider.addEventListener('mouseleave', () => {
  //   autoPlayInterval = setInterval(nextSlide, 5000);
  // });

  // Initialize
  updateSlider();
}

// Initialize slider when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServicesSlider);
} else {
  initServicesSlider();
}

// Workshop Images Slider Functionality
function initWorkshopSlider(sliderSelector) {
  const slider = document.querySelector(sliderSelector);
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-nav.prev');
  const nextBtn = slider.querySelector('.slider-nav.next');
  const dotsContainer = slider.querySelector('.slider-dots');
  
  let currentSlide = 0;
  const totalSlides = slides.length;

  function getSlidesPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  // Create dots
  const totalViews = Math.ceil(totalSlides / getSlidesPerView());
  for (let i = 0; i < totalViews; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i * getSlidesPerView()));
    dotsContainer.appendChild(dot);
  }

  const dots = dotsContainer.querySelectorAll('.slider-dot');

  function updateSlider() {
    const slidesPerView = getSlidesPerView();
    const translateX = -(currentSlide * (100 / slidesPerView));
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    const currentView = Math.floor(currentSlide / slidesPerView);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentView);
    });

    // Update button states
    const maxSlide = totalSlides - slidesPerView;
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= maxSlide;
  }

  function goToSlide(index) {
    const slidesPerView = getSlidesPerView();
    const maxSlide = totalSlides - slidesPerView;
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    updateSlider();
  }

  function nextSlide() {
    const slidesPerView = getSlidesPerView();
    const maxSlide = totalSlides - slidesPerView;
    if (currentSlide < maxSlide) {
      currentSlide += slidesPerView;
      updateSlider();
    }
  }

  function prevSlide() {
    const slidesPerView = getSlidesPerView();
    if (currentSlide > 0) {
      currentSlide = Math.max(0, currentSlide - slidesPerView);
      updateSlider();
    }
  }

  // Event listeners
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Touch/swipe support
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diffX = startX - currentX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  });

  // Handle window resize
  let resizeTimeout;
  let lastSlidesPerView = getSlidesPerView();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newSlidesPerView = getSlidesPerView();
      if (lastSlidesPerView !== newSlidesPerView) {
        lastSlidesPerView = newSlidesPerView;
        const maxSlide = totalSlides - newSlidesPerView;
        currentSlide = Math.min(currentSlide, maxSlide);
        updateSlider();
      }
    }, 250);
  });

  // Initialize
  updateSlider();
}

// Initialize workshop sliders
function initAllWorkshopSliders() {
  initWorkshopSlider('.fourth .workshop-images-slider');
  initWorkshopSlider('.fifth .workshop-images-slider');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllWorkshopSliders);
} else {
  initAllWorkshopSliders();
}

// Working Days Data
const workingDaysData = {
  'Casting Denture': [
    { service: 'Framework', days: 6 },
    { service: 'Framework + Wax rim', days: 7 },
    { service: 'Framework + set teeth', days: 7 },
    { service: 'Framework + set teeth + finish', days: 7 },
    { service: 'Set teeth + Finish', days: 6 },
    { service: 'Acrylic process (finish)', days: 6 }
  ],
  'Fixed Restoration': [
    { service: 'CMC/CMB', days: 6 },
    { service: 'Full ceramic', days: 6 },
    { service: 'Implant', days: 8 }
  ],
  'Acrylic Denture': [
    { service: 'Set teeth', days: 6 },
    { service: 'Set teeth + finish', days: 6 },
    { service: 'Acrylic process (finish)', days: 6 }
  ],
  'Other': [
    { service: 'Tray', days: 5 },
    { service: 'Bite rim', days: 5 },
    { service: 'Tray + Bite rim', days: 6 },
    { service: 'Retainer', days: 6 }
  ]
};

// Working Days Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('workingDaysModal');
  const closeBtn = modal.querySelector('.modal-close');
  const categoryCards = document.querySelectorAll('.working-days-category');
  const servicesList = modal.querySelector('.modal-services-list');

  // Open modal when clicking on a category card
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      const services = workingDaysData[category];

      if (!services) return;

      // Populate modal title and category
      modal.querySelector('.modal-title').textContent = category;
      modal.querySelector('.modal-category').textContent = 'Service Details';

      // Clear and populate services list
      servicesList.innerHTML = '';
      services.forEach(item => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'modal-service-item';
        serviceItem.innerHTML = `
          <span class="modal-service-name">${item.service}</span>
          <span class="modal-service-days">${item.days} Days</span>
        `;
        servicesList.appendChild(serviceItem);
      });

      // Show modal
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal when clicking close button
  closeBtn.addEventListener('click', function() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // Close modal when clicking outside the modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // ESC key handler is handled globally below
});

// China Factory Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('chinaFactoryModal');
  if (!modal) return;
  
  const closeBtn = modal.querySelector('.modal-close');
  const slider = modal.querySelector('.factory-images-slider');
  
  // Initialize slider when modal opens
  let sliderInitialized = false;
  
  function initChinaFactorySlider() {
    if (!slider || sliderInitialized) return;
    
    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slide');
    const prevBtn = slider.querySelector('.slider-nav.prev');
    const nextBtn = slider.querySelector('.slider-nav.next');
    const dotsContainer = slider.querySelector('.slider-dots');
    
    if (!track || slides.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    // Create dots
    function createDots() {
      dotsContainer.innerHTML = '';
      const totalViews = Math.ceil(totalSlides / getSlidesPerView());
      for (let i = 0; i < totalViews; i++) {
        const dot = document.createElement('div');
        dot.className = 'slider-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i * getSlidesPerView()));
        dotsContainer.appendChild(dot);
      }
    }

    const dots = () => dotsContainer.querySelectorAll('.slider-dot');

    function updateSlider() {
      const slidesPerView = getSlidesPerView();
      const translateX = -(currentSlide * (100 / slidesPerView));
      track.style.transform = `translateX(${translateX}%)`;
      
      // Update dots
      const currentView = Math.floor(currentSlide / slidesPerView);
      dots().forEach((dot, index) => {
        dot.classList.toggle('active', index === currentView);
      });

      // Update button states
      const maxSlide = totalSlides - slidesPerView;
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide >= maxSlide;
    }

    function goToSlide(index) {
      const slidesPerView = getSlidesPerView();
      const maxSlide = totalSlides - slidesPerView;
      currentSlide = Math.max(0, Math.min(index, maxSlide));
      updateSlider();
    }

    function nextSlide() {
      const slidesPerView = getSlidesPerView();
      const maxSlide = totalSlides - slidesPerView;
      if (currentSlide < maxSlide) {
        currentSlide += slidesPerView;
        updateSlider();
      }
    }

    function prevSlide() {
      const slidesPerView = getSlidesPerView();
      if (currentSlide > 0) {
        currentSlide = Math.max(0, currentSlide - slidesPerView);
        updateSlider();
      }
    }

    // Create dots on initialization
    createDots();

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Touch/swipe support
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = startX - currentX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        createDots();
        const slidesPerView = getSlidesPerView();
        const maxSlide = totalSlides - slidesPerView;
        currentSlide = Math.min(currentSlide, maxSlide);
        updateSlider();
      }, 250);
    });

    // Initialize
    updateSlider();
    sliderInitialized = true;
  }

  // Initialize slider when modal opens
  slider.addEventListener('initSlider', initChinaFactorySlider);
  
  const modalObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (modal.classList.contains('show')) {
          setTimeout(() => {
            if (!sliderInitialized) {
              slider.dispatchEvent(new Event('initSlider'));
            }
          }, 100);
        }
      }
    });
  });
  modalObserver.observe(modal, { attributes: true });

  // Also try to initialize immediately if modal is already visible
  if (modal.classList.contains('show')) {
    setTimeout(() => {
      if (!sliderInitialized) {
        slider.dispatchEvent(new Event('initSlider'));
      }
    }, 100);
  }

  // Close modal when clicking close button
  closeBtn.addEventListener('click', function() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // Close modal when clicking outside the modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
});

// Shared ESC key handler for all modals
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const chinaFactoryModal = document.getElementById('chinaFactoryModal');
    const workingDaysModal = document.getElementById('workingDaysModal');
    
    if (chinaFactoryModal && chinaFactoryModal.classList.contains('show')) {
      chinaFactoryModal.classList.remove('show');
      document.body.style.overflow = '';
    }
    if (workingDaysModal && workingDaysModal.classList.contains('show')) {
      workingDaysModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
});

// Clients Auto-Scroll Animation
document.addEventListener('DOMContentLoaded', function() {
  const clientRows = document.querySelectorAll('.client-row');
  
  clientRows.forEach((row, index) => {
    const track = row.querySelector('.client-track');
    if (!track) return;
    
    const items = track.querySelectorAll('.client-item');
    if (items.length === 0) return;
    
    // Determine direction: even rows (0,2,4...) go left to right, odd rows (1,3,5...) go right to left
    const direction = index % 2 === 0 ? 'left' : 'right';
    
    // Calculate dimensions
    function getDimensions() {
      const firstItemWidth = items[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(track).gap) || 32;
      const itemWidth = firstItemWidth + gap;
      const totalItems = items.length / 2; // Since we duplicated items
      const totalWidth = totalItems * itemWidth;
      return { itemWidth, totalWidth, gap };
    }
    
    let { totalWidth } = getDimensions();
    let position = direction === 'left' ? 0 : -totalWidth;
    
    // Animation speed (pixels per frame at 60fps)
    const speed = 0.8;
    
    function animate() {
      if (direction === 'left') {
        position += speed;
        if (position >= totalWidth) {
          position = 0;
        }
      } else {
        position -= speed;
        if (position <= -totalWidth * 2) {
          position = -totalWidth;
        }
      }
      
      track.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(animate);
    }
    
    // Start animation after a small delay to ensure layout is ready
    setTimeout(() => {
      ({ totalWidth } = getDimensions());
      position = direction === 'left' ? 0 : -totalWidth;
      animate();
    }, 100);
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const dims = getDimensions();
        totalWidth = dims.totalWidth;
        
        // Reset position proportionally or just reset
        position = direction === 'left' ? 0 : -totalWidth;
      }, 250);
    });
  });
});
