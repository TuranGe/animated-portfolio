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

  let navEl, pageEl, gsap;
  let leaving = false;
  let name = "",
    email = "",
    message = "",
    sending = false,
    submitted = false;

  async function goBack() {
    if (leaving) return;
    leaving = true;
    if (!gsap) {
      const m = await import("gsap");
      gsap = m.gsap;
    }
    let topNav = document.getElementById("top-nav");
    if (topNav)
      gsap.to(topNav, { y: -60, opacity: 0, duration: 0.85, ease: "expo.in" });
    await navEl?.hideBackAnim();
    await gsap.to(pageEl, { opacity: 0, duration: 0.45, ease: "expo.in" });

    // Tell home page to land on the section the user came from (fallback: CONTACT=3)
    try {
      const from = sessionStorage.getItem("fromSection");
      sessionStorage.removeItem("fromSection");
      sessionStorage.setItem("returnSection", from !== null ? from : "3");
    } catch (e) {}
    goto("/");
  }

  function handleSubmit() {
    if (!name || !email || !message) return;
    sending = true;
    setTimeout(() => {
      sending = false;
      submitted = true;
    }, 1200);
  }

  onMount(async () => {
    const m = await import("gsap");
    gsap = m.gsap;

    const topNav = document.getElementById("top-nav");
    if (topNav) gsap.set(topNav, { opacity: 0, y: -60 });
    gsap.set(pageEl, { opacity: 0 });
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    if (topNav)
      gsap.fromTo(
        topNav,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", delay: 0.05 },
      );
    navEl?.showBackAnim();
    gsap.to(pageEl, {
      opacity: 1,
      duration: 0.55,
      ease: "expo.out",
      delay: 0.05,
    });

    gsap.fromTo(
      ".ct-el",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.09,
        delay: 0.3,
      },
    );
  });
</script>

<svelte:head><title>Contact — Portfolio</title></svelte:head>

<Nav
  bind:this={navEl}
  {sections}
  subPage={true}
  showSidebar={false}
  onBack={goBack}
  onNavigate={() => goBack()}
/>
<!-- Ambient glows -->
<div
  style="position:fixed;width:600px;height:600px;border-radius:50%;bottom:-150px;left:-100px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(100px);opacity:.09;pointer-events:none;z-index:99;"
></div>
<div
  style="position:fixed;width:350px;height:350px;border-radius:50%;top:-80px;right:-60px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(80px);opacity:.07;pointer-events:none;z-index:99;"
></div>

<div
  bind:this={pageEl}
  class="page-scroll"
  style="position:fixed;inset:0;background:var(--bg);overflow-y:auto;scrollbar-width:none;z-index:100;
         padding-top:88px;padding-bottom:4rem;"
