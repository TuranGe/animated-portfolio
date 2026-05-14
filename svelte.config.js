import adapter from '@sveltejs/adapter-vercel'; // adapter-auto yerine bunu kullanıyorsan
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x' // Vercel'e Node 20 kullanmasını söyler
		})
	}
};

export default config;