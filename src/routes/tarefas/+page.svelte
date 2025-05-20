<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { projetos } from '../../lib/stores/projetos';
	import { tarefas } from '../../lib/stores/tarefas';
	import { onMount } from 'svelte';
	import {
		Plus,
		Calendar,
		Clock,
		Flag,
		CheckSquare,
		Folder,
		FolderOpen,
		PieChart,
		Edit,
		Trash2,
		AlertTriangle,
		BarChart,
		Target,
		CheckCircle,
		X,
		AlertCircle,
		FileText,
		List,
		Activity,
		Filter
	} from 'lucide-svelte';

	let novoTexto = '';
	let projetoSelecionado: number | 'sem-projeto' = 'sem-projeto';
	let filtroProjetoId: number | 'todos' | 'sem-projeto' = 'todos';
	let prioridadeSelecionada: Prioridade = 'media';
	let dataFinal = '';
	let dataInicio = '';
	let dataPrevisao = '';
	let tarefaEditando: Tarefa | null = null;
	let tarefaParaExcluir: Tarefa | null = null;
	let draggedTaskId: number | null = null;
	let tarefasFiltradas: any[] = [];
	let erroValidacao = '';

	const statusOptions: StatusTarefa[] = ['Pendente', 'Em Progresso', 'Concluída', 'Cancelada'];

	onMount(() => {
		tarefas.load(); // Garante o carregamento após montagem do componente
	});

	// Função para validar as datas
	function validarDatas(): boolean {
		erroValidacao = '';

		if (dataPrevisao && dataFinal) {
			if (new Date(dataPrevisao) > new Date(dataFinal)) {
				erroValidacao = 'A data de previsão não pode ser posterior à data final!';
				return false;
			}
		}

		return true;
	}

	// Função para filtrar tarefas com base no projeto selecionado
	$: {
		if (filtroProjetoId === 'todos') {
			tarefasFiltradas = $tarefas;
		} else if (filtroProjetoId === 'sem-projeto') {
			tarefasFiltradas = $tarefas.filter((t) => !t.projetoId);
		} else {
			tarefasFiltradas = $tarefas.filter((t) => t.projetoId === filtroProjetoId);
		}
	}

	const handleDragStart = (event: DragEvent, taskId: number) => {
		draggedTaskId = taskId;
		(event.target as HTMLElement).classList.add('dragging');
	};

	const handleDragOver = (event: DragEvent, newStatus: StatusTarefa) => {
		event.preventDefault();
		if (draggedTaskId) {
			tarefas.atualizarTarefa(draggedTaskId, { status: newStatus });
		}
	};

	const handleDragEnd = () => {
		draggedTaskId = null;
		document.querySelectorAll('.tarefa').forEach((el) => el.classList.remove('dragging'));
	};

	const editarTarefa = (tarefa: Tarefa) => {
		tarefaEditando = { ...tarefa };
		if (tarefa.dataFinal) {
			dataFinal = new Date(tarefa.dataFinal).toISOString().split('T')[0];
		} else {
			dataFinal = '';
		}
		if (tarefa.dataInicio) {
			dataInicio = new Date(tarefa.dataInicio).toISOString().split('T')[0];
		} else {
			dataInicio = '';
		}
		if (tarefa.dataPrevisao) {
			dataPrevisao = new Date(tarefa.dataPrevisao).toISOString().split('T')[0];
		} else {
			dataPrevisao = '';
		}
	};

	const confirmarExclusao = () => {
		if (tarefaParaExcluir) {
			tarefas.removerTarefa(tarefaParaExcluir.id);
			tarefaParaExcluir = null;
		}
	};

	// Configurar valores padrão para datas quando o componente for montado
	onMount(() => {
		// Definir data de início como hoje por padrão
		dataInicio = new Date().toISOString().split('T')[0];
	});

	function formatarData(dataString: string) {
		if (!dataString) return '';
		return new Date(dataString).toLocaleDateString();
	}

	function fecharModal() {
		tarefaEditando = null;
		tarefaParaExcluir = null;
	}
