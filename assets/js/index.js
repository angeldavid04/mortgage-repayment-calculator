// Parse & validations
function validateNumber(value) {
  return FLOAT_REGEX.test(value);
}

function validateRadio($field) {
  return $field.matches(":has(input:checked)");
}

function parseNumber(string) {
  return Number(string.replaceAll(",", "").trim());
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

// Calculations
function repayment(amount, term, rate) {
  const payment = { monthly: 0, total: 0 };
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
    monthly: monthly.toFixed(2),
    total: total.toFixed(2)
  };
}

// Event handlers
function handleSubmit(e) {
  e.preventDefault();

  let hasError = false;

  // Validations
  e.target.querySelectorAll(".mortgage-form__field").forEach(($field) => {
    const $input = $field.querySelector("input");
    const $message = $field.querySelector(".mortgage-form__validation");

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

  if ((data.type = TYPES.repayment)) {
    console.log(
      repayment(
        parseNumber(data.amount),
        parseNumber(data.term),
        parseNumber(data.rate)
      )
    );
  } else {
    console.log("Interest Only");
  }
}

const FLOAT_REGEX = /^[0-9]+(,[0-9]+)*(\.[0-9]+)?$/;
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const TYPES = Object.freeze({
  repayment: "repayment",
  interest: "interest"
});
const $form = document.getElementById("form");

$form.addEventListener("submit", handleSubmit);
$form.addEventListener("input", (e) => {
  if (e.target.value.trim() !== "") {
    const $field = e.target.closest(".mortgage-form__field");
    clearValidation($field);
  }
});

$form.addEventListener("input", (e) => {
  if (e.target.matches('input[type="text"]')) {
    // Quita espacios en blanco
    if (e.data === " ") {
      e.target.value = e.target.value.trim();
      return;
    }

    // Asegura que no tenga más de un punto
    const start = e.target.selectionStart;
    const regexDot = /^[^\.]*\.[^\.]*\.[^\.]*$/;

    if (e.data === "." && regexDot.test(e.target.value)) {
      e.target.value =
        e.target.value.slice(0, start - 1) +
        e.target.value.slice(start, e.target.value.length);
      e.target.setSelectionRange(start - 1, start - 1);
      return;
    }

    // Si ingresa el primer punto, no se hace nada
    if (e.data === ".") {
      return;
    }

    // Elimina las letras y otros caracteres en cuanto se ingresan
    if (!FLOAT_REGEX.test(e.target.value)) {
      e.target.value =
        e.target.value.slice(0, start - 1) +
        e.target.value.slice(start, e.target.value.length);
      e.target.setSelectionRange(start - 1, start - 1);
      return;
    }

    // Formatea al eliminar
    if (
      (e.inputType === "deleteContentBackward" ||
        e.inputType === "deleteContentForward") &&
      e.target.value.length >= 1
    ) {
      const value = e.target.value;

      e.target.value = NUMBER_FORMAT.format(parseNumber(value));
      e.target.setSelectionRange(start, start);
      return;
    }

    // Formatea la entrada en tiempo de escritura
    const value = e.target.value;
    e.target.value = NUMBER_FORMAT.format(parseNumber(value));
  }
});
