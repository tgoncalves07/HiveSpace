<!--src/routes/config/+page.svelte-->
<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { derived, get } from 'svelte/store';

	import {
		configuracoes,
		type Tema,
		type Idioma,
		type ConfiguracoesState,
		getAppDefaults
	} from '../../lib/stores/pageStore';
	import { projetos } from '../../lib/stores/projetos';
	import { tarefas } from '../../lib/stores/tarefas';
	import { notesStore } from '../../lib/stores/notesStores';
	import { reminders } from '../../lib/stores/reminders';

	// Ícones
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
		Monitor,
		HelpCircle,
		Send,
		Loader2 // --> MUDANÇA: Ícone de carregamento
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
				'Crie um ficheiro de backup com as suas configurações, projetos, tarefas, notas e lembretes. Guarde este ficheiro num local seguro.',
			'config.dados.importarInfo':
				'Restaure as suas configurações e dados de projetos, tarefas, notas e lembretes a partir de um ficheiro de backup previamente exportado.',
			'config.perigo.titulo': 'Opções de Restauro',
			'config.perigo.repor': 'Repor Configurações Padrão',
			'config.perigo.eliminar': 'Eliminar Todos os Dados da Aplicação',
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
				'Todos os dados da aplicação foram eliminados e as configurações repostas.',
			'modal.repor.titulo': 'Repor Configurações',
			'modal.repor.descricao':
				'Tem a certeza de que deseja repor todas as configurações para os valores padrão? Esta ação não afetará os seus projetos e tarefas guardados.',
			'modal.repor.cancelar': 'Cancelar',
			'modal.repor.confirmar': 'Confirmar Reposição',
			'modal.exportar.titulo': 'Exportar Todos os Dados',
			'modal.exportar.descricao':
				'Será criado um ficheiro JSON contendo todas as suas configurações atuais e os dados de todos os seus projetos, tarefas, notas e lembretes. Guarde este ficheiro num local seguro para poder restaurá-lo mais tarde, se necessário.',
			'modal.exportar.exportar': 'Exportar',
			'modal.eliminar.titulo': 'Eliminar Todos os Dados da Aplicação',
			'modal.eliminar.atencao': 'ATENÇÃO: Esta ação é irreversível!',
			'modal.eliminar.descricao':
				'Todos os seus projetos, tarefas, notas e lembretes (guardados localmente no navegador) serão permanentemente eliminados. As configurações da aplicação serão repostas para os valores padrão.',
			'modal.eliminar.avisoBackup':
				'RECOMENDAÇÃO: Exporte os seus dados antes de continuar, caso deseje ter um backup.',
			'modal.eliminar.confirmar': 'Sim, Eliminar Tudo',
			// --> MUDANÇA: Textos para o novo formulário de suporte
			'config.suporte.titulo': 'Suporte e Feedback',
			'config.suporte.info':
				'Tem alguma dúvida, sugestão ou encontrou um problema? Envie-nos uma mensagem através do formulário abaixo.',
			'config.suporte.email': 'O seu Email (para podermos responder)',
			'config.suporte.mensagem': 'A sua Mensagem',
			'config.suporte.enviar': 'Enviar Mensagem',
			'config.suporte.enviando': 'A Enviar...',
			'config.suporte.enviadoSucesso':
				'Mensagem enviada com sucesso! Entraremos em contacto em breve.',
			'config.suporte.erroEnvio': 'Falha ao enviar a mensagem. Por favor, tente mais tarde.'
		},
		en: {
			'config.titulo': 'Settings',
			'config.salvar': 'Save Changes',
			'config.aparencia.titulo': 'Appearance',
			'config.aparencia.tema': 'Theme',
			'config.aparencia.idioma': 'Language',
			'config.dados.titulo': 'Application Data Management',
			'config.dados.exportar': 'Export All Data',
			'config.dados.importar': 'Import Data',
			'config.dados.exportarInfo':
				'Create a backup file with your settings, projects, tasks, notes, and reminders. Store this file in a safe place.',
			'config.dados.importarInfo':
				'Restore your settings and data for projects, tasks, notes, and reminders from a previously exported backup file.',
			'config.perigo.titulo': 'Reset Options',
			'config.perigo.repor': 'Reset Settings to Default',
			'config.perigo.eliminar': 'Delete All Application Data',
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
			'config.mensagens.dadosEliminados':
				'All application data has been deleted and settings reset.',
			'modal.repor.titulo': 'Reset Settings',
			'modal.repor.descricao':
				'Are you sure you want to reset all settings to their default values? This action will not affect your saved projects and tasks.',
			'modal.repor.cancelar': 'Cancel',
			'modal.repor.confirmar': 'Confirm Reset',
			'modal.exportar.titulo': 'Export All Data',
			'modal.exportar.descricao':
				'A JSON file will be created containing all your current settings and data for all your projects, tasks, notes, and reminders. Save this file in a secure location so you can restore it later if needed.',
			'modal.exportar.exportar': 'Export',
			'modal.eliminar.titulo': 'Delete All Application Data',
			'modal.eliminar.atencao': 'WARNING: This action is irreversible!',
			'modal.eliminar.descricao':
				'All your projects, tasks, notes, and reminders (saved locally in the browser) will be permanently deleted. Application settings will be reset to their default values.',
			'modal.eliminar.avisoBackup':
				'RECOMMENDATION: Export your data before proceeding if you wish to have a backup.',
			'modal.eliminar.confirmar': 'Yes, Delete Everything',
			// --> MUDANÇA: Textos para o novo formulário de suporte (EN)
			'config.suporte.titulo': 'Support & Feedback',
			'config.suporte.info':
				'Have a question, suggestion, or found an issue? Send us a message using the form below.',
			'config.suporte.email': 'Your Email (so we can reply)',
			'config.suporte.mensagem': 'Your Message',
			'config.suporte.enviar': 'Send Message',
			'config.suporte.enviando': 'Sending...',
			'config.suporte.enviadoSucesso': 'Message sent successfully! We will get back to you soon.',
			'config.suporte.erroEnvio': 'Failed to send message. Please try again later.'
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

	// --> MUDANÇA: Variáveis de estado para o formulário de suporte
	let suporteEmail = '';
	let suporteMensagem = '';
	let enviandoSuporte = false;

	const idiomasDisponiveis = [
		{ valor: 'pt' as Idioma, nome: 'Português' },
		{ valor: 'en' as Idioma, nome: 'English' }
	];

	$: temasDisponiveisAtualizados = [
		{ valor: 'claro' as Tema, nome: $t('config.temas.claro'), icone: Sun },
		{ valor: 'escuro' as Tema, nome: $t('config.temas.escuro'), icone: Moon },
		{ valor: 'sistema' as Tema, nome: $t('config.temas.sistema'), icone: Monitor }
	];

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
				projetos: get(projetos),
				tarefas: get(tarefas),
				notas: get(notesStore),
				reminders: get(reminders),
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
				let algumaCoisaImportada = false;

				if (dadosImportados.configuracoes && typeof dadosImportados.configuracoes === 'object') {
					try {
						const appDefaults = getAppDefaults();
						const {
							formatoHora,
							prioridadePadraoTarefa,
							lembretePadraoTarefa,
							...configImportadaLimpa
						} = dadosImportados.configuracoes as any;
						const mergedConfig = { ...appDefaults, ...configImportadaLimpa };
						configuracoes.set(mergedConfig as ConfiguracoesState);
						algumaCoisaImportada = true;
					} catch (err) {
						console.error("Falha ao importar a secção 'configuracoes':", err);
					}
				}
				if (dadosImportados.projetos) {
					try {
						projetos.set(dadosImportados.projetos);
						algumaCoisaImportada = true;
					} catch (err) {
						console.error("Falha ao importar a secção 'projetos':", err);
					}
				}
				if (dadosImportados.tarefas) {
					try {
						tarefas.set(dadosImportados.tarefas);
						algumaCoisaImportada = true;
					} catch (err) {
						console.error("Falha ao importar a secção 'tarefas':", err);
					}
				}
				if (dadosImportados.notas) {
					try {
						notesStore.reset();
						dadosImportados.notas.forEach((note) => {
							notesStore.addNote(note.title, note.description, note.content);
						});
						algumaCoisaImportada = true;
					} catch (err) {
						console.error("Falha ao importar a secção 'notas':", err);
					}
				}
				if (dadosImportados.reminders) {
					try {
						reminders.set(dadosImportados.reminders);
						algumaCoisaImportada = true;
					} catch (err) {
						console.error("Falha ao importar a secção 'reminders':", err);
					}
				}

				if (algumaCoisaImportada) {
					configuracoesIniciaisString = JSON.stringify($configuracoes);
					alteracoesPendentes = false;
					mostrarMensagem($t('config.mensagens.importadoSucesso'), 'sucesso');
				} else {
					throw new Error('O ficheiro JSON não continha nenhuma secção de dados válida.');
				}
			} catch (erro) {
				console.error('Erro geral ao importar dados:', erro);
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
		showDeleteModal = false;

		localStorage.removeItem('projetos');
		localStorage.removeItem('tarefas');
		localStorage.removeItem('reminders');
		localStorage.removeItem('svelte-notes-app-data');

		projetos.set([]);
		tarefas.set([]);
		notesStore.reset();
		reminders.set({});

		configuracoes.reset();

		mostrarMensagem($t('config.mensagens.dadosEliminados'), 'sucesso');
		configuracoesIniciaisString = JSON.stringify($configuracoes);
		alteracoesPendentes = false;
	}

	// --> MUDANÇA: Nova função para enviar a mensagem de suporte
	async function enviarMensagemSuporte() {
		enviandoSuporte = true;
		mostrarMensagem('', 'sucesso'); // Limpa mensagens anteriores
		mostrarMensagem('', 'erro');

		// !!! IMPORTANTE: Substitua pelo seu endpoint do Formspree !!!
		const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_UNIQUE_ID';

		try {
			const response = await fetch(FORM_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					email: suporteEmail,
					message: suporteMensagem
				})
			});

			if (response.ok) {
				mostrarMensagem($t('config.suporte.enviadoSucesso'), 'sucesso');
				suporteEmail = '';
				suporteMensagem = '';
			} else {
				throw new Error('Formspree submission failed');
			}
		} catch (error) {
			console.error('Erro ao enviar mensagem de suporte:', error);
			mostrarMensagem($t('config.suporte.erroEnvio'), 'erro');
		} finally {
			enviandoSuporte = false;
		}
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

