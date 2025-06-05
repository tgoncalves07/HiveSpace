<!-- routes/notas/+page.svelte -->
<script lang="ts">
	import { notesStore, type Note } from '../../lib/stores/notesStores';
	import { fade, slide } from 'svelte/transition';
	import { derived } from 'svelte/store'; // Adicionado derived
	import {
		Edit,
		Trash2,
		Plus,
		FileText,
		Clock,
		CheckCircle,
		BarChart,
		Filter,
		AlertTriangle
	} from 'lucide-svelte';

	// Importar APENAS a store de configurações de pageStore.ts
	// A função 't' será definida localmente.
	import { configuracoes } from '../../lib/stores/pageStore'; // Ajuste o caminho se necessário

	// --- DICIONÁRIO DE TRADUÇÕES PARA A PÁGINA DE NOTAS ---
	const notesTranslations = {
		pt: {
			'notas.tituloPagina': 'Minhas Notas',
			'notas.pesquisarPlaceholder': 'Pesquisar notas...',
			'notas.adicionar': 'Adicionar Nota',
			'notas.stats.total': 'Total de Notas',
			'notas.stats.recentes': 'Recentes (7 dias)',
			'notas.stats.atualizadas': 'Atualizadas Recentemente',
			'notas.listaTitulo': 'Notas',
			'notas.vazio.semBusca':
				'Você ainda não adicionou nenhuma nota. Clique em "Adicionar Nota" para começar!',
			'notas.vazio.comBusca': 'Nenhuma nota encontrada para "{searchTerm}".',
			'notas.acao.editar': 'Editar Nota',
			'notas.acao.excluir': 'Excluir Nota',
			'notas.detalhes.criado': 'Criado',
			'notas.detalhes.atualizado': 'Atualizado',
			'notas.dataNaoDisponivel': 'Data N/D',
			'notas.modal.adicionar.titulo': 'Adicionar Nova Nota',
			'notas.modal.editar.titulo': 'Editar Nota',
			'notas.modal.form.tituloLabel': 'Título',
			'notas.modal.form.tituloPlaceholder': 'Título da sua nota',
			'notas.modal.form.descricaoLabel': 'Descrição (Opcional)',
			'notas.modal.form.descricaoPlaceholder': 'Uma breve descrição da nota',
			'notas.modal.form.conteudoLabel': 'Conteúdo Principal',
			'notas.modal.form.conteudoPlaceholder': 'Escreva sua nota aqui...',
			'notas.modal.form.salvar': 'Salvar Alterações',
			'notas.modal.form.criar': 'Criar Nota',
			'notas.modal.form.cancelar': 'Cancelar',
			'notas.modal.excluir.titulo': 'Confirmar Exclusão',
			'notas.modal.excluir.mensagem': 'Tem certeza que deseja excluir a nota "{noteTitle}"?',
			'notas.modal.excluir.aviso': 'Esta ação não poderá ser desfeita.',
			'notas.modal.excluir.confirmar': 'Excluir Nota',
			'notas.modal.fechar': 'Fechar modal',
			'notas.erro.camposObrigatorios': 'Título e conteúdo são obrigatórios.'
		},
		en: {
			'notas.tituloPagina': 'My Notes',
			'notas.pesquisarPlaceholder': 'Search notes...',
			'notas.adicionar': 'Add Note',
			'notas.stats.total': 'Total Notes',
			'notas.stats.recentes': 'Recent (7 days)',
			'notas.stats.atualizadas': 'Recently Updated',
			'notas.listaTitulo': 'Notes',
			'notas.vazio.semBusca': 'You haven\'t added any notes yet. Click "Add Note" to get started!',
			'notas.vazio.comBusca': 'No notes found for "{searchTerm}".',
			'notas.acao.editar': 'Edit Note',
			'notas.acao.excluir': 'Delete Note',
			'notas.detalhes.criado': 'Created',
			'notas.detalhes.atualizado': 'Updated',
			'notas.dataNaoDisponivel': 'Date N/A',
			'notas.modal.adicionar.titulo': 'Add New Note',
			'notas.modal.editar.titulo': 'Edit Note',
			'notas.modal.form.tituloLabel': 'Title',
			'notas.modal.form.tituloPlaceholder': 'Title of your note',
			'notas.modal.form.descricaoLabel': 'Description (Optional)',
			'notas.modal.form.descricaoPlaceholder': 'A brief description of the note',
			'notas.modal.form.conteudoLabel': 'Main Content',
			'notas.modal.form.conteudoPlaceholder': 'Write your note here...',
			'notas.modal.form.salvar': 'Save Changes',
			'notas.modal.form.criar': 'Create Note',
			'notas.modal.form.cancelar': 'Cancel',
			'notas.modal.excluir.titulo': 'Confirm Deletion',
			'notas.modal.excluir.mensagem': 'Are you sure you want to delete the note "{noteTitle}"?',
			'notas.modal.excluir.aviso': 'This action cannot be undone.',
			'notas.modal.excluir.confirmar': 'Delete Note',
			'notas.modal.fechar': 'Close modal',
			'notas.erro.camposObrigatorios': 'Title and content are required.'
		}
		// Adicionar 'es' e 'fr' se necessário
	};

	// Store derivada 't' LOCAL para este componente
	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number>): string => {
			const selectedLang = $cfg.idioma;
			// Tenta pegar o dicionário do idioma selecionado; se não existir, usa 'pt' como fallback.
			let langDict =
				notesTranslations[selectedLang as keyof typeof notesTranslations] || notesTranslations.pt;

			// Pega o texto da chave; se não existir no dicionário atual (nem no fallback 'pt'), retorna a própria chave.
			let text = langDict?.[key] || notesTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});
	// --- FIM DA LÓGICA DE TRADUÇÃO LOCAL ---

	let currentNote: Partial<Note> = { title: '', description: '', content: '' };
	let showModal = false;
	let isEditing = false;
	let searchTerm = '';
	let notaParaExcluir: Note | null = null;
	let expandedNoteId: string | null = null;
	let validationError = '';

	$: filteredNotes = $notesStore.filter(
		(note) =>
			note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
			note.content.toLowerCase().includes(searchTerm.toLowerCase())
	);

	function handleSubmit() {
		if (!currentNote.title?.trim() || !currentNote.content?.trim()) {
			validationError = $t('notas.erro.camposObrigatorios');
			setTimeout(() => (validationError = ''), 3000);
			return;
		}
		validationError = '';

		const noteDataToSave = {
			title: currentNote.title.trim(),
			description: currentNote.description?.trim() || '',
			content: currentNote.content.trim()
		};

		if (isEditing && currentNote.id) {
			notesStore.updateNote(
				currentNote.id,
				noteDataToSave.title,
				noteDataToSave.description,
				noteDataToSave.content
			);
		} else {
			notesStore.addNote(noteDataToSave.title, noteDataToSave.description, noteDataToSave.content);
		}
		closeModal();
	}

	function openEditModal(note: Note) {
		currentNote = { ...note };
		isEditing = true;
		showModal = true;
		validationError = '';
	}

	function openAddModal() {
		resetForm();
		isEditing = false;
		showModal = true;
		validationError = '';
	}

	function solicitarExcluir(note: Note) {
		notaParaExcluir = note;
	}

	function confirmarExclusao() {
		if (notaParaExcluir?.id) {
			notesStore.deleteNote(notaParaExcluir.id);
			if (currentNote.id === notaParaExcluir.id) closeModal();
			if (expandedNoteId === notaParaExcluir.id) expandedNoteId = null;
			notaParaExcluir = null;
		}
	}

	function resetForm() {
		currentNote = { title: '', description: '', content: '' };
		validationError = '';
	}

	function closeModal() {
		showModal = false;
		resetForm();
	}

	function fecharModalExclusao() {
		notaParaExcluir = null;
	}

	function formatDate(dateString?: string | Date): string {
		if (!dateString) return $t('notas.dataNaoDisponivel');
		const date = new Date(dateString);

		let langTag = $configuracoes.idioma || 'pt';
		if (langTag === 'pt') langTag = 'pt-PT';
		else if (langTag === 'en') langTag = 'en-US';
		else if (langTag === 'es') langTag = 'es-ES';
		else if (langTag === 'fr') langTag = 'fr-FR';

		try {
			const dateOptions: Intl.DateTimeFormatOptions = {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			};
			const timeOptions: Intl.DateTimeFormatOptions = {
				hour: '2-digit',
				minute: '2-digit',
				hour12: $configuracoes.formatoHora === '12h'
			};

			const datePart = date.toLocaleDateString(langTag, dateOptions);
			const timePart = date.toLocaleTimeString(langTag, timeOptions);
			return `${datePart} ${timePart}`;
		} catch (e) {
			console.warn('Erro ao formatar data com locale:', langTag, e);
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${day}/${month}/${year} ${hours}:${minutes}`;
		}
	}

	function toggleNoteExpansion(noteId: string) {
		if (expandedNoteId === noteId) {
			expandedNoteId = null;
		} else {
			expandedNoteId = noteId;
		}
	}
</script>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">{$t('notas.tituloPagina')}</h1>
		<div class="header-actions">
			<div class="filter-control">
				<Filter size={18} />
				<input
					type="text"
					placeholder={$t('notas.pesquisarPlaceholder')}
					bind:value={searchTerm}
					class="input-field minimal flex-grow"
				/>
			</div>
			<button class="button primary-button" on:click={openAddModal}>
				<Plus size={18} />
				{$t('notas.adicionar')}
			</button>
		</div>
	</header>

	<div class="stats-overview-container">
		<div class="stat-card">
			<BarChart size={20} class="stat-icon total-icon" />
			<div class="stat-content">
				<span class="stat-value">{filteredNotes.length}</span>
				<span class="stat-label">{$t('notas.stats.total')}</span>
			</div>
		</div>
		<div class="stat-card">
			<Clock size={20} class="stat-icon overdue-icon" />
			<div class="stat-content">
				<span class="stat-value">
					{filteredNotes.filter((note) => {
						if (!note.createdAt) return false;
						const sevenDaysAgo = new Date();
						sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
						return new Date(note.createdAt) >= sevenDaysAgo;
					}).length}
				</span>
				<span class="stat-label">{$t('notas.stats.recentes')}</span>
			</div>
		</div>
		<div class="stat-card">
			<CheckCircle size={20} class="stat-icon high-priority-icon" />
			<div class="stat-content">
				<span class="stat-value">
					{filteredNotes.filter((note) => note.updatedAt && note.updatedAt !== note.createdAt)
						.length}
				</span>
				<span class="stat-label">{$t('notas.stats.atualizadas')}</span>
			</div>
		</div>
	</div>

	<div class="notes-main-content">
		<h2 class="content-section-title">
			{$t('notas.listaTitulo')} ({filteredNotes.length})
		</h2>
		{#if filteredNotes.length === 0}
			<div class="empty-column-message">
				{#if searchTerm}
					{@html $t('notas.vazio.comBusca', { searchTerm: `<strong>${searchTerm}</strong>` })}
				{:else}
					{$t('notas.vazio.semBusca')}
				{/if}
			</div>
		{:else}
			<div class="notes-grid">
				{#each filteredNotes as note (note.id)}
					<div
						class="note-card"
						class:expanded={expandedNoteId === note.id}
						on:click={() => toggleNoteExpansion(note.id)}
						on:keydown={(e) => e.key === 'Enter' && toggleNoteExpansion(note.id)}
						tabindex="0"
						role="button"
						aria-expanded={expandedNoteId === note.id}
						aria-label={note.title}
					>
						<div class="note-card-header">
							<h3 class="note-title">{note.title}</h3>
							<div class="note-actions" on:click|stopPropagation>
								<button
									class="icon-button"
									on:click={() => openEditModal(note)}
									aria-label={$t('notas.acao.editar')}
								>
									<Edit size={17} />
								</button>
								<button
									class="icon-button danger"
									on:click={() => solicitarExcluir(note)}
									aria-label={$t('notas.acao.excluir')}
								>
									<Trash2 size={17} />
								</button>
							</div>
						</div>
						{#if note.description}
							<p class="note-description-preview">{note.description}</p>
						{/if}

						{#if expandedNoteId === note.id}
							<div class="note-content-expanded" transition:slide|local={{ duration: 250 }}>
								<p>{@html note.content.replace(/\n/g, '<br>')}</p>
							</div>
						{/if}

						<div class="note-card-footer">
							{#if note.createdAt}
								<div class="detail-item">
									<Clock size={13} />
									<span>{$t('notas.detalhes.criado')}: {formatDate(note.createdAt)}</span>
								</div>
							{/if}
							{#if note.updatedAt && note.updatedAt !== note.createdAt}
								<div class="detail-item">
									<CheckCircle size={13} />
									<span>{$t('notas.detalhes.atualizado')}: {formatDate(note.updatedAt)}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if showModal}
		<div class="modal-backdrop" on:click|self={closeModal} transition:fade={{ duration: 150 }}>
			<div class="modal-dialog" transition:slide={{ duration: 250, y: 50 }}>
				<div class="modal-dialog-header">
					<h2 class="modal-title">
						{isEditing ? $t('notas.modal.editar.titulo') : $t('notas.modal.adicionar.titulo')}
					</h2>
					<button
						class="close-modal-button"
						on:click={closeModal}
						aria-label={$t('notas.modal.fechar')}>×</button
					>
				</div>
				<form class="modal-form" on:submit|preventDefault={handleSubmit}>
					<div class="form-fields-grid">
						<div class="form-input-group required-field" style="grid-column: 1 / -1;">
							<label for="note-title"
								><FileText size={16} /> {$t('notas.modal.form.tituloLabel')}</label
							>
							<input
								type="text"
								id="note-title"
								placeholder={$t('notas.modal.form.tituloPlaceholder')}
								bind:value={currentNote.title}
								required
								class="input-field"
							/>
						</div>
						<div class="form-input-group" style="grid-column: 1 / -1;">
							<label for="note-description"
								><FileText size={16} /> {$t('notas.modal.form.descricaoLabel')}</label
							>
							<input
								type="text"
								id="note-description"
								placeholder={$t('notas.modal.form.descricaoPlaceholder')}
								bind:value={currentNote.description}
								class="input-field"
							/>
						</div>
						<div class="form-input-group required-field" style="grid-column: 1 / -1;">
							<label for="note-content"
								><FileText size={16} /> {$t('notas.modal.form.conteudoLabel')}</label
							>
							<textarea
								id="note-content"
								placeholder={$t('notas.modal.form.conteudoPlaceholder')}
								bind:value={currentNote.content}
								rows="7"
								required
								class="input-field"
							></textarea>
						</div>
					</div>
					{#if validationError}
						<p class="validation-error-message" role="alert">{validationError}</p>
					{/if}
					<div class="modal-dialog-actions">
						<button type="submit" class="button primary-button">
							{isEditing ? $t('notas.modal.form.salvar') : $t('notas.modal.form.criar')}
						</button>
						<button type="button" class="button secondary-button" on:click={closeModal}
							>{$t('notas.modal.form.cancelar')}</button
						>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if notaParaExcluir}
		<div
			class="modal-backdrop"
			on:click|self={fecharModalExclusao}
			transition:fade={{ duration: 150 }}
		>
			<div class="modal-dialog confirmation-modal" transition:slide={{ duration: 250, y: 50 }}>
				<div class="modal-dialog-header">
					<AlertTriangle size={24} class="confirmation-icon" />
					<h2 class="modal-title">{$t('notas.modal.excluir.titulo')}</h2>
				</div>
				<p class="confirmation-message">
					{@html $t('notas.modal.excluir.mensagem', {
						noteTitle: `<strong>${notaParaExcluir.title}</strong>`
					})}
				</p>
				<p class="irreversible-warning">{$t('notas.modal.excluir.aviso')}</p>
				<div class="modal-dialog-actions">
					<button class="button secondary-button" on:click={fecharModalExclusao}
						>{$t('notas.modal.form.cancelar')}</button
					>
					<button class="button danger-button" on:click={confirmarExclusao}>
						<Trash2 size={16} />
						{$t('notas.modal.excluir.confirmar')}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Estilos como na sua última versão */
	.validation-error-message {
		color: var(--danger-text-color, #a94442);
		background-color: var(--danger-background-color, #f2dede);
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--danger-color, #ebccd1);
		border-radius: var(--radius);
		font-size: 0.9rem;
		margin-top: -0.5rem;
		margin-bottom: 1rem;
		text-align: center;
	}
	.page-container {
		max-width: 1200px;
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
		flex-grow: 1;
	}
	.filter-control :global(svg) {
		color: var(--text-color-muted, var(--app-text-color));
		flex-shrink: 0;
	}
	.input-field.minimal.flex-grow {
		background-color: transparent;
		border: none;
		padding: 0.25rem;
		font-size: 0.9rem;
		color: var(--app-text-color);
		outline: none;
		flex-grow: 1;
	}
	.input-field.minimal::placeholder {
		color: var(--text-color-muted, #999);
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
	.stat-icon.overdue-icon {
		background-color: color-mix(in srgb, var(--warning-color) 15%, transparent);
		color: var(--warning-color);
	}
	.stat-icon.high-priority-icon {
		background-color: color-mix(in srgb, var(--success-color) 15%, transparent);
		color: var(--success-color);
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
	.notes-main-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.content-section-title {
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--app-text-color);
		margin: 0;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.notes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
		gap: 1.25rem;
	}
	.note-card {
		background-color: var(--card-background-color);
		border-radius: var(--radius);
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-left: 4px solid var(--secondary-color, var(--border-color));
		box-shadow: var(--shadow);
		display: flex;
		flex-direction: column;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			border-left-color 0.2s ease;
		cursor: pointer;
		position: relative;
	}
	.note-card:hover,
	.note-card:focus-visible {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px -3px color-mix(in srgb, var(--shadow) 40%, transparent);
		border-left-color: var(--primary-color);
		outline: none;
	}
	.note-card.expanded {
		border-left-color: var(--primary-color);
	}
	.note-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}
	.note-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--app-text-color);
		line-height: 1.3;
		word-break: break-word;
	}
	.note-actions {
		display: flex;
		gap: 0.3rem;
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	.note-card:hover .note-actions,
	.note-card:focus-within .note-actions {
		opacity: 1;
	}
	.icon-button {
		background: none;
		border: none;
		padding: 0.3rem;
		cursor: pointer;
		color: var(--text-color-muted, var(--app-text-color));
		display: inline-flex;
		border-radius: var(--radius);
	}
	.icon-button:hover {
		color: var(--primary-color);
		background-color: var(--border-color);
	}
	.icon-button.danger:hover {
		color: var(--danger-color);
		background-color: color-mix(in srgb, var(--danger-color) 15%, transparent);
	}
	.note-description-preview {
		color: var(--text-color-muted, var(--app-text-color));
		font-size: 0.9rem;
		line-height: 1.4;
		margin-bottom: 0.75rem;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		word-break: break-word;
	}
	.note-content-expanded {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px dashed var(--border-color);
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--app-text-color);
		word-break: break-word;
	}
	.note-card-footer {
		margin-top: auto;
		padding-top: 0.75rem;
		font-size: 0.8rem;
		color: var(--text-color-muted, var(--app-text-color));
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.detail-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.detail-item :global(svg) {
		flex-shrink: 0;
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
		max-width: 650px;
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
		min-height: 140px;
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
		}
		.stats-overview-container {
			grid-template-columns: 1fr;
		}
		.notes-grid {
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
