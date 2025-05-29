<!-- src/routes/sobre/+page.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import { FolderOpen, Tag, Code, Users, Lightbulb, Target, LayoutTemplate } from 'lucide-svelte';
</script>

<div class="sobre-container" in:fade>
	<header>
		<h1><LayoutTemplate size={28} /> Sobre o HiveSpace</h1>
	</header>

	<div class="content-grid">
		<div class="card">
			<h2><Lightbulb size={20} /> O Projeto</h2>
			<p>
				O HiveSpace é uma aplicação web desenvolvida como parte da Prova de Aptidão Profissional
				(PAP) do curso de Gestão e Programação de Sistemas Informáticos.
			</p>
			<p>
				A nossa missão é fornecer uma solução integrada para ajudar pequenos empresários a otimizar
				e organizar o seu trabalho diário através de ferramentas de gestão de tarefas, lembretes e
				notas.
			</p>
		</div>

		<div class="card">
			<h2><Tag size={20} /> O Nome</h2>
			<p>
				<strong>HiveSpace</strong> combina dois conceitos fundamentais:
			</p>
			<ul>
				<li><strong>Hive (Colmeia):</strong> Representa o trabalho organizado e colaborativo</li>
				<li>
					<strong>Space (Espaço):</strong> Simboliza um ambiente de trabalho agradável e produtivo
				</li>
			</ul>
			<p>
				Juntos, formam a visão de um espaço de trabalho eficiente onde as tarefas fluem de forma
				organizada como numa colmeia.
			</p>
		</div>

		<div class="card">
			<h2><Code size={20} /> Tecnologias</h2>
			<p>A aplicação foi desenvolvida utilizando as seguintes tecnologias:</p>
			<ul class="tech-list">
				<li>SvelteKit (Framework principal)</li>
				<li>HTML5 (Estrutura)</li>
				<li>CSS3 (Estilização)</li>
				<li>JavaScript (Interatividade)</li>
				<li>TypeScript (Tipagem estática)</li>
			</ul>
		</div>

		<div class="card">
			<h2><Users size={20} /> Desenvolvimento</h2>
			<p>Projeto desenvolvido por:</p>
			<ul>
				<li><strong>Tiago Gonçalves</strong> (Desenvolvimento principal)</li>
			</ul>
			<p>Com ajuda de:</p>
			<ul>
				<li><strong>Vitor Verissimo</strong> (Desinger, Tester)</li>
				<li><strong>Tiago Carmo</strong> (Orientação, Tester)</li>
			</ul>
			<p>
				Agradecimento especial a todos os envolvidos no desenvolvimento desta PAP e na criação do
				HiveSpace.
			</p>
		</div>
	</div>
</div>

<style>
	.sobre-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1 {
		font-size: 2.5rem;
		color: var(--text);
		margin: 0;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.content-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 1.5rem;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		transition: transform 0.3s ease;
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}

	.card h2 {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--light-gray);
		color: var(--primary);
		font-size: 1.5rem;
	}

	.card p {
		line-height: 1.6;
		color: var(--secondary);
		margin-bottom: 1.25rem;
	}

	.card ul {
		padding-left: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.card li {
		margin-bottom: 0.75rem;
		line-height: 1.5;
	}

	.tech-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
		padding-left: 0;
		list-style: none;
	}

	.tech-list li {
		background: var(--background);
		padding: 0.75rem 1rem;
		border-radius: 4px;
		text-align: center;
		font-weight: 500;
		margin-bottom: 0;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
	}

	@media (max-width: 768px) {
		.sobre-container {
			padding: 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}

		.card {
			padding: 1.5rem;
		}

		.content-grid {
			gap: 1.5rem;
		}
	}
</style>
