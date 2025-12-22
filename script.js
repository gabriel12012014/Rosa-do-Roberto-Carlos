(function () {
  console.log("Script initializing...");

  // Easter Egg Logic (Moved to top)
  setTimeout(() => {
    const flashOverlay = document.querySelector(".flash-overlay");
    console.log("Easter Egg Timer Fired. Overlay found?", !!flashOverlay);

    if (flashOverlay && Math.random() > 0.5) {
      flashOverlay.classList.add("active");
      console.log("Easter Egg: SHOWING");
      setTimeout(() => {
        flashOverlay.classList.remove("active");
        console.log("Easter Egg: HIDING");
      }, 100);
    } else {
      console.log("Easter Egg: Skipped (Random) or Not Found");
    }
  }, 1000);

  // Data is now loaded from data.js as global variables: videosData, quotesData
  const videosData = window.videosData;
  const quotesData = window.quotesData;

  const mainVideo = document.querySelector(".video-wrapper video");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalButtonsContainer = document.querySelector(".modal-buttons");
  const mainShareButton = document.querySelector(".main-share-button");
  const closeModalButton = document.querySelector(".close-modal");
  const quoteTextElement = document.querySelector(".quote-text");
  const quoteSongElement = document.querySelector(".quote-song");

  if (!videosData || videosData.length === 0) {
    console.error("videosData not found or empty!");
    return;
  }

  // Custom Select Elements
  const customSelectWrapper = document.querySelector(".custom-select-wrapper");
  const customSelectTrigger = document.querySelector(".custom-select-trigger");
  const customOptionsContainer = document.querySelector(".custom-options");
  const triggerText = document.querySelector(".trigger-text");

  // Social Buttons
  const btnWhatsapp = document.querySelector(".btn-whatsapp");
  const btnFacebook = document.querySelector(".btn-facebook");
  const btnCopyLink = document.querySelector(".btn-copy-link");
  const copyFeedback = document.querySelector(".copy-feedback");
  const validationToast = document.querySelector(".validation-toast");

  let currentQuoteSelection = "-1"; // Default to random

  // Populate Custom Select
  if (customOptionsContainer) {
    // Add "Aleatória" option first
    const randomOption = document.createElement("div");
    randomOption.className = "custom-option selected";
    randomOption.dataset.value = "-1";
    randomOption.innerHTML = `
        <span class="option-text">Aleatória</span>
        <span class="option-song"></span>
    `;
    randomOption.addEventListener("click", function () {
      handleOptionClick(this);
    });
    customOptionsContainer.appendChild(randomOption);

    quotesData.forEach((quote, index) => {
      const option = document.createElement("div");
      option.className = "custom-option";
      option.dataset.value = index;

      const truncatedText = quote.text.length > 30 ? quote.text.substring(0, 30) + "..." : quote.text;

      option.innerHTML = `
        <span class="option-text">${truncatedText}</span>
        <span class="option-song">${quote.song}</span>
      `;

      option.addEventListener("click", function () {
        handleOptionClick(this);
      });

      customOptionsContainer.appendChild(option);
    });
  }


  function handleOptionClick(optionElement) {
    const value = optionElement.dataset.value;
    const text = optionElement.querySelector(".option-text").textContent;

    currentQuoteSelection = value;
    if (triggerText) triggerText.textContent = text;

    // Update selected class
    const allOptions = customOptionsContainer.querySelectorAll(".custom-option");
    allOptions.forEach(opt => opt.classList.remove("selected"));
    optionElement.classList.add("selected");

    // Close dropdown
    if (customSelectWrapper) customSelectWrapper.classList.remove("open");
  }

  // Toggle Dropdown
  if (customSelectTrigger) {
    customSelectTrigger.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent closing immediately
      customSelectWrapper.classList.toggle("open");
    });
  }

  // Close dropdown when clicking outside
  window.addEventListener("click", function (e) {
    if (customSelectWrapper && !customSelectWrapper.contains(e.target)) {
      customSelectWrapper.classList.remove("open");
    }
  });

  // Random Quote Logic
  function setQuote(index) {
    if (!quoteTextElement || !quoteSongElement) return;

    let quote;
    if (index === -1 || index === null || index === undefined) {
      const randomIndex = Math.floor(Math.random() * quotesData.length);
      quote = quotesData[randomIndex];
    } else {
      quote = quotesData[index];
    }

    if (quote) {
      quoteTextElement.textContent = `"${quote.text}"`;
      if (quote.year) {
        quoteSongElement.textContent = `${quote.song} - ${quote.artist} (${quote.year})`;
      } else {
        quoteSongElement.textContent = `${quote.song} - ${quote.artist}`;
      }

      // Update background music
      const bgMusic = document.getElementById("bg-music"); // Re-select to be sure
      if (bgMusic && quote.audio) {
        bgMusic.src = quote.audio;
        bgMusic.load();
      }
    }
  }

  let selectedVideoIndex = null;
  let currentVideoObj = null;

  if (!mainVideo || videosData.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const videoParam = params.get("video");
  const quoteParam = params.get("quote");

  // Handle Quote Param
  let chosenQuoteIndex = -1;
  if (quoteParam !== null) {
    const parsedQuote = parseInt(quoteParam, 10);
    if (!Number.isNaN(parsedQuote) && parsedQuote >= 0 && parsedQuote < quotesData.length) {
      chosenQuoteIndex = parsedQuote;
    }
  }
  setQuote(chosenQuoteIndex);

  let chosenIndex;

  if (videoParam !== null) {
    const parsed = parseInt(videoParam, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed < videosData.length) {
      chosenIndex = parsed;
    }
  }

  if (chosenIndex == null) {
    chosenIndex = Math.floor(Math.random() * videosData.length);
  }
  let hasInteracted = false;

  // Initialize Video
  function setVideo(index) {
    currentVideoObj = videosData[index];

    if (!hasInteracted) {
      mainVideo.src = currentVideoObj.start;
      mainVideo.loop = true;
      mainVideo.muted = true; // Autoplay requires muted
      mainVideo.play().catch(e => console.log("Start video play failed", e));

      // 1. Preload Intro when Start is loaded
      mainVideo.onloadeddata = () => {
        const preloadIntro = document.createElement("video");
        preloadIntro.preload = "auto";
        preloadIntro.src = currentVideoObj.intro;

        // 2. Preload Loop when Intro is loaded
        preloadIntro.onloadeddata = () => {
          const preloadLoop = document.createElement("video");
          preloadLoop.preload = "auto";
          preloadLoop.src = currentVideoObj.loop;
        };
      };
    } else {
      mainVideo.src = currentVideoObj.intro;
      mainVideo.loop = false;
      mainVideo.muted = false;
      mainVideo.load();
      // If we are setting video dynamically (not initial load), we might want to play it?
      // For initial load, we wait for user interaction.
      if (hasInteracted) {
        mainVideo.play().catch(e => console.log("Video play failed", e));
      }
    }

    // Reset text visibility
    const caption = document.querySelector(".video-caption");
    if (caption) {
      caption.classList.remove("visible");
    }
    const shareSection = document.querySelector(".share-section");
    if (shareSection) {
      shareSection.classList.remove("visible");
    }
  }

  setVideo(chosenIndex);

  // Handle Video Loop Transition
  mainVideo.addEventListener('ended', function () {
    if (currentVideoObj && mainVideo.src.includes(currentVideoObj.intro)) {
      mainVideo.src = currentVideoObj.loop;
      mainVideo.loop = true;
      mainVideo.play().catch(e => console.log("Loop play failed", e));

      // Show text
      const caption = document.querySelector(".video-caption");
      if (caption) {
        caption.classList.add("visible");
      }
      const shareSection = document.querySelector(".share-section");
      if (shareSection) {
        shareSection.classList.add("visible");
      }
    }
  });


  // Modal Logic
  function openModal() {
    modalOverlay.classList.add("active");
    modalOverlay.classList.add("active");
    // Reset selection when opening? Maybe keep it? 
    // Let's keep the video selection reset, but maybe default the quote to the current one if it was selected via URL?
    // For now, let's reset video selection as requested before.
    selectedVideoIndex = null;
    updateSelectionUI();

    // Reset quote select to "Aleatória" (-1)
    currentQuoteSelection = "-1";
    if (triggerText) triggerText.textContent = "Aleatória";

    // Reset selected class in dropdown
    const allOptions = customOptionsContainer.querySelectorAll(".custom-option");
    allOptions.forEach(opt => {
      if (opt.dataset.value === "-1") opt.classList.add("selected");
      else opt.classList.remove("selected");
    });

    if (customSelectWrapper) customSelectWrapper.classList.remove("open");
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
  }

  if (mainShareButton) {
    mainShareButton.addEventListener("click", openModal);
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
  }

  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  function updateSelectionUI() {
    const buttons = modalButtonsContainer.querySelectorAll(".share-option-button");
    buttons.forEach((btn, index) => {
      if (index === selectedVideoIndex) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });

    // The copy link button is now part of the social share buttons and its state is handled by the feedback mechanism.
    // The old copyLinkButton and its active class logic is removed.
  }

  // Generate Share Buttons
  if (modalButtonsContainer) {
    videosData.forEach(function (videoObj, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "share-option-button " + (videoObj.colorClass || "");
      button.setAttribute("aria-label", "Opção " + (index + 1));

      button.addEventListener("click", function () {
        selectedVideoIndex = index;
        updateSelectionUI();
        // When selecting a new video, we want to play it immediately if we are already in interacted state
        if (hasInteracted) {
          setVideo(index);
        } else {
          // If not interacted (shouldn't happen via modal usually, but good to be safe), just update index
          chosenIndex = index;
          setVideo(index);
        }
      });

      modalButtonsContainer.appendChild(button);
    });
  }

  function getShareUrl() {
    const baseUrl = window.location.href.split("#")[0].split("?")[0];
    let shareUrl = baseUrl + "?video=" + selectedVideoIndex;

    if (currentQuoteSelection !== "-1") {
      shareUrl += "&quote=" + currentQuoteSelection;
    }
    return shareUrl;
  }

  function getShareText() {
    // Optional: Add a nice message
    return "Olha essa rosa que eu escolhi pra você! 🌹";
  }

  function validateSelection() {
    if (selectedVideoIndex === null) {
      showValidationToast("Escolha uma cor da rosa!");
      return false;
    }
    return true;
  }

  function showValidationToast(message) {
    if (validationToast) {
      validationToast.textContent = message;
      validationToast.classList.add("visible");
      setTimeout(() => {
        validationToast.classList.remove("visible");
      }, 3000);
    }
  }

  if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", function () {
      if (!validateSelection()) return;
      const url = getShareUrl();
      const text = getShareText();
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    });
  }

  if (btnFacebook) {
    btnFacebook.addEventListener("click", function () {
      if (!validateSelection()) return;
      const url = getShareUrl();
      // Facebook sharer only takes the URL
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });
  }



  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          showCopyFeedback();
        },
        (err) => {
          console.error("Erro ao copiar link: ", err);
        }
      );
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showCopyFeedback();
      } catch (err) {
        console.error("Erro ao copiar link: ", err);
      }
      document.body.removeChild(textArea);
    }
  }

  function showCopyFeedback() {
    if (copyFeedback) {
      copyFeedback.classList.add("visible");
      setTimeout(() => {
        copyFeedback.classList.remove("visible");
      }, 2000);
    }
  }

  if (btnCopyLink) {
    btnCopyLink.addEventListener("click", function () {
      if (!validateSelection()) return;
      const shareUrl = getShareUrl();
      copyToClipboard(shareUrl);
    });
  }

  // Background Music Logic
  const bgMusic = document.getElementById("bg-music");
  const musicBtn = document.querySelector(".music-control");
  const iconMusicOn = musicBtn.querySelector(".icon-music-on");
  const iconMusicOff = musicBtn.querySelector(".icon-music-off");

  let isMusicPlaying = false;

  function updateMusicIcon() {
    iconMusicOn.style.display = "none";
    iconMusicOff.style.display = "none";

    if (bgMusic.paused) {
      iconMusicOff.style.display = "block";
    } else {
      iconMusicOn.style.display = "block";
    }
  }

  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicIcon();
      }).catch(e => console.log("Audio play failed", e));
    } else {
      bgMusic.pause();
      isMusicPlaying = false;
      updateMusicIcon();
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent triggering the global listener if clicked first
      toggleMusic();
    });
  }

  // Click Counter for "Loot Box" logic
  let clickCount = 0;
  const CLICKS_TO_OPEN = 1;

  // Global Click Listener for "Click to Play"
  function handleStartInteraction(event) {
    // Check if click is on the share button or inside it
    if (event.target.closest(".main-share-button") || event.target.closest(".modal-content")) {
      return;
    }

    if (!hasInteracted) {
      clickCount++;
      const clicksRemaining = CLICKS_TO_OPEN - clickCount;
      const overlay = document.querySelector(".start-overlay");

      if (clickCount < CLICKS_TO_OPEN) {
        // Shake Effect
        const videoWrapper = document.querySelector(".video-wrapper");
        if (videoWrapper) {
          // Progressive Intensity
          const intensity = 1 + (clickCount * 0.1); // 1.1, 1.2, 1.3, 1.4
          const scaleFactor = 1.02 + (clickCount * 0.005); // 1.025, 1.03, 1.035, 1.04

          videoWrapper.style.setProperty("--intensity", intensity);
          videoWrapper.style.setProperty("--scale-factor", scaleFactor);

          videoWrapper.classList.remove("shake-animation"); // Reset
          void videoWrapper.offsetWidth; // Trigger reflow
          videoWrapper.classList.add("shake-animation");
        }

        // Hide Overlay on first click
        if (clickCount === 1 && overlay) {
          overlay.classList.add("hidden");
        }

        return; // Don't start yet
      }

      // If we reach here, it's the 5th click
      hasInteracted = true;

      // Switch to intro video
      if (currentVideoObj) {
        mainVideo.src = currentVideoObj.intro;
        mainVideo.loop = false;
        mainVideo.muted = false;
        mainVideo.play().catch(e => console.log("Video play failed", e));
      } else {
        // currentVideoObj is null, this case should ideally not happen if videosData is populated correctly
        // but if it does, we can't play an intro video.
      }

      // Start Music
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicIcon();
      }).catch(e => console.log("Music play failed", e));

      // Hide Overlay
      if (overlay) {
        overlay.classList.add("hidden");
      }

      // Remove listener after first successful trigger attempt
      document.removeEventListener("click", handleStartInteraction);
      if (overlay) {
        overlay.removeEventListener("click", handleStartInteraction);
      }
    }
  }

  document.addEventListener("click", handleStartInteraction);


  const overlay = document.querySelector(".start-overlay");
  // The global 'click' listener covers everything including the overlay.
  // We do NOT add a specific listener to overlay here to avoid double-counting.


})();
