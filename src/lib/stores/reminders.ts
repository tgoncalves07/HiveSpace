// src/lib/stores/reminders.ts

import { writable, type Writable } from 'svelte/store';

// --- DEFINIÇÃO DOS TIPOS ---

// Define a estrutura de um único lembrete
export interface ReminderItem {
	id: string;
	text: string;
	time: string;
	completed: boolean;
}

// Define a estrutura completa dos dados guardados: um objeto
// onde cada chave é uma data ('YYYY-MM-DD') e o valor é um array de lembretes.
type RemindersData = Record<string, ReminderItem[]>;

// Chave para usar no localStorage
const REMINDERS_STORAGE_KEY = 'reminders';

// --- FUNÇÃO PARA CARREGAR DADOS ---

function loadRemindersFromLocalStorage(): RemindersData {
	// Garante que o código só é executado no browser
	if (typeof window !== 'undefined' && window.localStorage) {
		const savedData = localStorage.getItem(REMINDERS_STORAGE_KEY);
		if (savedData) {
			try {
				// Tenta converter o JSON guardado de volta para um objeto
				const parsedData = JSON.parse(savedData);
				// Validação simples para garantir que o que foi carregado é um objeto
				if (typeof parsedData === 'object' && parsedData !== null) {
					return parsedData;
				}
			} catch (e) {
				console.error('Erro ao ler os lembretes do localStorage:', e);
				// Em caso de erro, remove o item inválido para evitar erros futuros
				localStorage.removeItem(REMINDERS_STORAGE_KEY);
			}
		}
	}
	// Retorna um objeto vazio se não houver dados ou se ocorrer um erro
	return {};
}

// --- CRIAÇÃO E EXPORTAÇÃO DA STORE ---

// Cria a store reativa (writable), inicializando-a com os dados do localStorage
const store: Writable<RemindersData> = writable(loadRemindersFromLocalStorage());

// Usa a função 'subscribe' da própria store para observar mudanças.
// Sempre que o valor da store for alterado (via 'set' ou 'update'),
// esta função será chamada, guardando o novo estado no localStorage.
store.subscribe((currentValue) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(currentValue));
	}
});

// Exporta o objeto da store com os métodos padrão (subscribe, set, update).
// O seu componente `Calendar.svelte` usa `reminders.update()`, que agora
// estará disponível e funcional.
export const reminders = store;
