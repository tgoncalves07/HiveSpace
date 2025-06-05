<!-- src/routes/sobre/+page.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import { FolderOpen, Tag, Code, Users, Lightbulb, Target, LayoutTemplate } from 'lucide-svelte';
	import { derived } from 'svelte/store'; // ESSENCIAL
	import { configuracoes } from '../../lib/stores/pageStore'; // VERIFIQUE ESTE CAMINHO

	// 1. DICIONÁRIO DE TRADUÇÕES LOCAL para esta página (Sobre)
	const aboutTranslations = {
		pt: {
			'sobre.tituloPagina': 'Sobre o HiveSpace',
			'sobre.projeto.titulo': 'O Projeto',
			'sobre.projeto.paragrafo1':
				'O HiveSpace é uma aplicação web desenvolvida como parte da Prova de Aptidão Profissional (PAP) do curso de Gestão e Programação de Sistemas Informáticos.',
			'sobre.projeto.paragrafo2':
				'A nossa missão é fornecer uma solução integrada para ajudar pequenos empresários a otimizar e organizar o seu trabalho diário através de ferramentas de gestão de tarefas, lembretes e notas.',
			'sobre.nome.titulo': 'O Nome',
			'sobre.nome.intro': '<strong>HiveSpace</strong> combina dois conceitos fundamentais:',
			'sobre.nome.itemHive':
				'<strong>Hive (Colmeia):</strong> Representa o trabalho organizado e colaborativo.',
			'sobre.nome.itemSpace':
				'<strong>Space (Espaço):</strong> Simboliza um ambiente de trabalho agradável e produtivo.',
			'sobre.nome.conclusao':
				'Juntos, formam a visão de um espaço de trabalho eficiente onde as tarefas fluem de forma organizada como numa colmeia.',
			'sobre.tecnologias.titulo': 'Tecnologias Utilizadas',
			'sobre.tecnologias.intro':
				'A aplicação foi desenvolvida utilizando as seguintes tecnologias principais:',
			'sobre.tecnologias.itemSvelteKit': 'SvelteKit (Framework Full-Stack)',
			'sobre.tecnologias.itemTypeScript': 'TypeScript (Tipagem Estática)',
			'sobre.tecnologias.itemSvelte': 'Svelte (UI Compilador)',
			'sobre.tecnologias.itemHTML5': 'HTML5 (Estrutura Semântica)',
			'sobre.tecnologias.itemCSS3': 'CSS3 (Estilização Moderna)',
			'sobre.tecnologias.itemLucide': 'Lucide Icons (Ícones SVG)',
			'sobre.equipe.titulo': 'Equipe e Agradecimentos',
			'sobre.equipe.desenvolvidoPor': 'Projeto desenvolvido por:',
			'sobre.equipe.devPrincipal':
				'<strong>Tiago Gonçalves</strong> (Desenvolvimento Principal e UI/UX)',
			'sobre.equipe.colaboracao': 'Com a colaboração e orientação de:',
			'sobre.equipe.colabVitor':
				'<strong>Vitor Verissimo</strong> (Design Inicial, Testes e Feedback)',
			'sobre.equipe.colabTiagoC': '<strong>Tiago Carmo</strong> (Orientação Técnica e Testes)',
			'sobre.equipe.agradecimentoFinal':
				'Um agradecimento especial a todos os que contribuíram com ideias, apoio e feedback durante o desenvolvimento desta Prova de Aptidão Profissional e na criação do HiveSpace.'
		},
		en: {
			'sobre.tituloPagina': 'About HiveSpace',
			'sobre.projeto.titulo': 'The Project',
			'sobre.projeto.paragrafo1':
				'HiveSpace is a web application developed as part of the Professional Aptitude Test (PAP) for the Information Systems Management and Programming course.',
			'sobre.projeto.paragrafo2':
				'Our mission is to provide an integrated solution to help small business owners optimize and organize their daily work through task management, reminders, and note-taking tools.',
			'sobre.nome.titulo': 'The Name',
			'sobre.nome.intro': '<strong>HiveSpace</strong> combines two fundamental concepts:',
			'sobre.nome.itemHive': '<strong>Hive:</strong> Represents organized and collaborative work.',
			'sobre.nome.itemSpace':
				'<strong>Space:</strong> Symbolizes a pleasant and productive work environment.',
			'sobre.nome.conclusao':
				'Together, they form the vision of an efficient workspace where tasks flow組織edly like in a beehive.',
			'sobre.tecnologias.titulo': 'Technologies Used',
			'sobre.tecnologias.intro':
				'The application was developed using the following main technologies:',
			'sobre.tecnologias.itemSvelteKit': 'SvelteKit (Full-Stack Framework)',
			'sobre.tecnologias.itemTypeScript': 'TypeScript (Static Typing)',
			'sobre.tecnologias.itemSvelte': 'Svelte (UI Compiler)',
			'sobre.tecnologias.itemHTML5': 'HTML5 (Semantic Structure)',
			'sobre.tecnologias.itemCSS3': 'CSS3 (Modern Styling)',
			'sobre.tecnologias.itemLucide': 'Lucide Icons (SVG Icons)',
			'sobre.equipe.titulo': 'Team and Acknowledgments',
			'sobre.equipe.desenvolvidoPor': 'Project developed by:',
			'sobre.equipe.devPrincipal': '<strong>Tiago Gonçalves</strong> (Main Development and UI/UX)',
			'sobre.equipe.colaboracao': 'With the collaboration and guidance of:',
			'sobre.equipe.colabVitor':
				'<strong>Vitor Verissimo</strong> (Initial Design, Testing, and Feedback)',
			'sobre.equipe.colabTiagoC': '<strong>Tiago Carmo</strong> (Technical Guidance and Testing)',
			'sobre.equipe.agradecimentoFinal':
				'A special thank you to everyone who contributed ideas, support, and feedback during the development of this Professional Aptitude Test and the creation of HiveSpace.'
		}
		// Adicionar outros idiomas se necessário
	};

	// 2. Store derivada 't' LOCAL
	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number>): string => {
			const selectedLang = $cfg.idioma;
			let langDict =
				aboutTranslations[selectedLang as keyof typeof aboutTranslations] || aboutTranslations.pt;
			let text = langDict?.[key] || aboutTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});
	// --- FIM DA LÓGICA DE TRADUÇÃO LOCAL ---

	// $: if ($configuracoes) { // Para depuração
	//  console.log('[SOBRE] Idioma da store configuracoes:', $configuracoes.idioma);
	//  console.log('[SOBRE] Titulo Traduzido ($t):', $t('sobre.tituloPagina'));
	// }
