<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Nav from "$lib/Nav.svelte";
  import { currentSection, flipState } from "$lib/stores.js";

  const sections = [
    { label: "HOME", id: "hero" },
    { label: "WORK", id: "work" },
    { label: "ABOUT", id: "about" },
    { label: "CONTACT", id: "contact" },
  ];

  // solidColor = plain bg for the expanding clone
  // Each entry's solidColor MUST match the detail page's hero background exactly
  const works = [
    {
      slug: "reile",
      num: "01",
      title: "Horizon Studio",
      cat: "Brand Identity / Web Design",
      year: "2026",
      solidColor: "#7c3a1a",
      icolor: "#f97316",
    },
    {
      slug: "nova",
      num: "02",
      title: "Nova Space",
      cat: "UI/UX / Frontend",
      year: "2025",
      solidColor: "#0d1e36",
      icolor: "#60a5fa",
    },
    {
      slug: "mori",
      num: "03",
      title: "Mori Gardens",
      cat: "Web Design / Motion",
      year: "2024",
      solidColor: "#0d2010",
      icolor: "#4ade80",
    },
    {
      slug: "arc",
      num: "04",
      title: "Arc Architecture",
      cat: "Digital Presence",
      year: "2024",
      solidColor: "#1a0f2e",
      icolor: "#c084fc",
    },
  ];

  let navEl; // Nav component ref
  let cardEls = []; // each full row button
  let workSectionEl; // section 1 div

  // Pre-compute initial Y so fullpage renders at correct position BEFORE GSAP runs
  // This eliminates the flash/jump when returning from a work detail page
  let initY = "0vh";
  if (typeof sessionStorage !== "undefined") {
    try {
      if (sessionStorage.getItem("flipState")) initY = "-100vh";
    } catch (e) {}
  }

  let activeIdx = 0;
  let isScrolling = false;
  let gsap;

  // hero refs
  let heroLine, heroSub, heroTitle, heroScroll, heroSvg;

  /* ── Open work: clone row → expand fullscreen → navigate ── */
  async function openWork(slug, cardEl, solidColor, cardIdx) {
    // Ensure GSAP is loaded — it may not be on the very first interaction
    if (!gsap) {
      const m = await import("gsap");
      gsap = m.gsap;
    }
    if (!cardEl) {
      goto("/work/" + slug);
      return;
    }

    // Kill any in-progress fullpage scroll tweens so getBoundingClientRect() is accurate
    gsap.killTweensOf("#fullpage");
    // One rAF to let the DOM settle after killing tweens
    await new Promise((r) => requestAnimationFrame(r));

    // Use the card button rect for position/size (the animated box)
    const btnRect = cardEl.getBoundingClientRect();
    // Use the inner flex-row rect for content position (pixel-perfect content alignment)
    const innerRow = cardEl.querySelector("div");
    const rowRect = innerRow ? innerRow.getBoundingClientRect() : btnRect;

    // Compute padding FIRST — used in both flipState and clone
    const padTop = rowRect.top - btnRect.top;
    const padLeft = rowRect.left - btnRect.left;

    // Store cardIdx and computed padding so runReturnAnimation/goBack can target precisely
    flipState.set({
      rect: {
        left: btnRect.left,
        top: btnRect.top,
        width: btnRect.width,
        height: btnRect.height,
        padTop,
        padLeft,
      },
      solidColor,
      slug,
      cardIdx,
    });

    // Hero-row target padding (what the detail page uses) — for smooth X expansion
    // clamp(24px,6vw,96px) computed at runtime
    const targetPadH = Math.min(96, Math.max(24, window.innerWidth * 0.06));

    // Clone outer: sized like the card button, vertically centers content via flex
    const clone = document.createElement("div");
    clone.style.cssText = `
      position:fixed;
      left:${btnRect.left}px; top:${btnRect.top}px;
      width:${btnRect.width}px; height:${btnRect.height}px;
      background:var(--bg);
      z-index:9999; pointer-events:none; overflow:hidden;
      display:flex; align-items:center;
      padding:0 0;
      margin:0; box-sizing:border-box;
    `;

    // Inner row wrapper: carries horizontal padding, animated separately
    const rowWrapper = document.createElement("div");
    rowWrapper.style.cssText = `
      width:100%; display:flex; align-items:center;
      padding:0 ${padLeft}px;
      box-sizing:border-box; flex-shrink:0;
    `;

    if (innerRow) {
      const rowCopy = innerRow.cloneNode(true);
      rowCopy.style.cssText = `
        display:flex; align-items:center; gap:20px;
        width:100%; flex-shrink:0;
        padding:0; margin:0; box-sizing:border-box;
        transform:none; opacity:1;
      `;
      rowCopy.querySelectorAll("*").forEach((el) => {
        const computed = window.getComputedStyle(el);
        if (computed.color) el.style.color = computed.color;
        el.style.transform = "";
        el.style.opacity = "1";
      });
      // ── Theme-aware colour fix ──
      // Instead of hardcoding rgba(255,255,255,x) (dark-theme only), resolve the
      // actual CSS variable values from the document root at the moment of cloning.
      const cs = getComputedStyle(document.documentElement);
      const fg = cs.getPropertyValue("--fg").trim(); // e.g. #111111 or #f0ede8
      const fg2 = cs.getPropertyValue("--fg2").trim(); // e.g. #555555 or #a0a0a0
      rowCopy.querySelectorAll("h3,.row-title").forEach((el) => {
        el.style.color = fg;
      });
      rowCopy.querySelectorAll(".label").forEach((el) => {
        el.style.color = fg2;
      });
      rowWrapper.appendChild(rowCopy);
    }
    clone.appendChild(rowWrapper);
    document.body.appendChild(clone);
    window.__expandClone = clone;

    // Animate top-nav and sidebar out simultaneously
    const topNav = document.getElementById("top-nav");
    if (topNav)
      gsap.to(topNav, { y: -8, opacity: 0, duration: 0.35, ease: "expo.in" });
    navEl?.hideSidebar();

    // Expand clone to fullscreen, simultaneously animate padding to match detail page
    gsap.to(rowWrapper, {
      paddingLeft: targetPadH,
      paddingRight: targetPadH,
      duration: 0.75,
      ease: "expo.inOut",
    });
    await gsap.to(clone, {
      left: 0,
      top: 0,
      width: "100vw",
      height: "100vh",
      duration: 0.75,
      ease: "expo.inOut",
    });

    goto("/work/" + slug);
  }

  let _returnDone = false;

  /* ── Return: cards stay VISIBLE behind the shrinking clone ── */
  async function runReturnAnimation() {
    if (_returnDone) return;
    _returnDone = true;

    let state = null;
    try {
      const raw = sessionStorage.getItem("flipState");
      if (!raw) {
        _returnDone = false;
        return;
      }
      sessionStorage.removeItem("flipState");
      state = JSON.parse(raw);
    } catch (e) {
      _returnDone = false;
      return;
    }

    flipState.clear();

    // Jump to WORK section instantly — ALL cards visible behind the incoming clone
    activeIdx = 1;
    currentSection.set(1);
    const fp = document.getElementById("fullpage");
    if (fp && gsap) gsap.set(fp, { y: "-100vh" });

    // Wait two frames so DOM fully settles at the correct scroll position
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    // Read the LIVE card rect now that fullpage is positioned correctly.
    // state.cardIdx may have been updated by the work detail page's onMount (Next Project fix).
    const liveCardIdx =
      typeof state.cardIdx === "number" ? state.cardIdx : null;
    const liveCardEl = liveCardIdx !== null ? cardEls[liveCardIdx] : null;
    let liveRect = state.rect; // fallback to stored rect
    if (liveCardEl) {
      const r = liveCardEl.getBoundingClientRect();
      const liveInner = liveCardEl.querySelector("div");
      const liveRowRect = liveInner ? liveInner.getBoundingClientRect() : r;
      const livePadTop = liveRowRect.top - r.top;
      const livePadLeft = liveRowRect.left - r.left;
      liveRect = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        padTop: livePadTop,
        padLeft: livePadLeft,
      };
      state.rect = liveRect;
    }

    // ── KEY FIX: If goBack() already started a clone animation to stale coords,
    // kill it and retarget to the live card rect. ──
    // Wait 2 more frames to ensure the clone is appended to DOM by goBack()
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const existingClone = window.__returnClone;
    const existingWrapper = window.__returnRowWrapper;
    if (existingClone && gsap && liveCardEl) {
      // Kill whatever tweens are running on the clone
      gsap.killTweensOf(existingClone);
      gsap.killTweensOf(existingWrapper);
      const endPadTop = window.__returnEndPadTop ?? state.rect.padTop ?? 28;
      const cardPadLeft = window.__returnCardPadLeft ?? liveRect.padLeft ?? 0;
      // Re-fire the shrink animation to the correct live coordinates
      gsap.to(existingWrapper, {
        paddingLeft: cardPadLeft,
        paddingRight: cardPadLeft,
        duration: 0.65,
        ease: "expo.inOut",
      });
      gsap.to(existingClone, {
        left: liveRect.left,
        top: liveRect.top,
        width: liveRect.width,
        height: liveRect.height,
        paddingTop: endPadTop,
        duration: 0.65,
        ease: "expo.inOut",
        onComplete: () => {
          existingClone.remove();
          window.__returnClone = null;
        },
      });
    }

    // Animate sidebar + top-nav back in after the clone finishes shrinking (~0.75s)
    navEl?.showSidebarAnim();
    const topNav = document.getElementById("top-nav");
    if (topNav && gsap) {
      gsap.fromTo(
        topNav,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.4 },
      );
    }
  }

  /* ── Fullpage scroll ── */
  function handleWheel(e) {
    e.preventDefault();
    if (isScrolling) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(sections.length - 1, activeIdx + dir));
    if (next !== activeIdx) goToSection(next);
  }

  let touchStartY = 0;
  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }
  function handleTouchEnd(e) {
    if (isScrolling) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    const dir = dy > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(sections.length - 1, activeIdx + dir));
    if (next !== activeIdx) goToSection(next);
  }

  const sectionHashes = ["home", "work", "about", "contact"];

  function goToSection(idx, updateHash = true) {
    if (idx === activeIdx || isScrolling) return;
    isScrolling = true;
    activeIdx = idx;
    currentSection.set(idx);
    if (updateHash && typeof history !== "undefined") {
      history.replaceState(null, "", "#" + sectionHashes[idx]);
    }
    gsap?.to("#fullpage", {
      y: -(idx * 100) + "vh",
      duration: 0.9,
      ease: "expo.inOut",
      onComplete: () => {
        isScrolling = false;
      },
    });
  }

  function jumpToSection(idx) {
    // Instant jump (no animation guard) used on load
    activeIdx = idx;
    currentSection.set(idx);
    const fp = document.getElementById("fullpage");
    if (fp && gsap) gsap.set(fp, { y: -(idx * 100) + "vh" });
    isScrolling = false;
  }

  onMount(async () => {
    const m = await import("gsap");
    gsap = m.gsap;

    // Check if returning from about/contact page FIRST
    let returnSection = -1;
    try {
      const rs = sessionStorage.getItem("returnSection");
      if (rs !== null) {
        returnSection = parseInt(rs);
        sessionStorage.removeItem("returnSection");
      }
    } catch (e) {}

    // If returnSection is set (coming back from about/contact), clear any stale flipState
    // so the flip animation doesn't override where we want to land.
    if (returnSection >= 0) {
      try {
        sessionStorage.removeItem("flipState");
      } catch (e) {}
    }

    let hasFlip = false;
    try {
      hasFlip = !!sessionStorage.getItem("flipState");
    } catch (e) {}

    // Read initial hash
    const initialHash =
      typeof location !== "undefined" ? location.hash.replace("#", "") : "";
    const initialIdx = sectionHashes.indexOf(initialHash);

    // returnSection from about/contact overrides everything
    if (returnSection >= 0) {
      jumpToSection(returnSection);
    } else if (initialIdx > 0 && !hasFlip) {
      jumpToSection(initialIdx);
    }

    // Hashchange listener — user types URL hash manually
    function onHashChange() {
      const h = location.hash.replace("#", "");
      const idx = sectionHashes.indexOf(h);
      if (idx >= 0 && idx !== activeIdx) {
        isScrolling = false; // reset guard
        goToSection(idx, false); // don't re-update hash
      }
    }
    window.addEventListener("hashchange", onHashChange);

    if (hasFlip) {
      // Pre-hide sidebar and top-nav — will animate back in after reveal
      const sideNav = document.getElementById("side-nav");
      const topNav = document.getElementById("top-nav");
      if (sideNav) gsap.set(sideNav, { x: -60, opacity: 0 });
      if (topNav) gsap.set(topNav, { y: -60, opacity: 0 });
      // Hide hero text during work→home transition (we're showing WORK section)
      if (heroLine) gsap.set(heroLine, { scaleX: 0 });
      if (heroSub) gsap.set(heroSub, { opacity: 0 });
      if (heroTitle) gsap.set(heroTitle, { opacity: 0 });
      if (heroScroll) gsap.set(heroScroll, { opacity: 0 });

      await runReturnAnimation();

      // After return, optionally re-animate hero if user scrolls back
      // (already hidden, will animate when section 0 is visited)
    } else {
      // Normal hero entrance
      const tl = gsap.timeline({ delay: 0.1 });
      // Nav slides down from CSS hidden state (opacity:0, y:-60)
      const topNavEl = document.getElementById("top-nav");
      if (topNavEl)
        gsap.fromTo(
          topNavEl,
          { opacity: 0, y: -60 },
          { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", delay: 0.1 },
        );
      if (heroLine)
        tl.fromTo(
          heroLine,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: "expo.out" },
        );
      if (heroSub)
        tl.fromTo(
          heroSub,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" },
          "-=0.4",
        );
      if (heroTitle)
        tl.fromTo(
          heroTitle,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "expo.out" },
          "-=0.5",
        );
      if (heroScroll)
        tl.fromTo(
          heroScroll,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.1",
        );
    }

    // When user navigates to section 0 after returning, animate hero in
    const unsubSection = currentSection.subscribe((idx) => {
      if (idx === 0 && heroTitle) {
        const titleVisible =
          parseFloat(getComputedStyle(heroTitle).opacity) > 0.1;
        if (!titleVisible) {
          const tl = gsap.timeline({ delay: 0.1 });
          if (heroLine)
            tl.fromTo(
              heroLine,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.7, ease: "expo.out" },
            );
          if (heroSub)
            tl.fromTo(
              heroSub,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
              "-=0.3",
            );
          if (heroTitle)
            tl.fromTo(
              heroTitle,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" },
              "-=0.4",
            );
          if (heroScroll)
            tl.fromTo(
              heroScroll,
              { opacity: 0 },
              { opacity: 1, duration: 0.5 },
              "-=0.1",
            );
        }
      }
    });

    // Set initial hash if not already set
    if (!initialHash && typeof history !== "undefined") {
      history.replaceState(null, "", "#" + sectionHashes[activeIdx]);
    }

    // SVG parallax on hero
    function onMouseMove(e) {
      if (!heroSvg || activeIdx !== 0) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      gsap.to(heroSvg, {
        x: dx * 22,
        y: dy * 14,
        duration: 1.4,
        ease: "power2.out",
      });
    }
    window.addEventListener("mousemove", onMouseMove);

    const container = document.getElementById("fp-container");
    container?.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      unsubSection();
      window.removeEventListener("hashchange", onHashChange);
      container?.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", onMouseMove);
    };
  });
