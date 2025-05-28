<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.css';

	let isOpen = true;
	let draggedIndex = null;
	let dragOverIndex = null;

	// Lista original de links
	const defaultLinks = [
		{ path: '/', label: 'Página Principal', icon: '/home.svg' },
		{ path: '/projetos', label: 'Projetos', icon: '/mala.svg' },
		{ path: '/tarefas', label: 'Tarefas', icon: '/task.svg' },
		{ path: '/notas', label: 'Notas', icon: '/notes.svg' },
		{ path: '/calendario', label: 'Calendario', icon: '/calendario.svg' },
		{ path: '/config', label: 'Configurações', icon: '/gear.svg' },
		{ path: '/sobre', label: 'Sobre', icon: '/sobre.svg' }
	];

	let links = [];

	onMount(() => {
		// Carregar ordem salva do localStorage
		const savedOrder = localStorage.getItem('sidebarLinksOrder');
		links = savedOrder ? JSON.parse(savedOrder) : [...defaultLinks];
	});

	function handleDragStart(event, index) {
		draggedIndex = index;
		event.dataTransfer.effectAllowed = 'move';
		event.currentTarget.classList.add('dragging');
	}

	function handleDragOver(event, index) {
		event.preventDefault();
		dragOverIndex = index;
		if (draggedIndex === null || draggedIndex === dragOverIndex) return;

		// Atualizar visualmente a posição
		const items = [...links];
		const draggedItem = items[draggedIndex];
		items.splice(draggedIndex, 1);
		items.splice(dragOverIndex, 0, draggedItem);

		links = items;
		draggedIndex = dragOverIndex;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
		localStorage.setItem('sidebarLinksOrder', JSON.stringify(links));
		document.querySelectorAll('.sidebar-links a').forEach((el) => el.classList.remove('dragging'));
	}

	function handleBrandClick() {
		isOpen = !isOpen;
	}
</script>

<svelte:head>
	<title>HiveSpace</title>
</svelte:head>

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
		{#each links as link, index (link.path)}
			<a
				href={link.path}
				class={$page.url.pathname === link.path ? 'active' : ''}
				draggable="true"
				on:dragstart={(e) => handleDragStart(e, index)}
				on:dragover={(e) => handleDragOver(e, index)}
				on:dragend={handleDragEnd}
				on:touchstart={(e) => handleDragStart(e, index)}
				on:touchmove={(e) => e.preventDefault()}
			>
				<img src={link.icon} alt={link.label} />
				{#if isOpen}<span>{link.label}</span>{/if}
			</a>
		{/each}
	</div>
</div>

<main class="content">
	<slot />
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
		align-items: left;
		width: 250px;
		z-index: 1000;
	}

	.sidebar.closed {
		width: 80px;
	}

	.sidebar.closed .sidebar-links a {
		justify-content: center;
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
		align-items: left;
	}

	.sidebar-links a {
		display: flex;
		gap: 10px;
		color: var(--text-color);
		text-decoration: none;
		padding: 10px;
		border-radius: 5px;
		transition:
			background-color 0.3s,
			color 0.3s,
			transform 0.2s,
			opacity 0.2s;
		white-space: nowrap;
		width: calc(100% - 20px);
		user-select: none;
	}

	.sidebar-links a:hover {
		background-color: var(--hover-color);
		cursor: grab;
	}

	.sidebar-links a.active {
		background-color: var(--active-color);
		color: var(--background-color);
	}

	.sidebar-links a:active {
		cursor: grabbing;
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
