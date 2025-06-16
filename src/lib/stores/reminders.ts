// stores/reminders.js
import { writable } from 'svelte/store';

const REMINDERS_STORAGE_KEY = 'reminders';

// Função para carregar os lembretes do localStorage
function loadRemindersFromLocalStorage() {
	if (typeof window !== 'undefined' && window.localStorage) {
		const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
		if (saved) {
			try {
				// Validação simples para garantir que é um objeto
				const parsed = JSON.parse(saved);
				if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
					return parsed;
				}
			} catch (e) {
				console.error('Erro ao parsear lembretes do localStorage:', e);
			}
		}
	}
	return {}; // Retorna objeto vazio como fallback
}

// Função para salvar no localStorage
function saveRemindersToLocalStorage(remindersData) {
	if (typeof window !== 'undefined' && window.localStorage) {
		localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(remindersData));
	}
}

// Cria a store interna
const { subscribe, set, update } = writable(loadRemindersFromLocalStorage());

// Funções para manipular os lembretes
function addOrUpdateReminder(date, reminderText) {
	update((allReminders) => {
		const updatedReminders = { ...allReminders, [date]: reminderText };
		saveRemindersToLocalStorage(updatedReminders);
		return updatedReminders;
	});
}

function deleteReminder(date) {
	update((allReminders) => {
		const { [date]: _, ...remainingReminders } = allReminders;
		saveRemindersToLocalStorage(remainingReminders);
		return remainingReminders;
	});
}

// Exporta o objeto da store com os métodos
export const reminders = {
	subscribe,
	set: (value) => {
		// Mantém a compatibilidade com o set original, se necessário
		saveRemindersToLocalStorage(value);
		set(value);
	},
	addOrUpdateReminder,
	deleteReminder
};
