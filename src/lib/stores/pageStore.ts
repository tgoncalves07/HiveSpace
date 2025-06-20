// src/lib/stores/pageStore.ts

import { writable } from 'svelte/store';

// Define os tipos de idioma que a sua aplicação suporta
export type Idioma = 'pt' | 'en';

// Define a estrutura do objeto de configurações
export interface Configuracoes {
	idioma: Idioma;
}

// Cria a store 'configuracoes' com um valor inicial
const { subscribe, set, update } = writable<Configuracoes>({
	idioma: 'pt' // Define 'pt' como idioma padrão
});

// Exporta a store para que outros componentes a possam usar
export const configuracoes = {
	subscribe,
	set,
	update,
	// Pode adicionar métodos específicos aqui se desejar, por exemplo:
	changeLanguage: (lang: Idioma) => {
		update((cfg) => {
			cfg.idioma = lang;
			return cfg;
		});
	}
};
