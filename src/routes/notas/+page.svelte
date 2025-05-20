<script>
	import { notesStore } from '../../lib/stores/notesStores';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import {
		Edit,
		Trash2,
		Plus,
		Search,
		FileText,
		Clock,
		Tag,
		CheckCircle,
		Calendar,
		Flag,
		Activity,
		X,
		BarChart,
		AlertCircle,
		Target,
		Filter
	} from 'lucide-svelte';

	let currentNote = { id: '', title: '', content: '' };
	let showModal = false;
	let isEditing = false;
	let searchTerm = '';

	$: filteredNotes = $notesStore.filter(
		(note) =>
			note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			note.content.toLowerCase().includes(searchTerm.toLowerCase())
	);

	function handleSubmit() {
		if (!currentNote.title || !currentNote.content) return;

		if (isEditing) {
			notesStore.updateNote(currentNote.id, currentNote.title, currentNote.content);
		} else {
			notesStore.addNote(currentNote.title, currentNote.content);
		}

		closeModal();
	}

	function openEditModal(note) {
		currentNote = { ...note };
		isEditing = true;
		showModal = true;
	}

	function openAddModal() {
		resetForm();
		isEditing = false;
		showModal = true;
	}

	function deleteNote(id) {
		if (confirm('Tem certeza que deseja excluir esta nota?')) {
			notesStore.deleteNote(id);
			if (currentNote.id === id) closeModal();
		}
	}

	function resetForm() {
		currentNote = { id: '', title: '', content: '' };
	}

	function closeModal() {
		showModal = false;
		resetForm();
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}
</script>

<div class="tarefas-container">
	<!-- Cabeçalho -->
	<header>
		<h1>Minhas Notas</h1>
		<div class="header-controls">
			<div class="search-container">
				<Filter size={18} />
				<input type="text" placeholder="Pesquisar notas..." bind:value={searchTerm} class="input" />
			</div>
			<button class="btn-primary" on:click={openAddModal}>
				<Plus size={18} stroke-width="2" /> Adicionar Nota
			</button>
		</div>
	</header>

	<!-- Estatísticas -->
	<div class="estatisticas-container">
		<div class="estatistica-card total">
			<h3><BarChart size={18} /> Total</h3>
			<span>{filteredNotes.length}</span>
		</div>
		<div class="estatistica-card recentes">
			<h3><Clock size={18} /> Recentes (7 dias)</h3>
			<span>
				{filteredNotes.filter((note) => {
					const sevenDaysAgo = new Date();
					sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
					return new Date(note.createdAt) >= sevenDaysAgo;
				}).length}
			</span>
		</div>
		<div class="estatistica-card atualizadas">
			<h3><CheckCircle size={18} /> Atualizadas</h3>
			<span>
				{filteredNotes.filter((note) => note.updatedAt).length}
			</span>
		</div>
	</div>

	<!-- Lista de Notas -->
	<div class="notes-list">
		<h2>Notas ({filteredNotes.length})</h2>
		{#if filteredNotes.length === 0}
			<p class="no-notes">Nenhuma nota encontrada.</p>
		{:else}
			<div class="notes-grid">
				{#each filteredNotes as note (note.id)}
					<div class="note-item" transition:slide|local>
						<div class="note-header">
							<h3>{note.title}</h3>
							<div class="note-actions">
								<button class="btn-icon" on:click={() => openEditModal(note)}>
									<Edit size={18} stroke-width="1.5" />
								</button>
								<button class="btn-icon danger" on:click={() => deleteNote(note.id)}>
									<Trash2 size={18} stroke-width="1.5" />
								</button>
							</div>
						</div>
						<div class="note-content">
							<p>{note.content}</p>
						</div>
						<div class="note-footer">
							<div class="data-info">
								<Clock size={14} /> Criado em: {formatDate(note.createdAt)}
							</div>
							{#if note.updatedAt}
								<div class="data-info">
									<CheckCircle size={14} /> Atualizado em: {formatDate(note.updatedAt)}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Modal de Edição/Adição -->
	{#if showModal}
		<div class="modal-overlay" on:click|self={closeModal} transition:fade>
			<div class="modal-content" transition:slide|local>
				<div class="modal-header">
					<h2>{isEditing ? 'Editar Nota' : 'Nova Nota'}</h2>
					<button class="close-btn" on:click={closeModal}>&times;</button>
				</div>
				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-grid">
						<div class="input-container required">
							<label for="title"><FileText size={16} /> Título</label>
							<input
								type="text"
								id="title"
								placeholder="Título da nota"
								bind:value={currentNote.title}
								required
								class="input"
							/>
						</div>
						<div class="input-container required">
							<label for="content"><FileText size={16} /> Conteúdo</label>
							<textarea
								id="content"
								placeholder="Conteúdo da nota"
								bind:value={currentNote.content}
								rows="6"
								required
								class="input"
							></textarea>
						</div>
					</div>
					<div class="modal-actions">
						<button type="submit" class="btn-primary">
							{isEditing ? 'Atualizar' : 'Adicionar'}
						</button>
						<button type="button" class="btn-secondary" on:click={closeModal}> Cancelar </button>
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

	.search-container input {
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

	.notes-list {
		background-color: #fff;
		border-radius: 8px;
		box-shadow: var(--shadow);
		padding: 20px;
		border: 1px solid var(--border-color);
	}

	.notes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	h2 {
		font-size: 20px;
		margin-top: 0;
		margin-bottom: 20px;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.note-item {
		background-color: var(--background);
		border-radius: 4px;
		padding: 15px;
		border-left: 4px solid #585858;
		box-shadow: var(--shadow);
		display: flex;
		flex-direction: column;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.note-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 10px;
		position: relative;
	}

	.note-header h3 {
		margin: 0;
		font-size: 18px;
		color: var(--text);
		line-height: 1.2;
	}

	.note-actions {
		display: flex;
		gap: 8px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.note-item:hover .note-actions {
		opacity: 1;
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 3px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
	}

	.btn-icon:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.btn-icon.danger:hover {
		color: var(--danger);
	}

	.note-content {
		flex-grow: 1;
		color: var(--text);
		white-space: pre-line;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
	}

	.note-footer {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin-top: 10px;
		font-size: 12px;
	}

	.data-info {
		color: var(--medium-gray);
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.no-notes {
		color: var(--medium-gray);
		font-style: italic;
		text-align: center;
		padding: 20px;
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

		.search-container input {
			width: 100%;
		}

		.estatisticas-container {
			grid-template-columns: 1fr;
		}

		.notes-grid {
			grid-template-columns: 1fr;
		}

		.modal-content {
			padding: 15px;
			width: 95%;
		}
	}
</style>
