import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Lembrete {
	id: number;
	titulo: string;
	data: string;
	descricao?: string;
}

function createLembretesStore() {
	const { subscribe, set, update } = writable<Lembrete[]>([]);

	if (browser) {
		const saved = localStorage.getItem('lembretes');
		if (saved) set(JSON.parse(saved));
	}

	return {
		subscribe,
		add: (lembrete: Omit<Lembrete, 'id'>) => {
			update((lemb) => {
				const novo = [...lemb, { ...lembrete, id: Date.now() }];
				localStorage.setItem('lembretes', JSON.stringify(novo));
				return novo;
			});
		},
		remove: (id: number) => {
			update((lemb) => {
				const novo = lemb.filter((l) => l.id !== id);
				localStorage.setItem('lembretes', JSON.stringify(novo));
				return novo;
			});
		}
	};
}

export const lembretes = createLembretesStore();
