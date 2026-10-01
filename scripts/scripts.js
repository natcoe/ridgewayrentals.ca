/* navigation dropdowns */

document.querySelectorAll(".menu-toggle").forEach(button => {

  button.addEventListener("click", function(e) {

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

  if (window.innerWidth > 760) {

    parent.addEventListener('mouseenter', openMenu);

    parent.addEventListener('mouseleave', closeMenu);

    parent.addEventListener('focusin', openMenu);

    parent.addEventListener('focusout', (event) => {

      if (!parent.contains(event.relatedTarget)) {
        closeMenu();
      }

    });

    if (menu) {

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

    if (parentItem) {
      parentItem.classList.add('has-active');
    }
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


/* FAQ question form submission */

document.querySelectorAll('.faq-question-form').forEach(form => {

  const successMessage = form.parentElement.querySelector('.faq-form-success');

  if (!successMessage) return;

  form.addEventListener('submit', async (event) => {

    event.preventDefault();

    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {

      const formData = new FormData(form);

      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error(`Form submission failed: ${response.status}`);
      }

      // Hide the form
      form.classList.add('is-submitted');

      // Show the success message
      successMessage.hidden = false;

    } catch (error) {

      console.error('Form submission error:', error);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Question';
      }

      alert(
        'There was a problem sending your question. Please try again.'
      );

    }

  });

});


/* booking request modal */

const bookingForm = document.querySelector('.booking-form');
const bookingModal = document.querySelector('#booking-modal');

if (bookingForm && bookingModal) {

  const dropOffInput = bookingForm.querySelector('[name="drop-off-date"]');
  const pickUpInput = bookingForm.querySelector('[name="pick-up-date"]');

  const modalForm = bookingModal.querySelector('.booking-modal-form');
  const modalDropOffInput = bookingModal.querySelector('[data-booking-drop-off]');
  const modalPickUpInput = bookingModal.querySelector('[data-booking-pick-up]');

  const modalSuccessMessage = bookingModal.querySelector('.booking-form-success');
  const modalDateAlert = modalForm?.querySelector('.booking-form-alert');

  /*
   * Find the existing modal heading elements.
   * These do not require any HTML changes.
   */
  const modalSubtitle = bookingModal.querySelector('.contact-form-content .sub-title');
  const modalTitle = bookingModal.querySelector('#booking-modal-title');
  const modalIntro = bookingModal.querySelector('.booking-form-intro');

  const closeButtons = bookingModal.querySelectorAll('[data-booking-modal-close]');

  let lastFocusedElement;

  let dropOffPicker;
  let pickUpPicker;
  let modalDropOffPicker;
  let modalPickUpPicker;

  const clearBookingDateErrorState = (
    currentDropOffInput,
    currentPickUpInput,
    currentDropOffPicker,
    currentPickUpPicker,
    currentAlert
  ) => {

    const dropOffVisibleInput =
      currentDropOffPicker?.altInput || currentDropOffInput;

    const pickUpVisibleInput =
      currentPickUpPicker?.altInput || currentPickUpInput;

    dropOffVisibleInput?.removeAttribute('aria-invalid');
    pickUpVisibleInput?.removeAttribute('aria-invalid');

    if (currentDropOffInput) {
      currentDropOffInput.setCustomValidity('');
    }

    if (currentPickUpInput) {
      currentPickUpInput.setCustomValidity('');
    }

    if (currentAlert) {
      currentAlert.hidden = true;
      currentAlert.textContent = '';
    }

  };

  const getBookingDateError = (
    currentDropOffInput,
    currentPickUpInput,
    currentDropOffPicker,
    currentPickUpPicker,
    currentAlert
  ) => {

    clearBookingDateErrorState(
      currentDropOffInput,
      currentPickUpInput,
      currentDropOffPicker,
      currentPickUpPicker,
      currentAlert
    );

    if (!currentDropOffInput?.value) {
      return {
        input: currentDropOffInput,
        picker: currentDropOffPicker,
        message: 'Please select a drop off date.'
      };
    }

    if (!currentPickUpInput?.value) {
      return {
        input: currentPickUpInput,
        picker: currentPickUpPicker,
        message: 'Please select a pick up date.'
      };
    }

    if (currentPickUpInput.value < currentDropOffInput.value) {
      return {
        input: currentPickUpInput,
        picker: currentPickUpPicker,
        message: 'Pick up date must be on or after the drop off date.'
      };
    }

    return null;

  };

  const showBookingDateError = (dateError, currentAlert) => {

    if (!dateError?.input) {
      return;
    }

    dateError.input.setCustomValidity(dateError.message);

    const visibleInput =
      dateError.picker?.altInput || dateError.input;

    visibleInput?.setAttribute('aria-invalid', 'true');
    visibleInput?.focus();

    dateError.picker?.open?.();

    if (currentAlert) {
      currentAlert.hidden = false;
      currentAlert.textContent = dateError.message;
    }

  };

  const validateRequiredBookingDates = (
    currentDropOffInput,
    currentPickUpInput,
    currentDropOffPicker,
    currentPickUpPicker,
    currentAlert
  ) => {

    const dateError = getBookingDateError(
      currentDropOffInput,
      currentPickUpInput,
      currentDropOffPicker,
      currentPickUpPicker,
      currentAlert
    );

    if (dateError) {
      showBookingDateError(dateError, currentAlert);
      return false;
    }

    return true;

  };


  /* booking date pickers */

  if (window.flatpickr) {

    const fpConfig = {
      minDate: 'today',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j, Y',
      altInputClass: 'flatpickr-alt-input',
      disableMobile: true,
      monthSelectorType: 'static',

      onReady: (selectedDates, dateStr, instance) => {
        if (instance.altInput) {
          instance.altInput.placeholder =
            instance.input.placeholder || 'yyyy/mm/dd';
        }
      }
    };


    /* main booking form dates */

    dropOffPicker = flatpickr(dropOffInput, {

      ...fpConfig,

      onChange: (selectedDates, dateStr) => {

        if (modalDropOffPicker) {
          modalDropOffPicker.setDate(dateStr, false);
        }

        if (pickUpPicker) {
          pickUpPicker.set('minDate', dateStr || 'today');
        }

        if (modalPickUpPicker) {
          modalPickUpPicker.set('minDate', dateStr || 'today');
        }

      }

    });


    pickUpPicker = flatpickr(pickUpInput, {

      ...fpConfig,

      onChange: (selectedDates, dateStr) => {

        if (modalPickUpPicker) {
          modalPickUpPicker.setDate(dateStr, false);
        }

      }

    });


    /* modal dates */

    modalDropOffPicker = flatpickr(modalDropOffInput, {

      ...fpConfig,

      onChange: (selectedDates, dateStr) => {

        if (dropOffPicker) {
          dropOffPicker.setDate(dateStr, false);
        }

        if (modalPickUpPicker) {
          modalPickUpPicker.set(
            'minDate',
            dateStr || 'today'
          );
        }

        if (pickUpPicker) {
          pickUpPicker.set(
            'minDate',
            dateStr || 'today'
          );
        }

      }

    });


    modalPickUpPicker = flatpickr(modalPickUpInput, {

      ...fpConfig,

      onChange: (selectedDates, dateStr) => {

        if (pickUpPicker) {
          pickUpPicker.setDate(dateStr, false);
        }

      }

    });

  }


  /* open booking modal */

  const openBookingModal = () => {

    lastFocusedElement = document.activeElement;


    if (modalDropOffPicker && dropOffInput.value) {

      modalDropOffPicker.setDate(
        dropOffInput.value,
        false
      );

    } else {

      modalDropOffInput.value = dropOffInput.value;

    }


    if (modalPickUpPicker && pickUpInput.value) {

      modalPickUpPicker.setDate(
        pickUpInput.value,
        false
      );

    } else {

      modalPickUpInput.value = pickUpInput.value;

    }


    clearBookingDateErrorState(
      modalDropOffInput,
      modalPickUpInput,
      modalDropOffPicker,
      modalPickUpPicker,
      modalDateAlert
    );

    bookingModal.hidden = false;

    document.body.classList.add('modal-open');


    bookingModal
      .querySelector('.booking-modal-form input[name="name"]')
      ?.focus();

  };


  /* close booking modal */

  const closeBookingModal = () => {

    clearBookingDateErrorState(
      modalDropOffInput,
      modalPickUpInput,
      modalDropOffPicker,
      modalPickUpPicker,
      modalDateAlert
    );

    bookingModal.hidden = true;

    document.body.classList.remove('modal-open');

    lastFocusedElement?.focus();

  };


  /* validate modal dates */

  const validateModalDates = () => {

    clearBookingDateErrorState(
      modalDropOffInput,
      modalPickUpInput,
      modalDropOffPicker,
      modalPickUpPicker,
      modalDateAlert
    );

  };


  /* initial booking form */

  bookingForm.addEventListener('submit', event => {

    event.preventDefault();

    openBookingModal();

  });


  /* submit booking modal form */

  if (modalForm) {

    modalForm.addEventListener('submit', async (event) => {

      event.preventDefault();


      /* Validate dates */

      validateModalDates();

      if (
        !validateRequiredBookingDates(
          modalDropOffInput,
          modalPickUpInput,
          modalDropOffPicker,
          modalPickUpPicker,
          modalDateAlert
        )
      ) {
        return;
      }


      /* Validate all required fields */

      if (!modalForm.reportValidity()) {
        return;
      }


      const submitButton =
        modalForm.querySelector('[type="submit"]');


      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent = 'Sending...';

      }


      try {

        const formData = new FormData(modalForm);


        const response = await fetch('/', {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
          },

          body: new URLSearchParams(formData).toString(),

        });


        if (!response.ok) {

          throw new Error(
            `Form submission failed: ${response.status}`
          );

        }


        /*
         * Successfully submitted to Netlify.
         *
         * Hide the form and the existing
         * "Request a trailer" / "Tell us where
         * to reach you" heading.
         */

        modalForm.hidden = true;


        if (modalSubtitle) {
          modalSubtitle.hidden = true;
        }


        if (modalTitle) {
          modalTitle.hidden = true;
        }

        if (modalIntro) {
          modalIntro.hidden = true;
        }


        /*
         * Show our own confirmation message.
         */

        if (modalSuccessMessage) {
          modalSuccessMessage.hidden = false;
          modalSuccessMessage.focus();
        }


      } catch (error) {

        console.error(
          'Booking form submission error:',
          error
        );


        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent = 'Send request';

        }


        alert(
          'There was a problem sending your booking request. Please try again.'
        );

      }

    });

  }


  /* modal controls */

  closeButtons.forEach(button => {
    button.addEventListener('click', closeBookingModal);
  });


  modalDropOffInput.addEventListener(
    'input',
    validateModalDates
  );

  modalPickUpInput.addEventListener(
    'input',
    validateModalDates
  );

  dropOffInput?.addEventListener(
    'input',
    () => clearBookingDateErrorState(
      dropOffInput,
      pickUpInput,
      dropOffPicker,
        pickUpPicker,
        null
    )
  );

  pickUpInput?.addEventListener(
    'input',
    () => clearBookingDateErrorState(
      dropOffInput,
      pickUpInput,
      dropOffPicker,
        pickUpPicker,
        null
    )
  );


  /* escape key */

  document.addEventListener('keydown', event => {

    if (
      event.key === 'Escape' &&
      !bookingModal.hidden
    ) {

      closeBookingModal();

    }

  });

}


/* standalone booking page */

const bookingPageForm = document.querySelector('.booking-page-form');

if (bookingPageForm && !bookingForm) {

  const pageDropOffInput =
    bookingPageForm.querySelector('[name="drop-off-date"]');

  const pagePickUpInput =
    bookingPageForm.querySelector('[name="pick-up-date"]');

  const pageContent =
    bookingPageForm.closest('.contact-form-content') ||
    bookingPageForm.parentElement;

  const pageSuccessMessage =
    pageContent?.querySelector('.booking-form-success');
  const pageDateAlert =
    bookingPageForm.querySelector('.booking-form-alert');

  const pageSubtitle =
    pageContent?.querySelector('.sub-title');

  const pageTitle =
    pageContent?.querySelector('#booking-modal-title');

  const pageIntro =
    pageContent?.querySelector('.booking-form-intro');

  let pageDropOffPicker;
  let pagePickUpPicker;

  const clearBookingPageDateErrorState = () => {

    const dropOffVisibleInput =
      pageDropOffPicker?.altInput || pageDropOffInput;

    const pickUpVisibleInput =
      pagePickUpPicker?.altInput || pagePickUpInput;

    dropOffVisibleInput?.removeAttribute('aria-invalid');
    pickUpVisibleInput?.removeAttribute('aria-invalid');

    pageDropOffInput?.setCustomValidity('');
    pagePickUpInput?.setCustomValidity('');

    if (pageDateAlert) {
      pageDateAlert.hidden = true;
      pageDateAlert.textContent = '';
    }

  };

  const getBookingPageDateError = () => {

    clearBookingPageDateErrorState();

    if (!pageDropOffInput?.value) {
      return {
        input: pageDropOffInput,
        picker: pageDropOffPicker,
        message: 'Please select a drop off date.'
      };
    }

    if (!pagePickUpInput?.value) {
      return {
        input: pagePickUpInput,
        picker: pagePickUpPicker,
        message: 'Please select a pick up date.'
      };
    }

    if (pagePickUpInput.value < pageDropOffInput.value) {
      return {
        input: pagePickUpInput,
        picker: pagePickUpPicker,
        message: 'Pick up date must be on or after the drop off date.'
      };
    }

    return null;

  };

  const showBookingPageDateError = (dateError) => {

    if (!dateError?.input) {
      return;
    }

    dateError.input.setCustomValidity(dateError.message);

    const visibleInput =
      dateError.picker?.altInput || dateError.input;

    visibleInput?.setAttribute('aria-invalid', 'true');
    visibleInput?.focus();

    dateError.picker?.open?.();

    if (pageDateAlert) {
      pageDateAlert.hidden = false;
      pageDateAlert.textContent = dateError.message;
    }

  };

  const validateRequiredPageDates = () => {

    const dateError = getBookingPageDateError();

    if (dateError) {
      showBookingPageDateError(dateError);
      return false;
    }

    return true;

  };


  /* standalone booking page date pickers */

  if (
    window.flatpickr &&
    pageDropOffInput &&
    pagePickUpInput
  ) {

    const pagePickerConfig = {

      minDate: 'today',

      dateFormat: 'Y-m-d',

      altInput: true,

      altFormat: 'M j, Y',

      altInputClass: 'flatpickr-alt-input',

      disableMobile: true,

      monthSelectorType: 'static',

      onReady: (selectedDates, dateStr, instance) => {

        if (instance.altInput) {

          instance.altInput.placeholder =
            instance.input.placeholder || 'yyyy/mm/dd';

        }

      }

    };


    pagePickUpPicker =
      flatpickr(
        pagePickUpInput,
        pagePickerConfig
      );


    pageDropOffPicker = flatpickr(
      pageDropOffInput,
      {

        ...pagePickerConfig,

        onChange: (selectedDates, dateStr) => {

          pagePickUpPicker.set(
            'minDate',
            dateStr || 'today'
          );


          if (
            pagePickUpInput.value &&
            pagePickUpInput.value < dateStr
          ) {

            pagePickUpPicker.clear();

          }

        }

      }
    );

  }


  /* validate standalone booking dates */

  const validatePageDates = () => {

    return validateRequiredPageDates();

  };


  /* standalone booking page form submission */

  bookingPageForm.addEventListener(
    'submit',
    async (event) => {

      event.preventDefault();


      /* Validate dates */

      if (!validatePageDates()) {
        return;
      }


      /* Validate the complete form */

      if (!bookingPageForm.reportValidity()) {
        return;
      }


      const submitButton =
        bookingPageForm.querySelector(
          '[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          'Sending...';

      }


      try {

        const formData =
          new FormData(bookingPageForm);


        const response =
          await fetch('/', {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded',
            },

            body:
              new URLSearchParams(
                formData
              ).toString(),

          });


        if (!response.ok) {

          throw new Error(
            `Form submission failed: ${response.status}`
          );

        }


        /*
         * Successfully submitted to Netlify.
         *
         * Hide the form and heading,
         * then show the custom success message.
         */

        bookingPageForm.hidden = true;


        if (pageSubtitle) {

          pageSubtitle.hidden = true;

        }


        if (pageTitle) {

          pageTitle.hidden = true;

        }


        if (pageIntro) {

          pageIntro.hidden = true;

        }


        if (pageSuccessMessage) {

          pageSuccessMessage.hidden = false;

          pageSuccessMessage.focus();

        }


      } catch (error) {

        console.error(
          'Booking page form submission error:',
          error
        );


        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            'Send request';

        }


        alert(
          'There was a problem sending your booking request. Please try again.'
        );

      }

    }
  );

}


