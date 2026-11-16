/* Spokewise demo: small, dependency-free behaviour.
   1. The hero "What does your bike need?" picker pre-fills the booking form.
   2. The booking form validates in the browser with accessible error messages. */

(function () {
  "use strict";

  var form = document.getElementById("booking-form");
  var status = document.getElementById("form-status");
  var serviceSelect = document.getElementById("service");
  var dateInput = document.getElementById("date");

  // Earliest bookable day = tomorrow (local time).
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var minDate = tomorrow.getFullYear() + "-" +
    String(tomorrow.getMonth() + 1).padStart(2, "0") + "-" +
    String(tomorrow.getDate()).padStart(2, "0");
  dateInput.min = minDate;

  // 1. Hero quick pick -> booking form
  var quick = document.querySelector(".quick-pick");
  quick.addEventListener("submit", function (event) {
    event.preventDefault();
    var choice = quick.querySelector("input[name=quick]:checked");
    if (choice) serviceSelect.value = choice.value;
    var target = document.getElementById("book");
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    // Move focus to the first empty field so keyboard users land in the form.
    document.getElementById("name").focus({ preventScroll: true });
  });

  // 2. Validation rules: each returns an error message, or "" when valid.
  var rules = {
    name: function (v) {
      if (!v.trim()) return "Enter your name so we know who to ask for.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Enter your email so we can confirm the visit.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) {
        return "This email looks incomplete. Check it has an @ and a domain, like name@example.com.";
      }
      return "";
    },
    phone: function (v) {
      if (!v.trim()) return "";
      var digits = v.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return "Enter a phone number with 7 to 15 digits, or leave it empty.";
      }
      return "";
    },
    service: function (v) {
      if (!v) return "Choose a repair, or pick “Not sure, please take a look”.";
      return "";
    },
    date: function (v) {
      if (!v) return "Choose the day you would like the visit.";
      if (v < minDate) return "Choose a day from tomorrow onwards.";
      return "";
    },
    address: function (v) {
      if (v.trim().length < 5) return "Tell us where the bike is, a street address or a landmark.";
      return "";
    },
    message: function () { return ""; }
  };

  function validateField(field) {
    var rule = rules[field.name];
    if (!rule) return true;
    var message = rule(field.value);
    var errorEl = document.getElementById(field.id + "-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
      return false;
    }
    field.removeAttribute("aria-invalid");
    if (errorEl) errorEl.textContent = "";
    return true;
  }

  // Validate a field when the user leaves it, and re-check while they fix it.
  Array.prototype.forEach.call(form.elements, function (field) {
    if (!rules[field.name]) return;
    field.addEventListener("blur", function () {
      if (field.value || field.hasAttribute("aria-invalid")) validateField(field);
    });
    field.addEventListener("input", function () {
      if (field.hasAttribute("aria-invalid")) validateField(field);
    });
  });

  form.addEventListener("submit", function (event) {
    var invalid = [];
    Array.prototype.forEach.call(form.elements, function (field) {
      if (rules[field.name] && !validateField(field)) invalid.push(field);
    });

    if (invalid.length) {
      event.preventDefault();
      status.className = "form-status is-error";
      status.textContent = invalid.length === 1
        ? "One field needs a fix before we can send your request."
        : invalid.length + " fields need a fix before we can send your request.";
      invalid[0].focus();
      return;
    }

    // Demo mode: the form has a placeholder action, so show a success message
    // instead of sending. Remove this block once a real form service is connected
    // (see README, "Connect the form").
    if (form.getAttribute("action") === "#") {
      event.preventDefault();
      status.className = "form-status is-success";
      status.textContent = "Booking request ready. This is a demo, so nothing was sent.";
      form.reset();
      status.focus();
    }
  });

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
