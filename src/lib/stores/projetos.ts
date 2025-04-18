import { writable, derived } from 'svelte/store';

type Status = 'Ideia' | 'Pendente' | 'Em Processo' | 'Finalizado';

export interface Projeto {
    id: number;
    nome: string;
    descricao: string;
    status: Status;
}

// Função para carregar do localStorage
const loadProjetos = (): Projeto[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('projetos');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
};

// Função para salvar no localStorage
const saveProjetos = (projetos: Projeto[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('projetos', JSON.stringify(projetos));
    }
};

// Cria a store com persistência
function createPersistentProjetos() {
    const { subscribe, set, update } = writable<Projeto[]>(loadProjetos());

    return {
        subscribe,
        set: (value: Projeto[]) => {
            saveProjetos(value);
            set(value);
        },
        update: (updater: (value: Projeto[]) => Projeto[]) => {
            update(current => {
                const updated = updater(current);
                saveProjetos(updated);
                return updated;
            });
        }
    };
}

export const projetos = createPersistentProjetos();

// Store derivada (mantida igual)
export const estatisticasProjetos = derived(projetos, $projetos => {
    const total = $projetos.length;
    const porStatus = {
        ideia: $projetos.filter(p => p.status === 'Ideia').length,
        pendente: $projetos.filter(p => p.status === 'Pendente').length,
        emProcesso: $projetos.filter(p => p.status === 'Em Processo').length,
        finalizado: $projetos.filter(p => p.status === 'Finalizado').length
    };
    
    return {
        total,
        porStatus,
        percentuais: {
            ideia: total > 0 ? Math.round((porStatus.ideia / total) * 100) : 0,
            pendente: total > 0 ? Math.round((porStatus.pendente / total) * 100) : 0,
            emProcesso: total > 0 ? Math.round((porStatus.emProcesso / total) * 100) : 0,
            finalizado: total > 0 ? Math.round((porStatus.finalizado / total) * 100) : 0
        }
    };
});