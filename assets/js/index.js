"use strict";

// Parse & validations
function validateNumber(value) {
  return FLOAT_REGEX.test(value);
}

function validateRadio($field) {
  return $field.matches(":has(input:checked)");
}

// Utilities
function parseNumber(string) {
  return Number(string.replaceAll(",", "").trim());
}

function withoutCharAt(string, index) {
  return string.slice(0, index) + string.slice(index + 1, string.length);
}

function clearValidation($field) {
  const $input = $field.querySelector("input");
  const $message = $field.querySelector(".mortgage-form__validation");

  $input.removeAttribute("data-invalid");
  $message.textContent = "";
}

function showValidation($field) {
  const $input = $field.querySelector("input");
  const $message = $field.querySelector(".mortgage-form__validation");

  $input.setAttribute("data-invalid", "");
  $message.textContent = "This field is required";
}

function showResult() {
  $description.setAttribute("data-hidden", "true");
  $description.setAttribute("aria-hidden", "true");
  $results.setAttribute("data-hidden", "false");
  $results.setAttribute("aria-hidden", "false");
}

function showIndication() {
  $description.setAttribute("data-hidden", "false");
  $description.setAttribute("aria-hidden", "false");
  $results.setAttribute("data-hidden", "true");
  $results.setAttribute("aria-hidden", "true");
}

// Calculations
function repayment(amount, term, rate) {
  const monthlyInterest = rate / 100 / 12;
  const payNum = term * 12;

  if (monthlyInterest === 0) {
    return {
      monthly: (amount / payNum).toFixed(2),
      total: amount
    };
  }

  const factor = Math.pow(1 + monthlyInterest, payNum);
  const monthly = (amount * (monthlyInterest * factor)) / (factor - 1);

  const total = monthly * payNum;

  // The value is rounded at the end to avoid inconsistencies in the total
  return {
    monthly: Number(monthly.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

function interestOnly(amount, term, rate) {
  const monthlyInterest = rate / 100 / 12;
  const payNum = term * 12;

  const monthly = amount * monthlyInterest;
  const total = monthly * payNum;

  return {
    monthly: Number(monthly.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

// Event handlers
function handleSubmit(e) {
  e.preventDefault();

  let hasError = false;

  // Validations
  e.target.querySelectorAll(".mortgage-form__field").forEach(($field) => {
    const $input = $field.querySelector("input");

    if ($input.getAttribute("type") === "text") {
      const value = $input.value;
      const isValid = validateNumber(value);

      if (isValid) {
        clearValidation($field);
      } else {
        showValidation($field);
        hasError = true;
      }
    }

    if ($input.getAttribute("type") === "radio") {
      const isValid = validateRadio($field);

      if (isValid) {
        clearValidation($field);
      } else {
        showValidation($field);
        hasError = true;
      }
    }
  });

  if (hasError) return;

  // Calculations
  const data = Object.fromEntries(new FormData(e.target));
  let result;

  if (data.type === TYPES.repayment) {
    result = repayment(
      parseNumber(data.amount),
      parseNumber(data.term),
      parseNumber(data.rate)
    );
  } else {
    result = interestOnly(
      parseNumber(data.amount),
      parseNumber(data.term),
      parseNumber(data.rate)
    );
  }

  $monthly.textContent = POUND_FORMAT.format(result.monthly);
  $total.textContent = POUND_FORMAT.format(result.total);

  showResult();
}

const FLOAT_REGEX = /^[0-9]+(,[0-9]+)*(\.[0-9]+)?$/;
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const POUND_FORMAT = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP"
});
const TYPES = Object.freeze({
  repayment: "repayment",
  interest: "interest"
});
const $form = document.getElementById("form");
const $description = document.querySelector(".mortgage-results__description");
const $results = document.querySelector(".mortgage-results__results");
const $monthly = document.getElementById("monthly-repayments");
const $total = document.getElementById("total-repay");

$form.addEventListener("submit", handleSubmit);
$form.addEventListener("input", (e) => {
  if (e.target.value.trim() !== "") {
    const $field = e.target.closest(".mortgage-form__field");
    clearValidation($field);
  }
});
$form.addEventListener("input", (e) => {
  if (e.target.matches('input[type="text"]')) {
    // Remove whitespace
    if (e.data === " ") {
      e.target.value = e.target.value.trim();
      return;
    }

    // Ensure it has no more than one point.
    const start = e.target.selectionStart;
    const regexDot = /^[^\.]*\.[^\.]*\.[^\.]*$/;

    if (e.data === "." && regexDot.test(e.target.value)) {
      e.target.value = withoutCharAt(e.target.value, start - 1);
      e.target.setSelectionRange(start - 1, start - 1);
      return;
    }

    // If the first point was entered, no action is performed.
    if (e.data === ".") {
      return;
    }

    // Removes letters and other characters as soon as they are entered.
    if (!FLOAT_REGEX.test(e.target.value)) {
      e.target.value = withoutCharAt(e.target.value, start - 1);
      e.target.setSelectionRange(start - 1, start - 1);
      return;
    }

    // Format upon deletion
    if (
      (e.inputType === "deleteContentBackward" ||
        e.inputType === "deleteContentForward") &&
      e.target.value.length >= 1
    ) {
      e.target.value = NUMBER_FORMAT.format(parseNumber(e.target.value));
      e.target.setSelectionRange(start, start);
      return;
    }

    // Format the input at write time.
    e.target.value = NUMBER_FORMAT.format(parseNumber(e.target.value));
  }
});
$form.addEventListener("click", (e) => {
  if (e.target.matches("#clear")) {
    showIndication();
  }
});
