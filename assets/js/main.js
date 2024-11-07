// Get all sticker elements
const stickers = document.querySelectorAll("#sticker");

// Configuration for random movement
const config = {
  minRadius: 10, // Minimum movement radius
  maxRadius: 100, // Maximum movement radius
  minDuration: 2, // Minimum animation duration in seconds
  maxDuration: 5, // Maximum animation duration in seconds
  minInterval: 1000, // Minimum time between movements (ms)
  maxInterval: 3000, // Maximum time between movements (ms)
  maxRotation: 0, // Maximum rotation in degrees
  boundsMargin: 50, // Margin from viewport edges
};

// Store initial positions and states for each sticker
const stickerStates = new Map();

// Initialize sticker states
stickers.forEach((sticker) => {
  const rect = sticker.getBoundingClientRect();
  stickerStates.set(sticker, {
    initialX: rect.left,
    initialY: rect.top,
    currentX: 0,
    currentY: 0,
    rotation: 0,
    isDragging: false,
    interval: null,
  });
});

// Utility functions
const random = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Function to check if position is within viewport bounds
function isInBounds(x, y) {
  const margin = config.boundsMargin;
  return (
    x >= margin &&
    x <= window.innerWidth - margin &&
    y >= margin &&
    y <= window.innerHeight - margin
  );
}

// Generate new random position
function getNewPosition(sticker, state) {
  let attempts = 0;
  let newX, newY;

  // Try to find a valid position within bounds
  do {
    const radius = random(config.minRadius, config.maxRadius);
    const angle = random(0, Math.PI * 2);

    newX = state.initialX + radius * Math.cos(angle);
    newY = state.initialY + radius * Math.sin(angle);

    attempts++;
  } while (!isInBounds(newX, newY) && attempts < 10);

  return { x: newX - state.initialX, y: newY - state.initialY };
}

// Animate individual sticker
function animateSticker(sticker) {
  const state = stickerStates.get(sticker);

  if (!state.isDragging) {
    // Generate random movement parameters
    const newPos = getNewPosition(sticker, state);
    const duration = random(config.minDuration, config.maxDuration);
    const rotation = random(-config.maxRotation, config.maxRotation);

    // Apply smooth transition with random easing
    const easings = [
      "ease-in-out",
      "ease-out",
      "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    ];
    const randomEasing = easings[Math.floor(random(0, easings.length))];

    // Update state
    state.currentX = newPos.x;
    state.currentY = newPos.y;
    state.rotation = rotation;

    // Apply animation
    sticker.style.transition = `transform ${duration}s ${randomEasing}`;
    sticker.style.transform = `
            translate(${newPos.x}px, ${newPos.y}px)
            rotate(${rotation}deg)
            scale(${random(0.95, 1.05)})
        `;

    // Schedule next animation with random interval
    clearTimeout(state.interval);
    state.interval = setTimeout(() => {
      animateSticker(sticker);
    }, random(config.minInterval, config.maxInterval));
  }
}

// Start initial animations with slight delays
stickers.forEach((sticker, index) => {
  setTimeout(() => {
    animateSticker(sticker);
  }, index * 500); // Stagger the start of animations
});

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    stickers.forEach((sticker) => {
      const state = stickerStates.get(sticker);
      state.initialX = state.currentX;
      state.initialY = state.currentY;
    });
  }, 250);
});

//Company Logo Slider
document.addEventListener("DOMContentLoaded", function () {
  const mediaQuery = window.matchMedia("(min-width: 768px)");
  const slideTrack = document.querySelector(".logo-slide-track");

  // Function to handle responsive behavior
  function handleScreenChange(e) {
    if (e.matches) {
      // Desktop view
      slideTrack.style.transform = "none";
    } else {
      // Mobile view - reset transform if needed
      slideTrack.style.transform = "";
    }
  }

  // Initial check
  handleScreenChange(mediaQuery);

  // Listen for changes
  mediaQuery.addListener(handleScreenChange);
});

