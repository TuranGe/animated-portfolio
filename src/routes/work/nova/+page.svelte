<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Nav from "$lib/Nav.svelte";

  const sections = [
    { label: "HOME", id: "hero" },
    { label: "WORK", id: "work" },
    { label: "ABOUT", id: "about" },
    { label: "CONTACT", id: "contact" },
  ];

  const HERO_BG = "#0d1e36";
  const ACCENT_CLR = "#60a5fa";

  const project = {
    num: "02",
    title: "Nova Space",
    category: "UI/UX / Frontend",
    year: "2025",
    overview: `A carefully crafted digital experience pushing the boundaries of interaction and visual storytelling.`,
    project: `A carefully crafted digital experience for a forward-thinking client, exploring new interaction paradigms while maintaining visual coherence.`,
    approach: `Purposeful motion, typographic hierarchy, and deep respect for the user's attention and time guided every decision.`,
  };

  let navEl, pageEl, scrollerEl, heroEl, gsap;
  let leaving = false;

  async function goNext(href) {
    if (leaving) return;
    leaving = true;
    if (!gsap) {
      const m = await import("gsap");
      gsap = m.gsap;
    }
    await gsap.to(pageEl, {
      x: "-100%",
      opacity: 0,
      duration: 0.45,
      ease: "expo.inOut",
    });
    goto(href);
  }

  async function goBack() {
    if (leaving) return;
    leaving = true;
    if (!gsap) {
      const m = await import("gsap");
      gsap = m.gsap;
    }

    let state = null;
    try {
      const raw = sessionStorage.getItem("flipState");
      if (raw) state = JSON.parse(raw);
    } catch (e) {}
    if (!state) {
      goto("/");
      return;
    }

    // ── Symmetric exit: mirror of onMount entry animations ──
    // Scroll to top first so hero is fully visible for the shrink animation
    if (scrollerEl && scrollerEl.scrollTop > 0) {
      await gsap.to(scrollerEl, {
        scrollTop: 0,
        duration: 0.35,
        ease: "expo.inOut",
      });
    }

    const topNav = document.getElementById("top-nav");
    const bodyContent = pageEl.querySelector(".page-body");
    const passiveEls = pageEl.querySelectorAll(".hero-fade, .scroll-hint");

    // Fire all exit animations simultaneously — durations mirror onMount entry exactly
    if (topNav)
      gsap.to(topNav, { y: -60, opacity: 0, duration: 0.85, ease: "expo.in" });
    if (bodyContent)
      gsap.to(bodyContent, { opacity: 0, duration: 1.0, ease: "power2.in" });
    gsap.to(passiveEls, { opacity: 0, duration: 1.1, ease: "power2.in" });
    // Fade out ambient glows
    pageEl.querySelectorAll(".hero-glow").forEach((el) => {
      el.style.transition = "opacity 0.6s ease";
      el.style.opacity = "0";
    });
    await navEl?.hideBackAnim();

    // Use the hero section rect as the animated box (start of shrink animation)
    const heroRect = heroEl.getBoundingClientRect();
    // Use the inner flex-row rect for pixel-perfect content alignment
    const heroRow = heroEl.querySelector(".hero-row");
    const heroRowInner = heroRow ? heroRow.querySelector("div") : null;
    const rowRect = heroRowInner
      ? heroRowInner.getBoundingClientRect()
      : heroRect;

    // Hero padding (horizontal only — vertical centering via flex on clone)
    const padLeft = rowRect.left - heroRect.left;
    // Card target padding (horizontal)
    const cardPadLeft = state.rect.padLeft ?? 0;

    // Vertical: use padding-top so content position is explicit and animatable.
    // Start: vertically center the row inside the hero (same as hero's align-items:center).
    const heroH = heroRect.height;
    const rowH = rowRect.height;
    const startPadTop = Math.max(0, (heroH - rowH) / 2);
    // End: card's computed padTop (distance from card top to inner row top)
    const endPadTop = state.rect.padTop ?? 28;

    // Clone: full hero section, padding-based vertical alignment (no flex centering)
    const clone = document.createElement("div");
    clone.style.cssText = `
      position:fixed;
      left:${heroRect.left}px; top:${heroRect.top}px;
      width:${heroRect.width}px; height:${heroRect.height}px;
      background:var(--bg); z-index:9999; pointer-events:none; overflow:hidden;
      display:block;
      padding:${startPadTop}px 0 0 0; margin:0; box-sizing:border-box;
    `;

    // Row wrapper carries horizontal padding — animated to card's padLeft
    const rowWrapper = document.createElement("div");
    rowWrapper.style.cssText = `
      width:100%; display:flex; align-items:center;
      padding:0 ${padLeft}px;
      box-sizing:border-box; flex-shrink:0;
    `;

    // Clone the INNER flex div (not the .hero-row wrapper) so flex layout is preserved:
    // the inner div IS the flex container with gap:20px and flex:1 on title → arrow stays right.
    const sourceRow = heroRowInner || heroRow;
    if (sourceRow) {
      const rowCopy = sourceRow.cloneNode(true);
      // Preserve the flex container exactly — only reset GSAP artifacts
      rowCopy.style.width = "100%";
      rowCopy.style.flexShrink = "0";
      rowCopy.style.padding = "0";
      rowCopy.style.margin = "0";
      rowCopy.style.boxSizing = "border-box";
      rowCopy.style.transform = "";
      rowCopy.style.opacity = "1";
      rowCopy.querySelectorAll("*").forEach((el) => {
        const c = window.getComputedStyle(el);
        if (c.color) el.style.color = c.color;
        el.style.transform = "";
        el.style.opacity = "1";
      });
      // ── Theme-aware colour fix: override hardcoded whites with live CSS vars ──
      const _cs = getComputedStyle(document.documentElement);
      const _fg = _cs.getPropertyValue("--fg").trim();
      const _fg2 = _cs.getPropertyValue("--fg2").trim();
      rowCopy.querySelectorAll("h1,h2,h3").forEach((el) => {
        el.style.color = _fg;
      });
      rowCopy.querySelectorAll(".label").forEach((el) => {
        el.style.color = _fg2;
      });
      rowWrapper.appendChild(rowCopy);
    }
    clone.appendChild(rowWrapper);
    document.body.appendChild(clone);
    heroEl.style.visibility = "hidden";

    // Expose clone + rowWrapper globally so runReturnAnimation() on the home page
    // can kill the tween and redirect to the live card rect (fixes Next Project stale ref).
    window.__returnClone = clone;
    window.__returnRowWrapper = rowWrapper;
    window.__returnEndPadTop = endPadTop;
    window.__returnCardPadLeft = cardPadLeft;

    goto("/");

    // Shrink: animate size, position, and both axes of padding simultaneously.
    // runReturnAnimation() may kill & restart these tweens with corrected coordinates.
    gsap.to(rowWrapper, {
      paddingLeft: cardPadLeft,
      paddingRight: cardPadLeft,
      duration: 0.75,
      ease: "expo.inOut",
    });
    await gsap.to(clone, {
      left: state.rect.left,
      top: state.rect.top,
      width: state.rect.width,
      height: state.rect.height,
      paddingTop: endPadTop,
      duration: 0.75,
      ease: "expo.inOut",
    });
    clone.remove();
    window.__returnClone = null;
    window.__returnRowWrapper = null;
  }

  onMount(async () => {
    // Remove the fullscreen expand clone immediately so page animations are visible
    let navigatingExpandClone = false;
    if (typeof window !== "undefined" && window.__expandClone) {
      window.__expandClone.remove();
      window.__expandClone = null;
      navigatingExpandClone = true;
    }
    const m = await import("gsap");
    const st = await import("gsap/ScrollTrigger");
    gsap = m.gsap;
    gsap.registerPlugin(st.ScrollTrigger);
    scrollerEl = pageEl;
    // Fix: update flipState.cardIdx to match THIS page's card,
    // so goBack always shrinks to the correct card (handles Next Project nav)
    try {
      const raw = sessionStorage.getItem("flipState");
      if (raw) {
        const fs = JSON.parse(raw);
        fs.cardIdx = 1;
        fs.slug = "nova";
        fs.solidColor = "#0d1e36";
        sessionStorage.setItem("flipState", JSON.stringify(fs));
      }
    } catch (e) {}

    const topNav = document.getElementById("top-nav");

    if (topNav) gsap.set(topNav, { opacity: 0, y: -60 });
    const passiveEls = pageEl.querySelectorAll(".hero-fade, .scroll-hint");
    gsap.set(passiveEls, { opacity: 0 });
    const bodyEl = pageEl.querySelector(".page-body");
    if (bodyEl) gsap.set(bodyEl, { opacity: 0 });
    // Slide-in only when coming from another project (no expand clone)
    const fromNext = !window.__expandClone;
    if (!navigatingExpandClone) gsap.set(pageEl, { x: "6%", opacity: 0 });

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    if (topNav) {
      gsap.fromTo(
        topNav,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", delay: 0.05 },
      );
    }
    navEl?.showBackAnim();
    if (fromNext)
      gsap.to(pageEl, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "expo.out",
        delay: 0.05,
      });
    gsap.to(passiveEls, {
      opacity: 1,
      duration: 1.1,
      ease: "power2.out",
      delay: 0.5,
    });
    if (bodyEl) {
      gsap.to(bodyEl, {
        opacity: 1,
        duration: 1.0,
        ease: "power2.out",
        delay: 0.35,
      });
    }

    const revealEls = gsap.utils.toArray(".reveal");
    revealEls.forEach((el, i) => {
      const isLast = i === revealEls.length - 1;
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: isLast ? "top bottom" : "top 88%",
            scroller: pageEl,
          },
        },
      );
    });

    // Fade in ambient glows
    requestAnimationFrame(() => {
      const glows = pageEl.querySelectorAll(".hero-glow");
      glows[0] && (glows[0].style.opacity = "0.16");
      glows[1] && (glows[1].style.opacity = "0.13");
      glows[2] && (glows[2].style.opacity = "0.10");
    });
  });
