/* navigation dropdowns */

document.querySelectorAll(".menu-toggle").forEach(button => {

    button.addEventListener("click", function(e){

        e.preventDefault();
        e.stopPropagation();

        const parent = this.closest(".submenu-item, .nav-item");

        const expanded = this.getAttribute("aria-expanded") === "true";


        parent.classList.toggle(
            "is-open",
            !expanded
        );


        this.setAttribute(
            "aria-expanded",
            String(!expanded)
        );

    });

});


/* desktop dropdown hover */

const dropdownParents = document.querySelectorAll('.nav-item.has-children');

const closeAllDropdowns = (exception = null) => {
  dropdownParents.forEach((item) => {
    if (item !== exception) {
      item.classList.remove('is-open');
    }
  });
};

dropdownParents.forEach((parent) => {

  const menu = parent.querySelector(':scope > .dropdown-menu');

  let closeTimer;


  const openMenu = () => {
    clearTimeout(closeTimer);
    closeAllDropdowns(parent);
    parent.classList.add('is-open');
  };


  const closeMenu = () => {

    clearTimeout(closeTimer);

    closeTimer = setTimeout(() => {
      parent.classList.remove('is-open');
    }, 180);

  };


  if(window.innerWidth > 760){

    parent.addEventListener('mouseenter', openMenu);

    parent.addEventListener('mouseleave', closeMenu);


    parent.addEventListener('focusin', openMenu);

    parent.addEventListener('focusout', (event) => {

      if (!parent.contains(event.relatedTarget)) {
        closeMenu();
      }

    });


    if(menu){

      menu.addEventListener('mouseenter', openMenu);

      menu.addEventListener('mouseleave', closeMenu);

    }

  }

});

/* active nav */
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === window.location.pathname) {
    link.classList.add('active');
    const parentItem = link.closest('.nav-item')?.parentElement?.closest('.nav-item');
    if (parentItem) parentItem.classList.add('has-active');
  }
});


/* mobile navigation */

const mobileToggle = document.querySelector(".mobile-menu-toggle");
const siteNav = document.querySelector(".site-nav");


if (mobileToggle && siteNav) {

  mobileToggle.addEventListener("click", () => {

    const isOpen = siteNav.classList.toggle("open");

    mobileToggle.classList.toggle("open", isOpen);

    mobileToggle.setAttribute(
      "aria-expanded",
      isOpen
    );

    mobileToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );

  });

}

/* contact form submission */
/* contact form */

const contactForm = document.querySelector('.contact-form');
const contactFormContent = document.querySelector('.contact-form-content');
const formSuccess = document.querySelector('.form-success');

if (contactForm && contactFormContent && formSuccess) {

  contactForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const submitButton = contactForm.querySelector('[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {

      const formData = new FormData(contactForm);

      await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString(),
      });

      contactFormContent.hidden = true;
      formSuccess.hidden = false;

    } catch (error) {

      console.error('Form submission error:', error);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
      }

      alert(
        'There was a problem sending your message. Please try again.'
      );

    }

  });

}

/* homepage hero slideshow */
const heroSlideshow = document.querySelector('.hero-slideshow');

