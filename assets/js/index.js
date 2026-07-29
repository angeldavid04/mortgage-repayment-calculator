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

function handleSubmit(e) {
  e.preventDefault();

  e.target.querySelectorAll(".mortgage-form__field").forEach(($field) => {
    const $input = $field.querySelector("input");
    const $message = $field.querySelector(".mortgage-form__validation");

    if ($input.getAttribute("type") === "text") {
      const isValid = validateNumber($input.value);

      if (isValid) {
        clearValidation($field);
      } else {
        showValidation($field);
      }
    }

    if ($input.getAttribute("type") === "radio") {
      const isValid = validateRadio($field);

      if (isValid) {
        clearValidation($field);
      } else {
        showValidation($field);
      }
    }
  });
}

const $form = document.getElementById("form");

$form.addEventListener("submit", handleSubmit);
$form.addEventListener("input", (e) => {
  if (e.target.value.trim() !== "") {
    const $field = e.target.closest(".mortgage-form__field");
    clearValidation($field);
  }
});
