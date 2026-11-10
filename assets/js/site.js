/* 本文・リンク・画像はJavaScriptなしでも閲覧できます（動画はポスター画像で表示）。 */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- ループ動画：画面に入ったら読み込み・再生、出たら停止 ----
  const videos = document.querySelectorAll("video.lazy-video");
  const load = (v) => {
    if (v.dataset.loaded) return;
    v.src = v.dataset.src;
    v.dataset.loaded = "1";
  };
  if (reduceMotion) {
    // 動きを減らす設定では自動再生せず、操作で再生できるようにする
    videos.forEach((v) => { v.controls = true; v.preload = "none"; v.src = v.dataset.src; });
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          load(v);
          v.play().catch(() => { v.controls = true; });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.15 });
    videos.forEach((v) => io.observe(v));
  } else {
    videos.forEach((v) => { load(v); v.autoplay = true; });
  }

  // ---- スクロールで表示 ----
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".section-head, .feature-title, .tech-title");
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); ro.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    targets.forEach((t) => {
      if (t.closest(".hero")) return;
      t.classList.add("reveal");
      ro.observe(t);
    });
  }

  // ---- 画像の拡大表示（dialog非対応時は通常リンク） ----
  const dialog = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  if (!dialog || typeof dialog.showModal !== "function") return;
  let lastFocus = null;
  document.querySelectorAll("[data-lightbox]").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      lastFocus = link;
      img.src = link.href;
      img.alt = link.querySelector("img")?.alt || "";
      caption.textContent = link.dataset.caption || img.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog || e.target === img) dialog.close(); });
  dialog.addEventListener("close", () => {
    img.removeAttribute("src");
    lastFocus?.focus({ preventScroll: true });
  });
})();
