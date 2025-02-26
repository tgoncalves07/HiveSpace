<script>
	let { children } = $props();
	import '../app.css';
</script>

<main class="app">
	<aside>
		<h1 style="text-align: center;">
			<img class="hive" src="icon.svg" alt="" /> HiveSpace
		</h1>
		<nav style="padding: 30px;">
			<a href="/"><img class="icon" src="/casa.svg" alt="home" /> Pagina Principal</a> <br />
			<a href="/projetos"><img class="icon" src="/mala.svg" alt="mala" /> Projetos</a><br />
			<a href="/ideias"><img class="icon" src="lamp.svg" alt="lamp" /> Ideias</a><br />
			<a href="/equipas"><img class="icon" src="equipas.svg" alt="equipa" /> Equipas</a><br />
			<a href="/chat"><img class="icon" src="chat.svg" alt="chat" /> Chat</a><br />
			<a href="/config"><img class="icon" src="gear.svg" alt="gear" /> Config</a><br />
			<a href="/sobre"><img class="icon" src="sobre.svg" alt="" /> Sobre</a><br />
		</nav>
	</aside>
	<article>
		{@render children?.()}
	</article>
</main>

<style>
	article {
		padding: 20px;
	}
</style>
