const IMAGES = [
  { src: "./img/1.jpg.png", title: "Alaska-810433_1280" },
  { src: "./img/2.jpg.png", title: "Night-City-Preview" },
  { src: "./img/3.png.png", title: "Storm-Clouds-Formation" },
  { src: "./img/4.jpg.png", title: "Blue-Tit-On-Branch" },
  { src: "./img/5.jpg.png", title: "Hurricane-From-Orbit" },
  { src: "./img/6.jpg.png", title: "Frozen-Lake-Valley" },
  { src: "./img/7.jpg.png", title: "Solitary-Figure-At-Night" },
  { src: "./img/8.jpg.png", title: "Snow-Bunting-On-Rock" },
  { src: "./img/9.jpg.png", title: "Snow-Leopard-Cub" },
  { src: "./img/10.jpg.png", title: "Golden-Mountain-Light" },
  { src: "./img/11.jpg.png", title: "Winter-Tree-Field" },
  { src: "./img/12.jpg.png", title: "Waterfowl-On-Lake" }
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

/**
 * Get storage key for liked state.
 */
function getLikeKey(index) {
  return `fotogram_liked_${index}`;
}

/**
 * Check if image is liked.
 */
function isLiked(index) {
  return localStorage.getItem(getLikeKey(index)) === "true";
}

/**
 * Toggle liked state for image.
 */
function toggleLike(index) {
  const key = getLikeKey(index);
  const current = isLiked(index);
  localStorage.setItem(key, !current);
}

/**
 * Render SVG heart icon string based on liked state.
 */
function getLikeIconSvg(liked) {
  const fill = liked ? "#ff6b57" : "none";
  const stroke = liked ? "#ff6b57" : "currentColor";
  return `
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="${stroke}" stroke-width="2" fill="${fill}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  `;
}

/**
 * Create gallery item template string.
 */
function createGalleryItem(image, index) {
  const liked = isLiked(index);
  const heartSvg = getLikeIconSvg(liked);
  const activeClass = liked ? "is-liked" : "";
  return `
    <div class="gallery-card" data-index="${index}" role="button" tabindex="0" aria-label="Open ${image.title}">
      <img class="gallery-card__image" src="${image.src}" alt="${image.title}" width="220" height="220" loading="lazy" decoding="async">
      <button class="like-button ${activeClass}" type="button" aria-label="Like photo" data-index="${index}">${heartSvg}</button>
    </div>
  `;
}

/**
 * Render all gallery cards.
 */
function renderGallery() {
  const html = IMAGES.map(createGalleryItem).join("");
  gallery.innerHTML = html;
  setupGalleryListeners();
}

/**
 * Bind event listeners to gallery items.
 */
function setupGalleryListeners() {
  gallery.querySelectorAll(".gallery-card").forEach((card) => {
    card.addEventListener("click", (e) => handleCardClick(e, card));
    card.addEventListener("keydown", (e) => handleCardKey(e, card));
  });
}

/**
 * Handle click on a gallery card or its like button.
 */
function handleCardClick(event, card) {
  const index = Number(card.dataset.index);
  const likeBtn = event.target.closest(".like-button");
  if (likeBtn) {
    event.stopPropagation();
    handleLikeToggle(index);
  } else {
    openLightbox(index);
  }
}

/**
 * Handle keyboard activation for gallery card.
 */
function handleCardKey(event, card) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openLightbox(Number(card.dataset.index));
  }
}

/**
 * Toggle like state and update UI.
 */
function handleLikeToggle(index) {
  toggleLike(index);
  renderGallery();
  if (lightbox.open) {
    updateLightboxLikeButton();
  }
}

/**
 * Refresh like button inside the lightbox.
 */
function updateLightboxLikeButton() {
  const liked = isLiked(currentIndex);
  lightboxLike.innerHTML = getLikeIconSvg(liked);
  lightboxLike.classList.toggle("is-liked", liked);
}

/**
 * Update lightbox details.
 */
function updateLightbox() {
  const image = IMAGES[currentIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.title;
  lightboxTitle.textContent = image.title;
  lightboxCounter.textContent = `${currentIndex + 1}/${IMAGES.length}`;
  updateLightboxLikeButton();
}

/**
 * Open lightbox modal.
 */
function openLightbox(index) {
  currentIndex = index;
  lastFocusedElement = document.activeElement;
  updateLightbox();
  lightbox.showModal();
  document.body.classList.add("is-locked");
  closeButton.focus();
}

/**
 * Close lightbox modal.
 */
function closeLightbox() {
  lightbox.close();
  document.body.classList.remove("is-locked");
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

/**
 * Show previous image in lightbox.
 */
function showPrevious() {
  currentIndex = (currentIndex - 1 + IMAGES.length) % IMAGES.length;
  updateLightbox();
}

/**
 * Show next image in lightbox.
 */
function showNext() {
  currentIndex = (currentIndex + 1) % IMAGES.length;
  updateLightbox();
}

/**
 * Handle key events in the lightbox dialog.
 */
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

/**
 * Initialize listeners and render gallery.
 */
function init() {
  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);
  lightboxLike.addEventListener("click", () => handleLikeToggle(currentIndex));
  lightbox.addEventListener("keydown", handleDialogKeys);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  renderGallery();
}

init();
