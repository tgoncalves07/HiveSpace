<!-- routes/tarefas/+page.svelte (ou o nome correto da sua página de tarefas) -->
<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { projetos } from '../../lib/stores/projetos'; // Store de projetos
	import {
		tarefas as tarefasStore, // Renomeado para tarefasStore para evitar conflito
		type Tarefa,
		type StatusTarefa,
		type Prioridade
	} from '../../lib/stores/tarefas';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store'; // ESSENCIAL para a store 't' local
	import {
		Plus,
		Calendar,
		Clock,
		Flag,
		Folder,
		Edit,
		Trash2,
		AlertTriangle,
		BarChart,
		Target,
		CheckCircle,
		X,
		AlertCircle,
		FileText,
		Filter,
		Activity
	} from 'lucide-svelte';

	// 1. Importar APENAS a store 'configuracoes' de pageStore.ts
	import { configuracoes } from '../../lib/stores/pageStore'; // VERIFIQUE ESTE CAMINHO

	// 2. DICIONÁRIO DE TRADUÇÕES LOCAL para esta página (Tarefas)
	//    Certifique-se que TODAS as chaves usadas no template abaixo estão aqui.
	const taskTranslations = {
		pt: {
			'tarefas.tituloPagina': 'Minhas Tarefas',
			'tarefas.filtro.todosProjetos': 'Todos os projetos',
			'tarefas.filtro.semProjeto': 'Tarefas sem projeto',
			'tarefas.botao.adicionar': 'Adicionar Tarefa',
			'tarefas.stats.total': 'Total de Tarefas',
			'tarefas.stats.prioridadeAlta': 'Prioridade Alta',
			'tarefas.stats.atrasadas': 'Tarefas Atrasadas',
			'tarefas.coluna.pendente': 'Pendente',
			'tarefas.coluna.emProgresso': 'Em Progresso',
			'tarefas.coluna.concluida': 'Concluída',
			'tarefas.coluna.cancelada': 'Cancelada',
			'tarefas.card.editarAria': 'Editar Tarefa',
			'tarefas.card.excluirAria': 'Excluir Tarefa',
			'tarefas.card.detalhes.inicio': 'Início',
			'tarefas.card.detalhes.previsao': 'Previsão',
			'tarefas.card.detalhes.final': 'Final',
			'tarefas.card.dataNaoDisponivel': 'N/D',
			'tarefas.card.dataInvalida': 'Data Inválida',
			'tarefas.card.projetoAvulso': 'Projeto Avulso',
			'tarefas.coluna.vazia': 'Nenhuma tarefa nesta coluna.',
			'tarefas.modal.editar.titulo': 'Editar Tarefa',
			'tarefas.modal.adicionar.titulo': 'Adicionar Nova Tarefa',
			'tarefas.modal.fecharAria': 'Fechar modal',
			'tarefas.modal.form.descricaoLabel': 'Descrição da Tarefa',
			'tarefas.modal.form.descricaoPlaceholder': 'Ex: Desenvolver relatório semanal',
			'tarefas.modal.form.projetoLabel': 'Associar ao Projeto',
			'tarefas.modal.form.projetoNenhum': 'Nenhum projeto',
			'tarefas.modal.form.prioridadeLabel': 'Prioridade',
			'tarefas.modal.form.prioridadeBaixa': 'Baixa',
			'tarefas.modal.form.prioridadeMedia': 'Média',
			'tarefas.modal.form.prioridadeAlta': 'Alta',
			'tarefas.modal.form.dataInicioLabel': 'Data de Início',
			'tarefas.modal.form.dataPrevisaoLabel': 'Data de Previsão',
			'tarefas.modal.form.dataFinalLabel': 'Data Final (Prazo)',
			'tarefas.modal.form.hint.previsaoAposFinal': 'Previsão após data final.',
			'tarefas.modal.form.salvar': 'Salvar Alterações',
			'tarefas.modal.form.criar': 'Criar Tarefa',
			'tarefas.modal.form.cancelar': 'Cancelar',
			'tarefas.modal.validacao.descricaoObrigatoria': 'A descrição da tarefa é obrigatória!',
			'tarefas.modal.validacao.previsaoAposFinal':
				'A data de previsão não pode ser posterior à data final!',
			'tarefas.modal.validacao.previsaoAposPrazoProjeto':
				'A data de previsão não pode ser posterior à data de prazo do projeto ({dataPrazoProjeto})!',
			'tarefas.modal.validacao.finalAposPrazoProjeto':
				'A data final não pode ser posterior à data de prazo do projeto ({dataPrazoProjeto})!',
			'tarefas.modal.excluir.titulo': 'Confirmar Exclusão',
			'tarefas.modal.excluir.mensagem':
				'Tem certeza que deseja excluir a tarefa "{taskDescription}"?',
			'tarefas.modal.excluir.aviso': 'Esta ação não poderá ser desfeita.',
			'tarefas.modal.excluir.confirmar': 'Excluir Tarefa'
		},
		en: {
			'tarefas.tituloPagina': 'My Tasks',
			'tarefas.filtro.todosProjetos': 'All projects',
			'tarefas.filtro.semProjeto': 'Tasks without project',
			'tarefas.botao.adicionar': 'Add Task',
			'tarefas.stats.total': 'Total Tasks',
			'tarefas.stats.prioridadeAlta': 'High Priority',
			'tarefas.stats.atrasadas': 'Overdue Tasks',
			'tarefas.coluna.pendente': 'Pending',
			'tarefas.coluna.emProgresso': 'In Progress',
			'tarefas.coluna.concluida': 'Completed',
			'tarefas.coluna.cancelada': 'Canceled',
			'tarefas.card.editarAria': 'Edit Task',
			'tarefas.card.excluirAria': 'Delete Task',
			'tarefas.card.detalhes.inicio': 'Start',
			'tarefas.card.detalhes.previsao': 'Forecast',
			'tarefas.card.detalhes.final': 'End',
			'tarefas.card.dataNaoDisponivel': 'N/A',
			'tarefas.card.dataInvalida': 'Invalid Date',
			'tarefas.card.projetoAvulso': 'Standalone Project',
			'tarefas.coluna.vazia': 'No tasks in this column.',
			'tarefas.modal.editar.titulo': 'Edit Task',
			'tarefas.modal.adicionar.titulo': 'Add New Task',
			'tarefas.modal.fecharAria': 'Close modal',
			'tarefas.modal.form.descricaoLabel': 'Task Description',
			'tarefas.modal.form.descricaoPlaceholder': 'E.g., Develop weekly report',
			'tarefas.modal.form.projetoLabel': 'Associate with Project',
			'tarefas.modal.form.projetoNenhum': 'No project',
			'tarefas.modal.form.prioridadeLabel': 'Priority',
			'tarefas.modal.form.prioridadeBaixa': 'Low',
			'tarefas.modal.form.prioridadeMedia': 'Medium',
			'tarefas.modal.form.prioridadeAlta': 'High',
			'tarefas.modal.form.dataInicioLabel': 'Start Date',
			'tarefas.modal.form.dataPrevisaoLabel': 'Forecast Date',
			'tarefas.modal.form.dataFinalLabel': 'End Date (Deadline)',
			'tarefas.modal.form.hint.previsaoAposFinal': 'Forecast after end date.',
			'tarefas.modal.form.salvar': 'Save Changes',
			'tarefas.modal.form.criar': 'Create Task',
			'tarefas.modal.form.cancelar': 'Cancel',
			'tarefas.modal.validacao.descricaoObrigatoria': 'Task description is required!',
			'tarefas.modal.validacao.previsaoAposFinal':
				'The forecast date cannot be later than the end date!',
			'tarefas.modal.validacao.previsaoAposPrazoProjeto':
				'The forecast date cannot be later than the project deadline ({dataPrazoProjeto})!',
			'tarefas.modal.validacao.finalAposPrazoProjeto':
				'The end date cannot be later than the project deadline ({dataPrazoProjeto})!',
			'tarefas.modal.excluir.titulo': 'Confirm Deletion',
			'tarefas.modal.excluir.mensagem':
				'Are you sure you want to delete the task "{taskDescription}"?',
			'tarefas.modal.excluir.aviso': 'This action cannot be undone.',
			'tarefas.modal.excluir.confirmar': 'Delete Task'
		}
		// Adicionar outros idiomas aqui, se necessário
	};

	// 3. Store derivada 't' LOCAL, exatamente como nos outros exemplos.
	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number>): string => {
			const selectedLang = $cfg.idioma;
			let langDict =
				taskTranslations[selectedLang as keyof typeof taskTranslations] || taskTranslations.pt;
			let text = langDict?.[key] || taskTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});
	// --- FIM DA LÓGICA DE TRADUÇÃO LOCAL ---

	// let novoTexto = ''; // Removido pois não era usado
	let projetoSelecionado: number | 'sem-projeto' = 'sem-projeto';
	let filtroProjetoId: number | 'todos' | 'sem-projeto' = 'todos';
	let dataFinal = '';
	let dataInicio = '';
	let dataPrevisao = '';
	let tarefaEditando: Partial<Tarefa> | null = null;
	let tarefaParaExcluir: Tarefa | null = null;
	let draggedTaskId: number | null = null; // Se Tarefa.id for string, mude o tipo aqui
	let tarefasFiltradas: Tarefa[] = []; // $tarefasStore já é reativo, esta pode ser derivada
	let erroValidacao = '';

	// Estes são os valores para os status. Os labels virão das traduções.
	const statusValores: StatusTarefa[] = ['Pendente', 'Em Progresso', 'Concluída', 'Cancelada'];

	// Para os cabeçalhos das colunas
	$: statusOptionsDisplay = statusValores.map((statusValue) => {
		let keyBase = 'tarefas.coluna.';
		let icon = Clock; // default
		switch (statusValue) {
			case 'Pendente':
				keyBase += 'pendente';
				icon = Clock;
				break;
			case 'Em Progresso':
				keyBase += 'emProgresso';
				icon = Activity;
				break;
			case 'Concluída':
				keyBase += 'concluida';
				icon = CheckCircle;
				break;
			case 'Cancelada':
				keyBase += 'cancelada';
				icon = X;
				break;
		}
		return { value: statusValue, label: $t(keyBase), icon: icon };
	});

	onMount(() => {
		if (!tarefaEditando?.id) {
			dataInicio = new Date().toISOString().split('T')[0];
		}
	});

	function validarDatas(): boolean {
		erroValidacao = '';
		let projetoEncontrado: Projeto | undefined = undefined;

		if (projetoSelecionado !== 'sem-projeto' && typeof projetoSelecionado === 'number') {
			projetoEncontrado = $projetos.find((p) => p.id === projetoSelecionado);
		}

		if (dataPrevisao && dataFinal && new Date(dataPrevisao) > new Date(dataFinal)) {
			erroValidacao = $t('tarefas.modal.validacao.previsaoAposFinal');
			return false;
		}

		if (projetoEncontrado && projetoEncontrado.dataPrazo) {
			const dataPrazoProjeto = new Date(projetoEncontrado.dataPrazo);
			const prazoFormatado = formatarData(projetoEncontrado.dataPrazo); // Usa a função traduzida

			if (dataPrevisao && new Date(dataPrevisao) > dataPrazoProjeto) {
				erroValidacao = $t('tarefas.modal.validacao.previsaoAposPrazoProjeto', {
					dataPrazoProjeto: prazoFormatado
				});
				return false;
			}
			if (dataFinal && new Date(dataFinal) > dataPrazoProjeto) {
				erroValidacao = $t('tarefas.modal.validacao.finalAposPrazoProjeto', {
					dataPrazoProjeto: prazoFormatado
				});
				return false;
			}
		}
		return true;
	}

	$: {
		if (filtroProjetoId === 'todos') {
			tarefasFiltradas = $tarefasStore;
		} else if (filtroProjetoId === 'sem-projeto') {
			tarefasFiltradas = $tarefasStore.filter((t) => !t.projetoId);
		} else {
			tarefasFiltradas = $tarefasStore.filter((t) => t.projetoId === Number(filtroProjetoId));
		}
	}

	const handleDragStart = (event: DragEvent, taskId: number) => {
		// Se Tarefa.id for string, mude o tipo aqui
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
		draggedTaskId = taskId;
		(event.target as HTMLElement).classList.add('dragging');
	};

	const handleDragOver = (event: DragEvent) => {
		// Removido newStatus, não é usado aqui
		event.preventDefault();
	};

	const handleDrop = (event: DragEvent, newStatus: StatusTarefa) => {
		event.preventDefault();
		if (draggedTaskId !== null) {
			tarefasStore.atualizarStatusTarefa(draggedTaskId, newStatus);
		}
	};

	const handleDragEnd = () => {
		draggedTaskId = null;
		document.querySelectorAll('.tarefa-card').forEach((el) => el.classList.remove('dragging'));
	};

	const abrirModalNovaTarefa = () => {
		dataInicio = new Date().toISOString().split('T')[0];
		dataFinal = '';
		dataPrevisao = '';
		projetoSelecionado = 'sem-projeto';
		tarefaEditando = {
			descricao: '',
			prioridade: 'media',
			status: 'Pendente'
		};
		erroValidacao = '';
	};

	const editarTarefaClick = (tarefa: Tarefa) => {
		tarefaEditando = { ...tarefa };
		projetoSelecionado = tarefa.projetoId ? tarefa.projetoId : 'sem-projeto';
		dataInicio = tarefa.dataInicio ? new Date(tarefa.dataInicio).toISOString().split('T')[0] : '';
		dataPrevisao = tarefa.dataPrevisao
			? new Date(tarefa.dataPrevisao).toISOString().split('T')[0]
			: '';
		dataFinal = tarefa.dataFinal ? new Date(tarefa.dataFinal).toISOString().split('T')[0] : '';
		erroValidacao = '';
	};

	const confirmarExclusao = () => {
		if (tarefaParaExcluir) {
			tarefasStore.removerTarefa(tarefaParaExcluir.id);
			tarefaParaExcluir = null;
		}
	};

	// formatarData ajustada para usar $configuracoes.idioma
	function formatarData(dataString?: string): string {
		if (!dataString) return $t('tarefas.card.dataNaoDisponivel');
		try {
			let langTag = $configuracoes.idioma || 'pt';
			if (langTag === 'pt') langTag = 'pt-PT';
			else if (langTag === 'en')
				langTag = 'en-GB'; // Consistente com outras páginas
			else if (langTag === 'es') langTag = 'es-ES';
			else if (langTag === 'fr') langTag = 'fr-FR';

			return new Date(dataString).toLocaleDateString(langTag, {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch (e) {
			console.warn('Erro ao formatar data:', e);
			return $t('tarefas.card.dataInvalida');
		}
	}

	function fecharModal() {
		tarefaEditando = null;
		tarefaParaExcluir = null;
		erroValidacao = '';
	}

	function handleFormSubmit() {
		if (!tarefaEditando?.descricao?.trim()) {
			erroValidacao = $t('tarefas.modal.validacao.descricaoObrigatoria');
			return;
		}
		if (!validarDatas()) return;

		const dadosTarefa: Partial<Tarefa> = {
			...tarefaEditando,
			descricao: tarefaEditando.descricao,
			projetoId: projetoSelecionado !== 'sem-projeto' ? Number(projetoSelecionado) : undefined,
			prioridade: tarefaEditando.prioridade || 'media',
			dataInicio: dataInicio || undefined,
			dataPrevisao: dataPrevisao || undefined,
			dataFinal: dataFinal || undefined,
			status: tarefaEditando.status || 'Pendente' // Garantir que status é definido
		};

		if (tarefaEditando.id) {
			tarefasStore.atualizarTarefa(tarefaEditando.id, dadosTarefa);
		} else {
			// Para nova tarefa, garantir que todos os campos obrigatórios da store 'addTarefa' estão presentes
			// e que o status default é 'Pendente' se não for definido no formulário.
			tarefasStore.adicionarTarefa({
				descricao: dadosTarefa.descricao!, // Já validado que não é vazio
				prioridade: dadosTarefa.prioridade!,
				status: dadosTarefa.status!, // Default para 'Pendente' se não alterado
				projetoId: dadosTarefa.projetoId,
				dataInicio: dadosTarefa.dataInicio,
				dataPrevisao: dadosTarefa.dataPrevisao,
				dataFinal: dadosTarefa.dataFinal
			} as Omit<Tarefa, 'id'>);
		}
		fecharModal();
	}

	// $: if ($configuracoes) { // Para depuração
	// 	console.log('[TAREFAS] Idioma da store configuracoes:', $configuracoes.idioma);
	// 	console.log('[TAREFAS] Titulo Traduzido ($t):', $t('tarefas.tituloPagina'));
	// }
</script>

<div class="tarefas-page-container">
	<header class="page-header">
		<h1 class="page-title">{$t('tarefas.tituloPagina')}</h1>
		<div class="header-actions">
			<div class="filter-control">
				<Filter size={18} />
				<select id="filtro-projeto" bind:value={filtroProjetoId} class="input-field minimal">
					<option value="todos">{$t('tarefas.filtro.todosProjetos')}</option>
					<option value="sem-projeto">{$t('tarefas.filtro.semProjeto')}</option>
					{#each $projetos as projeto (projeto.id)}
						<option value={projeto.id}>{projeto.nome}</option>
					{/each}
				</select>
			</div>
			<button class="button primary-button" on:click={abrirModalNovaTarefa}>
				<Plus size={18} />
				{$t('tarefas.botao.adicionar')}
			</button>
		</div>
	</header>

	<div class="stats-overview-container">
		<div class="stat-card">
			<BarChart size={20} class="stat-icon total-icon" />
			<div class="stat-content">
				<span class="stat-value">{tarefasFiltradas.length}</span>
				<span class="stat-label">{$t('tarefas.stats.total')}</span>
			</div>
		</div>
		<div class="stat-card">
			<Flag size={20} class="stat-icon high-priority-icon" />
			<div class="stat-content">
				<span class="stat-value"
					>{tarefasFiltradas.filter((t) => t.prioridade === 'alta').length}</span
				>
				<span class="stat-label">{$t('tarefas.stats.prioridadeAlta')}</span>
			</div>
		</div>
		<div class="stat-card">
			<AlertCircle size={20} class="stat-icon overdue-icon" />
			<div class="stat-content">
				<span class="stat-value"
					>{tarefasFiltradas.filter(
						(t) => t.dataFinal && new Date(t.dataFinal) < new Date() && t.status !== 'Concluída'
					).length}</span
				>
				<span class="stat-label">{$t('tarefas.stats.atrasadas')}</span>
			</div>
		</div>
	</div>

	<div class="kanban-board-grid">
		{#each statusOptionsDisplay as statusOpt (statusOpt.value)}
			<div
				class="status-column"
				on:dragover={(e) => handleDragOver(e)}
				on:drop|preventDefault={(e) => handleDrop(e, statusOpt.value)}
				data-status={statusOpt.value}
			>
				<h3 class="column-header">
					<svelte:component this={statusOpt.icon} size={18} />
					<span class="column-title-text">{statusOpt.label}</span>
					<span class="column-task-count"
						>({tarefasFiltradas.filter((t) => t.status === statusOpt.value).length})</span
					>
				</h3>
				<div class="tasks-list">
					{#each tarefasFiltradas.filter((t) => t.status === statusOpt.value) as tarefa (tarefa.id)}
						<div
							class="tarefa-card priority-{tarefa.prioridade}"
							draggable="true"
							on:dragstart={(e) => handleDragStart(e, tarefa.id)}
							on:dragend={handleDragEnd}
							in:fade={{ duration: 200 }}
							out:fade={{ duration: 150 }}
						>
							<div class="tarefa-card-header">
								<div class="tarefa-identifier">
									<span class="priority-indicator"></span>
									<strong class="tarefa-description">{tarefa.descricao}</strong>
								</div>
								<div class="tarefa-action-buttons">
									<button
										class="icon-button"
										on:click={() => editarTarefaClick(tarefa)}
										aria-label={$t('tarefas.card.editarAria')}><Edit size={16} /></button
									>
									<button
										class="icon-button danger"
										on:click={() => (tarefaParaExcluir = tarefa)}
										aria-label={$t('tarefas.card.excluirAria')}><Trash2 size={16} /></button
									>
								</div>
							</div>
							<div class="tarefa-details-grid">
								{#if tarefa.dataInicio}
									<div class="detail-item">
										<Calendar size={14} /><span
											>{$t('tarefas.card.detalhes.inicio')}: {formatarData(tarefa.dataInicio)}</span
										>
									</div>{/if}
								{#if tarefa.dataPrevisao}
									<div class="detail-item">
										<Target size={14} /><span
											>{$t('tarefas.card.detalhes.previsao')}: {formatarData(
												tarefa.dataPrevisao
											)}</span
										>
									</div>{/if}
								{#if tarefa.dataFinal}
									<div class="detail-item final-date-item">
										<Flag size={14} />
										<span
											>{$t('tarefas.card.detalhes.final')}:
											<span
												class:overdue-text={new Date(tarefa.dataFinal) < new Date() &&
													tarefa.status !== 'Concluída'}>{formatarData(tarefa.dataFinal)}</span
											></span
										>
									</div>{/if}
							</div>
							{#if tarefa.projetoId}
								<div class="project-association-tag">
									<Folder size={14} />
									<span
										>{$projetos.find((p) => p.id === tarefa.projetoId)?.nome ||
											$t('tarefas.card.projetoAvulso')}</span
									>
								</div>{/if}
						</div>
					{:else}
						<div class="empty-column-message">{$t('tarefas.coluna.vazia')}</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if tarefaEditando}
		<div class="modal-backdrop" on:click|self={fecharModal} transition:fade={{ duration: 150 }}>
			<div class="modal-dialog" transition:slide={{ duration: 250, y: 50 }}>
				<div class="modal-dialog-header">
					<h2 class="modal-title">
						{tarefaEditando.id
							? $t('tarefas.modal.editar.titulo')
							: $t('tarefas.modal.adicionar.titulo')}
					</h2>
					<button
						class="close-modal-button"
						on:click={fecharModal}
						aria-label={$t('tarefas.modal.fecharAria')}>×</button
					>
				</div>
				<form class="modal-form" on:submit|preventDefault={handleFormSubmit}>
					<div class="form-fields-grid">
						<div class="form-input-group required-field">
							<label for="descricao"
								><FileText size={16} /> {$t('tarefas.modal.form.descricaoLabel')}</label
							>
							<input
								type="text"
								id="descricao"
								placeholder={$t('tarefas.modal.form.descricaoPlaceholder')}
								bind:value={tarefaEditando.descricao}
								required
								class="input-field"
							/>
						</div>
						<div class="form-input-group">
							<label for="projeto"
								><Folder size={16} /> {$t('tarefas.modal.form.projetoLabel')}</label
							>
							<select id="projeto" bind:value={projetoSelecionado} class="input-field">
								<option value="sem-projeto">{$t('tarefas.modal.form.projetoNenhum')}</option>
								{#each $projetos as projeto (projeto.id)}
									<option value={projeto.id}>{projeto.nome}</option>
								{/each}
							</select>
						</div>
						<div class="form-input-group">
							<label for="prioridade"
								><Flag size={16} /> {$t('tarefas.modal.form.prioridadeLabel')}</label
							>
							<select id="prioridade" bind:value={tarefaEditando.prioridade} class="input-field">
								<option value="baixa">{$t('tarefas.modal.form.prioridadeBaixa')}</option>
								<option value="media" selected>{$t('tarefas.modal.form.prioridadeMedia')}</option>
								<option value="alta">{$t('tarefas.modal.form.prioridadeAlta')}</option>
							</select>
						</div>
						<div class="form-input-group">
							<label for="data-inicio"
								><Calendar size={16} /> {$t('tarefas.modal.form.dataInicioLabel')}</label
							>
							<input id="data-inicio" type="date" bind:value={dataInicio} class="input-field" />
						</div>
						<div class="form-input-group">
							<label for="data-previsao"
								><Target size={16} /> {$t('tarefas.modal.form.dataPrevisaoLabel')}</label
							>
							<input
								id="data-previsao"
								type="date"
								bind:value={dataPrevisao}
								class="input-field"
								min={dataInicio}
								max={dataFinal || undefined}
							/>
							{#if dataPrevisao && dataFinal && new Date(dataPrevisao) > new Date(dataFinal)}<small
									class="field-hint error">{$t('tarefas.modal.form.hint.previsaoAposFinal')}</small
								>{/if}
						</div>
						<div class="form-input-group">
							<label for="data-final"
								><Flag size={16} /> {$t('tarefas.modal.form.dataFinalLabel')}</label
							>
							<input
								id="data-final"
								type="date"
								bind:value={dataFinal}
								class="input-field"
								min={dataInicio || dataPrevisao}
							/>
						</div>
					</div>
					{#if erroValidacao}
						<div class="form-validation-error">
							<AlertCircle size={18} />
							{erroValidacao}
						</div>{/if}
					<div class="modal-dialog-actions">
						<button type="submit" class="button primary-button"
							>{tarefaEditando.id
								? $t('tarefas.modal.form.salvar')
								: $t('tarefas.modal.form.criar')}</button
						>
						<button type="button" class="button secondary-button" on:click={fecharModal}
							>{$t('tarefas.modal.form.cancelar')}</button
						>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if tarefaParaExcluir}
		<div class="modal-backdrop" on:click|self={fecharModal} transition:fade={{ duration: 150 }}>
			<div class="modal-dialog confirmation-modal" transition:slide={{ duration: 250, y: 50 }}>
				<div class="modal-dialog-header">
					<AlertTriangle size={24} class="confirmation-icon" />
					<h2 class="modal-title">{$t('tarefas.modal.excluir.titulo')}</h2>
				</div>
				<p class="confirmation-message">
					{@html $t('tarefas.modal.excluir.mensagem', {
						taskDescription: `<strong>${tarefaParaExcluir.descricao}</strong>`
					})}
				</p>
				<p class="irreversible-warning">{$t('tarefas.modal.excluir.aviso')}</p>
				<div class="modal-dialog-actions">
					<button class="button secondary-button" on:click={fecharModal}
						>{$t('tarefas.modal.form.cancelar')}</button
					>
					<button class="button danger-button" on:click={confirmarExclusao}
						><Trash2 size={16} /> {$t('tarefas.modal.excluir.confirmar')}</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Cole aqui os seus estilos CSS originais para a página de tarefas */
	.tarefas-page-container {
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
		color: var(--text-color-muted);
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
	.stat-icon {
		flex-shrink: 0;
		padding: 0.6rem;
		border-radius: 8px;
	}
	.stat-icon.total-icon {
		background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
		color: var(--primary-color);
	}
	.stat-icon.high-priority-icon {
		background-color: color-mix(in srgb, var(--danger-color) 15%, transparent);
		color: var(--danger-color);
	}
	.stat-icon.overdue-icon {
		background-color: color-mix(in srgb, var(--warning-color) 15%, transparent);
		color: var(--warning-color);
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
		color: var(--text-color-muted);
		font-weight: 500;
	}
	.kanban-board-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
		min-height: 60vh;
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
		color: var(--text-color-muted);
	}
	.column-title-text {
		flex-grow: 1;
	}
	.column-task-count {
		font-size: 0.85rem;
		color: var(--text-color-muted);
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
		border-radius: 8px;
		box-shadow: var(--shadow);
		cursor: grab;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease,
			border-left-color 0.2s ease;
		border: 1px solid var(--border-color);
		border-left: 4px solid transparent;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.tarefa-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 10px -2px color-mix(in srgb, var(--shadow) 30%, transparent);
	}
	.tarefa-card.dragging {
		opacity: 0.6;
		transform: scale(0.98) rotate(1deg);
		box-shadow: 0 8px 15px color-mix(in srgb, var(--shadow) 50%, transparent);
	}
	.tarefa-card.priority-baixa {
		border-left-color: var(--success-color);
	}
	.tarefa-card.priority-media {
		border-left-color: var(--warning-color);
	}
	.tarefa-card.priority-alta {
		border-left-color: var(--danger-color);
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
	.priority-indicator {
		display: none;
	} /* Usando border-left no card */
	.tarefa-description {
		font-weight: 600;
		color: var(--app-text-color);
		line-height: 1.3;
		word-break: break-word;
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
		color: var(--text-color-muted);
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
		color: var(--text-color-muted);
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
	.project-association-tag {
		background-color: var(--border-color);
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		font-size: 0.75rem;
		margin-top: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--text-color-muted);
		align-self: flex-start;
		font-weight: 500;
	}
	.empty-column-message {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--text-color-muted);
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
		max-width: 550px;
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
		color: var(--text-color-muted);
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
		.form-fields-grid .form-input-group:first-child {
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
		border: 1px solid var(--border-color); /* Ajustei para --border-color para inputs não focados */
		border-radius: var(--radius);
		font-size: 0.95rem;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		font-family: inherit;
		background-color: var(--input-background-color); /* Usando input-background-color */
		color: var(--app-text-color);
		width: 100%;
	}
	.input-field:focus {
		border-color: var(--primary-color);
		outline: none;
		box-shadow: 0 0 0 3px var(--input-focus-ring-color); /* Usando input-focus-ring-color */
	}
	.field-hint {
		font-size: 0.75rem;
		color: var(--text-color-muted);
	}
	.field-hint.error {
		color: var(--danger-color);
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
		border-color: var(--text-color-muted);
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
	.confirmation-modal .confirmation-icon {
		color: var(--danger-color);
		margin-right: 0.5rem;
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
		color: var(--text-color-muted); /* Ajuste conforme seu tema, pode ser danger-text-color */
		background-color: var(
			--border-color
		); /* Ajuste conforme seu tema, pode ser danger-background-color */
		padding: 0.5rem; /* Era 0.75rem */
		border-radius: var(--radius);
		margin: 1rem 0;
		/* border-left: 3px solid var(--danger-color); Removido para um aviso mais suave */
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
	}
</style>
