<!--
  FlipOverlay — sadece return animasyonu için: fullscreen → kart rect.
  openWork artık kullanılmıyor (sayfa geçişi direkt navigate ile yapılıyor).
-->
<script>
  import { onMount } from 'svelte';

  let overlay;
  let gsap;
  let ready = false;

  onMount(async () => {
    const m = await import('gsap');
    gsap = m.gsap;
    ready = true;
  });

  /** Fullscreen'den hedef rect'e küçül (geri dönüş animasyonu) */
  export async function closeWork(rect, color) {
    if (!ready) return;
    overlay.style.background = color;
    overlay.style.display = 'block';
    overlay.style.borderRadius = '0px';

    gsap.set(overlay, {
      left: 0, top: 0,
      width: '100vw', height: '100vh',
      opacity: 1,
    });

    await gsap.to(overlay, {
      left:         rect.left,
      top:          rect.top,
      width:        rect.width,
      height:       rect.height,
      borderRadius: '0px',
      duration:     0.72,
      ease:         'expo.inOut',
    });

    overlay.style.display = 'none';
  }

  export function hide() {
    if (overlay) overlay.style.display = 'none';
  }
</script>

<div
  bind:this={overlay}
  style="
    display: none;
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    overflow: hidden;
  "
></div>
