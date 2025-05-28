//stores/tarefas.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Projeto } from './projetos';

type Prioridade = 'baixa' | 'media' | 'alta';
type StatusTarefa = 'Pendente' | 'Em Progresso' | 'Concluída' | 'Cancelada';

export interface Tarefa {
	id: number;
	descricao: string;
	projetoId?: number;
	prioridade: Prioridade;
	status: StatusTarefa;
	dataCriacao: string;
	dataInicio?: string;
	dataPrevisao?: string;
	dataFinal?: string;
}

function createPersistentTarefas() {
	const { subscribe, set, update } = writable<Tarefa[]>([]);

	const load = () => {
		if (browser) {
			const saved = localStorage.getItem('tarefas');
			if (saved) set(JSON.parse(saved));
		}
	};

	if (browser) load();

	return {
		subscribe,
		set: (value: Tarefa[]) => {
			if (browser) localStorage.setItem('tarefas', JSON.stringify(value));
			set(value);
		},
		update: (updater: (value: Tarefa[]) => Tarefa[]) => {
			update((current) => {
				const updated = updater(current);
				if (browser) localStorage.setItem('tarefas', JSON.stringify(updated));
				return updated;
			});
		},
		adicionarTarefa: (novaTarefa: Omit<Tarefa, 'id' | 'dataCriacao'>) => {
			const tarefaCompleta: Tarefa = {
				...novaTarefa,
				id: Date.now(),
				dataCriacao: new Date().toISOString()
			};
			update((tarefas) => {
				const newTarefas = [...tarefas, tarefaCompleta];
				if (browser) localStorage.setItem('tarefas', JSON.stringify(newTarefas));
				return newTarefas;
			});
		},
		atualizarTarefa: (id: number, novosDados: Partial<Tarefa>) => {
			update((tarefas) => {
				const updated = tarefas.map((t) => (t.id === id ? { ...t, ...novosDados } : t));
				if (browser) localStorage.setItem('tarefas', JSON.stringify(updated));
				return updated;
			});
		},
		removerTarefa: (id: number) => {
			update((tarefas) => {
				const filtered = tarefas.filter((t) => t.id !== id);
				if (browser) localStorage.setItem('tarefas', JSON.stringify(filtered));
				return filtered;
			});
		},
		load
	};
}

export const tarefas = createPersistentTarefas();

export const estatisticasTarefas = derived(tarefas, ($tarefas) => ({
	total: $tarefas.length,
	porStatus: {
		pendente: $tarefas.filter((t) => t.status === 'Pendente').length,
		emProgresso: $tarefas.filter((t) => t.status === 'Em Progresso').length,
		concluida: $tarefas.filter((t) => t.status === 'Concluída').length,
		cancelada: $tarefas.filter((t) => t.status === 'Cancelada').length
	},
	porPrioridade: {
		baixa: $tarefas.filter((t) => t.prioridade === 'baixa').length,
		media: $tarefas.filter((t) => t.prioridade === 'media').length,
		alta: $tarefas.filter((t) => t.prioridade === 'alta').length
	},
	atrasadas: $tarefas.filter(
		(t) => t.dataFinal && new Date(t.dataFinal) < new Date() && t.status !== 'Concluída'
	).length
}));

export const tarefasAtrasadas = derived(tarefas, ($t) =>
	$t.filter((t) => t.dataFinal && new Date(t.dataFinal) < new Date())
);