if (heroSlideshow) {
  const slides = Array.from(heroSlideshow.querySelectorAll('.hero-slide'));
  const breadcrumbs = Array.from(document.querySelectorAll('.hero-breadcrumb'));
  const hero = heroSlideshow.closest('.hero');

  if (slides.length > 1 && breadcrumbs.length === slides.length) {
    let currentIndex = 0;
    let autoplayTimer = null;

    const showSlide = (index) => {
      currentIndex = index;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      breadcrumbs.forEach((breadcrumb, breadcrumbIndex) => {
        const isActive = breadcrumbIndex === currentIndex;
        breadcrumb.classList.toggle('active', isActive);
        breadcrumb.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    const startAutoplay = () => {
      window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(() => {
        showSlide((currentIndex + 1) % slides.length);
      }, 5000);
    };

    breadcrumbs.forEach((breadcrumb, index) => {
      breadcrumb.addEventListener('click', () => {
        showSlide(index);
        startAutoplay();
      });
    });

    hero?.addEventListener('mouseenter', () => window.clearInterval(autoplayTimer));
    hero?.addEventListener('mouseleave', startAutoplay);
    hero?.addEventListener('focusin', () => window.clearInterval(autoplayTimer));
    hero?.addEventListener('focusout', (event) => {
      if (!hero.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });

    showSlide(0);
    startAutoplay();
  }
}

/* recent projects slideshow */
const projectsSlideshow = document.querySelector('.projects-slideshow');

if (projectsSlideshow) {
  const track = projectsSlideshow.querySelector('.slideshow-track');
  const prevButton = projectsSlideshow.querySelector('.arrow-prev');
  const nextButton = projectsSlideshow.querySelector('.arrow-next');

  if (track && prevButton && nextButton) {
    const cards = Array.from(track.children);

    if (cards.length > 1) {
      let currentIndex = 0;
      const desktopQuery = window.matchMedia('(min-width: 901px)');

      const getMaxIndex = () => desktopQuery.matches
        ? Math.max(0, cards.length - 2)
        : cards.length - 1;

      const updatePosition = (withTransition = true) => {
        const card = cards[currentIndex];
        if (!card) return;

        const offset = card.offsetLeft;
        track.style.transition = withTransition ? 'transform 0.4s ease' : 'none';
        track.style.transform = `translateX(-${offset}px)`;
      };

      const updateControls = () => {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= getMaxIndex();
      };

      const viewport = projectsSlideshow.querySelector('.slideshow-viewport');
      let pointerStartX = 0;
      let pointerStartY = 0;
      let swipeMoved = false;

      const finishSwipe = (event) => {
        if (!viewport || event.pointerId !== undefined && !viewport.hasPointerCapture(event.pointerId)) {
          return;
        }

        viewport.releasePointerCapture?.(event.pointerId);

        const distanceX = event.clientX - pointerStartX;
        const distanceY = event.clientY - pointerStartY;
        const isHorizontalSwipe = Math.abs(distanceX) > 40 && Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontalSwipe) {
          if (distanceX < 0 && currentIndex < getMaxIndex()) {
            currentIndex += 1;
          } else if (distanceX > 0 && currentIndex > 0) {
            currentIndex -= 1;
          }

          updatePosition(true);
          updateControls();
          swipeMoved = true;
        }
      };

      viewport?.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.target.closest('button')) return;

        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        swipeMoved = false;
        viewport.setPointerCapture(event.pointerId);
      });

      viewport?.addEventListener('pointerup', finishSwipe);
      viewport?.addEventListener('pointercancel', finishSwipe);
      viewport?.addEventListener('click', (event) => {
        if (swipeMoved) {
          event.preventDefault();
          event.stopPropagation();
          swipeMoved = false;
        }
      }, true);

      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          updatePosition(true);
          updateControls();
        }
      });

      nextButton.addEventListener('click', () => {
        if (currentIndex < getMaxIndex()) {
          currentIndex += 1;
          updatePosition(true);
          updateControls();
        }
      });

      window.addEventListener('resize', () => {
        currentIndex = Math.min(currentIndex, getMaxIndex());
        updatePosition(false);
        updateControls();
      });
      updateControls();
      updatePosition(false);
    }
  }
}

/* project gallery lightbox */
const lightbox = document.querySelector('.lightbox');

if (lightbox) {
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const prevButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');
  const counter = lightbox.querySelector('.lightbox-counter');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

  if (galleryItems.length && lightboxImage && closeButton && prevButton && nextButton && counter) {
    let currentIndex = 0;

    const updateLightbox = (index) => {
      const item = galleryItems[index];
      if (!item) return;

      const image = item.querySelector('img');
      if (!image) return;

      currentIndex = index;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      counter.textContent = `${index + 1} / ${galleryItems.length}`;
    };

    const openLightbox = (index) => {
      updateLightbox(index);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    closeButton.addEventListener('click', closeLightbox);

    prevButton.addEventListener('click', () => {
      const nextIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightbox(nextIndex);
    });

    nextButton.addEventListener('click', () => {
      const nextIndex = (currentIndex + 1) % galleryItems.length;
      updateLightbox(nextIndex);
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('active')) return;

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        const nextIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightbox(nextIndex);
      }

      if (event.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % galleryItems.length;
        updateLightbox(nextIndex);
      }
    });
  }
}

/* project filters */
document.querySelectorAll('.project-tile img').forEach((image) => {
  image.addEventListener('error', () => {
    image.remove();
  });
});

