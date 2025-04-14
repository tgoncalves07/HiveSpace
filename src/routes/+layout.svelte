<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';

	let isOpen = true;

	function handleBrandClick() {
		isOpen = !isOpen;
		goto('/');
	}
</script>

<div class="sidebar" class:open={isOpen} class:closed={!isOpen}>
	<div
		class="sidebar-brand"
		on:click={handleBrandClick}
		role="button"
		tabindex="0"
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleBrandClick() : null)}
	>
		<img src="/icon.svg" alt="HiveSpace Icon" class="icon floating" />
		{#if isOpen}<h1 class="fixed-color">HiveSpace</h1>{/if}
	</div>
	<div class="sidebar-links">
		<a href="/" class={$page.url.pathname === '/' ? 'active' : ''}>
			<img src="/home.svg" alt="Página Principal" />
			{#if isOpen}<span>Página Principal</span>{/if}
		</a>
		<a href="/projetos" class={$page.url.pathname === '/projetos' ? 'active' : ''}>
			<img src="/mala.svg" alt="Projetos" />
			{#if isOpen}<span>Projetos</span>{/if}
		</a>
		<a href="/ideias" class={$page.url.pathname === '/ideias' ? 'active' : ''}>
			<img src="/lamp.svg" alt="Ideias" />
			{#if isOpen}<span>Ideias</span>{/if}
		</a>
		<a href="/equipas" class={$page.url.pathname === '/equipas' ? 'active' : ''}>
			<img src="/equipas.svg" alt="Equipas" />
			{#if isOpen}<span>Equipas</span>{/if}
		</a>
		<a href="/chat" class={$page.url.pathname === '/chat' ? 'active' : ''}>
			<img src="/chat.svg" alt="Chat" />
			{#if isOpen}<span>Chat</span>{/if}
		</a>
		<a href="/config" class={$page.url.pathname === '/config' ? 'active' : ''}>
			<img src="/gear.svg" alt="Configurações" />
			{#if isOpen}<span>Configurações</span>{/if}
		</a>
		<a href="/sobre" class={$page.url.pathname === '/sobre' ? 'active' : ''}>
			<img src="/sobre.svg" alt="Sobre" />
			{#if isOpen}<span>Sobre</span>{/if}
		</a>
	</div>
</div>

<main class="content">
	<div class="content-wrapper">
		<slot />
	</div>
</main>

<style>
	:root {
		--primary-color: #6c5ce7;
		--secondary-color: #636363;
		--background-color: #c7c7c7;
		--text-color: #686868;
		--hover-color: #d1d8e0;
		--active-color: #a3a3a3;
	}

	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		background-color: var(--background-color);
		color: var(--text-color);
		transition: width 0.3s;
		padding-top: 20px;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 250px;
		z-index: 1000;
	}

	.sidebar.closed {
		width: 80px;
	}

	.sidebar-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		margin-bottom: 30px;
		width: 100%;
		padding: 0 10px;
		box-sizing: border-box;
	}

	.sidebar-brand .icon {
		width: 40px;
		height: 40px;
	}

	.floating {
		animation: float 2s infinite ease-in-out;
	}

	@keyframes float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-5px);
		}
		100% {
			transform: translateY(0px);
		}
	}

	.fixed-color {
		color: #6c5ce7 !important;
		pointer-events: none;
		font-weight: bold;
		font-size: 20px;
		text-align: center;
	}

	.sidebar-links {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-top: 20px;
		width: 100%;
		padding: 0 10px;
		box-sizing: border-box;
		align-items: center;
	}

	.sidebar-links a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		color: var(--text-color);
		text-decoration: none;
		padding: 10px;
		border-radius: 5px;
		transition:
			background-color 0.3s,
			color 0.3s;
		white-space: nowrap;
		width: calc(100% - 20px);
	}

	.sidebar-links a:hover {
		background-color: var(--hover-color);
	}

	.sidebar-links a.active {
		background-color: var(--active-color);
		color: var(--background-color);
	}

	.sidebar-links img {
		width: 24px;
		height: 24px;
		filter: brightness(0) saturate(100%);
	}

	.content {
		margin-left: 250px;
		padding: 30px;
		transition: margin-left 0.3s ease;
		min-height: 100vh;
	}

	.sidebar.closed + .content {
		margin-left: 80px;
	}

	.content-wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>
