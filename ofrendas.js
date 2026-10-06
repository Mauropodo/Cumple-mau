const giftCards = [...document.querySelectorAll(".gift-card")];
const selection = document.querySelector("#offerings-selection");
const selectedAmount = document.querySelector("#selected-amount");

giftCards.forEach((card) => {
  const button = card.querySelector(".gift-card__select");

  button.addEventListener("click", () => {
    const alreadySelected = card.classList.contains("is-selected");

    giftCards.forEach((gift) => {
      gift.classList.remove("is-selected");
      const control = gift.querySelector(".gift-card__select");
      control.setAttribute("aria-pressed", "false");
      control.textContent = "Seleccionar";
    });

    if (alreadySelected) {
      selection.hidden = true;
      selectedAmount.textContent = "";
      return;
    }

    card.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    button.textContent = "Seleccionado";
    selectedAmount.textContent = `CLP $${Number(card.dataset.amount).toLocaleString("es-CL")}`;
    selection.hidden = false;
  });
});
