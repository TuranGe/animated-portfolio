<script>
  import { onMount } from "svelte";
  import { navigating } from "$lib/stores.js";

  let p1, p2;
  let gsap;

  export async function leave() {
    if (!gsap) return;
    navigating.set(true);
    const tl = gsap.timeline();
    tl.fromTo(
      p2,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.45, ease: "expo.inOut" },
    );
    tl.fromTo(
      p1,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.55, ease: "expo.inOut" },
      "-=0.32",
    );
    await tl.then();
  }

  export async function enter() {
    if (!gsap) return;
    const tl = gsap.timeline({ onComplete: () => navigating.set(false) });
    tl.fromTo(
      p1,
      { scaleX: 1, transformOrigin: "right" },
      { scaleX: 0, duration: 0.55, ease: "expo.inOut" },
    );
    tl.fromTo(
      p2,
      { scaleX: 1, transformOrigin: "right" },
      { scaleX: 0, duration: 0.45, ease: "expo.inOut" },
      "-=0.35",
    );
    await tl.then();
  }

  onMount(async () => {
    const m = await import("gsap");
    gsap = m.gsap;
    // Initial entrance – panels start closed, open on mount
    gsap.set(p1, { scaleX: 1, transformOrigin: "right" });
    gsap.set(p2, { scaleX: 1, transformOrigin: "right" });
    const tl = gsap.timeline();
    tl.to(p1, { scaleX: 0, duration: 0.65, ease: "expo.inOut", delay: 0.1 });
    tl.to(p2, { scaleX: 0, duration: 0.5, ease: "expo.inOut" }, "-=0.4");
  });
</script>

<div id="pt-overlay">
  <div
    class="pt-panel"
    bind:this={p2}
    style="background:var(--bg);z-index:1;"
  ></div>
  <div
    class="pt-panel"
    bind:this={p1}
    style="background:var(--accent);z-index:2;"
  ></div>
</div>