document.querySelectorAll('.filter-bar').forEach((filterBar) => {
  const buttons = filterBar.querySelectorAll('.filter-btn');
  const projectsPage = filterBar.closest('.projects-page');

  if (!projectsPage) return;

  const grid = projectsPage.querySelector('.project-grid');
  const tiles = grid ? Array.from(grid.querySelectorAll('.project-tile')) : [];

  if (!tiles.length) return;

  const HEIGHT_TRANSITION_MS = 350;
  const SETTLE_MS = 380;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      const footer = document.querySelector('.site-footer');

      const startHeight = grid.getBoundingClientRect().height;

      projectsPage.classList.add('is-filtering');
      footer?.classList.add('is-filtering');

      buttons.forEach((btn) => {
        btn.classList.toggle('active', btn === button);
      });

      const visibleTiles = [];
      const hiddenTiles = [];

      tiles.forEach((tile) => {
        const matches = filter === 'all' || tile.dataset.category === filter;

        tile.classList.remove('is-visible', 'is-appearing');
        tile.classList.toggle('is-hidden', !matches);
        tile.classList.remove('is-removed');

        if (matches) {
          tile.style.display = '';
          visibleTiles.push(tile);
          tile.classList.add('is-appearing');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              tile.classList.add('is-visible');
            });
          });
        } else {
          hiddenTiles.push(tile);
        }
      });

      // Move matching cards to the front of the grid before the layout settles,
      // so filtered results start in the earliest available slots instead of
      // appearing in the last positions and then jumping upward.
      visibleTiles.concat(hiddenTiles).forEach((tile) => {
        grid.appendChild(tile);
      });

      // Measure the height the grid will settle at once non-matching tiles
      // are actually removed from flow, so we can animate to it directly
      // instead of letting the grid snap when display:none lands later.
      tiles.forEach((tile) => {
        if (tile.classList.contains('is-hidden')) {
          tile.style.display = 'none';
        }
      });
      const endHeight = grid.scrollHeight;
      tiles.forEach((tile) => {
        if (tile.classList.contains('is-hidden')) {
          tile.style.display = '';
        }
      });

      grid.style.height = `${startHeight}px`;
      grid.style.overflow = 'hidden';
      grid.style.transition = `height ${HEIGHT_TRANSITION_MS}ms ease`;

      requestAnimationFrame(() => {
        grid.style.height = `${endHeight}px`;
      });

      window.setTimeout(() => {
        tiles.forEach((tile) => {
          if (tile.classList.contains('is-hidden')) {
            tile.classList.add('is-removed');
            tile.style.display = 'none';
          }
        });

        grid.style.height = '';
        grid.style.overflow = '';
        grid.style.transition = '';
      }, HEIGHT_TRANSITION_MS);

      // Only fade the footer back in once the grid has actually finished
      // resizing, so it never becomes visible mid-jump.
      window.setTimeout(() => {
        projectsPage.classList.remove('is-filtering');
        footer?.classList.remove('is-filtering');
      }, SETTLE_MS);
    });
  });
});

/* testimonials slideshow */
const testimonialsSlideshow = document.querySelector('.testimonials-slideshow');

if (testimonialsSlideshow) {
  const track = testimonialsSlideshow.querySelector('.slideshow-track');
  const breadcrumbs = testimonialsSlideshow.querySelector('.slideshow-breadcrumbs');
  const slides = track ? Array.from(track.children) : [];

  if (track && breadcrumbs && slides.length > 1) {
    let currentIndex = 0;
    let autoplayTimer = null;

    const updatePosition = () => {
      const slide = slides[currentIndex];
      if (!slide) return;

      const offset = slide.offsetLeft;
      track.style.transition = 'transform 0.4s ease';
      track.style.transform = `translateX(-${offset}px)`;

      breadcrumbs.querySelectorAll('.breadcrumb').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    };

    const buildBreadcrumbs = () => {
      breadcrumbs.innerHTML = '';

      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'breadcrumb';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
        dot.addEventListener('click', () => {
          currentIndex = index;
          updatePosition();
          restartAutoplay();
        });
        breadcrumbs.appendChild(dot);
      });

      updatePosition();
    };

    const restartAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
      }

      autoplayTimer = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updatePosition();
      }, 5000);
    };

    const viewport = testimonialsSlideshow.querySelector('.slideshow-viewport');
    let pointerStartX = 0;
    let pointerStartY = 0;

    const finishSwipe = (event) => {
      if (!viewport || event.pointerId !== undefined && !viewport.hasPointerCapture(event.pointerId)) {
        return;
      }

      viewport.releasePointerCapture?.(event.pointerId);

      const distanceX = event.clientX - pointerStartX;
      const distanceY = event.clientY - pointerStartY;
      const isHorizontalSwipe = Math.abs(distanceX) > 40 && Math.abs(distanceX) > Math.abs(distanceY);

      if (isHorizontalSwipe) {
        if (distanceX < 0) {
          currentIndex = (currentIndex + 1) % slides.length;
        } else {
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        }

        updatePosition();
        restartAutoplay();
      }
    };

    viewport?.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      viewport.setPointerCapture(event.pointerId);
    });

    viewport?.addEventListener('pointerup', finishSwipe);
    viewport?.addEventListener('pointercancel', finishSwipe);

    buildBreadcrumbs();
    restartAutoplay();

    window.addEventListener('resize', updatePosition);
  }
}