</script>

<div class="page-container" in:fade={{ duration: 300 }}>
	<header class="page-header-style">
		<h1><LayoutTemplate size={28} /> {$t('sobre.tituloPagina')}</h1>
	</header>

	<div class="content-grid-style">
		<div class="info-card">
			<h2><Lightbulb size={20} /> {$t('sobre.projeto.titulo')}</h2>
			<p>{$t('sobre.projeto.paragrafo1')}</p>
			<p>{$t('sobre.projeto.paragrafo2')}</p>
		</div>

		<div class="info-card">
			<h2><Tag size={20} /> {$t('sobre.nome.titulo')}</h2>
			<p>{@html $t('sobre.nome.intro')}</p>
			<ul>
				<li>{@html $t('sobre.nome.itemHive')}</li>
				<li>{@html $t('sobre.nome.itemSpace')}</li>
			</ul>
			<p>{$t('sobre.nome.conclusao')}</p>
		</div>

		<div class="info-card">
			<h2><Code size={20} /> {$t('sobre.tecnologias.titulo')}</h2>
			<p>{$t('sobre.tecnologias.intro')}</p>
			<ul class="tech-list-style">
				<li>{$t('sobre.tecnologias.itemSvelteKit')}</li>
				<li>{$t('sobre.tecnologias.itemTypeScript')}</li>
				<li>{$t('sobre.tecnologias.itemSvelte')}</li>
				<li>{$t('sobre.tecnologias.itemHTML5')}</li>
				<li>{$t('sobre.tecnologias.itemCSS3')}</li>
				<li>{$t('sobre.tecnologias.itemLucide')}</li>
			</ul>
		</div>

		<div class="info-card">
			<h2><Users size={20} /> {$t('sobre.equipe.titulo')}</h2>
			<p>{$t('sobre.equipe.desenvolvidoPor')}</p>
			<ul>
				<li>{@html $t('sobre.equipe.devPrincipal')}</li>
			</ul>
			<p>{$t('sobre.equipe.colaboracao')}</p>
			<ul>
				<li>{@html $t('sobre.equipe.colabVitor')}</li>
				<li>{@html $t('sobre.equipe.colabTiagoC')}</li>
			</ul>
			<p>{$t('sobre.equipe.agradecimentoFinal')}</p>
		</div>
	</div>
</div>

<style>
	/* Seus estilos CSS existentes aqui... */
	.page-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: clamp(1.5rem, 3vw, 2.5rem);
		color: var(--app-text-color);
	}
	.page-header-style {
		text-align: center;
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	.page-header-style h1 {
		font-size: clamp(2rem, 5vw, 2.5rem);
		color: var(--app-text-color);
		margin: 0;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}
	.content-grid-style {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
		gap: 2rem;
	}
	.info-card {
		background-color: var(--card-background-color);
		padding: clamp(1.5rem, 3vw, 2rem);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		transition:
			transform 0.2s ease-out,
			box-shadow 0.2s ease-out;
	}
	.info-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 7px 18px -4px color-mix(in srgb, var(--shadow) 50%, transparent);
	}
	.info-card h2 {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 0;
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		color: var(--primary-color);
		font-size: 1.4rem;
		font-weight: 600;
	}
	.info-card p,
	.info-card li {
		line-height: 1.65;
		color: var(--app-text-color);
		margin-bottom: 1rem;
	}
	.info-card p:last-child,
	.info-card ul:last-child {
		margin-bottom: 0;
	}
	.info-card ul {
		padding-left: 1.25rem;
		margin-top: -0.5rem;
		list-style-type: disc;
	}
	.info-card ul li {
		margin-bottom: 0.5rem;
	}
	.tech-list-style {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.75rem;
		padding-left: 0;
		list-style: none;
	}
	.tech-list-style li {
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		text-align: center;
		font-weight: 500;
		margin-bottom: 0;
		border: 1px solid var(--border-color);
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
	}
	.tech-list-style li:hover {
		background-color: var(--border-color);
		border-color: var(--text-color-muted, var(--border-color));
	}
	@media (max-width: 768px) {
		.page-container {
			padding: clamp(1rem, 3vw, 1.5rem);
		}
		.page-header-style h1 {
			font-size: clamp(1.75rem, 5vw, 2rem);
		}
		.info-card {
			padding: clamp(1.25rem, 3vw, 1.5rem);
		}
		.content-grid-style {
			gap: 1.5rem;
		}
		.tech-list-style {
			grid-template-columns: 1fr;
		}
	}
</style>
