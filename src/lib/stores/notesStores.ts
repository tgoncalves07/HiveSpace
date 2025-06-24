import { writable, type Writable } from 'svelte/store';

// Definição da Interface da Nota
export interface Note {
	id: string;
	title: string;
	description?: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

// Chave para o LocalStorage
const NOTES_STORAGE_KEY = 'svelte-notes-app-data';

// Função para gerar IDs únicos (simples)
function generateId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Função para carregar notas do LocalStorage
function loadNotesFromLocalStorage(): Note[] {
	if (typeof window !== 'undefined' && window.localStorage) {
		const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
		if (storedNotes) {
			try {
				const parsedNotes = JSON.parse(storedNotes) as Note[];
				if (
					Array.isArray(parsedNotes) &&
					parsedNotes.every(
						(note) => note.id && note.title && note.content && note.createdAt && note.updatedAt
					)
				) {
					return parsedNotes;
				}
			} catch (error) {
				console.error('Erro ao parsear notas do localStorage:', error);
			}
		}
	}
	return [];
}

// Criação da Store Writable
const initialNotes = loadNotesFromLocalStorage();
const { subscribe, set, update }: Writable<Note[]> = writable<Note[]>(initialNotes);

// Função para salvar notas no LocalStorage
function saveNotesToLocalStorage(notes: Note[]) {
	if (typeof window !== 'undefined' && window.localStorage) {
		localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
	}
}

// Funções de CRUD para a Store
function addNote(title: string, description: string = '', content: string): void {
	const newNote: Note = {
		id: generateId(),
		title: title.trim(),
		description: description.trim(),
		content: content.trim(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
	update((notes) => {
		const updatedNotes = [...notes, newNote];
		saveNotesToLocalStorage(updatedNotes);
		return updatedNotes;
	});
}

function updateNote(id: string, title: string, description: string = '', content: string): void {
	update((notes) => {
		const noteIndex = notes.findIndex((note) => note.id === id);
		if (noteIndex === -1) {
			console.warn(`Nota com ID ${id} não encontrada para atualização.`);
			return notes;
		}
		const updatedNotes = [...notes];
		updatedNotes[noteIndex] = {
			...updatedNotes[noteIndex],
			title: title.trim(),
			description: description.trim(),
			content: content.trim(),
			updatedAt: new Date().toISOString()
		};
		saveNotesToLocalStorage(updatedNotes);
		return updatedNotes;
	});
}

function deleteNote(id: string): void {
	update((notes) => {
		const updatedNotes = notes.filter((note) => note.id !== id);
		saveNotesToLocalStorage(updatedNotes);
		return updatedNotes;
	});
}

// Função para resetar as notas
// Esta função limpa o estado da store e o localStorage
function resetNotes(): void {
	const emptyNotes: Note[] = [];
	set(emptyNotes);
	saveNotesToLocalStorage(emptyNotes);
}

// Exportação da Store e funções
export const notesStore = {
	subscribe,
	addNote,
	updateNote,
	deleteNote,
	reset: resetNotes
};
