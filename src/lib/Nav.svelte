<script>
  import { currentSection, theme } from "$lib/stores.js";
  import { onMount } from "svelte";

  export let sections = [];
  export let onNavigate = () => {};
  export let onBack = null; // fn → back button visible
  export let showSidebar = true;
  export let subPage = false; // true on /work/*, /about, /contact

  let mobileOpen = false;
  let gsap;
  let sideNavEl, backBtnEl, navLinksEl, topNavEl;

  // Promise that resolves once GSAP is loaded and initial state is set
  let _gsapReady;
  let _resolveGsap;
  _gsapReady = new Promise((r) => {
    _resolveGsap = r;
  });

  function applyTheme(next) {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", next);
    if (typeof localStorage !== "undefined")
      localStorage.setItem("kuon-theme", next);
    theme.set(next);
  }

  function toggleTheme() {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";

    // dark -> light = forward
    // light -> dark = reverse
    root.dataset.vtDir = next === "light" ? "forward" : "reverse";

    if ("startViewTransition" in document) {
      const transition = document.startViewTransition(() => {
        applyTheme(next);
      });

      transition.finished.finally(() => {
        delete root.dataset.vtDir;
      });

      return;
    }

    applyTheme(next);
  }

  function goSection(i) {
    mobileOpen = false;
    onNavigate(i);
  }

  export async function hideSidebar() {
    await _gsapReady;
    if (!gsap || !sideNavEl) return;
    await gsap.to(sideNavEl, {
      x: -60,
      opacity: 0,
      duration: 0.45,
      ease: "expo.in",
    });
  }

  export async function showSidebarAnim() {
    await _gsapReady;
    if (!gsap || !sideNavEl) return;
    gsap.fromTo(
      sideNavEl,
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55, ease: "expo.out" },
    );
  }

  export async function showBackAnim() {
    await _gsapReady;
    if (!gsap || !backBtnEl) return;
    gsap.fromTo(
      backBtnEl,
      { x: -22, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, ease: "expo.out", delay: 0.4 },
    );
  }

  export async function hideBackAnim() {
    await _gsapReady;
    if (!gsap || !backBtnEl) return;
    await gsap.to(backBtnEl, {
      x: -22,
      opacity: 0,
      duration: 0.9,
      ease: "expo.in",
    });
  }

  onMount(async () => {
    const m = await import("gsap");
    gsap = m.gsap;

    // Set initial hidden state for back button before resolving ready
    if (backBtnEl) {
      gsap.set(backBtnEl, { x: -22, opacity: 0 });
    }

    _resolveGsap(); // unblock any waiting showBackAnim / showSidebarAnim calls

    // ── FIX 2: Scroll background – listen on both window and .page-scroll containers ──
    function applyScrolled(scrollY) {
      const nav = document.getElementById("top-nav");
      if (!nav) return;
      if (scrollY > 10) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    // Main page uses fullpage.js (no real window scroll), sub-pages use .page-scroll div
    function onWindowScroll() {
      applyScrolled(window.scrollY);
    }
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    // Also watch any .page-scroll container (detail pages)
    const scrollContainers = document.querySelectorAll(".page-scroll");
    function onContainerScroll(e) {
      applyScrolled(e.currentTarget.scrollTop);
    }
    scrollContainers.forEach((el) =>
      el.addEventListener("scroll", onContainerScroll, { passive: true }),
    );

    // MutationObserver to catch dynamically added .page-scroll containers
    const mo = new MutationObserver(() => {
      document.querySelectorAll(".page-scroll").forEach((el) => {
        if (!el._scrollListenerAttached) {
          el._scrollListenerAttached = true;
          el.addEventListener("scroll", onContainerScroll, { passive: true });
        }
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      mo.disconnect();
    };
  });
</script>

<!-- TOP NAV -->
<nav id="top-nav" bind:this={topNavEl}>
  <div style="display:flex;flex-direction:column;gap:2px;">
    <a
      href="/"
      style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:600;
             letter-spacing:.12em;color:{subPage
        ? 'var(--fg)'
        : 'var(--fg)'};text-decoration:none;line-height:1.2;"
    >
      PORTFOLIO
    </a>

    {#if onBack}
      <button
        bind:this={backBtnEl}
        on:click={onBack}
        class="back-btn"
        style="display:flex;align-items:center;gap:8px;background:none;border:none;
               padding:6px 0 0 0;text-align:left;opacity:0;
               color:var(--fg2);"
      >
        <svg
          width="16"
          height="11"
          viewBox="0 0 16 11"
          fill="none"
          style="flex-shrink:0;"
        >
          <path
            d="M15 5.5H1M1 5.5L5.5 1M1 5.5L5.5 10"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span
          style="font-family:'JetBrains Mono',monospace;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;"
        >
          BACK
        </span>
      </button>
    {/if}
  </div>

  <div style="display:flex;align-items:center;gap:20px;">
    <!-- Theme toggle always visible -->
    <button
      class="theme-toggle"
      on:click={toggleTheme}
      aria-label="Toggle theme"
      style=""
    >
      <span class="theme-toggle-knob"></span>
    </button>

    <!-- Section links: hidden on sub-pages -->
    {#if !subPage}
      <div class="desktop-links" bind:this={navLinksEl}>
        {#each sections as s, i}
          <button
            on:click={() => goSection(i)}
            style="font-family:'JetBrains Mono',monospace;font-size:.62rem;letter-spacing:.18em;
                   text-transform:uppercase;background:none;border:none;
                   transition:color .3s;color:{$currentSection === i
              ? 'var(--accent)'
              : 'var(--fg2)'};"
          >
            {s.label}
          </button>
        {/each}
      </div>

      <button
        class="ham-btn"
        on:click={() => (mobileOpen = !mobileOpen)}
        aria-label="Menu"
        style=""
      >
        <span
          style="display:block;width:20px;height:1.5px;background:var(--fg);transition:all .3s;
          {mobileOpen ? 'transform:rotate(45deg) translateY(5px);' : ''}"
        ></span>
        <span
          style="display:block;width:20px;height:1.5px;background:var(--fg);transition:all .3s;
          margin:5px 0;{mobileOpen ? 'opacity:0;' : ''}"
        ></span>
        <span
          style="display:block;width:20px;height:1.5px;background:var(--fg);transition:all .3s;
          {mobileOpen ? 'transform:rotate(-45deg) translateY(-5px);' : ''}"
        ></span>
      </button>
    {/if}
  </div>
</nav>

<!-- SIDE NAV — only on main page -->
{#if showSidebar}
  <nav id="side-nav" bind:this={sideNavEl}>
    {#each sections as s, i}
      <button
        class="side-nav-item"
        class:active={$currentSection === i}
        on:click={() => goSection(i)}
        aria-label={s.label}
        style="background:none;border:none;"
      >
        <span class="side-nav-bar"></span>
        <span class="side-nav-label">{s.label}</span>
      </button>
    {/each}
  </nav>
{/if}

<!-- MOBILE MENU (only when nav links shown) -->
{#if mobileOpen && !subPage}
  <div id="mobile-menu">
    {#each sections as s, i}
      <button
        class="mobile-menu-item"
        class:active={$currentSection === i}
        on:click={() => goSection(i)}
        style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:600;
               background:none;border:none;
               color:{$currentSection === i ? 'var(--accent)' : 'var(--fg)'};"
      >
        {s.label}
      </button>
    {/each}
  </div>
{/if}

<style>
  .desktop-links {
    display: none;
    gap: 28px;
  }
  .ham-btn {
    display: flex;
    flex-direction: column;
    padding: 4px;
    background: none;
    border: none;
  }
  @media (min-width: 768px) {
    .desktop-links {
      display: flex;
    }
    .ham-btn {
      display: none;
    }
  }

  .back-btn {
    color: var(--fg2);
    transition: color 0.25s;
  }
  .back-btn:hover {
    color: var(--accent);
  }
  .back-btn svg {
    transition: transform 0.25s;
  }
  .back-btn:hover svg {
    transform: translateX(-4px);
  }
</style>