/* recent projects slideshow */

const projectsSlideshow =
  document.querySelector('.projects-slideshow');

if (projectsSlideshow) {

  const track =
    projectsSlideshow.querySelector('.slideshow-track');

  const prevButton =
    projectsSlideshow.querySelector('.arrow-prev');

  const nextButton =
    projectsSlideshow.querySelector('.arrow-next');


  if (track && prevButton && nextButton) {

    const cards =
      Array.from(track.children);


    if (cards.length > 1) {

      let currentIndex = 0;

      const desktopQuery =
        window.matchMedia('(min-width: 901px)');


      const getMaxIndex = () =>
        desktopQuery.matches
          ? Math.max(0, cards.length - 2)
          : cards.length - 1;


      const updatePosition =
        (withTransition = true) => {

          const card = cards[currentIndex];

          if (!card) return;

          const offset = card.offsetLeft;

          track.style.transition =
            withTransition
              ? 'transform 0.4s ease'
              : 'none';

          track.style.transform =
            `translateX(-${offset}px)`;

        };


      const updateControls = () => {

        prevButton.disabled =
          currentIndex === 0;

        nextButton.disabled =
          currentIndex >= getMaxIndex();

      };


      const viewport =
        projectsSlideshow.querySelector(
          '.slideshow-viewport'
        );


      let pointerStartX = 0;
      let pointerStartY = 0;
      let swipeMoved = false;


      const finishSwipe = (event) => {

        if (
          !viewport ||
          event.pointerId !== undefined &&
          !viewport.hasPointerCapture(event.pointerId)
        ) {

          return;

        }


        viewport.releasePointerCapture?.(
          event.pointerId
        );


        const distanceX =
          event.clientX - pointerStartX;

        const distanceY =
          event.clientY - pointerStartY;


        const isHorizontalSwipe =
          Math.abs(distanceX) > 40 &&
          Math.abs(distanceX) >
            Math.abs(distanceY);


        if (isHorizontalSwipe) {

          if (
            distanceX < 0 &&
            currentIndex < getMaxIndex()
          ) {

            currentIndex += 1;

          } else if (
            distanceX > 0 &&
            currentIndex > 0
          ) {

            currentIndex -= 1;

          }


          updatePosition(true);

          updateControls();

          swipeMoved = true;

        }

      };


      viewport?.addEventListener(
        'pointerdown',
        (event) => {

          if (
            event.pointerType === 'mouse' &&
            event.button !== 0
          ) {
            return;
          }


          if (event.target.closest('button')) {
            return;
          }


          pointerStartX = event.clientX;

          pointerStartY = event.clientY;

          swipeMoved = false;

          viewport.setPointerCapture(
            event.pointerId
          );

        }
      );


      viewport?.addEventListener(
        'pointerup',
        finishSwipe
      );

      viewport?.addEventListener(
        'pointercancel',
        finishSwipe
      );


      viewport?.addEventListener(
        'click',
        (event) => {

          if (swipeMoved) {

            event.preventDefault();

            event.stopPropagation();

            swipeMoved = false;

          }

        },
        true
      );


      prevButton.addEventListener(
        'click',
        () => {

          if (currentIndex > 0) {

            currentIndex -= 1;

            updatePosition(true);

            updateControls();

          }

        }
      );


      nextButton.addEventListener(
        'click',
        () => {

          if (
            currentIndex < getMaxIndex()
          ) {

            currentIndex += 1;

            updatePosition(true);

            updateControls();

          }

        }
      );


      window.addEventListener(
        'resize',
        () => {

          currentIndex =
            Math.min(
              currentIndex,
              getMaxIndex()
            );

          updatePosition(false);

          updateControls();

        }
      );


      updateControls();

      updatePosition(false);

    }

  }

  pageDropOffInput?.addEventListener(
    'input',
    clearBookingPageDateErrorState
  );

  pagePickUpInput?.addEventListener(
    'input',
    clearBookingPageDateErrorState
  );

}




