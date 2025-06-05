<!-- +layout.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import '../app.css';
	import { configuracoes, type Tema, type Idioma as AppIdioma } from '../lib/stores/pageStore'; // Importa configuracoes
	import { isSidebarOpen } from '../lib/stores/uiStore';
	import { derived } from 'svelte/store'; // ESSENCIAL para a store 't' local

	// 1. DICIONÁRIO DE TRADUÇÕES LOCAL para o Layout
	const layoutTranslations = {
		pt: {
			'layout.link.principal': 'Página Principal',
			'layout.link.projetos': 'Projetos',
			'layout.link.tarefas': 'Tarefas',
			'layout.link.notas': 'Notas',
			'layout.link.calendario': 'Calendário', // Corrigido para 'Calendário'
			'layout.link.configuracoes': 'Configurações',
			'layout.link.sobre': 'Sobre',
			'layout.sidebar.navegacaoPrincipalAria': 'Navegação principal',
			'layout.sidebar.brandAlt': 'Ícone HiveSpace',
			'layout.sidebar.toggleAria': 'Alternar barra lateral' // Adicionado para o clique na brand
		},
		en: {
			'layout.link.principal': 'Main Page',
			'layout.link.projetos': 'Projects',
			'layout.link.tarefas': 'Tasks',
			'layout.link.notas': 'Notes',
			'layout.link.calendario': 'Calendar',
			'layout.link.configuracoes': 'Settings',
			'layout.link.sobre': 'About',
			'layout.sidebar.navegacaoPrincipalAria': 'Main navigation',
			'layout.sidebar.brandAlt': 'HiveSpace Icon',
			'layout.sidebar.toggleAria': 'Toggle sidebar'
		}
		// Adicionar outros idiomas se necessário
	};

	// 2. Store derivada 't' LOCAL
	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number>): string => {
			const selectedLang = $cfg.idioma as keyof typeof layoutTranslations; // Tipo mais específico
			let langDict = layoutTranslations[selectedLang] || layoutTranslations.pt;
			let text = langDict?.[key] || layoutTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});
	// --- FIM DA LÓGICA DE TRADUÇÃO LOCAL ---

	let draggedIndex: number | null = null;
	let dragOverIndex: number | null = null;

	// Default links (sem labels traduzidos aqui, serão gerados reativamente)
	const baseLinksStructure = [
		{ path: '/', labelKey: 'layout.link.principal', icon: '/home.svg' },
		{ path: '/projetos', labelKey: 'layout.link.projetos', icon: '/mala.svg' },
		{ path: '/tarefas', labelKey: 'layout.link.tarefas', icon: '/task.svg' },
		{ path: '/notas', labelKey: 'layout.link.notas', icon: '/notes.svg' },
		{ path: '/calendario', labelKey: 'layout.link.calendario', icon: '/calendario.svg' },
		{ path: '/config', labelKey: 'layout.link.configuracoes', icon: '/gear.svg' },
		{ path: '/sobre', labelKey: 'layout.link.sobre', icon: '/sobre.svg' }
	];

	type LinkConfig = (typeof baseLinksStructure)[0];
	interface DisplayLink extends LinkConfig {
		label: string; // Label traduzido
	}

	let links: DisplayLink[] = [];

	// 3. Links da sidebar agora são reativos à tradução
	$: links = baseLinksStructure.map((linkConfig) => ({
		...linkConfig,
		label: $t(linkConfig.labelKey)
	}));

	// A função aplicarTemaConfigurado agora será chamada reativamente pela subscrição à store 'configuracoes'
	// Esta função é mantida caso precise ser chamada explicitamente em algum momento, mas
	// o `onMount` e a subscrição à store `configuracoes` (em `pageStore.ts`) já devem cuidar disso.
	function aplicarTemaEIdioma(temaConfig: Tema, idiomaConfig: AppIdioma) {
		const temaFinal =
			temaConfig === 'sistema'
				? window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'escuro'
					: 'claro'
				: temaConfig;
		document.documentElement.setAttribute('data-tema', temaFinal);
		if (idiomaConfig) {
			document.documentElement.setAttribute('lang', idiomaConfig.split('-')[0]);
		}
	}

	let mediaQuery: MediaQueryList | null = null;
	let systemThemeChangeHandler: (() => void) | null = null;
	let unsubscribeConfigStore: (() => void) | null = null;

	onMount(() => {
		// Carregar ordem da sidebar
		const savedOrderString = localStorage.getItem('sidebarLinksOrder');
		if (savedOrderString) {
			try {
				const savedPathOrder: string[] = JSON.parse(savedOrderString);
				// Reordenar baseLinksStructure com base na ordem salva antes de criar 'links' reativos
				// Esta parte precisa ser mais robusta para garantir que todos os links base existam
				// e para lidar com links novos/removidos na baseLinksStructure.
				const orderedBaseLinks: LinkConfig[] = [];
				const basePaths = baseLinksStructure.map((l) => l.path);

				savedPathOrder.forEach((path) => {
					const foundLink = baseLinksStructure.find((l) => l.path === path);
					if (foundLink) {
						orderedBaseLinks.push(foundLink);
					}
				});
				// Adicionar links base que não estavam na ordem salva (novos links)
				baseLinksStructure.forEach((baseLink) => {
					if (!orderedBaseLinks.find((l) => l.path === baseLink.path)) {
						orderedBaseLinks.push(baseLink);
					}
				});
				// Filtrar links que podem ter sido removidos da base mas estavam salvos
				const finalOrderedBaseLinks = orderedBaseLinks.filter((ol) => basePaths.includes(ol.path));

				// A variável reativa 'links' será atualizada automaticamente devido à mudança em $t
				// quando 'configuracoes' carregar. Para a ordem, precisamos da estrutura base.
				// Se quisermos que a ordem persistida seja usada para gerar 'links' reativamente,
				// a 'baseLinksStructure' em si precisaria ser reordenada.
				// Ou, 'links' não seria $: derivada de baseLinksStructure, mas construída aqui e depois
				// re-traduzida por uma subscrição a `$t` ou `$configuracoes`.
				// Por simplicidade, vamos reordenar baseLinksStructure uma vez no onMount
				// e deixar que a reatividade de `$t` cuide da tradução.
				// Isso significa que `baseLinksStructure` será modificada aqui.
				if (finalOrderedBaseLinks.length === baseLinksStructure.length) {
					// Garante que não perdemos links base
					// Reatribuir para que 'links' reativo possa pegar a nova ordem.
					// Esta abordagem é um pouco complexa para a reatividade da ordem E tradução.
					// Idealmente, a ordem seria uma store separada, ou 'links' seria uma writable store.
					// Por ora, vamos assumir que a tradução é o foco principal.
					// A forma mais simples para a ordem persistida seria reconstruir `links` não reativamente aqui
					// e depois ter uma subscrição separada para atualizar os labels quando o idioma mudar.
					// Para manter o padrão do $:
					const tempLinks = finalOrderedBaseLinks.map((linkConfig) => ({
						...linkConfig,
						label: $t(linkConfig.labelKey) // Traduz com o idioma atual
					}));
					links = tempLinks; // Atribui os links ordenados e traduzidos
				} else {
					// Fallback se a ordem salva estiver inconsistente
					links = baseLinksStructure.map((linkConfig) => ({
						...linkConfig,
						label: $t(linkConfig.labelKey)
					}));
				}
			} catch (e) {
				console.error('Erro ao carregar ordem da sidebar:', e);
				links = baseLinksStructure.map((linkConfig) => ({
					...linkConfig,
					label: $t(linkConfig.labelKey)
				}));
			}
		} else {
			// Se não houver ordem salva, 'links' já será gerado reativamente a partir de baseLinksStructure
			// A primeira tradução ocorrerá quando $t estiver disponível (após $configuracoes carregar).
			// Para garantir que os labels são traduzidos no mount inicial:
			links = baseLinksStructure.map((linkConfig) => ({
				...linkConfig,
				label: $t(linkConfig.labelKey)
			}));
		}

		// A store 'configuracoes' já deve carregar do localStorage em sua própria definição (pageStore.ts)
		// e aplicar o tema/idioma através de sua própria subscrição.
		// O onMount do layout pode precisar ouvir mudanças no tema do sistema se a store não fizer isso.

		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		systemThemeChangeHandler = () => {
			let currentConfig: { tema: Tema; idioma: AppIdioma } | undefined;
			const unsub = configuracoes.subscribe((value) => (currentConfig = value));
			unsub();

			if (currentConfig && currentConfig.tema === 'sistema') {
				// pageStore.ts já deve lidar com a atualização do data-tema
				// Se não, precisaríamos chamar aplicarTemaEIdioma aqui.
				// Apenas para garantir que a store é notificada se quisermos que ela faça algo mais:
				// configuracoes.update(cfg => ({...cfg})); // Força uma notificação (geralmente não necessário)
				// O importante é que document.documentElement.setAttribute('data-tema', ...) seja chamado.
				// E isso já é feito pela subscrição em pageStore.ts.
				aplicarTemaEIdioma('sistema', currentConfig.idioma); // Redundante se pageStore.ts faz
			}
		};
		if (mediaQuery) {
			// Verifica se mediaQuery não é null
			mediaQuery.addEventListener('change', systemThemeChangeHandler);
		}

		// A subscrição em pageStore.ts já aplica tema e idioma ao document.documentElement.
		// Esta subscrição aqui seria para reações específicas do layout, se necessário.
		// Por exemplo, se `links` não fosse reativo aos labels, precisaríamos re-traduzir aqui.
		// Como `links` é reativo a `$t`, e `$t` é reativo a `$configuracoes`, já deve funcionar.
		unsubscribeConfigStore = configuracoes.subscribe((currentConfigs) => {
			// Esta chamada é provavelmente redundante se pageStore.ts já faz o mesmo.
			// No entanto, não prejudica e garante que o layout está sincronizado.
			aplicarTemaEIdioma(currentConfigs.tema, currentConfigs.idioma);

			// Se a ordem dos links fosse uma store e os labels não fossem reativos via $t, faríamos:
			// links = links.map(link => ({ ...link, label: $t(link.labelKey) }));
		});

		// Aplicação inicial do tema e idioma no primeiro carregamento,
		// caso pageStore.ts ainda não o tenha feito ou para garantir.
		let initialConfigs: { tema: Tema; idioma: AppIdioma } | undefined;
		const unsubInitial = configuracoes.subscribe((value) => (initialConfigs = value));
		unsubInitial();
		if (initialConfigs) {
			aplicarTemaEIdioma(initialConfigs.tema, initialConfigs.idioma);
		}
	});

	onDestroy(() => {
		if (mediaQuery && systemThemeChangeHandler) {
			mediaQuery.removeEventListener('change', systemThemeChangeHandler);
		}
		if (unsubscribeConfigStore) {
			unsubscribeConfigStore();
		}
	});

	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
		(event.currentTarget as HTMLElement).classList.add('dragging');
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		// Não alteramos dragOverIndex aqui para evitar saltos rápidos
		// A reordenação acontece com base no dragOver do elemento alvo.
		const items = [...links];
		const draggedItem = items[draggedIndex];
		items.splice(draggedIndex, 1);
		items.splice(index, 0, draggedItem);

		links = items;
		draggedIndex = index; // Atualiza o índice do item arrastado para sua nova posição
	}

	function handleDragEnd() {
		if (draggedIndex !== null) {
			// Se houve um drag
			// Salva a nova ordem usando os paths originais para persistência
			const pathOrderToSave = links.map((link) => link.path);
			localStorage.setItem('sidebarLinksOrder', JSON.stringify(pathOrderToSave));
		}
		draggedIndex = null;
		dragOverIndex = null; // Resetado aqui também
		document
			.querySelectorAll('.sidebar-links a.dragging')
			.forEach((el) => el.classList.remove('dragging'));
	}

	function handleBrandClick() {
		isSidebarOpen.update((open) => !open);
	}

	let touchStartX = 0;
	let touchStartY = 0;

	function handleTouchStart(event: TouchEvent, index: number) {
		draggedIndex = index;
		const touch = event.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		const targetLink = event.currentTarget as HTMLElement;
		targetLink.classList.add('dragging');
		// Previne scroll da página enquanto arrasta o item na sidebar
		// event.preventDefault(); // Cuidado: pode impedir o scroll da sidebar se ela for longa
	}

	function handleTouchMove(event: TouchEvent) {
		if (draggedIndex === null) return;
		// event.preventDefault(); // Cuidado: pode impedir o scroll da sidebar se ela for longa

		const touch = event.touches[0];
		// Encontrar o elemento <a> diretamente sob o toque
		const targetElement = document
			.elementFromPoint(touch.clientX, touch.clientY)
			?.closest('.sidebar-links a');

		if (targetElement) {
			const allLinkElements = Array.from(document.querySelectorAll('.sidebar-links a'));
			const newDragOverIndex = allLinkElements.indexOf(targetElement);

			if (newDragOverIndex !== -1 && newDragOverIndex !== draggedIndex) {
				// dragOverIndex não é mais necessário para a lógica de reordenação direta
				const items = [...links];
				const draggedItem = items[draggedIndex];
				items.splice(draggedIndex, 1);
				items.splice(newDragOverIndex, 0, draggedItem);

				links = items;
				draggedIndex = newDragOverIndex;
			}
		}
	}

	function handleTouchEnd() {
		handleDragEnd(); // Usa a mesma lógica para salvar e limpar classes
	}
