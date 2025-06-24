import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// EXPORTANDO os tipos para que possam ser importados em outros lugares
export type Prioridade = 'baixa' | 'media' | 'alta';
export type StatusTarefa = 'Pendente' | 'Em Progresso' | 'Concluída' | 'Cancelada';

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

	// Função auxiliar para simplificar a persistência no localStorage
	function persist(tarefas: Tarefa[]) {
		if (browser) {
			localStorage.setItem('tarefas', JSON.stringify(tarefas));
		}
		return tarefas;
	}

	const load = () => {
		// Carrega as tarefas do localStorage se estiver no ambiente do navegador
		if (browser) {
			const saved = localStorage.getItem('tarefas');
			if (saved) {
				set(JSON.parse(saved));
			}
		}
	};

	if (browser) load();

	return {
		subscribe,
		set: (value: Tarefa[]) => set(persist(value)),
		update: (updater: (value: Tarefa[]) => Tarefa[]) => {
			update((current) => persist(updater(current)));
		},
		adicionarTarefa: (novaTarefa: Omit<Tarefa, 'id' | 'dataCriacao'>) => {
			const tarefaCompleta: Tarefa = {
				...novaTarefa,
				id: Date.now() + Math.random(), // Garante um ID mais único
				dataCriacao: new Date().toISOString()
			};
			update((tarefas) => persist([...tarefas, tarefaCompleta]));
		},
		atualizarTarefa: (id: number, novosDados: Partial<Omit<Tarefa, 'id'>>) => {
			update((tarefas) => persist(tarefas.map((t) => (t.id === id ? { ...t, ...novosDados } : t))));
		},
		removerTarefa: (id: number) => {
			update((tarefas) => persist(tarefas.filter((t) => t.id !== id)));
		},
		// Esta função é chamada quando uma tarefa é solta em uma nova coluna.
		atualizarStatusTarefa: (id: number, novoStatus: StatusTarefa) => {
			update((tarefas) => {
				const tarefasAtualizadas = tarefas.map((t) =>
					t.id === id ? { ...t, status: novoStatus } : t
				);
				return persist(tarefasAtualizadas);
			});
		},
		load
	};
}

export const tarefas = createPersistentTarefas();

// As stores derivadas abaixo não precisam de alteração.
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