/* FAQ accordion */

document
  .querySelectorAll('.faq-item')
  .forEach((item) => {

    const button =
      item.querySelector(
        '.faq-question'
      );

    const answer =
      item.querySelector(
        '.faq-answer-wrapper'
      );


    button.addEventListener(
      'click',
      () => {

        const isOpen =
          item.classList.contains(
            'active'
          );


        if (isOpen) {

          /* Close this FAQ */

          answer.style.height =
            answer.scrollHeight + 'px';


          requestAnimationFrame(() => {

            answer.style.height =
              '0px';

          });


          item.classList.remove(
            'active'
          );


          button.setAttribute(
            'aria-expanded',
            'false'
          );


        } else {

          /* Open this FAQ */

          item.classList.add(
            'active'
          );


          button.setAttribute(
            'aria-expanded',
            'true'
          );


          answer.style.height =
            answer.scrollHeight + 'px';


          answer.addEventListener(
            'transitionend',
            function handler() {

              if (
                item.classList.contains(
                  'active'
                )
              ) {

                answer.style.height =
                  'auto';

              }


              answer.removeEventListener(
                'transitionend',
                handler
              );

            }
          );

        }

      }
    );

  });


/**
 * Scroll reveal: fades/slides in any element marked [data-reveal]
 * as it scrolls into view. Pairs with the [data-reveal] CSS rules
 * in styles.css. Runs once per element (unobserves after revealing),
 * so it won't re-trigger if the user scrolls back up and down again.
 */

(function () {

  const items =
    document.querySelectorAll(
      '[data-reveal]'
    );


  if (!items.length) return;


  const prefersReducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  /* No IntersectionObserver support or user prefers no motion */

  if (
    !('IntersectionObserver' in window) ||
    prefersReducedMotion
  ) {

    items.forEach((el) => {

      el.classList.add(
        'is-revealed'
      );

    });

    return;

  }


  const observer =
    new IntersectionObserver(
      (entries, obs) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              'is-revealed'
            );

            obs.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px',
      }
    );


  items.forEach((el) => {

    observer.observe(el);

  });

})();