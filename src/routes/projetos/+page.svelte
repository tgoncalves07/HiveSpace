<!-- routes/projetos/+page.svelte -->
<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	// CORREÇÃO: Renomear import para 'projetos' para consistência
	import { projetos, type Projeto } from '../../lib/stores/projetos';
	import { onMount } from 'svelte';
	import { get, derived } from 'svelte/store';
	import {
		Plus,
		Calendar,
		Clock,
		Flag,
		Edit,
		Trash2,
		AlertTriangle,
		BarChart,
		Target,
		CheckCircle,
		X,
		AlertCircle,
		FileText,
		Activity,
		Filter
	} from 'lucide-svelte';

	import { configuracoes } from '../../lib/stores/pageStore';

	const projectTranslations = {
		pt: {
			'projetos.tituloPagina': 'Os Meus Projetos',
			'projetos.filtro.todosStatus': 'Todos os Projetos',
			'projetos.botao.novo': 'Novo Projeto',
			'projetos.stats.total': 'Total de Projetos',
			'projetos.stats.finalizados': 'Projetos Finalizados',
			'projetos.stats.atrasados': 'Projetos Atrasados',
			'projetos.coluna.ideia': 'Ideia',
			'projetos.coluna.pendente': 'Pendente',
			'projetos.coluna.emProcesso': 'Em Processo',
			'projetos.coluna.finalizado': 'Finalizado',
			'projetos.card.editarAria': 'Editar Projeto',
			'projetos.card.excluirAria': 'Excluir Projeto',
			'projetos.card.detalhes.inicio': 'Início',
			'projetos.card.detalhes.prazo': 'Prazo',
			'projetos.card.dataNaoDisponivel': 'N/D',
			'projetos.card.dataInvalida': 'Data Inválida',
			'projetos.coluna.vazia': 'Nenhum projeto',
			'projetos.modal.editar.titulo': 'Editar Projeto',
			'projetos.modal.adicionar.titulo': 'Adicionar Novo Projeto',
			'projetos.modal.fecharAria': 'Fechar modal',
			'projetos.modal.form.nomeLabel': 'Nome do Projeto',
			'projetos.modal.form.nomePlaceholder': 'Ex: Lançamento Alpha',
			'projetos.modal.form.descricaoLabel': 'Descrição (Opcional)',
			'projetos.modal.form.descricaoPlaceholder': 'Detalhes sobre o projeto...',
			'projetos.modal.form.statusLabel': 'Status',
			'projetos.modal.form.dataInicioLabel': 'Data de Início',
			'projetos.modal.form.dataPrazoLabel': 'Data de Prazo',
			'projetos.modal.form.salvar': 'Salvar Alterações',
			'projetos.modal.form.criar': 'Criar Projeto',
			'projetos.modal.form.cancelar': 'Cancelar',
			'projetos.modal.validacao.nomeObrigatorio': 'O nome do projeto é obrigatório.',
			'projetos.modal.validacao.prazoInvalido':
				'A data de prazo não pode ser anterior à data de início.',
			'projetos.modal.excluir.titulo': 'Confirmar Exclusão',
			'projetos.modal.excluir.mensagem':
				'Tem certeza que deseja excluir o projeto "{projectName}"?',
			'projetos.modal.excluir.aviso': 'Esta ação não poderá ser desfeita.',
			'projetos.modal.excluir.confirmar': 'Excluir Projeto'
		},
		en: {
			'projetos.tituloPagina': 'My Projects',
			'projetos.filtro.todosStatus': 'All Projects',
			'projetos.botao.novo': 'New Project',
			'projetos.stats.total': 'Total Projects',
			'projetos.stats.finalizados': 'Completed Projects',
			'projetos.stats.atrasados': 'Overdue Projects',
			'projetos.coluna.ideia': 'Idea',
			'projetos.coluna.pendente': 'Pending',
			'projetos.coluna.emProcesso': 'In Progress',
			'projetos.coluna.finalizado': 'Completed',
			'projetos.card.editarAria': 'Edit Project',
			'projetos.card.excluirAria': 'Delete Project',
			'projetos.card.detalhes.inicio': 'Start',
			'projetos.card.detalhes.prazo': 'Deadline',
			'projetos.card.dataNaoDisponivel': 'N/A',
			'projetos.card.dataInvalida': 'Invalid Date',
			'projetos.coluna.vazia': 'No project',
			'projetos.modal.editar.titulo': 'Edit Project',
			'projetos.modal.adicionar.titulo': 'Add New Project',
			'projetos.modal.fecharAria': 'Close modal',
			'projetos.modal.form.nomeLabel': 'Project Name',
			'projetos.modal.form.nomePlaceholder': 'E.g., Alpha Release',
			'projetos.modal.form.descricaoLabel': 'Description (Optional)',
			'projetos.modal.form.descricaoPlaceholder': 'Details about the project...',
			'projetos.modal.form.statusLabel': 'Status',
			'projetos.modal.form.dataInicioLabel': 'Start Date',
			'projetos.modal.form.dataPrazoLabel': 'Deadline Date',
			'projetos.modal.form.salvar': 'Save Changes',
			'projetos.modal.form.criar': 'Create Project',
			'projetos.modal.form.cancelar': 'Cancel',
			'projetos.modal.validacao.nomeObrigatorio': 'Project name is required.',
			'projetos.modal.validacao.prazoInvalido':
				'The deadline date cannot be earlier than the start date.',
			'projetos.modal.excluir.titulo': 'Confirm Deletion',
			'projetos.modal.excluir.mensagem':
				'Are you sure you want to delete the project "{projectName}"?',
			'projetos.modal.excluir.aviso': 'This action cannot be undone.',
			'projetos.modal.excluir.confirmar': 'Delete Project'
		}
	};
	const t = derived(configuracoes, ($cfg) => {
		// Função de tradução que seleciona o idioma atual e retorna a função de tradução
		return (key: string, replacements?: Record<string, string | number>): string => {
			const selectedLang = $cfg.idioma;
			let langDict =
				projectTranslations[selectedLang as keyof typeof projectTranslations] ||
				projectTranslations.pt;
			let text = langDict?.[key] || projectTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});

	type Status = 'Ideia' | 'Pendente' | 'Em Processo' | 'Finalizado';

	let filtro: Status | 'todos' = 'todos';
	let showModal = false;
	let editando = false;
	let projetoParaExcluir: Projeto | null = null;

	let projetoId: number | null = null;
	let nome = '';
	let descricao = '';
	let status: Status = 'Ideia';
	let dataInicio = '';
	let dataPrazo = '';
	let erroValidacao = '';

	$: statusOptions = [
		{ value: 'Ideia' as Status, label: $t('projetos.coluna.ideia'), icon: Clock },
		{ value: 'Pendente' as Status, label: $t('projetos.coluna.pendente'), icon: Activity },
		{ value: 'Em Processo' as Status, label: $t('projetos.coluna.emProcesso'), icon: CheckCircle },
		{ value: 'Finalizado' as Status, label: $t('projetos.coluna.finalizado'), icon: Flag }
	];

	onMount(() => {
		if (!editando) {
			dataInicio = new Date().toISOString().split('T')[0];
		}
	});

	const resetForm = () => {
		nome = '';
		descricao = '';
		status = 'Ideia';
		dataInicio = new Date().toISOString().split('T')[0];
		dataPrazo = '';
		projetoId = null;
		editando = false;
		erroValidacao = '';
	};

	function abrirNovoProjetoModal() {
		resetForm();
		showModal = true;
	}

	function editarProjetoModal(p: Projeto) {
		nome = p.nome;
		descricao = p.descricao || '';
		status = p.status;
		dataInicio = p.dataInicio ? new Date(p.dataInicio).toISOString().split('T')[0] : '';
		dataPrazo = p.dataPrazo ? new Date(p.dataPrazo).toISOString().split('T')[0] : '';
		projetoId = p.id;
		editando = true;
		showModal = true;
		erroValidacao = '';
	}

	function salvarProjeto() {
		erroValidacao = '';
		if (!nome.trim()) {
			erroValidacao = $t('projetos.modal.validacao.nomeObrigatorio');
			return;
		}
		if (dataInicio && dataPrazo && new Date(dataPrazo) < new Date(dataInicio)) {
			erroValidacao = $t('projetos.modal.validacao.prazoInvalido');
			return;
		}

		// A descrição deve ser string, mesmo que vazia, ou undefined se o tipo permitir.
		// O tipo na store foi ajustado para `descricao?: string`.
		const projetoData = {
			nome: nome.trim(),
			descricao: descricao.trim() || undefined,
			status,
			dataInicio: dataInicio || undefined,
			dataPrazo: dataPrazo || undefined
		};

		if (editando && projetoId !== null) {
			// A chamada agora corresponde ao método na store
			projetos.updateProjeto(projetoId, projetoData);
		} else {
			// A chamada agora corresponde ao método na store
			projetos.addProjeto(projetoData);
		}

		showModal = false;
		resetForm();
	}

	function confirmarExclusao() {
		if (projetoParaExcluir) {
			// A chamada agora corresponde ao método na store
			projetos.removeProjeto(projetoParaExcluir.id);
			projetoParaExcluir = null;
		}
	}

	const formatarDataDisplay = (dataString?: string): string => {
		const tFunc = get(t);
		if (!dataString) return tFunc('projetos.card.dataNaoDisponivel');

		try {
			let langTag = get(configuracoes).idioma || 'pt';

			if (langTag === 'pt') langTag = 'pt-PT';
			else if (langTag === 'en') langTag = 'en-GB';

			// A data vinda do input é 'YYYY-MM-DD'. Para evitar problemas de fuso horário,
			// adicionamos 'T00:00:00' para garantir que é interpretada como o início do dia local.
			const dateObj = new Date(dataString + 'T00:00:00');
			return dateObj.toLocaleDateString(langTag, {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch (e) {
			console.warn('Erro ao formatar data display:', e);
			return tFunc('projetos.card.dataInvalida');
		}
	};

	function fecharModal() {
		showModal = false;
		projetoParaExcluir = null;
		erroValidacao = '';
		if (!editando) resetForm();
	}

	$: projetosFiltrados =
		filtro === 'todos' ? $projetos : $projetos.filter((p) => p.status === filtro);

	$: projetosAtrasados = $projetos.filter(
		(p) => p.dataPrazo && new Date(p.dataPrazo) < new Date() && p.status !== 'Finalizado'
	);
</script>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">{$t('projetos.tituloPagina')}</h1>
		<div class="header-actions">
			<div class="filter-control">
				<Filter size={18} />
				<select id="filtro-status-projeto" bind:value={filtro} class="input-field minimal">
					<option value="todos">{$t('projetos.filtro.todosStatus')}</option>
					{#each statusOptions as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<button class="button primary-button" on:click={abrirNovoProjetoModal}>
				<Plus size={18} />
				{$t('projetos.botao.novo')}
			</button>
		</div>
	</header>

	<div class="stats-overview-container">
		<div class="stat-card">
			<BarChart size={20} class="stat-icon total-icon" />
			<div class="stat-content">
				<span class="stat-value">{$projetos.length}</span>
				<span class="stat-label">{$t('projetos.stats.total')}</span>
			</div>
		</div>
		<div class="stat-card">
			<Flag size={20} class="stat-icon high-priority-icon" />
			<div class="stat-content">
				<span class="stat-value">{$projetos.filter((p) => p.status === 'Finalizado').length}</span>
				<span class="stat-label">{$t('projetos.stats.finalizados')}</span>
			</div>
		</div>
		<div class="stat-card">
			<AlertCircle size={20} class="stat-icon overdue-icon" />
			<div class="stat-content">
				<span class="stat-value">{projetosAtrasados.length}</span>
				<span class="stat-label">{$t('projetos.stats.atrasados')}</span>
			</div>
		</div>
	</div>

	<div class="kanban-board-grid">
		{#each statusOptions as statusOpt (statusOpt.value)}
			<div class="status-column" data-status={statusOpt.value}>
				<h3 class="column-header">
					<svelte:component this={statusOpt.icon} size={18} />
					<span class="column-title-text">{statusOpt.label}</span>
					<span class="column-task-count">
						({projetosFiltrados.filter((p) => p.status === statusOpt.value).length})
					</span>
				</h3>
				<div class="tasks-list">
					{#each projetosFiltrados.filter((p) => p.status === statusOpt.value) as projeto (projeto.id)}
						<div class="tarefa-card" in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
							<div class="tarefa-card-header">
								<div class="tarefa-identifier">
									<strong class="tarefa-description">{projeto.nome}</strong>
								</div>
								<div class="tarefa-action-buttons">
									<button
										class="icon-button"
										on:click={() => editarProjetoModal(projeto)}
										aria-label={$t('projetos.card.editarAria')}
									>
										<Edit size={16} />
									</button>
									<button
										class="icon-button danger"
										on:click={() => (projetoParaExcluir = projeto)}
										aria-label={$t('projetos.card.excluirAria')}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>

							{#if projeto.descricao}
								<p class="project-description">{projeto.descricao}</p>
							{/if}

							<div class="tarefa-details-grid">
								{#if projeto.dataInicio}
									<div class="detail-item">
										<Calendar size={14} />
										<span
											>{$t('projetos.card.detalhes.inicio')}: {formatarDataDisplay(
												projeto.dataInicio
											)}</span
										>
									</div>
								{/if}
								{#if projeto.dataPrazo}
									<div class="detail-item final-date-item">
										<Flag size={14} />
										<span
											>{$t('projetos.card.detalhes.prazo')}:
											<span
												class:overdue-text={new Date(projeto.dataPrazo) < new Date() &&
													projeto.status !== 'Finalizado'}
											>
												{formatarDataDisplay(projeto.dataPrazo)}
											</span>
										</span>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="empty-column-message">{$t('projetos.coluna.vazia')}</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if showModal}
		<div class="modal-backdrop" on:click|self={fecharModal} transition:fade={{ duration: 150 }}>
			<div class="modal-dialog" transition:slide={{ duration: 250, y: 50 }}>
				<div class="modal-dialog-header">
					<h2 class="modal-title">
						{editando ? $t('projetos.modal.editar.titulo') : $t('projetos.modal.adicionar.titulo')}
					</h2>
					<button
						class="close-modal-button"
						on:click={fecharModal}
						aria-label={$t('projetos.modal.fecharAria')}>×</button
					>
				</div>
				<form class="modal-form" on:submit|preventDefault={salvarProjeto}>
					<div class="form-fields-grid">
						<div class="form-input-group required-field">
							<label for="nome-projeto"
								><FileText size={16} /> {$t('projetos.modal.form.nomeLabel')}</label
							>
							<input
								type="text"
								id="nome-projeto"
								placeholder={$t('projetos.modal.form.nomePlaceholder')}
								bind:value={nome}
								required
								class="input-field"
							/>
						</div>
						<div class="form-input-group" style="grid-column: 1 / -1;">
							<label for="descricao-projeto"
								><FileText size={16} /> {$t('projetos.modal.form.descricaoLabel')}</label
							>
							<textarea
								id="descricao-projeto"
								placeholder={$t('projetos.modal.form.descricaoPlaceholder')}
								bind:value={descricao}
								class="input-field"
								rows="4"
							></textarea>
						</div>
						<div class="form-input-group">
							<label for="status-projeto"
								><Flag size={16} /> {$t('projetos.modal.form.statusLabel')}</label
							>
							<select id="status-projeto" bind:value={status} class="input-field">
								{#each statusOptions as opt (opt.value)}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</div>
						<div class="form-input-group">
							<label for="data-inicio-projeto"
								><Calendar size={16} /> {$t('projetos.modal.form.dataInicioLabel')}</label
							>
							<input
								id="data-inicio-projeto"
								type="date"
								bind:value={dataInicio}
								class="input-field"
							/>
						</div>
						<div class="form-input-group">
							<label for="data-prazo-projeto"
								><Target size={16} /> {$t('projetos.modal.form.dataPrazoLabel')}</label
							>
							<input
								id="data-prazo-projeto"
								type="date"
								bind:value={dataPrazo}
								class="input-field"
								min={dataInicio}
							/>
						</div>
					</div>
					{#if erroValidacao}
						<div class="form-validation-error">
							<AlertCircle size={18} />
							{erroValidacao}
						</div>
					{/if}
					<div class="modal-dialog-actions">
						<button type="submit" class="button primary-button">
							{editando ? $t('projetos.modal.form.salvar') : $t('projetos.modal.form.criar')}
						</button>
						<button type="button" class="button secondary-button" on:click={fecharModal}
							>{$t('projetos.modal.form.cancelar')}</button
						>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if projetoParaExcluir}
		<div class="modal-backdrop" on:click|self={fecharModal} transition:fade={{ duration: 150 }}>
			<div class="modal-dialog confirmation-modal" transition:slide={{ duration: 250, y: 50 }}>
				<div class="modal-dialog-header">
					<AlertTriangle size={24} class="confirmation-icon" />
					<h2 class="modal-title">{$t('projetos.modal.excluir.titulo')}</h2>
				</div>
				<p class="confirmation-message">
					{@html $t('projetos.modal.excluir.mensagem', {
						projectName: `<strong>${projetoParaExcluir.nome}</strong>`
					})}
				</p>
				<p class="irreversible-warning">{$t('projetos.modal.excluir.aviso')}</p>
				<div class="modal-dialog-actions">
					<button class="button secondary-button" on:click={fecharModal}
						>{$t('projetos.modal.form.cancelar')}</button
					>
					<button class="button danger-button" on:click={confirmarExclusao}>
						<Trash2 size={16} />
						{$t('projetos.modal.excluir.confirmar')}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.page-container {
		max-width: 1300px;
		margin: 0 auto;
		padding: clamp(1.5rem, 3vw, 2rem);
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--border-color);
		gap: 1rem;
		flex-wrap: wrap;
	}
	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		color: var(--app-text-color);
		font-weight: 700;
		margin: 0;
	}
	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.filter-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: var(--card-background-color);
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
		border: 1px solid var(--border-color);
	}
	.filter-control :global(svg) {
		color: var(--text-color-muted, var(--app-text-color)); /* Fallback */
	}
	.input-field.minimal {
		background-color: transparent;
		border: none;
		padding: 0.25rem;
		font-size: 0.9rem;
		color: var(--app-text-color);
		outline: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		cursor: pointer;
	}

	.stats-overview-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.25rem;
	}
	.stat-card {
		background-color: var(--card-background-color);
		padding: 1.25rem;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		display: flex;
		align-items: center;
		gap: 1rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px -3px color-mix(in srgb, var(--shadow) 40%, transparent);
	}
	.stat-content {
		display: flex;
		flex-direction: column;
	}
	.stat-value {
		font-size: clamp(1.5rem, 3vw, 1.85rem);
		font-weight: 700;
		color: var(--app-text-color);
		line-height: 1.1;
	}
	.stat-label {
		font-size: 0.85rem;
		color: var(--text-color-muted, var(--app-text-color));
		font-weight: 500;
	}

	.kanban-board-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Colunas do Kanban */
		gap: 1.5rem;
		align-items: flex-start;
	}
	.status-column {
		background-color: var(--content-background-color);
		padding: 1rem;
		border-radius: var(--radius);
		border: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 50vh;
	}
	.column-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--app-text-color);
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		margin-bottom: 0.5rem;
	}
	.column-header :global(svg) {
		color: var(--text-color-muted, var(--app-text-color));
	}
	.column-title-text {
		flex-grow: 1;
	}
	.column-task-count {
		font-size: 0.85rem;
		color: var(--text-color-muted, var(--app-text-color));
		background-color: var(--border-color);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-weight: 500;
	}
	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		min-height: 100px;
		flex-grow: 1;
	}
	.tarefa-card {
		background-color: var(--card-background-color);
		padding: 1rem;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
		border: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.tarefa-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 10px -2px color-mix(in srgb, var(--shadow) 30%, transparent);
	}
	.tarefa-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}
	.tarefa-identifier {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-grow: 1;
		min-width: 0;
	}
	.tarefa-description {
		font-weight: 600;
		color: var(--app-text-color);
		line-height: 1.3;
		word-break: break-word;
	}
	.project-description {
		font-size: 0.9rem;
		color: var(--text-color-muted, var(--app-text-color));
		line-height: 1.5;
		margin-bottom: 0.3rem;
	}
	.tarefa-action-buttons {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s ease;
		flex-shrink: 0;
	}
	.tarefa-card:hover .tarefa-action-buttons {
		opacity: 1;
	}
	.icon-button {
		background: none;
		border: none;
		padding: 0.3rem;
		cursor: pointer;
		color: var(--text-color-muted, var(--app-text-color));
		display: inline-flex;
		border-radius: 4px;
	}
	.icon-button:hover {
		color: var(--primary-color);
		background-color: var(--border-color);
	}
	.icon-button.danger:hover {
		color: var(--danger-color);
		background-color: color-mix(in srgb, var(--danger-color) 15%, transparent);
	}
	.tarefa-details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: 0.4rem 0.8rem;
		font-size: 0.8rem;
		color: var(--text-color-muted, var(--app-text-color));
		margin-top: 0.4rem;
	}
	.detail-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.detail-item :global(svg) {
		flex-shrink: 0;
	}
	.final-date-item .overdue-text {
		color: var(--danger-color);
		font-weight: 600;
	}
	.empty-column-message {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--text-color-muted, var(--app-text-color));
		font-style: italic;
		font-size: 0.9rem;
		border: 2px dashed var(--border-color);
		border-radius: var(--radius);
		margin-top: 1rem;
	}
	.form-validation-error {
		color: var(--danger-text-color);
		background-color: var(--danger-background-color);
		padding: 0.8rem 1rem;
		border-radius: var(--radius);
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		border-left: 3px solid var(--danger-color);
	}
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: color-mix(in srgb, var(--app-background-color) 10%, black 60%);
		display: grid;
		place-items: center;
		z-index: 1000;
		padding: 1rem;
	}
	.modal-dialog {
		background-color: var(--card-background-color);
		padding: clamp(1.25rem, 4vw, 2rem);
		border-radius: var(--radius);
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 10px 30px -5px color-mix(in srgb, var(--shadow) 70%, transparent);
		border: 1px solid var(--border-color);
	}
	.modal-dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.modal-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--app-text-color);
		margin: 0;
	}
	.close-modal-button {
		background: none;
		border: none;
		font-size: 1.75rem;
		cursor: pointer;
		color: var(--text-color-muted, var(--app-text-color));
		padding: 0 0.5rem;
		line-height: 1;
	}
	.close-modal-button:hover {
		color: var(--app-text-color);
	}
	.modal-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.form-fields-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	@media (min-width: 600px) {
		.form-fields-grid {
			grid-template-columns: 1fr 1fr;
			gap: 1rem 1.25rem;
		}
		.form-fields-grid .form-input-group:nth-child(1),
		.form-fields-grid .form-input-group:nth-child(2) {
			grid-column: 1 / -1;
		}
	}
	.form-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.form-input-group label {
		font-weight: 500;
		color: var(--app-text-color);
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
	}
	.form-input-group.required-field label::after {
		content: '*';
		color: var(--danger-color);
		margin-left: 0.2rem;
	}
	.input-field {
		padding: 0.7rem 0.9rem;
		border: 1px solid var(--input-border-color);
		border-radius: var(--radius);
		font-size: 0.95rem;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		font-family: inherit;
		background-color: var(--input-background-color);
		color: var(--app-text-color);
		width: 100%;
	}
	.input-field:focus {
		border-color: var(--primary-color);
		outline: none;
		box-shadow: 0 0 0 3px var(--input-focus-ring-color);
	}
	textarea.input-field {
		resize: vertical;
		min-height: 100px;
	}
	.modal-dialog-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}
	.button {
		padding: 0.65rem 1.25rem;
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
	.button:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}
	.button.primary-button {
		background-color: var(--primary-color);
		color: var(--primary-color-text);
		border-color: var(--primary-color);
	}
	.button.primary-button:hover {
		background-color: var(--primary-color-hover);
		border-color: var(--primary-color-hover);
	}
	.button.secondary-button {
		background-color: var(--card-background-color);
		color: var(--app-text-color);
		border-color: var(--border-color);
	}
	.button.secondary-button:hover {
		background-color: var(--border-color);
		border-color: var(--text-color-muted, var(--app-text-color));
	}
	.button.danger-button {
		background-color: var(--danger-color);
		color: var(--primary-color-text);
		border-color: var(--danger-color);
	}
	.button.danger-button:hover {
		background-color: var(--danger-color-hover);
		border-color: var(--danger-color-hover);
	}
	.confirmation-modal .modal-dialog-header {
		border-bottom: none;
		margin-bottom: 0.5rem;
		justify-content: center;
	}

	.confirmation-message {
		text-align: center;
		font-size: 1.05rem;
		color: var(--app-text-color);
		margin-bottom: 0.5rem;
	}
	.irreversible-warning {
		text-align: center;
		font-size: 0.9rem;
		color: var(--danger-text-color);
		background-color: var(--danger-background-color);
		padding: 0.75rem;
		border-radius: var(--radius);
		margin: 1rem 0;
		border-left: 3px solid var(--danger-color);
	}
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		.header-actions {
			flex-direction: column;
			width: 100%;
			align-items: stretch;
		}
		.filter-control {
			width: 100%;
			justify-content: space-between;
		}
		.filter-control select.minimal {
			flex-grow: 1;
		}
		.stats-overview-container {
			grid-template-columns: 1fr;
		}
		.kanban-board-grid {
			grid-template-columns: 1fr;
		}
		.modal-dialog {
			padding: 1.25rem;
			width: 95%;
		}
		.modal-dialog-actions {
			flex-direction: column-reverse;
		}
		.modal-dialog-actions .button {
			width: 100%;
		}
	}
</style>
