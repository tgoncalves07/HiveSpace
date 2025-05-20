//projetos.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

type Status = 'Ideia' | 'Pendente' | 'Em Processo' | 'Finalizado';

export interface Projeto {
	id: number;
	nome: string;
	descricao: string;
	status: Status;
	dataPrazo?: string;
	dataInicio?: string;
}

const initialProjetos: Projeto[] = [];

function createProjetosStore() {
	const { subscribe, set, update } = writable<Projeto[]>(initialProjetos);

	// Carregar dados apenas no cliente
	if (browser) {
		const saved = localStorage.getItem('projetos');
		if (saved) set(JSON.parse(saved));
	}

	return {
		subscribe,
		set: (value: Projeto[]) => {
			if (browser) localStorage.setItem('projetos', JSON.stringify(value));
			set(value);
		},
		update: (updater: (value: Projeto[]) => Projeto[]) => {
			update((current) => {
				const updated = updater(current);
				if (browser) localStorage.setItem('projetos', JSON.stringify(updated));
				return updated;
			});
		},
		// Método para adicionar projeto
		add: (projeto: Omit<Projeto, 'id'>) => {
			update((projs) => [...projs, { ...projeto, id: Date.now() }]);
		}
	};
}

export const projetos = createProjetosStore();

export const estatisticasProjetos = derived(projetos, ($projetos) => {
	const total = $projetos.length;
	const porStatus = {
		ideia: $projetos.filter((p) => p.status === 'Ideia').length,
		pendente: $projetos.filter((p) => p.status === 'Pendente').length,
		emProcesso: $projetos.filter((p) => p.status === 'Em Processo').length,
		finalizado: $projetos.filter((p) => p.status === 'Finalizado').length
	};

	return {
		total,
		porStatus,
		percentuais: {
			ideia: total > 0 ? Math.round((porStatus.ideia / total) * 100) : 0,
			pendente: total > 0 ? Math.round((porStatus.pendente / total) * 100) : 0,
			emProcesso: total > 0 ? Math.round((porStatus.emProcesso / total) * 100) : 0,
			finalizado: total > 0 ? Math.round((porStatus.finalizado / total) * 100) : 0
		},
		atrasados: $projetos.filter(
			(p) => p.dataPrazo && new Date(p.dataPrazo) < new Date() && p.status !== 'Finalizado'
		).length
	};
});