</script>

<svelte:head>
	<title>HiveSpace</title>
	<link rel="icon" href="/icon.svg" type="image/svg+xml" />
</svelte:head>

<div class="sidebar" class:open={$isSidebarOpen} class:closed={!$isSidebarOpen}>
	<div
		class="sidebar-brand"
		on:click={handleBrandClick}
		role="button"
		tabindex="0"
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleBrandClick() : null)}
		aria-expanded={$isSidebarOpen}
		aria-controls="sidebar-nav"
		aria-label={$t('layout.sidebar.toggleAria')}
	>
		<img src="/icon.svg" alt={$t('layout.sidebar.brandAlt')} class="brand-icon floating" />
		{#if $isSidebarOpen}<h1 class="brand-title">HiveSpace</h1>{/if}
	</div>
	<nav
		class="sidebar-links"
		id="sidebar-nav"
		aria-label={$t('layout.sidebar.navegacaoPrincipalAria')}
	>
		{#each links as link, index (link.path)}
			<a
				href={link.path}
				class:active={$page.url.pathname === link.path ||
					($page.url.pathname.startsWith(link.path + '/') && link.path !== '/')}
				draggable="true"
				on:dragstart={(e) => handleDragStart(e, index)}
				on:dragover={(e) => handleDragOver(e, index)}
				on:dragend={handleDragEnd}
				on:touchstart={(e) => handleTouchStart(e, index)}
				on:touchmove={handleTouchMove}
				on:touchend={handleTouchEnd}
				aria-current={$page.url.pathname === link.path ? 'page' : undefined}
				title={link.label}
			>
				<img src={link.icon} alt="" class="link-icon" />
				{#if $isSidebarOpen}<span>{link.label}</span>{/if}
			</a>
		{/each}
	</nav>
</div>

<main class="content" class:sidebar-open={$isSidebarOpen} class:sidebar-closed={!$isSidebarOpen}>
	<slot />
</main>

<style>
	/* Seus estilos CSS existentes permanecem aqui */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		background-color: var(--sidebar-background-color);
		color: var(--sidebar-text-color);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		padding-top: 20px;
		box-shadow: 2px 0 5px color-mix(in srgb, var(--shadow, rgba(0, 0, 0, 0.1)) 20%, transparent);
		display: flex;
		flex-direction: column;
		width: 250px;
		z-index: 1000;
	}
	.sidebar.closed {
		width: 80px;
	}
	.sidebar.closed .sidebar-links a {
		justify-content: center;
	}
	.sidebar.closed .sidebar-links a span {
		display: none;
	}
	.sidebar-brand {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 10px;
		cursor: pointer;
		margin-bottom: 30px;
		width: 100%;
		padding: 0 15px;
		box-sizing: border-box;
		user-select: none;
	}
	.sidebar.closed .sidebar-brand {
		flex-direction: column;
		padding: 0 10px;
	}
	.sidebar-brand .brand-icon {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
	}
	.floating {
		animation: float 3s infinite ease-in-out;
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-4px);
		}
	}
	.brand-title {
		color: var(--primary-color);
		font-weight: bold;
		font-size: 1.5rem;
		text-align: center;
		white-space: nowrap;
		margin: 0;
		opacity: 1;
		transition: opacity 0.2s ease-in-out;
	}
	.sidebar.closed .brand-title {
		opacity: 0;
		display: none;
	}
	.sidebar-links {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		padding: 0 12px;
		box-sizing: border-box;
		overflow-y: auto;
		overflow-x: hidden;
		flex-grow: 1;
	}
	.sidebar-links::-webkit-scrollbar {
		width: 6px;
	}
	.sidebar-links::-webkit-scrollbar-track {
		background: transparent;
	}
	.sidebar-links::-webkit-scrollbar-thumb {
		background-color: var(--border-color);
		border-radius: 6px;
	}
	.sidebar-links::-webkit-scrollbar-thumb:hover {
		background-color: var(--text-color-muted, var(--border-color));
	}
	.sidebar-links a {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--sidebar-text-color);
		text-decoration: none;
		padding: 10px 12px;
		border-radius: var(--radius);
		transition:
			background-color 0.2s,
			color 0.2s,
			transform 0.15s,
			opacity 0.15s;
		white-space: nowrap;
		user-select: none;
	}
	.sidebar-links a:hover {
		background-color: var(--link-hover-background-color);
	}
	.sidebar-links a.dragging {
		opacity: 0.4;
		background-color: var(--link-active-background-color);
		transform: scale(0.95);
		border: 1px dashed var(--link-active-text-color);
	}
	.sidebar-links a.active {
		background-color: var(--link-active-background-color);
		color: var(--link-active-text-color);
		font-weight: 600;
	}
	.sidebar-links .link-icon {
		width: 22px;
		height: 22px;
		filter: brightness(0) saturate(100%);
		flex-shrink: 0;
		transition: filter 0.2s ease-in-out;
	}
	.sidebar-links a.active .link-icon {
		filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg)
			brightness(200%) contrast(100%);
	}
	.content {
		padding: clamp(1.5rem, 3vw, 2rem);
		transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 100vh;
		background-color: var(--content-background-color);
	}
	.content.sidebar-open {
		margin-left: 250px;
	}
	.content.sidebar-closed {
		margin-left: 80px;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 220px;
		}
		.sidebar.closed {
			width: 70px;
		}
		.content.sidebar-open {
			margin-left: 220px;
		}
		.content.sidebar-closed {
			margin-left: 70px;
		}
		.content {
			padding: 1.5rem;
		}
		.brand-title {
			font-size: 1.35rem;
		}
	}
	:global(html[data-tema='escuro'] .sidebar-links a:not(.active) .link-icon) {
		filter: brightness(0) saturate(100%) invert(1) sepia(0) saturate(0) hue-rotate(0deg)
			brightness(1.5);
	}
</style>
