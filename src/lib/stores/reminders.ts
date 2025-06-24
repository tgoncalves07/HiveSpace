import { writable, type Writable } from 'svelte/store';

// Define a estrutura de um único lembrete
export interface ReminderItem {
	id: string;
	text: string;
	time: string;
	completed: boolean;
}

// Define a estrutura completa dos dados guardados: um objeto
type RemindersData = Record<string, ReminderItem[]>;

// Chave para usar no localStorage
const REMINDERS_STORAGE_KEY = 'reminders';

function loadRemindersFromLocalStorage(): RemindersData {
	// Verifica se o localStorage está disponível e tenta carregar os dados
	if (typeof window !== 'undefined' && window.localStorage) {
		const savedData = localStorage.getItem(REMINDERS_STORAGE_KEY);
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				if (typeof parsedData === 'object' && parsedData !== null) {
					return parsedData;
				}
			} catch (e) {
				console.error('Erro ao ler os lembretes do localStorage:', e);
				localStorage.removeItem(REMINDERS_STORAGE_KEY);
			}
		}
	}
	return {};
}

const store: Writable<RemindersData> = writable(loadRemindersFromLocalStorage());

store.subscribe((currentValue) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(currentValue));
	}
});

export const reminders = store;
