document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // =========================================================
  // 1. Loading screen
  // =========================================================
  const loader = document.querySelector(".loader");

  function hideLoader() {
    loader?.classList.add("hidden");
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  window.setTimeout(hideLoader, 2500);

  // =========================================================
  // 2. Responsive navigation
  // =========================================================
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-navigation");
  const navLinks = document.querySelectorAll(".nav-link");

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  function openMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.add("is-open");
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
  }

  menuToggle?.addEventListener("click", () => {
    navigation?.classList.contains("is-open")
      ? closeMenu()
      : openMenu();
  });

  navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", event => {
    if (
      navigation &&
      menuToggle &&
      !navigation.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  // =========================================================
  // 3. Header appearance and back-to-top button
  // =========================================================
  const siteHeader = document.querySelector(".site-header");
  const backToTop = document.querySelector(".back-to-top");

  function updateScrollUI() {
    siteHeader?.classList.toggle("scrolled", window.scrollY > 30);
    backToTop?.classList.toggle("visible", window.scrollY > 500);
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  backToTop?.addEventListener("click", event => {
    event.preventDefault();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth"
    });

    history.replaceState(null, "", "#top");
  });

  // =========================================================
  // 4. Active navigation links
  // =========================================================
  const sections = Array.from(
    document.querySelectorAll("main section[id]")
  );

  function updateActiveNavigation() {
    if (!sections.length) return;

    const headerHeight = siteHeader
      ? siteHeader.getBoundingClientRect().height
      : 0;

    const currentPosition = window.scrollY + headerHeight + 130;
    let currentSection = sections[0].id;

    sections.forEach(section => {
      if (section.offsetTop <= currentPosition) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute("href");

      if (!href?.startsWith("#")) return;

      const active = href === `#${currentSection}`;

      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavigation, {
    passive: true
  });

  window.addEventListener("resize", updateActiveNavigation);

  // =========================================================
  // 5. Reveal animations
  // =========================================================
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealElements.length) {
    document.body.classList.add("js-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("visible"));
  }

  // =========================================================
  // 6. Smooth scrolling
  // =========================================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.getElementById(href.slice(1));

      if (!target) return;

      event.preventDefault();
      closeMenu();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      history.replaceState(null, "", href);
    });
  });

  // =========================================================
  // 7. Automatic footer year
  // =========================================================
  document.querySelectorAll(".current-year").forEach(element => {
    element.textContent = String(new Date().getFullYear());
  });

  // =========================================================
  // 8. Shared utilities
  // =========================================================
  const reduceMotion = () => window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function showNotice(element, message, type = "success") {
    if (!element) return;

    element.textContent = message;
    element.hidden = false;
    element.classList.toggle("error", type === "error");
  }

  function hideNotice(element) {
    if (!element) return;

    element.hidden = true;
    element.textContent = "";
    element.classList.remove("error");
  }

  function openDialog(dialog) {
    if (!dialog) return false;

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
      return true;
    }

    dialog.setAttribute("open", "");
    return true;
  }

  function closeDialog(dialog) {
    if (!dialog) return;

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  document.querySelectorAll("dialog").forEach(dialog => {
    dialog.querySelector(".dialog-close")?.addEventListener("click", () => {
      closeDialog(dialog);
    });

    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  function formToObject(form) {
    const result = {};

    new FormData(form).forEach((value, key) => {
      if (value instanceof File) {
        result[key] = value.name ? value.name : "";
      } else {
        result[key] = String(value).trim();
      }
    });

    return result;
  }

  function formatLabel(value) {
    return String(value || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  function formatFormDetails(title, data) {
    const lines = [
      title,
      "=".repeat(Math.min(title.length, 45)),
      ""
    ];

    Object.entries(data).forEach(([key, value]) => {
      if (!value || key === "attachment") return;

      lines.push(`${formatLabel(key)}: ${value}`);
    });

    return lines.join("\n");
  }

  async function copyText(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }

    const temporaryTextarea = document.createElement("textarea");

    temporaryTextarea.value = textToCopy;
    temporaryTextarea.setAttribute("readonly", "");
    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.opacity = "0";

    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();

    const copied = document.execCommand("copy");

    temporaryTextarea.remove();

    if (!copied) {
      throw new Error("Copying was not successful.");
    }

    return true;
  }

  // =========================================================
  // 9. Product catalogue, category filtering and search
  // =========================================================
  const productGrid = document.querySelector("#product-grid");
  const productSearch = document.querySelector("#product-search");
  const productSort = document.querySelector("#product-sort");
  const catalogueTitle = document.querySelector("#catalogue-title");
  const categoryButtons = document.querySelectorAll(".category-button");

  let activeCategory = "all";
  let searchTerm = "";

  const categoryNames = {
    all: "All products",
    "living-room": "Living-room furniture",
    bedroom: "Bedroom furniture",
    children: "Children's rooms",
    kitchen: "Kitchen furniture and products",
    bathroom: "Bathroom products",
    curtains: "Curtains",
    "bed-linen": "Bed linen",
    textiles: "Household textiles",
    "other-furniture": "Other furniture",
    accessories: "Home accessories"
  };

  function getProductCards() {
    return productGrid
      ? Array.from(productGrid.querySelectorAll(".product-card"))
      : [];
  }

  function applyProductFilters() {
    const cards = getProductCards();

    cards.forEach(card => {
      const category = card.dataset.category || "";
      const name = (card.dataset.name || "").toLowerCase();
      const description = (
        card.querySelector(".product-info p")?.textContent || ""
      ).toLowerCase();

      const categoryMatch =
        activeCategory === "all" || category === activeCategory;

      const searchMatch =
        !searchTerm ||
        name.includes(searchTerm) ||
        description.includes(searchTerm) ||
        category.toLowerCase().includes(searchTerm);

      card.hidden = !(categoryMatch && searchMatch);
    });

    if (catalogueTitle) {
      catalogueTitle.textContent =
        activeCategory === "all"
          ? "Explore available products"
          : categoryNames[activeCategory] || "Explore products";
    }

    const noResultsId = "catalogue-no-results";
    let noResults = document.getElementById(noResultsId);

    if (!cards.some(card => !card.hidden)) {
      if (!noResults && productGrid) {
        noResults = document.createElement("p");
        noResults.id = noResultsId;
        noResults.className = "form-notice";
        noResults.textContent =
          "No products match your search. Try another term or category.";
        productGrid.appendChild(noResults);
      }
      if (noResults) noResults.hidden = false;
    } else if (noResults) {
      noResults.hidden = true;
    }
  }

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "all";

      categoryButtons.forEach(item => {
        const selected = item === button;

        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      applyProductFilters();
    });
  });

  productSearch?.addEventListener("input", () => {
    searchTerm = productSearch.value.trim().toLowerCase();
    applyProductFilters();
  });

  productSort?.addEventListener("change", () => {
    const cards = getProductCards();
    const sortMode = productSort.value;

    cards.sort((a, b) => {
      const nameA = (a.dataset.name || "").toLowerCase();
      const nameB = (b.dataset.name || "").toLowerCase();
      const priceA = Number(a.dataset.price) || 0;
      const priceB = Number(b.dataset.price) || 0;

      if (sortMode === "name") return nameA.localeCompare(nameB);
      if (sortMode === "price-low") return priceA - priceB;
      if (sortMode === "price-high") return priceB - priceA;

      return 0;
    });

    cards.forEach(card => productGrid?.appendChild(card));
    applyProductFilters();
  });

  // =========================================================
  // 10. Central order/cart state
  // =========================================================
  const orderItemsContainer = document.querySelector("#order-items");
  const cartCount = document.querySelector("#cart-count");
  const headingCartCount = document.querySelector("#heading-cart-count");
  const orderCountBadge = document.querySelector("#order-count-badge");

  const orderSubtotal = document.querySelector("#order-subtotal");
  const orderDeliveryCost = document.querySelector("#order-delivery-cost");
  const orderAssemblyCost = document.querySelector("#order-assembly-cost");
  const orderTotal = document.querySelector("#order-total");

  const checkoutForm = document.querySelector("#checkout-form");
  const checkoutNotice = document.querySelector("#checkout-notice");

  const checkoutDialog = document.querySelector("#checkout-dialog");
  const checkoutDialogMessage = document.querySelector(
    "#checkout-dialog-message"
  );
  const checkoutRequestSummary = document.querySelector(
    "#checkout-request-summary"
  );
  const checkoutCopyButton = document.querySelector("#checkout-copy-request");

  const productDialog = document.querySelector("#product-dialog");
  const productDialogTitle = document.querySelector("#product-dialog-title");
  const productDialogDescription = document.querySelector(
    "#product-dialog-description"
  );
  const productDialogQuantity = document.querySelector(
    "#product-dialog-quantity"
  );
  const productDialogNotes = document.querySelector("#product-dialog-notes");
  const productDialogConfirm = document.querySelector(
    "#product-dialog-confirm"
  );
  const productDialogNotice = document.querySelector("#product-dialog-notice");

  const productCardsById = new Map(
    getProductCards().map(card => [card.dataset.productId, card])
  );

  const order = new Map();
  let selectedProductId = null;
  let latestRequestText = "";

  function getProductDetails(productId) {
    const card = productCardsById.get(productId);

    if (!card) return null;

    return {
      id: productId,
      name: card.dataset.name || "Selected product",
      category: card.dataset.category || "",
      price: Number(card.dataset.price) || 0
    };
  }

  function addProduct(productId, quantity = 1, notes = "") {
    const product = getProductDetails(productId);

    if (!product) return false;

    const existing = order.get(productId);

    if (existing) {
      existing.quantity = Math.min(
        100,
        existing.quantity + Math.max(1, quantity)
      );

      if (notes) existing.notes = notes;
    } else {
      order.set(productId, {
        ...product,
        quantity: Math.max(1, Math.min(100, quantity)),
        notes
      });
    }

    renderOrder();
    return true;
  }

  function changeQuantity(productId, amount) {
    const item = order.get(productId);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
      order.delete(productId);
    } else {
      item.quantity = Math.min(100, item.quantity);
    }

    renderOrder();
  }

  function removeProduct(productId) {
    order.delete(productId);
    renderOrder();
  }

  function renderOrder() {
    if (!orderItemsContainer) return;

    orderItemsContainer.replaceChildren();

    const items = Array.from(order.values());
    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    if (cartCount) cartCount.textContent = String(totalQuantity);
    if (headingCartCount) headingCartCount.textContent = `(${totalQuantity})`;
    if (orderCountBadge) {
      orderCountBadge.textContent =
        `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
    }

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-order";

      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "▱";

      const heading = document.createElement("h4");
      heading.textContent = "Your order is empty";

      const paragraph = document.createElement("p");
      paragraph.textContent =
        "Browse the catalogue and select products you want to enquire about.";

      const link = document.createElement("a");
      link.href = "#store";
      link.className = "text-link";
      link.textContent = "Browse products ↗";

      empty.append(icon, heading, paragraph, link);
      orderItemsContainer.appendChild(empty);
    } else {
      items.forEach(item => {
        const row = document.createElement("article");
        row.className = "order-item";

        const details = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = item.name;

        const category = document.createElement("p");
        category.textContent = formatLabel(item.category);

        const controls = document.createElement("div");
        controls.className = "order-item-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", `Reduce ${item.name} quantity`);
        minus.addEventListener("click", () => changeQuantity(item.id, -1));

        const quantity = document.createElement("span");
        quantity.textContent = String(item.quantity);
        quantity.setAttribute("aria-label", "Quantity");

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", `Increase ${item.name} quantity`);
        plus.addEventListener("click", () => changeQuantity(item.id, 1));

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "order-item-remove";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => removeProduct(item.id));

        controls.append(minus, quantity, plus, remove);
        details.append(title, category, controls);

        if (item.notes) {
          const notes = document.createElement("p");
          notes.textContent = `Requirements: ${item.notes}`;
          details.appendChild(notes);
        }

        const price = document.createElement("span");
        price.className = "order-item-price";
        price.textContent = item.price > 0
          ? `₦${(item.price * item.quantity).toLocaleString("en-NG")}`
          : "Quote required";

        row.append(details, price);
        orderItemsContainer.appendChild(row);
      });
    }

    const subtotal = items.every(item => item.price > 0)
      ? items.reduce((total, item) => total + item.price * item.quantity, 0)
      : null;

    if (orderSubtotal) {
      orderSubtotal.textContent = subtotal === null
        ? "To be confirmed"
        : `₦${subtotal.toLocaleString("en-NG")}`;
    }

    if (orderDeliveryCost) orderDeliveryCost.textContent = "To be confirmed";
    if (orderAssemblyCost) orderAssemblyCost.textContent = "To be confirmed";

    if (orderTotal) {
      orderTotal.textContent = subtotal === null
        ? "Quote required"
        : `₦${subtotal.toLocaleString("en-NG")} + services`;
    }
  }

  // Open the product details dialog.
  document.querySelectorAll("[data-add-product]").forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.dataset.addProduct;
      const product = getProductDetails(productId);

      if (!product) return;

      selectedProductId = productId;

      if (productDialogTitle) {
        productDialogTitle.textContent = product.name;
      }

      if (productDialogDescription) {
        productDialogDescription.textContent =
          "Add this product to your request. Confirm price, specifications and availability with the business.";
      }

      if (productDialogQuantity) productDialogQuantity.value = "1";
      if (productDialogNotes) productDialogNotes.value = "";
      hideNotice(productDialogNotice);

      openDialog(productDialog);
    });
  });

  productDialogConfirm?.addEventListener("click", () => {
    if (!selectedProductId) return;

    const quantity = Number(productDialogQuantity?.value || 1);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      showNotice(
        productDialogNotice,
        "Enter a quantity between 1 and 100.",
        "error"
      );
      return;
    }

    const notes = productDialogNotes?.value.trim() || "";
    const added = addProduct(selectedProductId, quantity, notes);

    if (!added) {
      showNotice(productDialogNotice, "This product could not be added.", "error");
      return;
    }

    showNotice(
      productDialogNotice,
      "Product added to your order request."
    );

    window.setTimeout(() => closeDialog(productDialog), 500);
  });

  // =========================================================
  // 11. Gallery filters
  // =========================================================
  const galleryFilterButtons = document.querySelectorAll(
    ".gallery-filter-button"
  );
  const galleryCards = document.querySelectorAll("[data-gallery-category]");

  galleryFilterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter || "all";

      galleryFilterButtons.forEach(item => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      galleryCards.forEach(card => {
        card.hidden =
          filter !== "all" && card.dataset.galleryCategory !== filter;
      });
    });
  });

  // =========================================================
  // 12. Collection, delivery and assembly shortcuts
  // =========================================================
  const deliveryAddressField = document.querySelector(
    "#delivery-address-field"
  );
  const deliveryAddress = document.querySelector("#delivery-address");

  function updateFulfilmentFields() {
    const selected = checkoutForm?.querySelector(
      'input[name="fulfilment"]:checked'
    )?.value;

    const deliverySelected = selected === "delivery";

    if (deliveryAddressField) {
      deliveryAddressField.hidden = !deliverySelected;
    }

    if (deliveryAddress) {
      deliveryAddress.required = deliverySelected;
    }
  }

  checkoutForm?.querySelectorAll('input[name="fulfilment"]').forEach(input => {
    input.addEventListener("change", updateFulfilmentFields);
  });

  document.querySelectorAll("[data-set-fulfilment]").forEach(link => {
    link.addEventListener("click", () => {
      const desired = link.dataset.setFulfilment;

      const radio = checkoutForm?.querySelector(
        `input[name="fulfilment"][value="${desired}"]`
      );

      if (radio) {
        radio.checked = true;
        updateFulfilmentFields();
      }
    });
  });

  document.querySelectorAll("[data-set-assembly]").forEach(link => {
    link.addEventListener("click", () => {
      const desired = link.dataset.setAssembly;

      const radio = checkoutForm?.querySelector(
        `input[name="assembly"][value="${desired}"]`
      );

      if (radio) radio.checked = true;
    });
  });

  // =========================================================
  // 13. Prepare an order request
  // =========================================================
  function buildOrderRequest(data) {
    const lines = [
      "DEPARTMENT STORE — ORDER REQUEST",
      "================================",
      "",
      "SELECTED PRODUCTS"
    ];

    if (order.size === 0) {
      lines.push("No catalogue products selected.");
    } else {
      order.forEach(item => {
        lines.push(
          `- ${item.name}`,
          `  Quantity: ${item.quantity}`,
          `  Category: ${formatLabel(item.category)}`,
          `  Price: ${item.price > 0
            ? `₦${(item.price * item.quantity).toLocaleString("en-NG")}`
            : "Quote required"}`
        );

        if (item.notes) lines.push(`  Requirements: ${item.notes}`);
      });
    }

    lines.push(
      "",
      "CUSTOMER AND FULFILMENT DETAILS",
      "-------------------------------"
    );

    Object.entries(data).forEach(([key, value]) => {
      if (!value || key === "order-terms") return;
      lines.push(`${formatLabel(key)}: ${value}`);
    });

    lines.push(
      "",
      "COSTS",
      "-----",
      "Product prices: confirm with the business.",
      "Delivery/freight: confirm with the business.",
      "Assembly: confirm with the business.",
      "Payment instructions: confirm with the business.",
      "",
      "This is a prepared request, not an order confirmation or payment receipt."
    );

    return lines.join("\n");
  }

  checkoutForm?.addEventListener("submit", event => {
    event.preventDefault();
    hideNotice(checkoutNotice);

    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }

    const data = formToObject(checkoutForm);
    latestRequestText = buildOrderRequest(data);

    if (checkoutDialogMessage) {
      checkoutDialogMessage.textContent =
        "Review the details below. You can copy the request and share it with the business for confirmation.";
    }

    if (checkoutRequestSummary) {
      checkoutRequestSummary.textContent = latestRequestText;
    }

    openDialog(checkoutDialog);
    showNotice(
      checkoutNotice,
      "Your request has been prepared for review. Copy the details and share them with the business to continue."
    );
  });

  checkoutCopyButton?.addEventListener("click", async () => {
    if (!latestRequestText) {
      showNotice(
        checkoutDialogMessage,
        "Prepare an order request before copying it."
      );
      return;
    }

    try {
      await copyText(latestRequestText);
      checkoutCopyButton.textContent = "Request details copied ✓";

      window.setTimeout(() => {
        checkoutCopyButton.textContent = "Copy request details";
      }, 1800);
    } catch {
      showNotice(
        checkoutDialogMessage,
        "Automatic copying was unavailable. Select and copy the request text shown above."
      );
    }
  });

  // =========================================================
  // 14. Custom product requests
  // =========================================================
  const customOrderForm = document.querySelector("#custom-order-form");
  const customOrderNotice = document.querySelector("#custom-order-notice");

  customOrderForm?.addEventListener("submit", async event => {
    event.preventDefault();
    hideNotice(customOrderNotice);

    if (!customOrderForm.checkValidity()) {
      customOrderForm.reportValidity();
      return;
    }

    const data = formToObject(customOrderForm);
    const attachment = customOrderForm.querySelector(
      'input[name="attachment"]'
    )?.files?.[0];

    if (attachment) {
      data.attachment = attachment.name;
    }

    latestRequestText = formatFormDetails(
      "CUSTOM PRODUCT REQUEST",
      data
    );

    try {
      await copyText(latestRequestText);

      showNotice(
        customOrderNotice,
        "Your custom-order request has been prepared and copied. Share it with the business to confirm measurements, specifications, quotation, production and order terms."
      );
    } catch {
      showNotice(
        customOrderNotice,
        "Your request details have been prepared. Copy the information from the form and share it with the business to proceed."
      );
    }

    customOrderNotice.scrollIntoView({
      behavior: reduceMotion() ? "auto" : "smooth",
      block: "nearest"
    });
  });

  // =========================================================
  // 15. Member registration
  // =========================================================
  const memberForm = document.querySelector("#member-registration");
  const memberNotice = document.querySelector("#member-registration-notice");

  memberForm?.addEventListener("submit", async event => {
    event.preventDefault();
    hideNotice(memberNotice);

    if (!memberForm.checkValidity()) {
      memberForm.reportValidity();
      return;
    }

    const data = formToObject(memberForm);

    latestRequestText = formatFormDetails(
      "PRACTICAL TRAINING — MEMBER REGISTRATION",
      data
    );

    try {
      await copyText(latestRequestText);

      showNotice(
        memberNotice,
        "Your member registration details have been prepared and copied. Share the details with the initiative for review. Registration and acceptance as a member are not confirmed by this form."
      );
    } catch {
      showNotice(
        memberNotice,
        "Your registration details are ready. Copy the information and share it with the initiative for review."
      );
    }
  });

  // =========================================================
  // 16. Cooperation partner registration
  // =========================================================
  const partnerForm = document.querySelector("#partner-registration");
  const partnerNotice = document.querySelector("#partner-registration-notice");

  partnerForm?.addEventListener("submit", async event => {
    event.preventDefault();
    hideNotice(partnerNotice);

    if (!partnerForm.checkValidity()) {
      partnerForm.reportValidity();
      return;
    }

    const data = formToObject(partnerForm);

    latestRequestText = formatFormDetails(
      "COOPERATION PARTNER REGISTRATION",
      data
    );

    try {
      await copyText(latestRequestText);

      showNotice(
        partnerNotice,
        "Your cooperation partner details have been prepared and copied. Share them with the initiative for review. This form does not confirm partnership approval."
      );
    } catch {
      showNotice(
        partnerNotice,
        "Your registration details are ready. Copy the information and share it with the initiative for review."
      );
    }
  });

  // =========================================================
  // 17. Voice, video and enquiry shortcuts
  // =========================================================
  const contactTopic = document.querySelector("#contact-topic");
  const contactMessage = document.querySelector("#contact-message");

  function selectContactTopic(topic) {
    if (!contactTopic) return;

    const option = Array.from(contactTopic.options).find(item => {
      return item.value.toLowerCase() === String(topic).toLowerCase();
    });

    if (option) {
      contactTopic.value = option.value;
      contactTopic.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  document.querySelectorAll("[data-contact-mode]").forEach(link => {
    link.addEventListener("click", () => {
      const mode = link.dataset.contactMode;

      if (mode === "voice") {
        selectContactTopic("voice");

        if (contactMessage && !contactMessage.value.trim()) {
          contactMessage.value =
            "I would like to request a voice conversation about a product or order. Please let me know the available arrangements.";
        }
      }

      if (mode === "video") {
        selectContactTopic("video");

        if (contactMessage && !contactMessage.value.trim()) {
          contactMessage.value =
            "I would like to request a video tour showing products, rooms or the warehouse. Please let me know the available arrangements.";
        }
      }
    });
  });

  document.querySelectorAll("[data-set-enquiry]").forEach(link => {
    link.addEventListener("click", () => {
      const desired = (link.dataset.setEnquiry || "").toLowerCase();

      const matchingOption = Array.from(
        contactTopic?.options || []
      ).find(option => {
        const value = option.value.toLowerCase();
        const label = option.textContent.toLowerCase();

        return value.includes(desired) || label.includes(desired);
      });

      if (matchingOption && contactTopic) {
        contactTopic.value = matchingOption.value;
      }
    });
  });

  // =========================================================
  // 18. General contact form
  // =========================================================
  const contactForm = document.querySelector("#contact-form");
  const contactNotice = document.querySelector("#form-notice");

  contactForm?.addEventListener("submit", async event => {
    event.preventDefault();
    hideNotice(contactNotice);

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const data = formToObject(contactForm);

    latestRequestText = formatFormDetails(
      "DEPARTMENT STORE — GENERAL ENQUIRY",
      data
    );

    try {
      await copyText(latestRequestText);

      showNotice(
        contactNotice,
        "Your enquiry has been prepared and copied. Share the copied details with the business so the team can review your message."
      );
    } catch {
      showNotice(
        contactNotice,
        "Your enquiry details are ready. Copy the information from the form and share it with the business."
      );
    }

    contactNotice.scrollIntoView({
      behavior: reduceMotion() ? "auto" : "smooth",
      block: "nearest"
    });
  });

  // =========================================================
  // 19. Initialise page
  // =========================================================
  updateFulfilmentFields();
  applyProductFilters();
  renderOrder();
  updateActiveNavigation();
});