<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Nav from '$lib/Nav.svelte';

  const sections = [
    { label:'HOME', id:'hero' }, { label:'WORK', id:'work' },
    { label:'ABOUT', id:'about' }, { label:'CONTACT', id:'contact' },
  ];

  const skills = [
    { cat:'Design',      items:['UI/UX Design','Brand Identity','Motion Design','Typography','Art Direction'] },
    { cat:'Development', items:['SvelteKit','React / Next.js','GSAP / Motion','Three.js','TailwindCSS'] },
    { cat:'Tools',       items:['Figma','Adobe CC','Blender','VS Code','Git'] },
  ];

  const timeline = [
    { year:'2024', title:'Senior Creative Dev',     place:'Freelance & Studio Work' },
    { year:'2022', title:'Lead Frontend Developer', place:'Digital Agency XYZ' },
    { year:'2020', title:'UI/UX Designer',           place:'StartupCo' },
    { year:'2018', title:'B.Sc. Interaction Design', place:'Design University' },
  ];

  let navEl, pageEl, gsap;
  let leaving = false;

  async function goBack() {
    if (leaving) return;
    leaving = true;
    if (!gsap) { const m = await import('gsap'); gsap = m.gsap; }
    let topNav = document.getElementById('top-nav');
    if (topNav) gsap.to(topNav, { y: -60, opacity: 0, duration: 0.85, ease: 'expo.in' });
    await navEl?.hideBackAnim();
    await gsap.to(pageEl, { opacity: 0, duration: 0.45, ease: 'expo.in' });
    // Tell home page to land on the section the user came from (fallback: ABOUT=2)
    try { const from = sessionStorage.getItem('fromSection'); sessionStorage.removeItem('fromSection'); sessionStorage.setItem('returnSection', from !== null ? from : '2'); } catch(e) {}
    goto('/');
  }

  onMount(async () => {
    const m  = await import('gsap');
    const st = await import('gsap/ScrollTrigger');
    gsap = m.gsap;
    gsap.registerPlugin(st.ScrollTrigger);

    const topNav = document.getElementById('top-nav');
    if (topNav) gsap.set(topNav, { opacity: 0, y: -60 });
    gsap.set(pageEl, { opacity: 0 });
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));
    if (topNav) gsap.fromTo(topNav, { opacity:0, y:-60 }, { opacity:1, y:0, duration:0.85, ease:'expo.out', delay:0.05 });
    navEl?.showBackAnim();
    gsap.to(pageEl, { opacity: 1, duration: 0.55, ease: 'expo.out', delay: 0.05 });

    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo('.ab-hero > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.1 });

    gsap.utils.toArray('.ab-section').forEach(el => {
      gsap.fromTo(el, { y: 35, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', scroller: pageEl }
      });
    });
  });
</script>

<svelte:head><title>About — Portfolio</title></svelte:head>

<Nav bind:this={navEl} {sections} subPage={true} showSidebar={false} onBack={goBack} onNavigate={() => goBack()} />
<!-- Ambient glows -->
<div style="position:fixed;width:550px;height:550px;border-radius:50%;top:-120px;right:-80px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(90px);opacity:.08;pointer-events:none;z-index:99;"></div>
<div style="position:fixed;width:400px;height:400px;border-radius:50%;bottom:-100px;left:-60px;background:radial-gradient(circle,var(--accent) 0%,transparent 65%);filter:blur(80px);opacity:.07;pointer-events:none;z-index:99;"></div>