</script>

<svelte:head><title>{project.title} — Portfolio</title></svelte:head>
<Nav
  bind:this={navEl}
  {sections}
  subPage={true}
  showSidebar={false}
  onBack={goBack}
  onNavigate={() => goBack()}
/>

<div
  bind:this={pageEl}
  class="page-scroll"
  style="position:fixed;inset:0;background:var(--bg);overflow-y:auto;z-index:100;"
>
  <div
    bind:this={heroEl}
    style="width:100%;height:100vh;position:relative;overflow:hidden;
           display:flex;align-items:center;flex-shrink:0;"
  >
    <div
      class="hero-row"
      style="width:100%;padding:0 clamp(24px,6vw,96px);box-sizing:border-box;"
    >
      <div style="display:flex;align-items:center;gap:20px;">
        <span
          class="label"
          style="width:32px;flex-shrink:0;color:rgba(255,255,255,.45);">02</span
        >
        <div
          style="width:96px;height:64px;border-radius:6px;overflow:hidden;flex-shrink:0;
                    background:{HERO_BG};display:flex;align-items:center;justify-content:center;"
        >
          <span style="font-size:1.4rem;opacity:.8;color:#60a5fa;">◆</span>
        </div>
        <div style="flex:1;">
          <h1
            style="font-family:'Playfair Display',serif;font-size:clamp(1.3rem,3vw,2.4rem);
                     font-weight:600;color:rgba(255,255,255,.92);margin-bottom:4px;"
          >
            {project.title}
          </h1>
          <p class="label" style="color:rgba(255,255,255,.4);">
            {project.category} — {project.year}
          </p>
        </div>
        <span style="color:{ACCENT_CLR};font-size:1.4rem;flex-shrink:0;">→</span
        >
      </div>
    </div>

    <div
      class="scroll-hint"
      style="position:absolute;bottom:36px;left:50%;transform:translateX(-50%);
                display:flex;flex-direction:column;align-items:center;gap:12px;"
    >
      <p
        class="label scroll-hint-text"
        style="color:rgba(255,255,255,.65);letter-spacing:.22em;"
      >
        SCROLL
      </p>
      <div
        class="scroll-line"
        style="width:1.5px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,.5),transparent);"
      ></div>
    </div>

    <!-- Ambient glow orbs — fade in on mount -->
    <div
      class="hero-glow hero-glow-1"
      style="position:absolute;width:700px;height:700px;border-radius:50%;top:-200px;right:-60px;background:radial-gradient(circle,#60a5fa 0%,transparent 65%);filter:blur(90px);opacity:0;pointer-events:none;transition:opacity 2.0s ease;"
    ></div>
    <div
      class="hero-glow hero-glow-2"
      style="position:absolute;width:500px;height:500px;border-radius:50%;bottom:-100px;left:-80px;background:radial-gradient(circle,#60a5fa 0%,transparent 65%);filter:blur(80px);opacity:0;pointer-events:none;transition:opacity 2.4s ease 0.5s;"
    ></div>
    <div
      class="hero-glow hero-glow-3"
      style="position:absolute;width:300px;height:300px;border-radius:50%;top:35%;right:28%;background:radial-gradient(circle,#60a5fa 0%,transparent 65%);filter:blur(65px);opacity:0;pointer-events:none;transition:opacity 2.2s ease 1.0s;"
    ></div>

    <div
      class="hero-fade"
      style="position:absolute;bottom:0;left:0;right:0;height:200px;
                background:linear-gradient(to bottom,transparent,var(--bg));pointer-events:none;"
    ></div>
  </div>

  <div
    class="page-body"
    style="padding:80px clamp(24px,6vw,96px) 120px;max-width:1100px;margin:0 auto;"
  >
    <div class="reveal" style="margin-bottom:48px;">
      <p class="label" style="margin-bottom:14px;color:#60a5fa;">
        {project.num} — {project.category}
      </p>
      <h2
        style="font-family:'Playfair Display',serif;font-size:clamp(3rem,9vw,8rem);
                 font-weight:600;line-height:.95;color:var(--fg);margin-bottom:40px;"
      >
        {project.title}
      </h2>
      <p
        style="color:var(--fg2);max-width:620px;line-height:1.85;font-size:1.05rem;"
      >
        {project.overview}
      </p>
    </div>
    <div
      class="reveal"
      style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-bottom:80px;"
    >
      <div>
        <p class="label" style="margin-bottom:16px;">THE PROJECT</p>
        <p style="color:var(--fg2);line-height:1.85;">
          {project.project}
        </p>
      </div>
      <div>
        <p class="label" style="margin-bottom:16px;">OUR APPROACH</p>
        <p style="color:var(--fg2);line-height:1.85;">
          {project.approach}
        </p>
      </div>
    </div>
    <div
      class="reveal"
      style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:80px;"
    >
      {#each Array(6) as _, i}
        <div
          style="aspect-ratio:4/3;border-radius:6px;border:1px solid var(--border);
                    background:linear-gradient(135deg,var(--bg2),var(--bg));overflow:hidden;"
        >
          <div
            style="width:100%;height:100%;display:flex;align-items:flex-end;padding:14px;"
          >
            <div>
              <div
                style="height:6px;width:55%;border-radius:2px;margin-bottom:5px;background:#60a5fa;opacity:.3;"
              ></div>
              <div
                style="height:5px;width:38%;border-radius:2px;background:rgba(255,255,255,.06);"
              ></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div
      class="reveal"
      style="display:flex;justify-content:space-between;align-items:center;
                                padding-top:40px;border-top:1px solid var(--border);"
    >
      <button
        on:click={goBack}
        style="display:flex;align-items:center;gap:12px;background:none;border:none;cursor:pointer;color:var(--fg2);transition:color .3s;"
        onmouseenter="this.style.color='var(--accent)'"
        onmouseleave="this.style.color='var(--fg2)'"
      >
        <span>←</span><span class="label">ALL WORK</span>
      </button>
      <a
        href="/work/mori"
        class="label"
        on:click|preventDefault={() => goNext("/work/mori")}
        style="display:flex;align-items:center;gap:12px;color:var(--fg2);text-decoration:none;transition:color .3s;"
        onmouseenter="this.style.color='var(--accent)'"
        onmouseleave="this.style.color='var(--fg2)'"
      >
        NEXT <span>→</span>
      </a>
    </div>
  </div>
</div>

<style>
  .label {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .reveal {
    opacity: 0;
  }

  .hero-glow {
    will-change: opacity;
  }
  .scroll-hint-text {
    animation: scrollPulse 2.4s ease-in-out infinite;
  }
  @keyframes scrollPulse {
    0%,
    100% {
      opacity: 0.65;
    }
    50% {
      opacity: 0.25;
    }
  }
  .scroll-line {
    animation: scrollDrop 2.4s ease-in-out infinite;
  }
  @keyframes scrollDrop {
    0%,
    100% {
      transform: scaleY(1);
      transform-origin: top;
    }
    50% {
      transform: scaleY(0.6);
    }
  }
</style>
