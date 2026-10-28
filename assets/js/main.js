/* G-WORX Consulting — progressive enhancement only.
   Everything on the page works with this file absent or blocked. */
(function () {
  "use strict";

  /* ---- Mobile navigation -------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    /* Close after following an in-page link, and on Escape. */
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) { setOpen(false); }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    /* The panel only exists below the 900px breakpoint. */
    var wide = window.matchMedia("(min-width: 900px)");
    var syncWidth = function () { if (wide.matches) { setOpen(false); } };
    wide.addEventListener ? wide.addEventListener("change", syncWidth) : wide.addListener(syncWidth);
  }

  /* ---- Hero video facade --------------------------------------------
     The play control is rendered hidden and only revealed when a video
     source has been configured on the figure, so there is never a
     control on the page that does nothing. */
  var media = document.querySelector(".media[data-video-src]");
  var play = media && media.querySelector(".media__play");
  var src = media && media.getAttribute("data-video-src");

  if (media && play && src) {
    play.hidden = false;
    play.addEventListener("click", function () {
      var video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("poster", media.querySelector(".media__poster").src);
      media.replaceChildren(video);
      video.focus();
    });
  }
})();