>
  <div
    style="width:100%;padding:0 clamp(24px,6vw,96px);max-width:1100px;margin:0 auto;"
  >
    <div
      class="contact-grid"
      style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(48px,8vw,96px);"
    >
      <!-- Left -->
      <div>
        <p class="ct-el label" style="margin-bottom:12px;opacity:0;">
          03 — CONTACT
        </p>
        <h1
          class="ct-el"
          style="font-family:'Playfair Display',serif;font-size:clamp(2.8rem,6vw,5.5rem);
                 font-weight:600;line-height:1.1;color:var(--fg);margin-bottom:24px;opacity:0;"
        >
          Start a<br /><em style="color:var(--accent);">conversation.</em>
        </h1>
        <p
          class="ct-el"
          style="color:var(--fg2);line-height:1.85;max-width:360px;margin-bottom:36px;opacity:0;"
        >
          Have a project in mind, or just want to say hello? Drop me a message —
          I'll respond within 24 hours.
        </p>

        <div class="ct-el" style="margin-bottom:32px;opacity:0;">
          <p class="label" style="color:var(--fg2);margin-bottom:6px;">EMAIL</p>
          <a
            href="mailto:hello@turange.dev"
            style="font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--fg);
                   text-decoration:none;transition:color .3s;"
            onmouseenter="this.style.color='var(--accent)'"
            onmouseleave="this.style.color='var(--fg)'"
          >
            hello@turange.dev
          </a>
        </div>

        <div class="ct-el" style="margin-bottom:32px;opacity:0;">
          <p class="label" style="color:var(--fg2);margin-bottom:6px;">
            AVAILABILITY
          </p>
          <p style="color:var(--fg);">Open for projects — Q1 2025</p>
        </div>

        <div class="ct-el" style="display:flex;gap:24px;opacity:0;">
          {#each [{ name: "TWITTER", url: "https://twitter.com" }, { name: "GITHUB", url: "https://github.com" }, { name: "LINKEDIN", url: "https://linkedin.com" }] as s}
            <a
              href={s.url}
              class="label"
              style="color:var(--fg2);opacity:.6;text-decoration:none;
                     border-bottom:1px solid transparent;padding-bottom:2px;transition:opacity .2s,border-color .2s;"
              onmouseenter="this.style.opacity=1;this.style.borderBottomColor='var(--accent)'"
              onmouseleave="this.style.opacity=.6;this.style.borderBottomColor='transparent'"
              >{s.name}</a
            >
          {/each}
        </div>
      </div>

      <!-- Right: Form -->
      <div class="ct-el" style="opacity:0;">
        {#if submitted}
          <div
            style="display:flex;flex-direction:column;align-items:flex-start;gap:20px;padding:48px 0;"
          >
            <div
              style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;
                        font-size:1.1rem;color:var(--accent);border:1.5px solid var(--accent);"
            >
              ✓
            </div>
            <h2
              style="font-family:'Playfair Display',serif;font-size:2rem;color:var(--fg);"
            >
              Message sent!
            </h2>
            <p style="color:var(--fg2);">
              Thanks for reaching out. I'll be in touch soon.
            </p>
            <button
              on:click={() => {
                submitted = false;
                name = "";
                email = "";
                message = "";
              }}
              class="label"
              style="color:var(--accent);background:none;border:none;cursor:pointer;transition:opacity .2s;"
            >
              SEND ANOTHER →
            </button>
          </div>
        {:else}
          <div style="display:flex;flex-direction:column;gap:28px;">
            <!-- Name input — no dynamic type -->
            <div>
              <label
                for="name"
                class="label"
                style="display:block;margin-bottom:8px;color:var(--fg2);"
                >YOUR NAME</label
              >
              <input
                id="name"
                bind:value={name}
                type="text"
                placeholder="Jane Smith"
                style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);
                       padding:10px 0;outline:none;color:var(--fg);font-family:'Playfair Display',serif;
                       font-size:1.1rem;transition:border-color .3s;"
                onfocus="this.style.borderBottomColor='var(--accent)'"
                onblur="this.style.borderBottomColor='var(--border)'"
              />
            </div>

            <!-- Email input — no dynamic type -->
            <div>
              <label
                for="email"
                class="label"
                style="display:block;margin-bottom:8px;color:var(--fg2);"
                >EMAIL ADDRESS</label
              >
              <input
                id="email"
                bind:value={email}
                type="email"
                placeholder="jane@example.com"
                style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);
                       padding:10px 0;outline:none;color:var(--fg);font-family:'Playfair Display',serif;
                       font-size:1.1rem;transition:border-color .3s;"
                onfocus="this.style.borderBottomColor='var(--accent)'"
                onblur="this.style.borderBottomColor='var(--border)'"
              />
            </div>

            <!-- Message textarea -->
            <div>
              <label
                for="message"
                class="label"
                style="display:block;margin-bottom:8px;color:var(--fg2);"
                >YOUR MESSAGE</label
              >
              <textarea
                id="message"
                bind:value={message}
                rows="5"
                placeholder="Tell me about your project..."
                style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);
                       padding:10px 0;outline:none;color:var(--fg);font-family:'Playfair Display',serif;
                       font-size:1.1rem;resize:none;transition:border-color .3s;"
                onfocus="this.style.borderBottomColor='var(--accent)'"
                onblur="this.style.borderBottomColor='var(--border)'"
              ></textarea>
            </div>

            <button
              on:click={handleSubmit}
              disabled={sending}
              class="label"
              style="display:inline-flex;align-items:center;gap:16px;padding:14px 40px;
                     border:1.5px solid var(--accent);color:var(--accent);background:none;
                     cursor:pointer;transition:background .35s,color .35s;align-self:flex-start;
                     opacity:{sending ? 0.6 : 1};"
              onmouseenter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = "var(--accent)";
                  e.target.style.color = "var(--bg)";
                }
              }}
              onmouseleave={(e) => {
                e.target.style.background = "";
                e.target.style.color = "var(--accent)";
              }}
            >
              {#if sending}
                <span
                  style="width:14px;height:14px;border-radius:50%;border:1.5px solid currentColor;
                             border-top-color:transparent;display:inline-block;animation:spin .7s linear infinite;"
                ></span>
                SENDING...
              {:else}
                SEND MESSAGE →
              {/if}
            </button>
          </div>
        {/if}
      </div>
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
  input::placeholder,
  textarea::placeholder {
    color: var(--fg2);
    opacity: 0.4;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .contact-grid {
    width: 100%;
    box-sizing: border-box;
  }
  @media (max-width: 768px) {
    .contact-grid {
      grid-template-columns: 1fr !important;
      gap: 40px !important;
    }
    .page-scroll {
      align-items: flex-start;
    }
  }
  @media (max-width: 480px) {
    .contact-grid {
      gap: 32px !important;
    }
  }
</style>
