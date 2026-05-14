import { writable } from 'svelte/store';

export const currentSection = writable(0);
export const theme = writable('dark');

// FLIP state — persisted via sessionStorage so it survives SvelteKit navigation
function createFlipState() {
  const { subscribe, set } = writable(null);
  return {
    subscribe,
    set(val) {
      if (typeof sessionStorage !== 'undefined') {
        if (val) sessionStorage.setItem('flipState', JSON.stringify(val));
        else sessionStorage.removeItem('flipState');
      }
      set(val);
    },
    load() {
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem('flipState');
        if (raw) { try { set(JSON.parse(raw)); } catch (e) { set(null); } }
      }
    },
    clear() {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('flipState');
      set(null);
    }
  };
}

export const flipState = createFlipState();
export const navigating = writable(false);