</script>

<div class="tarefas-container">
	<!-- Cabeçalho -->
	<header>
		<h1>Minhas Tarefas</h1>
		<div class="header-controls">
			<div class="search-container">
				<Filter size={18} />
				<select id="filtro-projeto" bind:value={filtroProjetoId} class="input">
					<option value="todos">Todos os projetos</option>
					<option value="sem-projeto">Sem projeto</option>
					{#each $projetos as projeto}
						<option value={projeto.id}>{projeto.nome}</option>
					{/each}
				</select>
			</div>
			<button class="btn-primary" on:click={() => (tarefaEditando = {})}>
				<Plus size={18} stroke-width="2" /> Adicionar Tarefa
			</button>
		</div>
	</header>

	<!-- Estatísticas -->
	<div class="estatisticas-container">
		<div class="estatistica-card total">
			<h3><BarChart size={18} /> Total</h3>
			<span>{tarefasFiltradas.length}</span>
		</div>
		<div class="estatistica-card alta">
			<h3><Flag size={18} /> Prioridade Alta</h3>
			<span>{tarefasFiltradas.filter((t) => t.prioridade === 'alta').length}</span>
		</div>
		<div class="estatistica-card atrasadas">
			<h3><AlertCircle size={18} /> Atrasadas</h3>
			<span>
				{tarefasFiltradas.filter(
					(t) => t.dataFinal && new Date(t.dataFinal) < new Date() && t.status !== 'Concluída'
				).length}
			</span>
		</div>
	</div>

	<!-- Quadro Kanban -->
	<div class="quadro-kanban">
		{#each statusOptions as status}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="coluna-status"
				on:dragover={(e) => handleDragOver(e, status)}
				data-status={status}
			>
				<h3 class="coluna-titulo">
					{#if status === 'Pendente'}
						<Clock size={18} />
					{:else if status === 'Em Progresso'}
						<Activity size={18} />
					{:else if status === 'Concluída'}
						<CheckCircle size={18} />
					{:else}
						<X size={18} />
					{/if}
					{status}
					<small>
						({tarefasFiltradas.filter((t) => t.status === status).length})
					</small>
				</h3>

				{#each tarefasFiltradas.filter((t) => t.status === status) as tarefa (tarefa.id)}
					<div
						class="tarefa {tarefa.prioridade}"
						draggable="true"
						on:dragstart={(e) => handleDragStart(e, tarefa.id)}
						on:dragend={handleDragEnd}
						in:fade
					>
						<div class="tarefa-header">
							<span class="prioridade-dot {tarefa.prioridade}"></span>
							{#if tarefa.dataFinal}
								<span
									class="data-vencimento {new Date(tarefa.dataFinal) < new Date()
										? 'atrasada'
										: ''}"
								>
									<Flag size={14} /> Data Final: {formatarData(tarefa.dataFinal)}
								</span>
							{/if}
						</div>

						<p class="descricao">{tarefa.descricao}</p>

						{#if tarefa.dataInicio}
							<div class="data-info">
								<Calendar size={14} /> Início: {formatarData(tarefa.dataInicio)}
							</div>
						{/if}

						{#if tarefa.dataPrevisao}
							<div class="data-info">
								<Target size={14} /> Previsão: {formatarData(tarefa.dataPrevisao)}
							</div>
						{/if}

						{#if tarefa.projetoId}
							<div class="projeto-tag">
								<Folder size={14} />
								{$projetos.find((p) => p.id === tarefa.projetoId)?.nome || 'Projeto desconhecido'}
							</div>
						{/if}

						<div class="tarefa-acoes">
							<button class="btn-icon" on:click={() => editarTarefa(tarefa)}
								><Edit size={16} /></button
							>
							<button class="btn-icon danger" on:click={() => (tarefaParaExcluir = tarefa)}
								><Trash2 size={16} /></button
							>
						</div>
					</div>
				{:else}
					<div class="tarefa-vazia">Nenhuma tarefa aqui...</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Modal de Edição/Adição -->
	{#if tarefaEditando}
		<div class="modal-overlay" on:click|self={fecharModal} transition:fade>
			<div class="modal-content" transition:slide|local>
				<div class="modal-header">
					<h2>{tarefaEditando.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
					<button class="close-btn" on:click={fecharModal}>&times;</button>
				</div>
				<form
					on:submit|preventDefault={() => {
						if (!tarefaEditando.descricao.trim()) {
							erroValidacao = 'A descrição da tarefa é obrigatória!';
							return;
						}

						if (!validarDatas()) {
							return;
						}

						if (tarefaEditando.id) {
							tarefas.atualizarTarefa(tarefaEditando.id, {
								...tarefaEditando,
								dataInicio: dataInicio || undefined,
								dataPrevisao: dataPrevisao || undefined,
								dataFinal: dataFinal || undefined
							});
						} else {
							tarefas.adicionarTarefa({
								descricao: tarefaEditando.descricao,
								projetoId: projetoSelecionado !== 'sem-projeto' ? projetoSelecionado : undefined,
								prioridade: tarefaEditando.prioridade,
								status: 'Pendente',
								dataInicio: dataInicio || undefined,
								dataPrevisao: dataPrevisao || undefined,
								dataFinal: dataFinal || undefined
							});
						}
						fecharModal();
						erroValidacao = '';
					}}
				>
					<div class="form-grid">
						<div class="input-container required">
							<label for="descricao"><FileText size={16} /> Descrição</label>
							<input
								type="text"
								id="descricao"
								placeholder="Descrição da tarefa"
								bind:value={tarefaEditando.descricao}
								required
								class="input"
							/>
						</div>
						<div class="input-container">
							<label for="projeto"><Folder size={16} /> Projeto</label>
							<select id="projeto" bind:value={projetoSelecionado} class="input">
								<option value="sem-projeto">Sem projeto</option>
								{#each $projetos as projeto}
									<option value={projeto.id}>{projeto.nome} ({projeto.status})</option>
								{/each}
							</select>
						</div>
						<div class="input-container">
							<label for="prioridade"><Flag size={16} /> Prioridade</label>
							<select id="prioridade" bind:value={tarefaEditando.prioridade} class="input">
								<option value="baixa">Baixa</option>
								<option value="media">Média</option>
								<option value="alta">Alta</option>
							</select>
						</div>
						<div class="input-container">
							<label for="data-inicio"><Calendar size={16} /> Data de início</label>
							<input id="data-inicio" type="date" bind:value={dataInicio} class="input" />
						</div>
						<div class="input-container">
							<label for="data-previsao"><Target size={16} /> Previsão de prazo</label>
							<input
								id="data-previsao"
								type="date"
								bind:value={dataPrevisao}
								class="input {dataPrevisao ? 'has-data' : ''}"
								min={dataInicio}
								max={dataFinal || undefined}
							/>
							<small>Não pode ser posterior à data final</small>
						</div>
						<div class="input-container">
							<label for="data-final"><Flag size={16} /> Data final</label>
							<input
								id="data-final"
								type="date"
								bind:value={dataFinal}
								class="input {dataFinal ? 'has-data' : ''}"
								min={dataInicio}
							/>
						</div>
					</div>
					<div class="modal-actions">
						<button type="submit" class="btn-primary">
							{tarefaEditando.id ? 'Atualizar' : 'Adicionar'}
						</button>
						<button type="button" class="btn-secondary" on:click={fecharModal}> Cancelar </button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Modal de Confirmação -->
	{#if tarefaParaExcluir}
		<div class="modal-overlay" on:click|self={fecharModal} transition:fade>
			<div class="modal-content" transition:slide|local>
				<h2><Trash2 size={18} /> Confirmar Exclusão</h2>
				<p>Tem certeza que deseja excluir a tarefa "{tarefaParaExcluir.descricao}"?</p>
				<div class="botoes-confirmacao">
					<button class="btn-secondary" on:click={fecharModal}>Cancelar</button>
					<button class="btn-danger" on:click={confirmarExclusao}>Confirmar Exclusão</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--primary: #333;
		--secondary: #555;
		--background: #f5f5f5;
		--text: #222;
		--success: #444;
		--warning: #666;
		--danger: #000;
		--light-gray: #e0e0e0;
		--medium-gray: #999;
		--shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		--border-color: #ddd;
	}

	.tarefas-container {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		gap: 1.5rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	h1 {
		font-size: 28px;
		color: var(--text);
		margin: 0;
	}

	.header-controls {
		display: flex;
		gap: 15px;
		align-items: center;
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-container select {
		padding: 10px 10px 10px 40px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		width: 250px;
		font-size: 14px;
	}

	.search-container :global(svg) {
		position: absolute;
		left: 10px;
		color: var(--medium-gray);
	}

	.estatisticas-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.estatistica-card {
		background: white;
		padding: 1.5rem;
		border-radius: 4px;
		text-align: center;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
	}

	.estatistica-card h3 {
		margin: 0 0 1rem 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 1rem;
	}

	.estatistica-card span {
		font-size: 2rem;
		font-weight: bold;
	}

	.quadro-kanban {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.coluna-status {
		background: var(--background);
		padding: 1rem;
		border-radius: 4px;
		min-height: 60vh;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
	}

	.coluna-titulo {
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color);
		color: var(--text);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tarefa {
		background: white;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		box-shadow: var(--shadow);
		cursor: grab;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		position: relative;
		border: 1px solid var(--border-color);
	}

	.tarefa:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.tarefa.dragging {
		opacity: 0.5;
		transform: scale(0.98);
	}

	.tarefa-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.prioridade-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
		margin-right: 0.5rem;
	}

	.prioridade-dot.baixa {
		background: var(--success);
	}
	.prioridade-dot.media {
		background: var(--warning);
	}
	.prioridade-dot.alta {
		background: var(--danger);
	}

	.data-vencimento {
		font-size: 0.85rem;
		color: var(--medium-gray);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.data-vencimento.atrasada {
		color: var(--danger);
		font-weight: bold;
	}

	.data-info {
		font-size: 0.85rem;
		color: var(--medium-gray);
		margin-top: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.projeto-tag {
		background: #f0f0f0;
		padding: 0.25rem 0.5rem;
		border-radius: 2px;
		font-size: 0.85rem;
		margin-top: 0.5rem;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid var(--border-color);
	}

	.tarefa-acoes {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.tarefa:hover .tarefa-acoes {
		opacity: 1;
	}

	.btn-icon {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		margin-left: 0.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon.danger:hover {
		color: var(--danger);
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: grid;
		place-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		padding: 25px;
		border-radius: 8px;
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: var(--medium-gray);
		padding: 0 8px;
	}

	.close-btn:hover {
		color: var(--text);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.input-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-container label {
		font-weight: 500;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.input-container.required label::after {
		content: '*';
		color: var(--danger);
		margin-left: 0.25rem;
	}

	.input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
		font-family: inherit;
	}

	.input:focus {
		border-color: var(--primary);
		outline: none;
	}

	textarea.input {
		resize: vertical;
		min-height: 120px;
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 20px;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.3s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary:hover {
		background: #000;
	}

	.btn-secondary {
		background: var(--light-gray);
		color: var(--text);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.btn-secondary:hover {
		background: #d0d0d0;
	}

	@media (max-width: 768px) {
		header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}

		.header-controls {
			flex-direction: column;
			width: 100%;
			align-items: stretch;
		}

		.search-container {
			width: 100%;
		}

		.search-container select {
			width: 100%;
		}

		.estatisticas-container {
			grid-template-columns: 1fr;
		}

		.quadro-kanban {
			grid-template-columns: 1fr;
		}

		.modal-content {
			padding: 15px;
			width: 95%;
		}
	}
</style>