<div bind:this={pageEl} class="page-scroll"
  style="position:fixed;inset:0;background:var(--bg);overflow-y:auto;scrollbar-width:none;z-index:100;
         padding-top:88px;padding-bottom:6rem;">

  <div style="padding:0 clamp(24px,6vw,96px);max-width:1100px;margin:0 auto;">

    <!-- Hero -->
    <div class="ab-hero" style="margin-bottom:clamp(48px,8vw,96px);">
      <p class="label" style="margin-bottom:12px;opacity:0;">02 — ABOUT ME</p>
      <h1 style="font-family:'Playfair Display',serif;font-size:clamp(3.5rem,10vw,9rem);
                 font-weight:600;line-height:1;color:var(--fg);margin-bottom:28px;opacity:0;">
        Hello,<br><em style="color:var(--accent);">World.</em>
      </h1>
      <p style="font-family:'Playfair Display',serif;font-size:clamp(1.2rem,2.5vw,1.8rem);
                color:var(--fg);font-weight:300;line-height:1.6;max-width:680px;opacity:0;">
        I'm a creative developer who thrives at the intersection of design and technology.
      </p>
    </div>

    <!-- Portrait + bio -->
    <div class="ab-section ab-portrait-bio" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);
                                    margin-bottom:clamp(48px,8vw,96px);align-items:center;">
      <div style="position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:2px;">
        <div style="width:100%;height:100%;background:linear-gradient(160deg,var(--bg2),var(--bg));">
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.2;">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <circle cx="90" cy="90" r="88" stroke="var(--accent)" stroke-width=".6"/>
              <circle cx="90" cy="90" r="60" stroke="var(--accent)" stroke-width=".4"/>
              <line x1="90" y1="2"   x2="90"  y2="178" stroke="var(--accent)" stroke-width=".4"/>
              <line x1="2"  y1="90"  x2="178" y2="90"  stroke="var(--accent)" stroke-width=".4"/>
            </svg>
          </div>
        </div>
        <div style="position:absolute;bottom:0;left:0;width:2px;height:100%;background:var(--accent);"></div>
      </div>

      <div style="display:flex;flex-direction:column;gap:18px;">
        <p style="color:var(--fg2);line-height:1.85;">
          With over 5 years of experience in both design and development, I bring a unique perspective to every project. I started as a designer, learned to code out of necessity — and fell in love with the craft.
        </p>
        <p style="color:var(--fg2);line-height:1.85;">
          I believe the best digital experiences are those that feel inevitable — where every interaction, every transition, every typographic choice feels exactly right.
        </p>
        <p style="color:var(--fg2);line-height:1.85;">
          When I'm not in front of a screen, you'll find me exploring film photography, reading about architecture, or hunting for the perfect espresso.
        </p>
        <div style="display:flex;gap:24px;margin-top:8px;">
          {#each [{name: 'TWITTER', url: 'https://twitter.com'}, {name: 'GITHUB', url: 'https://github.com'}, {name: 'DRIBBBLE', url: 'https://dribbble.com'}] as s}
            <a href="{s.url}" class="label" style="color:var(--fg2);opacity:.6;text-decoration:none;transition:opacity .2s;"
              onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=.6">{s.name}</a>
          {/each}
        </div>
      </div>
    </div>

    <!-- Skills -->
    <div class="ab-section" style="margin-bottom:clamp(48px,8vw,96px);">
      <p class="label" style="margin-bottom:28px;">SKILLS &amp; TOOLS</p>
      <div class="skills-grid">
        {#each skills as g, i}
          <div class="skill-card">
            <p style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:600;
                      color:var(--accent);margin-bottom:18px;">{g.cat}</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
              {#each g.items as item}
                <li style="display:flex;align-items:center;gap:10px;color:var(--fg2);font-size:.9rem;">
                  <span style="width:4px;height:4px;border-radius:50%;background:var(--accent);opacity:.5;flex-shrink:0;"></span>
                  {item}
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>

    <!-- Timeline -->
    <div class="ab-section" style="margin-bottom:clamp(48px,8vw,96px);">
      <p class="label" style="margin-bottom:32px;">EXPERIENCE</p>
      {#each timeline as t}
        <div style="display:grid;grid-template-columns:100px 1fr 1fr;gap:16px;
                    padding:24px 0;border-top:1px solid var(--border);">
          <span class="label" style="color:var(--accent);">{t.year}</span>
          <p style="font-family:'Playfair Display',serif;font-size:1.15rem;
                    font-weight:600;color:var(--fg);">{t.title}</p>
          <p style="color:var(--fg2);font-size:.9rem;align-self:center;">{t.place}</p>
        </div>
      {/each}
      <div style="border-top:1px solid var(--border);"></div>
    </div>

    <div class="ab-section" style="text-align:center;padding-bottom:2rem;">
      <button on:click={() => { try { sessionStorage.setItem('fromSection', '2'); } catch(e) {} goto('/contact'); }}
        class="label"
        style="display:inline-flex;align-items:center;gap:16px;padding:14px 40px;
               border:1.5px solid var(--accent);color:var(--accent);background:none;
               cursor:pointer;transition:background .35s,color .35s;"
        onmouseenter="this.style.background='var(--accent)';this.style.color='var(--bg)'"
        onmouseleave="this.style.background='';this.style.color='var(--accent)'">
        LET'S WORK TOGETHER →
      </button>
    </div>

  </div>
</div>

<style>
  .label { font-family:'JetBrains Mono',monospace; font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; }
  .ab-hero > * { opacity:0; }
  .ab-section { opacity:0; }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .skill-card {
    padding: 28px;
    border-top: 1px solid var(--border);
    border-left: 1px solid var(--border);
  }
  .skill-card:last-child { border-right: 1px solid var(--border); }

  @media (max-width: 768px) {
    .skills-grid {
      grid-template-columns: 1fr;
    }
    .skill-card {
      border-left: none;
      border-right: none;
    }
    .skill-card:last-child { border-right: none; }
    .ab-portrait-bio { grid-template-columns: 1fr !important; }
    div[style*="grid-template-columns:100px"]   { grid-template-columns: 1fr !important; gap: 8px !important; }
  }
</style>
