// stores/projetos.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

type Status = 'Ideia' | 'Pendente' | 'Em Processo' | 'Finalizado';

export interface Projeto {
	id: number;
	nome: string;
	descricao?: string; // Descrição pode ser opcional
	status: Status;
	dataPrazo?: string;
	dataInicio?: string;
}

// Dados iniciais para exemplo, caso o localStorage esteja vazio
const initialProjetos: Projeto[] = [
	{
		id: 1,
		nome: 'Desenvolver App de Tarefas',
		descricao: 'Criar um aplicativo completo com SvelteKit.',
		status: 'Em Processo',
		dataInicio: '2023-10-01',
		dataPrazo: '2023-12-31'
	},
	{
		id: 2,
		nome: 'Planejar Férias de Verão',
		descricao: 'Pesquisar destinos e hotéis.',
		status: 'Pendente',
		dataInicio: '2023-11-15'
	},
	{
		id: 3,
		nome: 'Estudar Svelte Stores',
		status: 'Finalizado',
		dataInicio: '2023-09-20',
		dataPrazo: '2023-09-30'
	},
	{
		id: 4,
		nome: 'Ideia para um Blog',
		descricao: 'Blog técnico sobre desenvolvimento web.',
		status: 'Ideia'
	}
];

function createProjetosStore() {
	const { subscribe, set, update } = writable<Projeto[]>([]);

	// Carregar dados apenas no cliente
	if (browser) {
		const saved = localStorage.getItem('projetos');
		if (saved) {
			set(JSON.parse(saved));
		} else {
			set(initialProjetos); // Define dados iniciais se não houver nada salvo
		}
	}

	// Função para salvar no localStorage
	const saveToLocalStorage = (projetos: Projeto[]) => {
		if (browser) {
			localStorage.setItem('projetos', JSON.stringify(projetos));
		}
	};

	return {
		subscribe,
		// Método para adicionar um novo projeto
		addProjeto: (projetoData: Omit<Projeto, 'id'>) => {
			update((projetos) => {
				const novoProjeto = { ...projetoData, id: Date.now() };
				const updatedProjetos = [...projetos, novoProjeto];
				saveToLocalStorage(updatedProjetos);
				return updatedProjetos;
			});
		},
		// Método para atualizar um projeto existente
		updateProjeto: (id: number, projetoData: Partial<Omit<Projeto, 'id'>>) => {
			update((projetos) => {
				const updatedProjetos = projetos.map((p) => {
					if (p.id === id) {
						return { ...p, ...projetoData };
					}
					return p;
				});
				saveToLocalStorage(updatedProjetos);
				return updatedProjetos;
			});
		},
		// Método para remover um projeto
		removeProjeto: (id: number) => {
			update((projetos) => {
				const updatedProjetos = projetos.filter((p) => p.id !== id);
				saveToLocalStorage(updatedProjetos);
				return updatedProjetos;
			});
		},
		// Expor o 'set' original se necessário, mas encapsulando o save
		set: (value: Projeto[]) => {
			saveToLocalStorage(value);
			set(value);
		}
	};
}

export const projetos = createProjetosStore();

// A store derivada para estatísticas continua igual e funcional
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
