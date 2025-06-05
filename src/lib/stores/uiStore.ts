// src/lib/stores/uiStore.ts
import { writable } from 'svelte/store';

// 'true' se a sidebar deve começar aberta, 'false' se deve começar fechada.
// Ajuste este valor inicial para corresponder ao comportamento padrão desejado.
export const isSidebarOpen = writable(true);

// Você pode adicionar outros estados globais da UI aqui no futuro, se necessário.
// Por exemplo:
// export const currentModal = writable<string | null>(null);
