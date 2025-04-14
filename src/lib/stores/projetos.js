import { writable } from 'svelte/store';

export const projetos = writable([
	{ id: 1, nome: 'Projeto A', descricao: 'Descrição do Projeto A', status: 'Ideia' },
	{ id: 2, nome: 'Projeto B', descricao: 'Descrição do Projeto B', status: 'Pendente' },
	{ id: 3, nome: 'Projeto C', descricao: 'Descrição do Projeto C', status: 'Em Processo' },
	{ id: 4, nome: 'Projeto D', descricao: 'Descrição do Projeto D', status: 'Finalizado' }
]);
