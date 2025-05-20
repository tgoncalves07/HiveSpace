import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Função para criar um store persistente
function createNotesStore() {
	// Inicializa o store com valores do localStorage ou um array vazio
	const initialNotes = browser ? JSON.parse(localStorage.getItem('notes') || '[]') : [];
	const { subscribe, set, update } = writable(initialNotes);

	return {
		subscribe,
		// Adicionar nova nota
		addNote: (title, content) => {
			const newNote = {
				id: Date.now().toString(),
				title,
				content,
				createdAt: new Date().toISOString()
			};

			update((notes) => {
				const updatedNotes = [newNote, ...notes];
				if (browser) localStorage.setItem('notes', JSON.stringify(updatedNotes));
				return updatedNotes;
			});
		},
		// Atualizar nota existente
		updateNote: (id, title, content) => {
			update((notes) => {
				const noteIndex = notes.findIndex((note) => note.id === id);
				if (noteIndex !== -1) {
					const updatedNote = {
						...notes[noteIndex],
						title,
						content,
						updatedAt: new Date().toISOString()
					};

					const updatedNotes = [...notes];
					updatedNotes[noteIndex] = updatedNote;

					if (browser) localStorage.setItem('notes', JSON.stringify(updatedNotes));
					return updatedNotes;
				}
				return notes;
			});
		},
		// Excluir nota
		deleteNote: (id) => {
			update((notes) => {
				const filteredNotes = notes.filter((note) => note.id !== id);
				if (browser) localStorage.setItem('notes', JSON.stringify(filteredNotes));
				return filteredNotes;
			});
		},
		// Limpa todas as notas
		clearNotes: () => {
			set([]);
			if (browser) localStorage.removeItem('notes');
		}
	};
}

// Exporta o store
export const notesStore = createNotesStore();
