<script>
	import { page } from '$app/stores';
</script>

<nav class="navbar">
	<div class="navbar-brand">
		<a href="/" style="display: flex; align-items: center; text-decoration: none;">
			<img src="/icon.svg" alt="HiveSpace Icon" class="icon" />
			<h1 style="color: #3D679D; font-size: 32px; margin: 0;">HiveSpace</h1>
		</a>
	</div>
	<div class="navbar-links">
		<a href="/projetos" class={$page.url.pathname === '/projetos' ? 'active' : ''}>
			<img src="/mala.svg" alt="Projetos" />
			<span>Projetos</span>
		</a>
		<a href="/ideias" class={$page.url.pathname === '/ideias' ? 'active' : ''}>
			<img src="/lamp.svg" alt="Ideias" />
			<span>Ideias</span>
		</a>
		<a href="/equipas" class={$page.url.pathname === '/equipas' ? 'active' : ''}>
			<img src="/equipas.svg" alt="Equipas" />
			<span>Equipas</span>
		</a>
		<a href="/chat" class={$page.url.pathname === '/chat' ? 'active' : ''}>
			<img src="/chat.svg" alt="Chat" />
			<span>Chat</span>
		</a>
		<a href="/config" class={$page.url.pathname === '/config' ? 'active' : ''}>
			<img src="/gear.svg" alt="Configurações" />
			<span>Configurações</span>
		</a>
		<a href="/sobre" class={$page.url.pathname === '/sobre' ? 'active' : ''}>
			<img src="/sobre.svg" alt="Sobre" />
			<span>Sobre</span>
		</a>
	</div>
</nav>

<slot />

<style>
	:root {
		--primary-color: #6c5ce7; 
		--secondary-color: #636363; 
		--background-color: #c7c7c7; 
		--text-color: #686868; 
		--hover-color: #d1d8e0;
		--active-color: #a3a3a3; 
	}


	body {
		font-family: 'Cocogoose', Arial, sans-serif;
	}

	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: var(--background-color);
		color: var(--text-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 20px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.navbar-brand {
		display: flex;
		align-items: center;
	}

	.navbar-brand a {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.navbar-brand .icon {
		width: 40px;
		height: 40px;
		margin-right: 10px;
	}

	.navbar-brand h1 {
		font-size: 32px;
		color: var(--primary-color);
		font-family: 'Cocogoose', Arial, sans-serif; 
	}

	.navbar-links {
		display: flex;
		gap: 15px;
		margin-right: 50px;
	}

	.navbar-links a {
		display: flex;
		align-items: center;
		color: var(--text-color);
		text-decoration: none;
		padding: 10px;
		border-radius: 5px;
		transition: background-color 0.3s, color 0.3s;
		font-family: 'Cocogoose', Arial, sans-serif; 
	}

	.navbar-links a:hover {
		background-color: var(--hover-color);
		color: var(--text-color);
	}

	.navbar-links a.active {
		background-color: var(--active-color);
		color: var(--background-color);
	}

	.navbar-links img {
		width: 24px;
		height: 24px;
		margin-right: 8px;
		filter: brightness(0) saturate(100%);
	}

	.navbar-links span {
		font-size: 16px;
		font-family: 'Cocogoose', Arial, sans-serif;
	}
</style>