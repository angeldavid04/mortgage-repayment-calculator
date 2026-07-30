function validateNumber(value) {
  const regex = /^[0-9]+([.,][0-9]+)?$/;
  return regex.test(value);
}

function validateRadio($field) {
  return $field.matches(":has(input:checked)");
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

function handleSubmit(e) {
  e.preventDefault();

  let hasError = false;

  // Validations
  e.target.querySelectorAll(".mortgage-form__field").forEach(($field) => {
    const $input = $field.querySelector("input");
    const $message = $field.querySelector(".mortgage-form__validation");

    if ($input.getAttribute("type") === "text") {
      const isValid = validateNumber($input.value);

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
  console.log(data);
  console.log(repayment(data.amount, data.term, data.rate));
}

const $form = document.getElementById("form");

$form.addEventListener("submit", handleSubmit);
$form.addEventListener("input", (e) => {
  if (e.target.value.trim() !== "") {
    const $field = e.target.closest(".mortgage-form__field");
    clearValidation($field);
  }
});