// Modal functionality
function createModal() {
  // Create modal HTML structure
  const modalHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <button class="modal-close">&times;</button>
        <div class="modal-content">
          <div class="modal-img-container">
            <img src="" alt="" class="modal-img">
            <div class="modal-img-loader" style="display: none;">Loading...</div>
          </div>
          </br>
          <h3 class="modal-title"></h3>
          <div class="modal-description"></div>
          <div class="modal-social-links"></div>
          <div class="modal-redirect-links"></div>
          <button class="modal-btn"></button>
          <div class="modal-custom-content"></div>
        </div>
      </div>
    </div>
  `;

  // Add modal to document
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Get modal elements
  const modalBackdrop = document.querySelector(".modal-backdrop");
  const modal = document.querySelector(".modal");
  const modalClose = document.querySelector(".modal-close");
  const modalImg = document.querySelector(".modal-img");
  const modalImgLoader = document.querySelector(".modal-img-loader");
  const modalTitle = document.querySelector(".modal-title");
  const modalDescription = document.querySelector(".modal-description");
  const modalSocialLinks = document.querySelector(".modal-social-links");
  const modalRedirectLinks = document.querySelector(".modal-redirect-links");
  const modalBtn = document.querySelector(".modal-btn");
  const modalCustomContent = document.querySelector(".modal-custom-content");

  // Function to preload image
  function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  // Function to open modal
  async function openModal(cardData) {
    // Show modal with loading state
    modalBackdrop.style.display = "block";
    modal.style.display = "block";
    document.body.classList.add("modal-open");

    // Handle image loading
    if (cardData.image) {
      modalImg.style.opacity = "0";
      modalImgLoader.style.display = "block";

      try {
        await preloadImage(cardData.image);
        modalImg.src = cardData.image;
        modalImg.style.display = "block";
        modalImg.style.opacity = "1";
        modalImgLoader.style.display = "none";
      } catch (error) {
        console.error(error);
        modalImg.style.display = "none";
        modalImgLoader.style.display = "none";
      }
    } else {
      modalImg.style.display = "none";
      modalImgLoader.style.display = "none";
    }

    // Set other modal content
    modalTitle.textContent = cardData.title || "";

    if (cardData.description) {
      modalDescription.innerHTML = cardData.description;
      modalDescription.style.display = "block";
    } else {
      modalDescription.style.display = "none";
    }

    // Add social media links
    modalSocialLinks.innerHTML = "";
    if (cardData.socialLinks) {
      cardData.socialLinks.forEach((link) => {
        const socialLink = document.createElement("a");
        socialLink.href = link.url;
        socialLink.target = "_blank";
        socialLink.rel = "noopener noreferrer";
        socialLink.innerHTML = `<i class="bx ${link.icon}"></i>`;
        modalSocialLinks.appendChild(socialLink);
      });
      modalSocialLinks.style.display = "flex";
    } else {
      modalSocialLinks.style.display = "none";
    }

    // Add redirect links
    modalRedirectLinks.innerHTML = "";
    if (cardData.redirectLinks && cardData.redirectLinks.length > 0) {
      cardData.redirectLinks.forEach((link) => {
        const redirectLink = document.createElement("a");
        redirectLink.href = link.url;
        redirectLink.className = "modal-redirect-link";
        redirectLink.innerHTML = `
          <span class="modal-redirect-text">${link.text}</span>
          <i class="bx bx-chevron-right"></i>
        `;
        modalRedirectLinks.appendChild(redirectLink);
      });
      modalRedirectLinks.style.display = "block";
    } else {
      modalRedirectLinks.style.display = "none";
    }

    if (cardData.button) {
      modalBtn.textContent = cardData.button;
      modalBtn.style.display = "block";
    } else {
      modalBtn.style.display = "none";
    }

    // Add custom HTML content
    if (cardData.customContent) {
      modalCustomContent.innerHTML = cardData.customContent;
      modalCustomContent.style.display = "block";
    } else {
      modalCustomContent.style.display = "none";
    }

    // Trigger reflow and add active classes
    modal.offsetHeight;
    modalBackdrop.classList.add("active");
    modal.classList.add("active");
  }

  // Function to close modal
  function closeModal() {
    modalBackdrop.classList.remove("active");
    modal.classList.remove("active");

    setTimeout(() => {
      modalBackdrop.style.display = "none";
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      // Reset image state
      modalImg.src = "";
      modalImg.style.opacity = "0";
    }, 300);
  }

  // Add click event listeners
  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Add escape key listener
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.style.display === "block") {
      closeModal();
    }
  });

  return { openModal, closeModal };
}

// Initialize modal
const { openModal } = createModal();

// Add click event listeners to thirdfold cards
document.querySelectorAll(".thirdfold__data").forEach((card) => {
  card.addEventListener("click", () => {
    const cardData = JSON.parse(card.dataset.modalContent);
    openModal(cardData);
  });
});

/*==================== SHOW MENU ====================*/
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId);

  // Validate that variables exist
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      // We add the show-menu class to the div tag with the nav__menu class
      nav.classList.toggle("show-menu");
    });
  }
};
showMenu("nav-toggle", "nav-menu");

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll(".nav__link");

function linkAction() {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.add("active-link");
    } else {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.remove("active-link");
    }
  });
}
window.addEventListener("scroll", scrollActive);

/*==================== CHANGE BACKGROUND HEADER ====================*/
function scrollHeader() {
  const nav = document.getElementById("header");
  // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
  if (this.scrollY >= 200) nav.classList.add("scroll-header");
  else nav.classList.remove("scroll-header");
}
window.addEventListener("scroll", scrollHeader);

/*==================== SHOW SCROLL TOP ====================*/
function scrollTop() {
  const scrollTop = document.getElementById("scroll-top");
  // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
  if (this.scrollY >= 560) scrollTop.classList.add("show-scroll");
  else scrollTop.classList.remove("show-scroll");
}
window.addEventListener("scroll", scrollTop);

/*==================== SCROLL REVEAL ANIMATION ====================*/
// const sr = ScrollReveal({
//   distance: "30px",
//   duration: 1800,
//   reset: true,
// });

// sr.reveal(
//   `.firstfold__data, .firstfold__img,
//            .thirdfold__data,
//            .fourthfold__content,
//            .footer__content`,
//   {
//     origin: "top",
//     interval: 200,
//   }
// );

// sr.reveal(`.secondfold__img, .home__img, .fifthfold__content`, {
//   origin: "left",
// });

// sr.reveal(`.secondfold__data, home__data, .fifthfold__img`, {
//   origin: "right",
// });
