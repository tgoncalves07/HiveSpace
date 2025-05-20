<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let loaded = false;

	onMount(() => {
		loaded = true;
	});
</script>

<div class="hero" in:fade={{ duration: 500 }}>
	<header class="header" in:fade={{ delay: 300, duration: 700 }}>
		<h1 class="title">
			<span class="title-line">Este projeto foi desenvolvido</span>
			<span class="title-line">por mim para a minha PAP</span>
		</h1>
		<p class="subtitle">Uma</p>
	</header>

	{#if loaded}
		<div class="cta-container" in:fade={{ delay: 600, duration: 500 }}>
			<a href="/projetos" class="cta-button">
				Explorar Projetos
				<svg class="arrow-icon" viewBox="0 0 24 24">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</a>
		</div>
	{/if}

	<div class="decoration">
		<div class="circle circle-1" />
		<div class="circle circle-2" />
		<div class="circle circle-3" />
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
		background-color: #f8fafc;
		color: #0f172a;
	}

	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0 1.5rem;
		position: relative;
		overflow: hidden;
	}

	.header {
		max-width: 800px;
		margin-bottom: 3rem;
		position: relative;
		z-index: 2;
	}

	.title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 800;
		line-height: 1.2;
		margin: 0 0 1.5rem 0;
		letter-spacing: -0.05em;
	}

	.title-line {
		display: block;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #64748b;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.cta-container {
		position: relative;
		z-index: 2;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		background-color: #0f172a;
		color: white;
		padding: 1rem 2rem;
		border-radius: 50px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background-color: #1e293b;
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.arrow-icon {
		width: 20px;
		height: 20px;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.decoration {
		position: absolute;
		inset: 0;
		z-index: 1;
		overflow: hidden;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
		opacity: 0.6;
	}

	.circle-1 {
		width: 300px;
		height: 300px;
		top: -100px;
		left: -100px;
	}

	.circle-2 {
		width: 500px;
		height: 500px;
		bottom: -200px;
		right: -200px;
	}

	.circle-3 {
		width: 200px;
		height: 200px;
		top: 50%;
		right: 50px;
	}

	/* Animações */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.circle-1 {
		animation: float 8s ease-in-out infinite;
	}

	.circle-2 {
		animation: float 10s ease-in-out infinite 2s;
	}

	.circle-3 {
		animation: float 6s ease-in-out infinite 1s;
	}
</style>
