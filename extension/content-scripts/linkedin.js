// ============================================================================
// CortexOS Companion — LinkedIn Content Script
// Extracts profile data from LinkedIn pages and sends to background worker.
// ============================================================================

(function () {
  "use strict";

  const PROFILE_URL_PATTERN = /linkedin\.com\/in\//;
  const COMPANY_URL_PATTERN = /linkedin\.com\/company\//;

  // Debounce to handle SPA navigation
  let lastProcessedUrl = "";

  function init() {
    // LinkedIn is a SPA — watch for URL changes
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastProcessedUrl) {
        lastProcessedUrl = window.location.href;
        setTimeout(processPage, 1500); // Wait for LinkedIn to render
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Process initial page
    if (document.readyState === "complete") {
      processPage();
    } else {
      window.addEventListener("load", processPage);
    }
  }

  function processPage() {
    const url = window.location.href;

    if (PROFILE_URL_PATTERN.test(url)) {
      extractPersonProfile();
    } else if (COMPANY_URL_PATTERN.test(url)) {
      extractCompanyProfile();
    }
  }

  // ============================================================================
  // Person Profile Extraction
  // ============================================================================

  function extractPersonProfile() {
    const data = {
      type: "person",
      url: window.location.href,
      timestamp: Date.now(),
    };

    // Name
    const nameEl = document.querySelector(".text-heading-xlarge");
    data.fullName = nameEl?.textContent?.trim() || "";

    // Headline / Title
    const headlineEl = document.querySelector(".text-body-medium.break-words");
    data.headline = headlineEl?.textContent?.trim() || "";

    // Location
    const locationEl = document.querySelector(".text-body-small.inline.t-black--light.break-words");
    data.location = locationEl?.textContent?.trim() || "";

    // About section
    const aboutSection = document.querySelector("#about ~ div .inline-show-more-text");
    data.about = aboutSection?.textContent?.trim() || "";

    // Current company
    const experienceSection = document.querySelector("#experience ~ div .pvs-list__container");
    if (experienceSection) {
      const firstRole = experienceSection.querySelector(".pvs-entity");
      if (firstRole) {
        const company = firstRole.querySelector(".t-bold span[aria-hidden='true']");
        const title = firstRole.querySelector(".t-14.t-normal span[aria-hidden='true']");
        data.currentCompany = company?.textContent?.trim() || "";
        data.currentTitle = title?.textContent?.trim() || "";
      }
    }

    // Profile image
    const imgEl = document.querySelector(".pv-top-card-profile-picture__image--show");
    data.profileImageUrl = imgEl?.getAttribute("src") || "";

    // Connection count
    const connectionsEl = document.querySelector(".t-bold[href*='connections']");
    data.connections = connectionsEl?.textContent?.trim() || "";

    // Send to background
    if (data.fullName) {
      chrome.runtime.sendMessage({
        type: "linkedin_profile_data",
        payload: data,
      });

      showOverlayNotification(`Captured: ${data.fullName}`);
    }
  }

  // ============================================================================
  // Company Profile Extraction
  // ============================================================================

  function extractCompanyProfile() {
    const data = {
      type: "company",
      url: window.location.href,
      timestamp: Date.now(),
    };

    // Company name
    const nameEl = document.querySelector(".org-top-card-summary__title");
    data.companyName = nameEl?.textContent?.trim() || "";

    // Industry
    const industryEl = document.querySelector(".org-top-card-summary-info-list__info-item");
    data.industry = industryEl?.textContent?.trim() || "";

    // Employee count
    const employeeEls = document.querySelectorAll(".org-top-card-summary-info-list__info-item");
    if (employeeEls.length >= 2) {
      data.employeeRange = employeeEls[1]?.textContent?.trim() || "";
    }

    // About/Overview
    const aboutEl = document.querySelector(".org-page-details__definition-text");
    data.about = aboutEl?.textContent?.trim() || "";

    // Website
    const websiteEl = document.querySelector(".org-top-card-primary-actions__inner a[href*='http']");
    data.website = websiteEl?.getAttribute("href") || "";

    // Headquarters
    const hqEl = document.querySelector(".org-location-card p");
    data.headquarters = hqEl?.textContent?.trim() || "";

    if (data.companyName) {
      chrome.runtime.sendMessage({
        type: "linkedin_profile_data",
        payload: data,
      });

      showOverlayNotification(`Captured: ${data.companyName}`);
    }
  }

  // ============================================================================
  // Overlay Notification
  // ============================================================================

  function showOverlayNotification(text) {
    // Remove existing
    const existing = document.getElementById("cortex-overlay-notification");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "cortex-overlay-notification";
    overlay.innerHTML = `
      <div class="cortex-overlay-icon">⚡</div>
      <div class="cortex-overlay-text">${text}</div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add("cortex-overlay-fade-out");
      setTimeout(() => overlay.remove(), 400);
    }, 3000);
  }

  init();
})();