</script>

<svelte:head><title>TuranGe — Portfolio</title></svelte:head>

<Nav bind:this={navEl} {sections} onNavigate={goToSection} showSidebar={true} />

<div id="fp-container" style="height:100vh;overflow:hidden;position:relative;">
  <div
    id="fullpage"
    style="will-change:transform;transform:translateY({initY});"
  >
    <!-- ══ SECTION 0 · HERO ══ -->
    <section class="fp-section" style="background:var(--bg);">
      <div
        style="position:absolute;inset:0;pointer-events:none;
        background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);
        background-size:72px 72px;opacity:.5;"
      ></div>
      <!-- Ambient glows -->
      <div
        style="position:absolute;width:600px;height:600px;border-radius:50%;top:-150px;right:-80px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(100px);opacity:.07;pointer-events:none;"
      ></div>
      <div
        style="position:absolute;width:400px;height:400px;border-radius:50%;bottom:-100px;left:5%;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(80px);opacity:.06;pointer-events:none;"
      ></div>

      <div
        class="hero-grid"
        style="position:relative;z-index:10;width:100%;padding:0 clamp(24px,6vw,96px);
                  display:grid;grid-template-columns:1fr 1fr;gap:clamp(48px,8vw,120px);align-items:center;margin-left:clamp(48px,6vw,80px);box-sizing:border-box;"
      >
        <!-- LEFT: text -->
        <div style="position:relative;z-index:2;">
          <span
            bind:this={heroLine}
            style="display:block;width:48px;height:2px;background:var(--accent);margin-bottom:24px;transform-origin:left;"
          ></span>
          <p
            bind:this={heroSub}
            class="label"
            style="margin-bottom:16px;opacity:0;"
          >
            TuranGe — 2026
          </p>
          <h1
            bind:this={heroTitle}
            style="font-family:'Playfair Display',serif;font-size:clamp(3.5rem,7vw,8rem);
                   font-weight:600;line-height:1;color:var(--fg);opacity:0;margin-bottom:40px;"
          >
            DESIGN<br /><em style="color:var(--accent);">&amp;</em><br />CODE.
          </h1>
          <div
            bind:this={heroScroll}
            style="display:flex;align-items:center;gap:16px;opacity:0;"
          >
            <span
              class="label"
              style="writing-mode:vertical-rl;color:var(--fg2);"
              >SCROLL DOWN</span
            >
            <div
              style="width:1px;height:48px;background:var(--fg2);opacity:.4;"
            ></div>
          </div>
        </div>

        <!-- RIGHT: SVG with parallax -->
        <div
          bind:this={heroSvg}
          class="hero-svg-wrap"
          style="display:flex;align-items:center;justify-content:center;will-change:transform;"
        >
          <svg
            viewBox="0 0 480 480"
            width="100%"
            style="max-width:520px;"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="240"
              cy="240"
              r="220"
              stroke="var(--accent)"
              stroke-width=".6"
              opacity=".2"
            />
            <circle
              cx="240"
              cy="240"
              r="170"
              stroke="var(--accent)"
              stroke-width=".8"
              stroke-dasharray="4 8"
              opacity=".3"
            />
            <circle
              cx="240"
              cy="240"
              r="110"
              stroke="var(--accent)"
              stroke-width="1"
              opacity=".45"
            />
            <line
              x1="240"
              y1="95"
              x2="240"
              y2="385"
              stroke="var(--accent)"
              stroke-width=".6"
              opacity=".25"
            />
            <line
              x1="95"
              y1="240"
              x2="385"
              y2="240"
              stroke="var(--accent)"
              stroke-width=".6"
              opacity=".25"
            />
            <line
              x1="157"
              y1="157"
              x2="323"
              y2="323"
              stroke="var(--accent)"
              stroke-width=".5"
              opacity=".15"
            />
            <line
              x1="323"
              y1="157"
              x2="157"
              y2="323"
              stroke="var(--accent)"
              stroke-width=".5"
              opacity=".15"
            />
            <line
              x1="240"
              y1="70"
              x2="410"
              y2="240"
              stroke="var(--accent)"
              stroke-width="1.5"
              opacity=".55"
            />
            <rect
              x="226"
              y="226"
              width="28"
              height="28"
              stroke="var(--accent)"
              stroke-width="1.1"
              opacity=".65"
              transform="rotate(45 240 240)"
            />
            <circle
              cx="240"
              cy="240"
              r="40"
              fill="var(--accent)"
              opacity=".05"
            />
            <circle cx="240" cy="240" r="6" fill="var(--accent)" opacity=".7" />
            <circle cx="240" cy="240" r="2" fill="var(--fg)" opacity="1" />
            <text
              x="248"
              y="52"
              font-family="JetBrains Mono,monospace"
              font-size="9"
              fill="var(--accent)"
              opacity=".4"
              letter-spacing="2">N 48°52</text
            >
            <text
              x="396"
              y="244"
              font-family="JetBrains Mono,monospace"
              font-size="9"
              fill="var(--accent)"
              opacity=".4"
              letter-spacing="2">E 02°21</text
            >
            <circle
              cx="186"
              cy="148"
              r="2.5"
              fill="var(--accent)"
              opacity=".45"
            />
            <circle
              cx="240"
              cy="130"
              r="2"
              fill="var(--accent)"
              opacity=".35"
            />
            <circle
              cx="294"
              cy="148"
              r="2.5"
              fill="var(--accent)"
              opacity=".45"
            />
            <circle
              cx="332"
              cy="240"
              r="2.5"
              fill="var(--accent)"
              opacity=".4"
            />
          </svg>
        </div>
      </div>

      <span
        class="label"
        style="position:absolute;bottom:32px;right:clamp(24px,4vw,64px);color:var(--fg2);opacity:.45;"
        >PORTFOLIO — 2026</span
      >
    </section>

    <!-- ══ SECTION 1 · WORK ══ -->
    <section
      class="fp-section"
      bind:this={workSectionEl}
      style="background:var(--bg);align-items:flex-start;padding-top:80px;"
    >
      <!-- Ambient glows -->
      <div
        style="position:absolute;width:500px;height:500px;border-radius:50%;bottom:-80px;right:-60px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(90px);opacity:.07;pointer-events:none;"
      ></div>
      <div
        style="position:absolute;width:300px;height:300px;border-radius:50%;top:10%;left:-50px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(70px);opacity:.05;pointer-events:none;"
      ></div>
      <div
        style="width:100%;padding:0 clamp(24px,6vw,96px);overflow-y:auto;max-height:100vh;padding-bottom:40px;"
      >
        <div style="max-width:1100px;margin:0 auto;">
          <div style="margin-bottom:40px;">
            <p class="label" style="margin-bottom:10px;">01 — SELECTED WORKS</p>
            <h2
              style="font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,4rem);
                       font-weight:600;line-height:1;color:var(--fg);"
            >
              Recent <em style="color:var(--accent);">Projects</em>
            </h2>
          </div>

          {#each works as w, i}
            <button
              bind:this={cardEls[i]}
              on:click={() => openWork(w.slug, cardEls[i], w.solidColor, i)}
              class="work-row-btn"
              style="display:block;width:100%;text-align:left;background:none;border:none;
                     cursor:pointer;border-top:1px solid var(--border);padding:28px 0;"
            >
              <div style="display:flex;align-items:center;gap:20px;">
                <span
                  class="label"
                  style="width:32px;flex-shrink:0;color:var(--fg2);"
                  >{w.num}</span
                >

                <div
                  style="width:96px;height:64px;border-radius:6px;overflow:hidden;flex-shrink:0;
                            background:{w.solidColor};transition:transform .5s cubic-bezier(.23,1,.32,1);"
                  class="card-thumb"
                >
                  <div
                    style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"
                  >
                    <span style="font-size:1.4rem;opacity:.8;color:{w.icolor};"
                      >◆</span
                    >
                  </div>
                </div>

                <div style="flex:1;">
                  <h3
                    class="row-title"
                    style="font-family:'Playfair Display',serif;font-size:clamp(1.3rem,3vw,2.4rem);
                           font-weight:600;color:var(--fg);margin-bottom:4px;transition:color .35s;"
                  >
                    {w.title}
                  </h3>
                  <p class="label" style="color:var(--fg2);">
                    {w.cat} — {w.year}
                  </p>
                </div>

                <span
                  class="row-arrow"
                  style="color:{w.icolor};font-size:1.4rem;flex-shrink:0;transition:transform .35s;"
                  >→</span
                >
              </div>

              <div
                style="height:1px;margin-top:28px;position:relative;overflow:hidden;background:var(--border);"
              >
                <div
                  class="hover-line"
                  style="position:absolute;inset-y:0;left:0;width:0;background:{w.solidColor};transition:width .65s ease;"
                ></div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ SECTION 2 · ABOUT ══ -->
    <section class="fp-section" style="background:var(--bg);">
      <!-- Ambient glows -->
      <div
        style="position:absolute;width:550px;height:550px;border-radius:50%;top:-120px;left:-100px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(90px);opacity:.07;pointer-events:none;"
      ></div>
      <div
        style="position:absolute;width:350px;height:350px;border-radius:50%;bottom:-60px;right:10%;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(75px);opacity:.06;pointer-events:none;"
      ></div>
      <div style="width:100%;padding:0 clamp(24px,6vw,96px);">
        <div
          class="about-layout"
          style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;
                    gap:clamp(48px,6vw,96px);align-items:center;"
        >
          <div>
            <p class="label" style="margin-bottom:16px;">02 — ABOUT ME</p>
            <h2
              style="font-family:'Playfair Display',serif;font-size:clamp(2.5rem,6vw,5rem);
                       font-weight:600;line-height:1.1;margin-bottom:28px;color:var(--fg);"
            >
              Crafting<br /><em style="color:var(--accent);">experiences</em><br
              />that matter.
            </h2>
            <p
              style="color:var(--fg2);line-height:1.85;max-width:420px;margin-bottom:28px;"
            >
              I'm a creative developer passionate about the intersection of
              design and technology.
            </p>
            <a
              href="/about"
              class="label"
              style="display:inline-flex;align-items:center;gap:12px;color:var(--accent);text-decoration:none;"
              on:click|preventDefault={() => {
                try {
                  sessionStorage.setItem("fromSection", String(activeIdx));
                } catch (e) {}
                goto("/about");
              }}
            >
              <span
                style="display:block;width:40px;height:2px;background:var(--accent);"
              ></span>
              LEARN MORE →
            </a>
          </div>
          <div
            class="stats-grid"
            style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"
          >
            {#each [{ n: "5+", l: "Years Experience" }, { n: "30+", l: "Projects Delivered" }, { n: "12+", l: "Happy Clients" }, { n: "∞", l: "Cups of Coffee" }] as s}
              <div
                class="glow-card"
                style="padding:24px;border:1px solid var(--border);background:var(--surface);border-radius:4px;"
              >
                <p
                  style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:600;color:var(--accent);margin-bottom:4px;"
                >
                  {s.n}
                </p>
                <p class="label" style="color:var(--fg2);">{s.l}</p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ══ SECTION 3 · CONTACT ══ -->
    <section class="fp-section" style="background:var(--bg);">
      <div
        class="float"
        style="position:absolute;width:500px;height:500px;border-radius:50%;
        left:-100px;bottom:-100px;background:radial-gradient(circle,var(--accent) 0%,transparent 70%);
        filter:blur(80px);opacity:.12;pointer-events:none;"
      ></div>
      <div
        style="position:relative;z-index:10;width:100%;padding:0 clamp(24px,6vw,96px);text-align:center;"
      >
        <p class="label" style="margin-bottom:16px;">03 — CONTACT</p>
        <h2
          style="font-family:'Playfair Display',serif;font-size:clamp(3rem,8vw,7rem);
                   font-weight:600;line-height:1.05;margin-bottom:28px;color:var(--fg);"
        >
          Let's create<br />something
          <em style="color:var(--accent);">great.</em>
        </h2>
        <p style="color:var(--fg2);font-size:1.1rem;margin-bottom:40px;">
          Have a project in mind? I'd love to hear about it.
        </p>
        <a
          href="/contact"
          class="label cta-btn"
          style="display:inline-flex;align-items:center;gap:16px;padding:14px 40px;
                 border:1.5px solid var(--accent);color:var(--accent);text-decoration:none;
                 transition:background .35s,color .35s;"
          on:click|preventDefault={() => {
            try {
              sessionStorage.setItem("fromSection", String(activeIdx));
            } catch (e) {}
            goto("/contact");
          }}
        >
          GET IN TOUCH <span>→</span>
        </a>
        <div
          style="display:flex;justify-content:center;gap:32px;margin-top:56px;"
        >
          {#each [{ name: "TWITTER", url: "https://twitter.com" }, { name: "GITHUB", url: "https://github.com" }, { name: "DRIBBBLE", url: "https://dribbble.com" }] as s}
            <a
              href={s.url}
              class="label"
              style="color:var(--fg2);opacity:.6;text-decoration:none;transition:opacity .2s;"
              onmouseenter="this.style.opacity=1"
              onmouseleave="this.style.opacity=.6">{s.name}</a
            >
          {/each}
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .label {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .fp-section {
    height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
  }
  .work-row-btn:hover .row-title {
    color: var(--accent);
  }
  .work-row-btn:hover .row-arrow {
    transform: translateX(8px);
  }
  .work-row-btn:hover .hover-line {
    width: 100% !important;
  }
  .work-row-btn:hover .card-thumb {
    transform: scale(1.05);
  }
  .cta-btn:hover {
    background: var(--accent) !important;
    color: var(--bg) !important;
  }
  .glow-card {
    transition:
      border-color 0.35s,
      box-shadow 0.35s;
  }
  .glow-card:hover {
    border-color: var(--accent) !important;
    box-shadow:
      0 0 18px -4px var(--accent),
      0 0 40px -12px var(--accent);
  }
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-14px);
    }
  }
  .float {
    animation: float 7s ease-in-out infinite;
  }
  @media (max-width: 640px) {
    .fp-section {
      align-items: flex-start !important;
      padding-top: 80px !important;
    }
  }
  @media (max-width: 768px) {
    .about-layout {
      grid-template-columns: 1fr !important;
      gap: clamp(32px, 6vw, 48px) !important;
    }
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
    }
    /* Hero: stack vertically — text on top, SVG below */
    .hero-grid {
      grid-template-columns: 1fr !important;
      grid-template-rows: auto auto !important;
      position: relative !important;
      margin-left: 0 !important;
      padding-top: clamp(24px, 6vw, 48px) !important;
    }
    .hero-grid > div:first-child {
      grid-row: 1 !important;
      z-index: 2 !important;
      position: relative !important;
    }
    .hero-svg-wrap {
      grid-row: 2 !important;
      position: relative !important;
      z-index: 1 !important;
      opacity: 1 !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-top: 16px !important;
    }
    .hero-svg-wrap svg {
      width: 80% !important;
      max-width: 320px !important;
    }
  }
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .glow-card {
      padding: 18px !important;
    }
  }
</style>
