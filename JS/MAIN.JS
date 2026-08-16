/* AR Akron Services — site behaviour */
(function(){
  "use strict";

  /* ---------- Sticky header on scroll ---------- */
  var header = document.querySelector(".site-header");
  var isPageHero = document.body.hasAttribute("data-solid-header");
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 40){ header.classList.add("is-scrolled"); }
    else { header.classList.remove("is-scrolled"); }
  }
  if(isPageHero && header){ header.classList.add("is-solid"); }
  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if(toggle && nav){
    toggle.addEventListener("click", function(){
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if("IntersectionObserver" in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  /* ---------- Language switching ---------- */
  var STORAGE_KEY = "ar-akron-lang";
  var originalText = {};   // key -> greek (default) text, captured once
  var originalHtml = {};

  function captureOriginal(){
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      if(!(key in originalText)){
        originalText[key] = el.textContent;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
      var key = el.getAttribute("data-i18n-placeholder");
      if(!(key in originalHtml)){
        originalHtml[key] = el.getAttribute("placeholder") || "";
      }
    });
  }

  function lookup(dict, key){
    var parts = key.split(".");
    var node = dict;
    for(var i=0;i<parts.length;i++){
      if(node && typeof node === "object" && parts[i] in node){ node = node[parts[i]]; }
      else { return null; }
    }
    return typeof node === "string" ? node : null;
  }

  function applyLang(lang){
    var dict = (window.AR_I18N && window.AR_I18N[lang]) || null;

    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      if(lang === "el" || !dict){
        el.textContent = originalText[key];
        return;
      }
      var val = lookup(dict, key);
      el.textContent = (val !== null) ? val : originalText[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
      var key = el.getAttribute("data-i18n-placeholder");
      if(lang === "el" || !dict){
        el.setAttribute("placeholder", originalHtml[key]);
        return;
      }
      var val = lookup(dict, key);
      el.setAttribute("placeholder", val !== null ? val : originalHtml[key]);
    });

    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll(".lang-switch button").forEach(function(btn){
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
  }

  captureOriginal();

  document.querySelectorAll(".lang-switch button").forEach(function(btn){
    btn.addEventListener("click", function(){
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  var savedLang = "el";
  try{ savedLang = localStorage.getItem(STORAGE_KEY) || "el"; }catch(e){}
  applyLang(savedLang);

  /* ---------- Contact form (no backend: opens mail client) ---------- */
  var form = document.getElementById("contact-form");
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = form.querySelector("#name").value.trim();
      var email = form.querySelector("#email").value.trim();
      var message = form.querySelector("#message").value.trim();
      var subject = encodeURIComponent("Νέο μήνυμα από το site — " + name);
      var body = encodeURIComponent(message + "\n\n---\n" + name + " | " + email);
      window.location.href = "mailto:akronservices@mail.com?subject=" + subject + "&body=" + body;
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

})();
