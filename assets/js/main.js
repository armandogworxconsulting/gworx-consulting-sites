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

})();

/* Below 768px the comparison table is replaced by one card per package,
   with that package's included services behind an accordion.

   The cards are BUILT FROM THE TABLE rather than written into the HTML, so
   the pricing content exists in exactly one place and the two views cannot
   drift apart. If this never runs, .has-cards is never set, the scrollable
   table stays visible on mobile and the section still works. */
(function () {
  "use strict";

  var pricing = document.querySelector(".pricing");
  var table = pricing && pricing.querySelector(".pricing__table");
  if (!table) { return; }

  var heads = table.querySelectorAll("thead .pricing__pkg");
  var rows = table.querySelectorAll("tbody tr");
  if (!heads.length || !rows.length) { return; }

  var cards = document.createElement("div");
  cards.className = "pkg-cards";

  Array.prototype.forEach.call(heads, function (head, col) {
    var featured = head.classList.contains("pricing__pkg--featured");

    var card = document.createElement("article");
    card.className = "pkg-card" + (featured ? " pkg-card--featured" : "");

    var top = document.createElement("div");
    top.className = "pkg-card__head";

    var name = document.createElement("h3");
    name.className = "pkg-card__name";
    name.textContent = head.querySelector(".pkg__name").textContent;

    var scope = document.createElement("p");
    scope.className = "pkg-card__scope";
    scope.textContent = head.querySelector(".pkg__scope").textContent;

    var price = document.createElement("p");
    price.className = "pkg-card__price";
    price.textContent = head.querySelector(".pkg__price").textContent;

    top.appendChild(name);
    top.appendChild(scope);
    top.appendChild(price);

    /* Clone the real CTA so href, target, rel and its screen-reader text
       all carry over, and only one of the two copies is ever visible. */
    var cta = head.querySelector(".btn");
    if (cta) {
      var copy = cta.cloneNode(true);
      copy.classList.add("btn--block");
      top.appendChild(copy);
    }
    card.appendChild(top);

    /* Only the services this package includes are listed, matching the
       design: there are no "Not included" rows in the mobile view. */
    var included = [];
    Array.prototype.forEach.call(rows, function (row) {
      var cell = row.cells[col + 1];
      if (cell && cell.classList.contains("is-included")) {
        included.push(row.cells[0].textContent.trim());
      }
    });
    if (!included.length) { cards.appendChild(card); return; }

    var acc = document.createElement("details");
    acc.className = "pkg-card__acc";

    var toggle = document.createElement("summary");
    toggle.className = "pkg-card__toggle";
    toggle.textContent = "Included services";

    var list = document.createElement("ul");
    list.className = "pkg-card__list";
    included.forEach(function (label) {
      var li = document.createElement("li");
      li.textContent = label;
      list.appendChild(li);
    });

    acc.appendChild(toggle);
    acc.appendChild(list);
    card.appendChild(acc);
    cards.appendChild(card);
  });

  pricing.insertBefore(cards, pricing.querySelector(".pricing__scroller"));
  pricing.classList.add("has-cards");
})();
