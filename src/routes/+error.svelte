<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import PageTransition from '$lib/PageTransition.svelte';

  let pt;

  onMount(async () => {
    const { gsap } = await import('gsap');
    gsap.fromTo('.err-el', { y:30,opacity:0 }, { y:0,opacity:1,duration:0.8,ease:'expo.out',stagger:0.1,delay:0.2 });
  });
</script>
<svelte:head><title>404 — Portfolio</title></svelte:head>
<PageTransition bind:this={pt} />

<div style="min-height:100vh;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
  <p class="err-el label mb-3 opacity-0" style="font-family:'JetBrains Mono',monospace;font-size:.65rem;letter-spacing:.2em;color:var(--accent);">404 — NOT FOUND</p>
  <h1 class="err-el display font-semibold mb-4 opacity-0 leading-none"
    style="font-family:'Playfair Display',serif;font-size:clamp(5rem,20vw,14rem);color:var(--fg);opacity:.08;">404</h1>
  <p class="err-el opacity-0 mb-10" style="color:var(--fg2);">This page seems to have wandered off.</p>
  <button on:click={async () => { await pt?.leave(); await goto('/'); }}
    class="err-el opacity-0 label inline-flex items-center gap-3 hover:opacity-100 transition-opacity"
    style="color:var(--accent);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:.65rem;letter-spacing:.2em;">
    ← BACK HOME
  </button>
</div>
