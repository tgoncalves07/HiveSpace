<!--src/routes/config/+page.svelte-->
<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import {
		configuracoes,
		type Tema,
		type Idioma,
		type ConfiguracoesState,
		// type PrioridadeTarefa, // Removido
		// type TipoLembreteTarefa, // Removido
		getAppDefaults
	} from '../../lib/stores/pageStore';
	import {
		Settings,
		Globe,
		Moon,
		Sun,
		Save,
		RotateCcw,
		Database,
		Download,
		Upload,
		Trash2,
		AlertTriangle,
		CheckCircle,
		Monitor
		// ClipboardCheck, // Removido
		// Bell // Removido
	} from 'lucide-svelte';

	// --- DICIONÁRIO DE TRADUÇÕES ---
	const translations = {
		pt: {
			'config.titulo': 'Configurações',
			'config.salvar': 'Guardar Alterações',
			'config.aparencia.titulo': 'Aparência',
			'config.aparencia.tema': 'Tema',
			'config.aparencia.idioma': 'Idioma',
			'config.dados.titulo': 'Gestão de Dados da Aplicação',
			'config.dados.exportar': 'Exportar Todos os Dados',
			'config.dados.importar': 'Importar Dados',
			'config.dados.exportarInfo':
				'Crie um ficheiro de backup com as suas configurações e dados de projetos. Guarde este ficheiro num local seguro.',
			'config.dados.importarInfo':
				'Restaure as suas configurações e dados de projetos a partir de um ficheiro de backup previamente exportado.',
			// Seção de Tarefas Removida das Traduções
			// 'config.tarefas.titulo': 'Padrões de Tarefas',
			// 'config.tarefas.prioridadePadrao': 'Prioridade Padrão',
			// ...
			'config.perigo.titulo': 'Opções de Restauro',
			'config.perigo.repor': 'Repor Configurações Padrão',
			'config.perigo.eliminar': 'Eliminar Todos os Dados de Projetos',
			'config.temas.claro': 'Claro',
			'config.temas.escuro': 'Escuro',
			'config.temas.sistema': 'Sistema',
			'config.mensagens.guardadoSucesso': 'Configurações guardadas com sucesso!',
			'config.mensagens.repostoSucesso': 'Configurações repostas para os valores padrão.',
			'config.mensagens.exportadoSucesso':
				'Dados exportados com sucesso! Guarde o ficheiro num local seguro.',
			'config.mensagens.importadoSucesso': 'Dados importados com sucesso!',
			'config.mensagens.erroExportar': 'Erro ao exportar dados. Verifique o console.',
			'config.mensagens.erroImportar': 'Erro ao importar dados. Ficheiro inválido ou corrompido.',
			'config.mensagens.erroLerFicheiro': 'Erro ao ler o ficheiro.',
			'config.mensagens.dadosEliminados':
				'Todos os dados de projetos foram eliminados e as configurações repostas.',
			'modal.repor.titulo': 'Repor Configurações',
			'modal.repor.descricao':
				'Tem a certeza de que deseja repor todas as configurações para os valores padrão? Esta ação não afetará os seus projetos e tarefas guardados.',
			'modal.repor.cancelar': 'Cancelar',
			'modal.repor.confirmar': 'Confirmar Reposição',
			'modal.exportar.titulo': 'Exportar Todos os Dados',
			'modal.exportar.descricao':
				'Será criado um ficheiro JSON contendo todas as suas configurações atuais e os dados de todos os seus projetos e tarefas. Guarde este ficheiro num local seguro para poder restaurá-lo mais tarde, se necessário.',
			'modal.exportar.exportar': 'Exportar Agora',
			'modal.eliminar.titulo': 'Eliminar Dados de Projetos e Tarefas',
			'modal.eliminar.atencao': 'ATENÇÃO: Esta ação é irreversível!',
			'modal.eliminar.descricao':
				'Todos os seus projetos e tarefas (guardados localmente no navegador) serão permanentemente eliminados. As configurações da aplicação serão repostas para os valores padrão.',
			'modal.eliminar.avisoBackup':
				'RECOMENDAÇÃO: Exporte os seus dados antes de continuar, caso deseje ter um backup.',
			'modal.eliminar.confirmar': 'Sim, Eliminar Tudo'
		},
		en: {
			// Lembre-se de atualizar o inglês também
			'config.titulo': 'Settings',
			'config.salvar': 'Save Changes',
			'config.aparencia.titulo': 'Appearance',
			'config.aparencia.tema': 'Theme',
			'config.aparencia.idioma': 'Language',
			'config.dados.titulo': 'Application Data Management',
			'config.dados.exportar': 'Export All Data',
			'config.dados.importar': 'Import Data',
			'config.dados.exportarInfo':
				'Create a backup file with your settings and project data. Store this file in a safe place.',
			'config.dados.importarInfo':
				'Restore your settings and project data from a previously exported backup file.',
			'config.perigo.titulo': 'Reset Options',
			'config.perigo.repor': 'Reset Settings to Default',
			'config.perigo.eliminar': 'Delete All Project Data',
			'config.temas.claro': 'Light',
			'config.temas.escuro': 'Dark',
			'config.temas.sistema': 'System',
			'config.mensagens.guardadoSucesso': 'Settings saved successfully!',
			'config.mensagens.repostoSucesso': 'Settings reset to default values.',
			'config.mensagens.exportadoSucesso':
				'Data exported successfully! Store the file in a safe place.',
			'config.mensagens.importadoSucesso': 'Data imported successfully!',
			'config.mensagens.erroExportar': 'Error exporting data. Check console.',
			'config.mensagens.erroImportar': 'Error importing data. Invalid or corrupted file.',
			'config.mensagens.erroLerFicheiro': 'Error reading file.',
			'config.mensagens.dadosEliminados': 'All project data has been deleted and settings reset.',
			'modal.repor.titulo': 'Reset Settings',
			'modal.repor.descricao':
				'Are you sure you want to reset all settings to their default values? This action will not affect your saved projects and tasks.',
			'modal.repor.cancelar': 'Cancel',
			'modal.repor.confirmar': 'Confirm Reset',
			'modal.exportar.titulo': 'Export All Data',
			'modal.exportar.descricao':
				'A JSON file will be created containing all your current settings and data for all your projects and tasks. Save this file in a secure location so you can restore it later if needed.',
			'modal.exportar.exportar': 'Export Now',
			'modal.eliminar.titulo': 'Delete Project and Task Data',
			'modal.eliminar.atencao': 'WARNING: This action is irreversible!',
			'modal.eliminar.descricao':
				'All your projects and tasks (saved locally in the browser) will be permanently deleted. Application settings will be reset to their default values.',
			'modal.eliminar.avisoBackup':
				'RECOMMENDATION: Export your data before proceeding if you wish to have a backup.',
			'modal.eliminar.confirmar': 'Yes, Delete Everything'
		}
	};

	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number>): string => {
			const lang = $cfg.idioma as keyof typeof translations;
			let text = translations[lang]?.[key] || translations.pt?.[key] || key;
			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});

	let showResetModal = false;
	let showExportModal = false;
	let showDeleteModal = false;
	let mensagemSucesso = '';
	let mensagemErro = '';
	let alteracoesPendentes = false;
	let configuracoesIniciaisString = '';

	const idiomasDisponiveis = [
		{ valor: 'pt' as Idioma, nome: 'Português' },
		{ valor: 'en' as Idioma, nome: 'English' }
	];

	$: temasDisponiveisAtualizados = [
		{ valor: 'claro' as Tema, nome: $t('config.temas.claro'), icone: Sun },
		{ valor: 'escuro' as Tema, nome: $t('config.temas.escuro'), icone: Moon },
		{ valor: 'sistema' as Tema, nome: $t('config.temas.sistema'), icone: Monitor }
	];

	// prioridadesTarefa e lembretesTarefa removidos
	// $: prioridadesTarefa = [ ... ];
	// $: lembretesTarefa = [ ... ];

	onMount(() => {
		configuracoesIniciaisString = JSON.stringify($configuracoes);
		alteracoesPendentes = false;
	});

	function guardarConfiguracoes() {
		configuracoesIniciaisString = JSON.stringify($configuracoes);
		alteracoesPendentes = false;
		mostrarMensagem($t('config.mensagens.guardadoSucesso'), 'sucesso');
	}

	function resetarConfiguracoes() {
		configuracoes.reset();
		showResetModal = false;
		mostrarMensagem($t('config.mensagens.repostoSucesso'), 'sucesso');
		configuracoesIniciaisString = JSON.stringify($configuracoes);
		alteracoesPendentes = false;
	}

	function exportarDadosEFecharModal() {
		try {
			const dadosParaExportar = {
				configuracoes: $configuracoes,
				projetos: JSON.parse(localStorage.getItem('projetos') || '[]'),
				versaoApp: '1.0.0',
				dataExportacao: new Date().toISOString()
			};
			const blob = new Blob([JSON.stringify(dadosParaExportar, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `backup-app-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showExportModal = false;
			mostrarMensagem($t('config.mensagens.exportadoSucesso'), 'sucesso');
		} catch (error) {
			console.error('Erro ao exportar dados:', error);
			mostrarMensagem($t('config.mensagens.erroExportar'), 'erro');
			showExportModal = false;
		}
	}

	function importarDados(event: Event) {
		const input = event.target as HTMLInputElement;
		const ficheiro = input.files?.[0];
		if (!ficheiro) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const dadosImportados = JSON.parse(e.target?.result as string);

				if (dadosImportados.configuracoes && typeof dadosImportados.configuracoes === 'object') {
					const appDefaults = getAppDefaults();
					// Remover campos obsoletos dos dados importados antes do merge
					const {
						formatoHora,
						prioridadePadraoTarefa,
						lembretePadraoTarefa,
						...configImportadaLimpa
					} = dadosImportados.configuracoes as any;
					const mergedConfig = { ...appDefaults, ...configImportadaLimpa };
					configuracoes.set(mergedConfig as ConfiguracoesState);
				} else {
					console.warn(
						'Dados de configuração não encontrados ou em formato inválido no ficheiro importado.'
					);
				}

				if (dadosImportados.projetos) {
					localStorage.setItem('projetos', JSON.stringify(dadosImportados.projetos));
				} else {
					console.warn('Dados de projetos não encontrados no ficheiro importado.');
				}

				configuracoesIniciaisString = JSON.stringify($configuracoes);
				alteracoesPendentes = false;
				mostrarMensagem($t('config.mensagens.importadoSucesso'), 'sucesso');
			} catch (erro) {
				console.error('Erro ao importar dados:', erro);
				mostrarMensagem($t('config.mensagens.erroImportar'), 'erro');
			} finally {
				input.value = '';
			}
		};
		reader.onerror = () => {
			mostrarMensagem($t('config.mensagens.erroLerFicheiro'), 'erro');
			input.value = '';
		};
		reader.readAsText(ficheiro);
	}

	function eliminarTodosDados() {
		localStorage.removeItem('projetos');
		configuracoes.reset();
		showDeleteModal = false;
		mostrarMensagem($t('config.mensagens.dadosEliminados'), 'sucesso');
		configuracoesIniciaisString = JSON.stringify($configuracoes);
		alteracoesPendentes = false;
	}

	function mostrarMensagem(mensagem: string, tipo: 'sucesso' | 'erro') {
		if (tipo === 'sucesso') {
			mensagemErro = '';
			mensagemSucesso = mensagem;
			setTimeout(() => (mensagemSucesso = ''), 4000);
		} else {
			mensagemSucesso = '';
			mensagemErro = mensagem;
			setTimeout(() => (mensagemErro = ''), 5000);
		}
	}

	$: {
		if (
			configuracoesIniciaisString &&
			typeof $configuracoes === 'object' &&
			$configuracoes !== null
		) {
			const configAtualString = JSON.stringify($configuracoes);
			alteracoesPendentes = configAtualString !== configuracoesIniciaisString;
		}
	}
</script>

<div class="configuracoes-container">
	<header>
		<h1><Settings size={28} /> {$t('config.titulo')}</h1>
		<div class="header-controls">
			<button
				class="btn btn-primary"
				on:click={guardarConfiguracoes}
				disabled={!alteracoesPendentes}
			>
				<Save size={18} />
				{$t('config.salvar')}
			</button>
		</div>
	</header>

	{#if mensagemSucesso}
		<div class="mensagem sucesso" role="alert" transition:fade={{ duration: 300 }}>
			<CheckCircle size={20} />
			<p>{mensagemSucesso}</p>
		</div>
	{/if}
	{#if mensagemErro}
		<div class="mensagem erro" role="alert" transition:fade={{ duration: 300 }}>
			<AlertTriangle size={20} />
			<p>{mensagemErro}</p>
		</div>
	{/if}

	<div class="configuracoes-grid">
		<!-- SECÇÃO APARÊNCIA -->
		<section class="config-secao">
			<h2><Monitor size={20} /> {$t('config.aparencia.titulo')}</h2>
			<div class="config-item">
				<label for="tema-label">{$t('config.aparencia.tema')}</label>
				<div id="tema-label" class="tema-opcoes" role="group" aria-labelledby="tema-label">
					{#each temasDisponiveisAtualizados as temaOpt (temaOpt.valor)}
						<button
							class="btn tema-btn {$configuracoes.tema === temaOpt.valor ? 'ativo' : ''}"
							on:click={() => configuracoes.update((cfg) => ({ ...cfg, tema: temaOpt.valor }))}
							aria-pressed={$configuracoes.tema === temaOpt.valor}
						>
							<svelte:component this={temaOpt.icone} size={18} />
							{temaOpt.nome}
						</button>
					{/each}
				</div>
			</div>
			<div class="config-item">
				<label for="idioma"><Globe size={16} /> {$t('config.aparencia.idioma')}</label>
				<select
					id="idioma"
					bind:value={$configuracoes.idioma}
					on:change={(e) =>
						configuracoes.update((cfg) => ({
							...cfg,
							idioma: (e.target as HTMLSelectElement).value as Idioma
						}))}
					class="input"
				>
					{#each idiomasDisponiveis as idiomaOpt}
						<option value={idiomaOpt.valor}>{idiomaOpt.nome}</option>
					{/each}
				</select>
			</div>
		</section>

		<!-- SECÇÃO DADOS E BACKUP -->
		<section class="config-secao">
			<h2><Database size={20} /> {$t('config.dados.titulo')}</h2>
			<p class="info-text">{$t('config.dados.exportarInfo')}</p>
			<div class="config-item">
				<button class="btn btn-primary btn-full-width" on:click={() => (showExportModal = true)}>
					<Download size={16} />
					{$t('config.dados.exportar')}
				</button>
			</div>

			<p class="info-text">{$t('config.dados.importarInfo')}</p>
			<div class="config-item">
				<label
					class="btn btn-secondary btn-full-width"
					for="importar-dados-input"
					role="button"
					tabindex="0"
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') (e.currentTarget as HTMLLabelElement).click();
					}}
				>
					<Upload size={16} />
					{$t('config.dados.importar')}
					<input
						id="importar-dados-input"
						type="file"
						accept=".json,application/json"
						on:change={importarDados}
						style="display: none;"
					/>
				</label>
			</div>
		</section>

		<!-- SECÇÃO PADRÕES DE TAREFAS (REMOVIDA) -->
		<!--
		<section class="config-secao">
			<h2><ClipboardCheck size={20} /> {$t('config.tarefas.titulo')}</h2>
			...
		</section>
		-->

		<!-- SECÇÃO PERIGO / REPOSIÇÃO -->
		<section class="config-secao">
			<h2><RotateCcw size={20} /> {$t('config.perigo.titulo')}</h2>
			<div class="config-acoes-perigo">
				<button class="btn btn-secondary" on:click={() => (showResetModal = true)}>
					{$t('config.perigo.repor')}
				</button>
				<button class="btn btn-danger" on:click={() => (showDeleteModal = true)}>
					<Trash2 size={16} />
					{$t('config.perigo.eliminar')}
				</button>
			</div>
		</section>
	</div>

	<!-- MODAIS (sem alterações na estrutura, apenas textos podem ter mudado) -->
	{#if showResetModal}
		<div
			class="modal-overlay"
			on:click|self={() => (showResetModal = false)}
			on:keydown|self={(e) => e.key === 'Escape' && (showResetModal = false)}
			transition:fade
		>
			<div
				class="modal-content"
				role="dialog"
				aria-labelledby="resetModalTitle"
				aria-describedby="resetModalDesc"
				tabindex="-1"
				transition:slide|local={{ y: -50, duration: 250 }}
			>
				<h2 id="resetModalTitle"><RotateCcw size={24} /> {$t('modal.repor.titulo')}</h2>
				<p id="resetModalDesc">{$t('modal.repor.descricao')}</p>
				<div class="modal-actions">
					<button class="btn btn-secondary" on:click={() => (showResetModal = false)}>
						{$t('modal.repor.cancelar')}
					</button>
					<button class="btn btn-warning" on:click={resetarConfiguracoes}>
						<RotateCcw size={16} />
						{$t('modal.repor.confirmar')}
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showExportModal}
		<div
			class="modal-overlay"
			on:click|self={() => (showExportModal = false)}
			on:keydown|self={(e) => e.key === 'Escape' && (showExportModal = false)}
			transition:fade
		>
			<div
				class="modal-content"
				role="dialog"
				aria-labelledby="exportModalTitle"
				aria-describedby="exportModalDesc"
				tabindex="-1"
				transition:slide|local={{ y: -50, duration: 250 }}
			>
				<h2 id="exportModalTitle"><Download size={24} /> {$t('modal.exportar.titulo')}</h2>
				<p id="exportModalDesc">{$t('modal.exportar.descricao')}</p>
				<div class="modal-actions">
					<button class="btn btn-secondary" on:click={() => (showExportModal = false)}>
						{$t('modal.repor.cancelar')}
					</button>
					<button class="btn btn-primary" on:click={exportarDadosEFecharModal}>
						<Download size={16} />
						{$t('modal.exportar.exportar')}
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showDeleteModal}
		<div
			class="modal-overlay"
			on:click|self={() => (showDeleteModal = false)}
			on:keydown|self={(e) => e.key === 'Escape' && (showDeleteModal = false)}
			transition:fade
		>
			<div
				class="modal-content"
				role="dialog"
				aria-labelledby="deleteModalTitle"
				aria-describedby="deleteModalDesc1 deleteModalDesc2 deleteModalDesc3"
				tabindex="-1"
				transition:slide|local={{ y: -50, duration: 250 }}
			>
				<h2 id="deleteModalTitle"><Trash2 size={24} /> {$t('modal.eliminar.titulo')}</h2>
				<p id="deleteModalDesc1"><strong>{$t('modal.eliminar.atencao')}</strong></p>
				<p id="deleteModalDesc2">{$t('modal.eliminar.descricao')}</p>
				<p class="aviso-exclusao" id="deleteModalDesc3">{$t('modal.eliminar.avisoBackup')}</p>
				<div class="modal-actions">
					<button class="btn btn-secondary" on:click={() => (showDeleteModal = false)}>
						{$t('modal.repor.cancelar')}
					</button>
					<button class="btn btn-danger" on:click={eliminarTodosDados}>
						<Trash2 size={16} />
						{$t('modal.eliminar.confirmar')}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Estilos atualizados para usar variáveis CSS do seu app.css */
	.info-text {
		font-size: 0.9rem;
		color: var(--app-text-color);
		opacity: 0.85;
		margin-bottom: 1rem;
		margin-top: 0.25rem;
		line-height: 1.5;
	}
	html[data-tema='escuro'] .info-text {
		opacity: 0.75;
	}
	.btn-full-width {
		width: 100%;
	}
	.configuracoes-container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: clamp(1rem, 2vw, 1.5rem); /* Padding responsivo */
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background-color: var(--app-background-color);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	h1 {
		font-size: clamp(1.5rem, 4vw, 1.75rem); /* Ajuste de clamp */
		color: var(--app-text-color);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
	}
	.header-controls .btn {
		min-width: auto; /* Permitir que o botão encolha */
		padding: 0.6rem 1rem; /* Padding ligeiramente menor para header */
	}
	.mensagem {
		padding: 1rem;
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-weight: 500;
		margin-bottom: 1rem;
	}
	.mensagem p {
		margin: 0;
		line-height: 1.4;
	}
	.mensagem.sucesso {
		background-color: var(--success-background-color);
		color: var(--success-text-color);
		border: 1px solid var(--success-color);
	}
	.mensagem.erro {
		background-color: var(--danger-background-color);
		color: var(--danger-text-color);
		border: 1px solid var(--danger-color);
	}
	.configuracoes-grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(100%, 320px), 1fr)
		); /* Ajustado para telas menores */
		gap: 1.5rem;
	}
	.config-secao {
		background: var(--card-background-color);
		padding: 1.5rem;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		gap: 1.25rem; /* Espaçamento entre itens da seção */
	}
	.config-secao h2 {
		margin: 0 0 0.75rem 0; /* Aumentado margin-bottom */
		color: var(--app-text-color);
		font-size: 1.15rem; /* Ligeiramente menor */
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		font-weight: 600;
	}
	.config-item {
		display: flex;
		flex-direction: column;
		gap: 0.4rem; /* Espaço entre label e input/botão */
	}
	/* .config-item label:not(.btn),
    .config-item > .tema-opcoes {
		margin-bottom: 0.25rem; // Removido, o gap do .config-item já faz isso
	} */

	.config-item label,
	label.btn {
		font-weight: 500;
		font-size: 0.9rem; /* Tamanho de label */
		color: var(--app-text-color);
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	label.btn {
		display: inline-flex;
		justify-content: center;
		font-size: 0.9rem; /* Consistência com outros botões */
		padding: 0.6rem 1rem;
	}
	.input,
	select.input {
		width: 100%;
		padding: 0.65rem 0.9rem; /* Padding ajustado */
		border: 1px solid var(--input-border-color);
		background-color: var(--input-background-color);
		color: var(--app-text-color);
		border-radius: var(--radius);
		font-size: 0.95rem; /* Tamanho do texto do input */
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		font-family: inherit;
	}
	select.input option {
		background-color: var(--input-background-color);
		color: var(--app-text-color);
	}

	.input:disabled,
	select.input:disabled {
		opacity: 0.6; /* Ajustado */
		cursor: not-allowed;
		background-color: var(--content-background-color); /* Fundo diferente para desabilitado */
		color: var(--text-color-muted); /* Cor de texto para desabilitado */
		border-color: var(--border-color);
	}
	.input:focus,
	select.input:focus {
		border-color: var(--primary-color);
		outline: none;
		box-shadow: 0 0 0 3px var(--input-focus-ring-color);
	}
	.tema-opcoes {
		display: flex;
		gap: 0.5rem; /* Espaçamento entre botões de tema */
		flex-wrap: wrap;
	}
	.tema-btn {
		/* Estilo base para botões de tema */
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		border: 1px solid var(--border-color);
		padding: 0.5rem 0.8rem; /* Padding para botões de tema */
		font-size: 0.85rem;
	}
	.tema-btn:hover:not(.ativo) {
		border-color: var(--primary-color);
		background-color: color-mix(
			in srgb,
			var(--content-background-color) 80%,
			var(--primary-color) 20%
		);
	}
	.tema-btn.ativo {
		background-color: var(--primary-color);
		color: var(--primary-color-text);
		border-color: var(--primary-color);
	}
	.tema-btn.ativo:hover {
		/* Hover do botão ativo pode ser sutil */
		background-color: var(--primary-color-hover);
	}

	.btn {
		/* Estilo base para todos os botões */
		padding: 0.6rem 1.1rem; /* Padding geral dos botões */
		border-radius: var(--radius);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 500;
		font-size: 0.9rem; /* Tamanho de fonte dos botões */
		text-decoration: none;
		border: 1px solid transparent;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			opacity 0.2s ease;
		white-space: nowrap;
	}
	.btn:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}
	.btn:disabled {
		cursor: not-allowed;
		opacity: 0.5; /* Opacidade geral para desabilitado */
	}
	.btn-primary {
		background-color: var(--primary-color);
		color: var(--primary-color-text);
		border-color: var(--primary-color);
	}
	.btn-primary:hover:not(:disabled) {
		background-color: var(--primary-color-hover);
		border-color: var(--primary-color-hover);
	}
	.btn-primary:disabled {
		background-color: var(--secondary-color);
		border-color: var(--secondary-color);
		color: var(--secondary-color-text); /* Ajustar se secundário for claro */
	}
	.btn-secondary {
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		border: 1px solid var(--border-color);
	}
	.btn-secondary:hover:not(:disabled) {
		background-color: var(--border-color); /* Ou um tom mais escuro/claro */
		border-color: var(--app-text-color);
	}
	.btn-secondary:disabled {
		background-color: var(--content-background-color);
		color: var(--text-color-muted);
		border-color: var(--border-color);
	}
	.btn-warning {
		background-color: var(--warning-color);
		color: var(--app-text-color); /* Ajustar se warning for muito claro */
		border-color: var(--warning-color);
	}
	html[data-tema='claro'] .btn-warning {
		/* Exemplo para texto em botão warning claro */
		color: #42200e; /* Texto escuro para melhor contraste no tema claro */
	}
	.btn-warning:hover:not(:disabled) {
		background-color: color-mix(
			in srgb,
			var(--warning-color) 85%,
			black 15%
		); /* Escurecer warning no hover */
		border-color: color-mix(in srgb, var(--warning-color) 85%, black 15%);
	}
	.btn-danger {
		background-color: var(--danger-color);
		color: var(--primary-color-text); /* Assumindo que --danger-color é escuro o suficiente */
		border-color: var(--danger-color);
	}
	html[data-tema='escuro'] .btn-danger {
		/* No tema escuro, a cor do texto pode precisar ser escura se --danger-color for clara */
		color: #450a0a;
	}
	.btn-danger:hover:not(:disabled) {
		background-color: var(--danger-color-hover);
		border-color: var(--danger-color-hover);
	}
	.config-acoes-perigo {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.75); /* Overlay mais escuro */
		display: grid;
		place-items: center;
		z-index: 1000;
		padding: 1rem;
	}
	.modal-content {
		background: var(--card-background-color);
		color: var(--app-text-color);
		padding: clamp(1.25rem, 4vw, 1.75rem); /* Padding do modal ajustado */
		border-radius: var(--radius);
		width: 100%;
		max-width: 500px; /* Max-width do modal */
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
	}
	.modal-content:focus {
		outline: none;
	}
	.modal-content h2 {
		margin: 0 0 1.25rem 0; /* Espaçamento do título do modal */
		font-size: 1.25rem; /* Tamanho do título do modal */
		color: var(--app-text-color);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.modal-content p {
		margin-bottom: 1rem;
		line-height: 1.6; /* Ajuste de line-height */
		color: var(--text-color-muted);
		font-size: 0.9rem; /* Tamanho do texto do parágrafo no modal */
	}
	.modal-content p strong {
		color: var(--app-text-color);
		font-weight: 600;
	}
	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-color);
	}
	.aviso-exclusao {
		background-color: var(--danger-background-color);
		color: var(--danger-text-color);
		padding: 0.8rem 1rem; /* Padding do aviso */
		border-radius: var(--radius);
		border-left: 3px solid var(--danger-color); /* Borda mais sutil */
		font-size: 0.85rem;
	}

	@media (max-width: 768px) {
		header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		.header-controls {
			width: 100%;
		}
		.header-controls .btn {
			width: 100%;
		}
		.config-secao .config-item .btn-full-width,
		.config-secao .config-item label.btn-full-width {
			width: 100%;
		}
		.config-acoes-perigo {
			flex-direction: column;
		}
		.config-acoes-perigo .btn {
			width: 100%;
		}
		.modal-actions {
			flex-direction: column-reverse;
		}
		.modal-actions .btn {
			width: 100%;
		}
	}
	@media (max-width: 480px) {
		.tema-opcoes {
			flex-direction: column;
		}
		.tema-opcoes .btn {
			width: 100%;
		}
		.configuracoes-container {
			padding: 0.75rem;
		}
		.config-secao {
			padding: 1rem;
		}
		.modal-content {
			padding: 1rem;
		}
	}
</style>
