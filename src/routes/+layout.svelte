<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  // Sub-pages that need normal scroll (not fullpage)
  $: isSubPage = $page.url.pathname !== "/";

  onMount(() => {
    const saved = localStorage.getItem("kuon-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    window.onbeforeunload = null;
  });

  $: if (typeof document !== "undefined") {
    if (isSubPage) {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
  }
</script>

<svelte:head><title>Portfolio</title></svelte:head>

<slot />