<!-- O HTML e CSS permanecem os mesmos, exceto pela secção de suporte -->
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

		<!-- -->
		<!-- -->
		<!-- -->
		<!-- -->
		<!-- MUDANÇA: SECÇÃO SUPORTE E FEEDBACK MODIFICADA -->
		<!-- -->
		<!-- -->
		<!-- -->
		<!-- -->
		<section class="config-secao">
			<h2><HelpCircle size={20} /> {$t('config.suporte.titulo')}</h2>
			<p class="info-text">{$t('config.suporte.info')}</p>

			<form on:submit|preventDefault={enviarMensagemSuporte} class="suporte-form">
				<div class="config-item">
					<label for="suporte-email">{$t('config.suporte.email')}</label>
					<input
						id="suporte-email"
						type="email"
						name="email"
						class="input"
						bind:value={suporteEmail}
						placeholder="seu.email@exemplo.com"
						required
						disabled={enviandoSuporte}
					/>
				</div>

				<div class="config-item">
					<label for="suporte-mensagem">{$t('config.suporte.mensagem')}</label>
					<textarea
						id="suporte-mensagem"
						name="message"
						class="input"
						rows="5"
						bind:value={suporteMensagem}
						placeholder={$t('config.suporte.mensagem')}
						required
						disabled={enviandoSuporte}
					/>
				</div>

				<button
					type="submit"
					class="btn btn-primary btn-full-width"
					disabled={!suporteEmail.includes('@') || suporteMensagem.trim() === '' || enviandoSuporte}
				>
					{#if enviandoSuporte}
						<Loader2 size={16} class="icon-spin" />
						{$t('config.suporte.enviando')}
					{:else}
						<Send size={16} />
						{$t('config.suporte.enviar')}
					{/if}
				</button>
			</form>
		</section>

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

	<!-- MODAIS (permanecem iguais) -->
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
	/* --> MUDANÇA: Adiciona CSS para o formulário de suporte e animação de spin */
	.suporte-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.icon-spin {
		animation: spin 1s linear infinite;
	}
	/* Fim da adição */

	.info-text {
		font-size: 0.9rem;
		color: var(--app-text-color);
		opacity: 0.85;
		margin-bottom: 1rem;
		margin-top: 0.25rem;
		line-height: 1.5;
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
	select.input,
	textarea.input {
		width: 100%;
		padding: 0.65rem 0.9rem;
		border: 1px solid var(--input-border-color);
		background-color: var(--input-background-color);
		color: var(--app-text-color);
		border-radius: var(--radius);
		font-size: 0.95rem;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		font-family: inherit;
	}

	textarea.input {
		resize: vertical;
		min-height: 100px;
	}

	select.input option {
		background-color: var(--input-background-color);
		color: var(--app-text-color);
	}

	.input:disabled,
	select.input:disabled,
	textarea.input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--content-background-color);
		color: var(--text-color-muted);
		border-color: var(--border-color);
	}

	.input:focus,
	select.input:focus,
	textarea.input:focus {
		border-color: var(--primary-color);
		outline: none;
		box-shadow: 0 0 0 3px var(--input-focus-ring-color);
	}
	.tema-opcoes {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.tema-btn {
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		border: 1px solid var(--border-color);
		padding: 0.5rem 0.8rem;
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
		background-color: var(--primary-color-hover);
	}

	.btn {
		padding: 0.6rem 1.1rem;
		border-radius: var(--radius);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 500;
		font-size: 0.9rem;
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
		opacity: 0.5;
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
		color: var(--secondary-color-text);
	}
	.btn-secondary {
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		border: 1px solid var(--border-color);
	}
	.btn-secondary:hover:not(:disabled) {
		background-color: var(--border-color);
		border-color: var(--app-text-color);
	}
	.btn-secondary:disabled {
		background-color: var(--content-background-color);
		color: var(--text-color-muted);
		border-color: var(--border-color);
	}
	.btn-warning {
		background-color: var(--warning-color);
		color: var(--app-text-color);
		border-color: var(--warning-color);
	}
	.btn-warning:hover:not(:disabled) {
		background-color: color-mix(in srgb, var(--warning-color) 85%, black 15%);
		border-color: color-mix(in srgb, var(--warning-color) 85%, black 15%);
	}
	.btn-danger {
		background-color: var(--danger-color);
		color: var(--primary-color-text);
		border-color: var(--danger-color);
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
	/* Adicionado para espaçar o botão de envio na seção de suporte */
	.config-secao > .btn-full-width {
		margin-top: 0.5rem;
	}
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.75);
		display: grid;
		place-items: center;
		z-index: 1000;
		padding: 1rem;
	}
	.modal-content {
		background: var(--card-background-color);
		color: var(--app-text-color);
		padding: clamp(1.25rem, 4vw, 1.75rem);
		border-radius: var(--radius);
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
	}
	.modal-content:focus {
		outline: none;
	}
	.modal-content h2 {
		margin: 0 0 1.25rem 0;
		font-size: 1.25rem;
		color: var(--app-text-color);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.modal-content p {
		margin-bottom: 1rem;
		line-height: 1.6;
		color: var(--text-color-muted);
		font-size: 0.9rem;
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
		padding: 0.8rem 1rem;
		border-radius: var(--radius);
		border-left: 3px solid var(--danger-color);
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
		.config-secao .config-item label.btn-full-width,
		.suporte-form .btn-full-width {
			/* --> MUDANÇA: Garante que o botão de suporte também é full-width */
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
