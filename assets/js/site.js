/* Progressive enhancement: 本文・リンク・detailsはJavaScriptなしでも利用できます。 */
(() => {
  "use strict";

  // 作品画面の切り替え。利用できる場合だけ切り替えボタンを表示します。
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const link = gallery.querySelector(".gallery-main");
    const image = link?.querySelector("img");
    const choices = gallery.querySelector(".gallery-choices");
    const status = gallery.querySelector("[data-gallery-status]");
    if (!link || !image || !choices) return;
    choices.hidden = false;
    choices.querySelectorAll("button[data-src]").forEach((button) => {
      button.addEventListener("click", () => {
        const src = button.dataset.src;
        if (!src) return;
        choices.querySelectorAll("button").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
        image.src = src;
        image.alt = button.dataset.alt || "ゲームの画面";
        link.href = src;
        link.dataset.caption = button.dataset.caption || image.alt;
        link.setAttribute("aria-label", `${button.textContent.trim()}の画面を拡大`);
        if (status) status.textContent = `${button.textContent.trim()}の画面に切り替えました。`;
      });
    });
  });

  // ネイティブdialogのフォーカス制御・Escキー処理を利用。
  // 非対応ブラウザーでは画像への通常リンクとして機能します。
  const dialog = document.getElementById("image-dialog");
  const dialogImage = document.getElementById("dialog-image");
  const caption = document.getElementById("dialog-caption");
  const closeButton = dialog?.querySelector(".dialog-close");
  if (dialog && dialogImage && caption && closeButton && typeof dialog.showModal === "function") {
    let previousFocus = null;
    document.querySelectorAll("[data-lightbox]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        previousFocus = link;
        dialogImage.src = link.href;
        dialogImage.alt = link.querySelector("img")?.alt || "ゲームの画面";
        caption.textContent = link.dataset.caption || dialogImage.alt;
        dialog.showModal();
        document.body.classList.add("has-dialog");
      });
    });
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const isOutside = event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
      if (event.target === dialog && isOutside) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("has-dialog");
      dialogImage.removeAttribute("src");
      previousFocus?.focus({ preventScroll: true });
    });
  }
})();
