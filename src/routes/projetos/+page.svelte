<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { projetos, type Projeto } from '../../lib/stores/projetos';
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

	type Status = 'Ideia' | 'Pendente' | 'Em Processo' | 'Finalizado';

	let filtro: Status | 'todos' = 'todos';
	let showModal = false;
	let editando = false;

	let projetoId: number | null = null;
	let nome = '';
	let descricao = '';
	let status: Status = 'Ideia';
	let dataInicio = '';
	let dataPrazo = '';
	let erro = '';

	onMount(() => {
		dataInicio = new Date().toISOString().split('T')[0];
	});

	const resetForm = () => {
		nome = '';
		descricao = '';
		status = 'Ideia';
		dataInicio = new Date().toISOString().split('T')[0];
		dataPrazo = '';
		projetoId = null;
		editando = false;
		erro = '';
	};

	function abrirNovoProjeto() {
		resetForm();
		showModal = true;
	}

	function editarProjeto(p) {
		nome = p.nome;
		descricao = p.descricao;
		status = p.status;
		dataInicio = p.dataInicio || '';
		dataPrazo = p.dataPrazo || '';
		projetoId = p.id;
		editando = true;
		showModal = true;
	}

	function salvarProjeto() {
		if (!nome.trim()) {
			erro = 'Nome obrigatório.';
			return;
		}
		if (dataPrazo && new Date(dataPrazo) < new Date(dataInicio)) {
			erro = 'Prazo não pode ser anterior ao início.';
			return;
		}

		const novoProjeto = {
			id: projetoId ?? Date.now(),
			nome,
			descricao,
			status,
			dataInicio,
			dataPrazo
		};

		projetos.update((lista) => {
			if (editando && projetoId !== null) {
				return lista.map((p) => (p.id === projetoId ? novoProjeto : p));
			}
			return [...lista, novoProjeto];
		});

		showModal = false;
		resetForm();
	}

	function excluirProjeto(id: number) {
		projetos.update((lista) => lista.filter((p) => p.id !== id));
	}

	const formatarData = (data: string) => (data ? new Date(data).toLocaleDateString('pt-BR') : '');

	$: projetosFiltrados =
		filtro === 'todos' ? $projetos : $projetos.filter((p) => p.status === filtro);

	$: atrasados = $projetos.filter(
		(p) => p.dataPrazo && new Date(p.dataPrazo) < new Date() && p.status !== 'Finalizado'
	);
</script>

<div class="tarefas-container">
	<!-- Cabeçalho -->
	<header>
		<h1>Projetos</h1>
		<div class="header-controls">
			<div class="search-container">
				<Filter size={18} />
				<select id="filtro-projeto" bind:value={filtro} class="input">
					<option value="todos">Todos</option>
					<option value="Ideia">Ideia</option>
					<option value="Pendente">Pendente</option>
					<option value="Em Processo">Em Processo</option>
					<option value="Finalizado">Finalizado</option>
				</select>
			</div>
			<button class="btn-primary" on:click={abrirNovoProjeto}>
				<Plus size={18} stroke-width="2" /> Novo Projeto
			</button>
		</div>
	</header>

	<!-- Estatísticas -->
	<div class="estatisticas-container">
		<div class="estatistica-card total">
			<h3><BarChart size={18} /> Total</h3>
			<span>{$projetos.length}</span>
		</div>
		<div class="estatistica-card alta">
			<h3><Flag size={18} /> Finalizados</h3>
			<span>{$projetos.filter((p) => p.status === 'Finalizado').length}</span>
		</div>
		<div class="estatistica-card atrasadas">
			<h3><AlertCircle size={18} /> Atrasados</h3>
			<span>{atrasados.length}</span>
		</div>
	</div>

	<!-- Quadro Kanban -->
	<div class="quadro-kanban">
		{#each ['Ideia', 'Pendente', 'Em Processo', 'Finalizado'] as st}
			<div class="coluna-status">
				<h3 class="coluna-titulo">
					{#if st === 'Ideia'}
						<Clock size={18} />
					{:else if st === 'Pendente'}
						<Activity size={18} />
					{:else if st === 'Em Processo'}
						<CheckCircle size={18} />
					{:else}
						<X size={18} />
					{/if}
					{st}
					<small>
						({projetosFiltrados.filter((p) => p.status === st).length})
					</small>
				</h3>

				{#each projetosFiltrados.filter((p) => p.status === st) as p (p.id)}
					<div class="tarefa" in:fade>
						<div class="tarefa-header">
							<span class="prioridade-dot"></span>
							<h4 class="titulo-projeto">{p.nome}</h4>
						</div>

						<p class="descricao">{p.descricao}</p>

						{#if p.dataInicio}
							<div class="data-info">
								<Calendar size={14} /> Início: {formatarData(p.dataInicio)}
							</div>
						{/if}

						{#if p.dataPrazo}
							<div class="data-info">
								<Flag size={14} /> Prazo: {formatarData(p.dataPrazo)}
							</div>
						{/if}

						<div class="tarefa-acoes">
							<button class="btn-icon" on:click={() => editarProjeto(p)}><Edit size={16} /></button>
							<button class="btn-icon danger" on:click={() => excluirProjeto(p.id)}
								><Trash2 size={16} /></button
							>
						</div>
					</div>
				{:else}
					<div class="tarefa-vazia">Nenhum projeto aqui...</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Modal de Edição/Adição -->
	{#if showModal}
		<div class="modal-overlay" on:click|self={() => (showModal = false)} transition:fade>
			<div class="modal-content" transition:slide|local>
				<div class="modal-header">
					<h2>{editando ? 'Editar Projeto' : 'Novo Projeto'}</h2>
					<button class="close-btn" on:click={() => (showModal = false)}>&times;</button>
				</div>
				<form on:submit|preventDefault={salvarProjeto}>
					<div class="form-grid">
						<div class="input-container required">
							<label for="nome"><FileText size={16} /> Nome</label>
							<input
								type="text"
								id="nome"
								placeholder="Nome do projeto"
								bind:value={nome}
								required
								class="input"
							/>
						</div>
						<div class="input-container">
							<label for="descricao"><Folder size={16} /> Descrição</label>
							<textarea
								id="descricao"
								placeholder="Descrição do projeto"
								bind:value={descricao}
								class="input"
							></textarea>
						</div>
						<div class="input-container">
							<label for="status"><Flag size={16} /> Status</label>
							<select id="status" bind:value={status} class="input">
								<option value="Ideia">Ideia</option>
								<option value="Pendente">Pendente</option>
								<option value="Em Processo">Em Processo</option>
								<option value="Finalizado">Finalizado</option>
							</select>
						</div>
						<div class="input-container">
							<label for="data-inicio"><Calendar size={16} /> Data de início</label>
							<input id="data-inicio" type="date" bind:value={dataInicio} class="input" />
						</div>
						<div class="input-container">
							<label for="data-prazo"><Target size={16} /> Prazo</label>
							<input
								id="data-prazo"
								type="date"
								bind:value={dataPrazo}
								class="input"
								min={dataInicio}
							/>
						</div>
					</div>
					<div class="modal-actions">
						<button type="submit" class="btn-primary">
							{editando ? 'Atualizar' : 'Adicionar'}
						</button>
						<button type="button" class="btn-secondary" on:click={() => (showModal = false)}>
							Cancelar
						</button>
					</div>
				</form>
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
	.titulo-projeto {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text);
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

	.tarefa-header {
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

	.data-info {
		font-size: 0.85rem;
		color: var(--medium-gray);
		margin-top: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.tarefa-acoes {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.btn-icon {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
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
