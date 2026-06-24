const IMAGES = [
  { src: "./assets/img/1.jpg.png", title: "Alaska-810433_1280" },
  { src: "./assets/img/2.jpg.png", title: "Night-City-Preview" },
  { src: "./assets/img/3.png.png", title: "Storm-Clouds-Formation" },
  { src: "./assets/img/4.jpg.png", title: "Blue-Tit-On-Branch" },
  { src: "./assets/img/5.jpg.png", title: "Hurricane-From-Orbit" },
  { src: "./assets/img/6.jpg.png", title: "Frozen-Lake-Valley" },
  { src: "./assets/img/7.jpg.png", title: "Solitary-Figure-At-Night" },
  { src: "./assets/img/8.jpg.png", title: "Snow-Bunting-On-Rock" },
  { src: "./assets/img/9.jpg.png", title: "Snow-Leopard-Cub" },
  { src: "./assets/img/10.jpg.png", title: "Golden-Mountain-Light" },
  { src: "./assets/img/11.jpg.png", title: "Winter-Tree-Field" },
  { src: "./assets/img/12.jpg.png", title: "Waterfowl-On-Lake" }
];

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxLike = document.getElementById("lightbox-like");
const closeButton = document.getElementById("close-lightbox");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

let currentIndex = 0;
let lastFocusedElement = null;
const memoryStore = new Map();

function getLikeKey(index) {
  return `fotogram_liked_${index}`;
}

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

function isLiked(index) {
  return safeGet(getLikeKey(index)) === "true";
}

function toggleLike(index) {
  const key = getLikeKey(index);
  safeSet(key, String(!isLiked(index)));
}

function getLikeIconSvg(liked) {
  const fill = liked ? "#FD5B4F" : "none";
  const stroke = liked ? "#FD5B4F" : "currentColor";
  return `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  `;
}

function createGalleryItem(image, index) {
  const liked = isLiked(index);
  return `
    <div class="gallery-card" data-index="${index}" role="button" tabindex="0" aria-label="Open ${image.title}">
      <img
        class="gallery-card__image"
        src="${image.src}"
        alt="${image.title}"
        width="150"
        height="150"
        loading="lazy"
        decoding="async"
      >
      <button
        class="like-button ${liked ? "is-liked" : ""}"
        type="button"
        aria-label="${liked ? "Unlike photo" : "Like photo"}"
        data-index="${index}"
      >
        ${getLikeIconSvg(liked)}
      </button>
    </div>
  `;
}

function renderGallery() {
  gallery.innerHTML = IMAGES.map(createGalleryItem).join("");
  setupGalleryListeners();
}

function setupGalleryListeners() {
  gallery.querySelectorAll(".gallery-card").forEach((card) => {
    card.addEventListener("click", (event) => handleCardClick(event, card));
    card.addEventListener("keydown", (event) => handleCardKey(event, card));
  });
}

function handleCardClick(event, card) {
  const index = Number(card.dataset.index);
  const likeBtn = event.target.closest(".like-button");

  if (likeBtn) {
    event.stopPropagation();
    handleLikeToggle(index, likeBtn);
    return;
  }

  openLightbox(index);
}

function handleCardKey(event, card) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openLightbox(Number(card.dataset.index));
  }
}

function handleLikeToggle(index, triggerButton = null) {
  toggleLike(index);
  const liked = isLiked(index);

  if (triggerButton) {
    updateButtonState(triggerButton, liked);
  }

  const galleryLikeButton = gallery.querySelector(`.like-button[data-index="${index}"]`);
  if (galleryLikeButton && galleryLikeButton !== triggerButton) {
    updateButtonState(galleryLikeButton, liked);
  }

  if (lightbox.open) {
    updateLightboxLikeButton();
  }
}

function updateButtonState(button, liked) {
  button.innerHTML = getLikeIconSvg(liked);
  button.classList.toggle("is-liked", liked);
  button.setAttribute("aria-label", liked ? "Unlike photo" : "Like photo");
}

function updateLightboxLikeButton() {
  updateButtonState(lightboxLike, isLiked(currentIndex));
}

function updateLightbox() {
  const image = IMAGES[currentIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.title;
  lightboxTitle.textContent = image.title;
  lightboxCounter.textContent = `${currentIndex + 1}/${IMAGES.length}`;
  updateLightboxLikeButton();
}

function openLightbox(index) {
  currentIndex = index;
  lastFocusedElement = document.activeElement;
  updateLightbox();
  lightbox.showModal();
  document.body.classList.add("is-locked");
  closeButton.focus();
}

function closeLightbox() {
  if (!lightbox.open) return;
  lightbox.close();
  document.body.classList.remove("is-locked");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function showPrevious() {
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = IMAGES.length - 1;
  }
  updateLightbox();
}

function showNext() {
  if (currentIndex < IMAGES.length - 1) {
    currentIndex++;
  } else {
    currentIndex = 0;
  }
  updateLightbox();
}

function handleDialogKeys(event) {
  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    showPrevious();
  }

  if (event.key === "ArrowRight") {
    showNext();
  }
}

function init() {
  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);
  lightboxLike.addEventListener("click", () => handleLikeToggle(currentIndex));

  prevButton.addEventListener("mousedown", (e) => e.preventDefault());
  nextButton.addEventListener("mousedown", (e) => e.preventDefault());
  lightboxImage.addEventListener("mousedown", (e) => e.preventDefault());

  lightbox.addEventListener("keydown", handleDialogKeys);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  renderGallery();
}