/* related service projects slideshow */
document.querySelectorAll('.related-projects-carousel').forEach((carousel) => {
  const viewport = carousel.querySelector('.slideshow-viewport');
  const track = carousel.querySelector('.slideshow-track');
  const cards = track ? Array.from(track.children) : [];

  if (!viewport || !track || cards.length < 2) return;

  const mobileQuery = window.matchMedia('(max-width: 600px)');
  let currentIndex = 0;
  let autoplayTimer = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let swipeMoved = false;

  const updatePosition = (withTransition = true) => {
    if (!mobileQuery.matches) {
      track.style.transition = 'none';
      track.style.transform = 'none';
      return;
    }

    const card = cards[currentIndex];
    if (!card) return;

    track.style.transition = withTransition ? 'transform 0.4s ease' : 'none';
    track.style.transform = `translateX(-${card.offsetLeft}px)`;
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!mobileQuery.matches) return;

    autoplayTimer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % cards.length;
      updatePosition(true);
    }, 5000);
  };

  const finishSwipe = (event) => {
    if (!viewport.hasPointerCapture(event.pointerId)) return;

    viewport.releasePointerCapture?.(event.pointerId);

    const distanceX = event.clientX - pointerStartX;
    const distanceY = event.clientY - pointerStartY;
    const isHorizontalSwipe = mobileQuery.matches &&
      Math.abs(distanceX) > 40 &&
      Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      currentIndex = distanceX < 0
        ? (currentIndex + 1) % cards.length
        : (currentIndex - 1 + cards.length) % cards.length;
      updatePosition(true);
      startAutoplay();
      swipeMoved = true;
    }
  };

  viewport.addEventListener('pointerdown', (event) => {
    if (!mobileQuery.matches || event.pointerType === 'mouse' && event.button !== 0) return;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    swipeMoved = false;
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointerup', finishSwipe);
  viewport.addEventListener('pointercancel', finishSwipe);
  viewport.addEventListener('click', (event) => {
    if (swipeMoved) {
      event.preventDefault();
      event.stopPropagation();
      swipeMoved = false;
    }
  }, true);

  const syncMode = () => {
    if (!mobileQuery.matches) stopAutoplay();
    updatePosition(false);
    startAutoplay();
  };

  mobileQuery.addEventListener?.('change', syncMode);
  window.addEventListener('resize', () => updatePosition(false));
  syncMode();
});

/* faq accordion */
/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach((item) => {

  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer-wrapper');


  button.addEventListener('click', () => {

    const isOpen = item.classList.contains('active');


    if (isOpen) {

      // Close this FAQ
      answer.style.height = answer.scrollHeight + 'px';

      requestAnimationFrame(() => {
        answer.style.height = '0px';
      });

      item.classList.remove('active');

      button.setAttribute(
        'aria-expanded',
        'false'
      );


    } else {

      // Open this FAQ
      item.classList.add('active');

      button.setAttribute(
        'aria-expanded',
        'true'
      );

      answer.style.height = answer.scrollHeight + 'px';


      answer.addEventListener('transitionend', function handler() {

        if (item.classList.contains('active')) {
          answer.style.height = 'auto';
        }

        answer.removeEventListener(
          'transitionend',
          handler
        );

      });

    }

  });

});


/**
 * Scroll reveal: fades/slides in any element marked [data-reveal]
 * as it scrolls into view. Pairs with the [data-reveal] CSS rules
 * in styles.css. Runs once per element (unobserves after revealing),
 * so it won't re-trigger if the user scrolls back up and down again.
 */
(function () {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // No IntersectionObserver support or user prefers no motion:
  // just show everything immediately, no animation.
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '0px 0px 0px 0px',
    }
  );

  items.forEach((el) => observer.observe(el));
})();
