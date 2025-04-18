// src/lib/stores/projetos.ts
import { writable } from 'svelte/store';

type Status = 'Ideia' | 'Pendente' | 'Em Processo' | 'Finalizado';

interface Projeto {
    id: number;
    nome: string;
    descricao: string;
    status: Status;
}

function loadProjects(): Projeto[] {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('projetos-kanban');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                nome: 'Projeto Exemplo',
                descricao: 'Este é um projeto de exemplo',
                status: 'Ideia'
            }
        ];
    }
    return [];
}

function createPersistentStore() {
    const { subscribe, set, update } = writable<Projeto[]>(loadProjects());

    return {
        subscribe,
        set: (value: Projeto[]) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('projetos-kanban', JSON.stringify(value));
            }
            set(value);
        },
        update: (updater: (current: Projeto[]) => Projeto[]) => {
            update(current => {
                const newValue = updater(current);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('projetos-kanban', JSON.stringify(newValue));
                }
                return newValue;
            });
        }
    };
}

export const projetos = createPersistentStore();