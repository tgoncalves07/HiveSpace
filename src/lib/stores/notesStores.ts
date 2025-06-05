// src/lib/stores/notesStores.ts
import { writable, type Writable } from 'svelte/store';

// 1. Definição da Interface da Nota
export interface Note {
	id: string;
	title: string;
	description?: string; // Descrição é opcional
	content: string;
	createdAt: string; // Armazenar como string ISO para facilitar a serialização
	updatedAt: string; // Armazenar como string ISO
	// Poderia adicionar outros campos como 'tags', 'priority', 'status', etc. no futuro
}

// 2. Chave para o LocalStorage
const NOTES_STORAGE_KEY = 'svelte-notes-app-data';

// 3. Função para gerar IDs únicos (simples)
// Para produção, considere usar uma biblioteca como 'uuid'
function generateId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback simples se crypto.randomUUID não estiver disponível (ex: ambientes não seguros ou Node.js mais antigo sem --experimental-global-crypto)
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 4. Função para carregar notas do LocalStorage
function loadNotesFromLocalStorage(): Note[] {
	if (typeof window !== 'undefined' && window.localStorage) {
		const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
		if (storedNotes) {
			try {
				const parsedNotes = JSON.parse(storedNotes) as Note[];
				// Validação básica para garantir que os dados são um array de notas
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
				// Se houver erro, retorna um array vazio para não quebrar a aplicação
			}
		}
	}
	return []; // Retorna array vazio se não houver nada ou se estiver no SSR/ambiente sem localStorage
}

// 5. Criação da Store Writable
const initialNotes = loadNotesFromLocalStorage();
const { subscribe, set, update }: Writable<Note[]> = writable<Note[]>(initialNotes);

// 6. Função para salvar notas no LocalStorage
function saveNotesToLocalStorage(notes: Note[]) {
	if (typeof window !== 'undefined' && window.localStorage) {
		localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
	}
}

// 7. Funções de CRUD para a Store
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
			return notes; // Retorna o array original se a nota não for encontrada
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

// 8. Exportação da Store e funções
export const notesStore = {
	subscribe,
	addNote,
	updateNote,
	deleteNote
	// Você pode adicionar uma função 'setNotes' se precisar substituir todas as notas (ex: importação)
	// setNotes: (newNotes: Note[]) => {
	//   set(newNotes);
	//   saveNotesToLocalStorage(newNotes);
	// }
};

// Garantir que a interface Note seja exportada para uso no componente
// export type { Note }; // Já está exportada no topo
