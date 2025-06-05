// src/lib/stores/pageStore.ts
import { writable, type Writable } from 'svelte/store';

// Tipos para Configurações Gerais
export type Tema = 'claro' | 'escuro' | 'sistema';
export type Idioma = 'pt' | 'en' | 'es' | 'fr';
export type FormatoHora = '24h' | '12h';

// Tipos para Backup Automático
export type FrequenciaBackup = 'diario' | 'semanal' | 'mensal' | 'nunca';

// Tipos para Padrões de Tarefas
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';
export type TipoLembreteTarefa = 'nenhum' | 'nahora' | '5min' | '15min' | '1hora' | '1dia';

export interface ConfiguracoesState {
	// Configurações existentes
	tema: Tema;
	idioma: Idioma;
	formatoHora: FormatoHora;
	notificacoesEmail: boolean;
	notificacoesPush: boolean;
	notificacoesSom: boolean;
	lembretePrazos: boolean;
	backupEmail: string; // Usado para backup manual e automático
	nome: string;
	email: string;
	funcao: string;

	// Novas configurações para Backup Automático
	backupAutomaticoHabilitado: boolean;
	frequenciaBackupAutomatico: FrequenciaBackup;
	ultimoBackupAutomatico: string | null; // Armazena como ISO date string

	// Novas configurações para Padrões de Tarefas
	prioridadePadraoTarefa: PrioridadeTarefa;
	lembretePadraoTarefa: TipoLembreteTarefa;
}

// Chave para o localStorage
const CONFIG_STORAGE_KEY = 'app-configuracoes';

// Valores Padrão (incluindo os novos campos)
const defaultConfig: ConfiguracoesState = {
	tema: 'sistema',
	idioma: 'pt',
	formatoHora: '24h',
	notificacoesEmail: true,
	notificacoesPush: true,
	notificacoesSom: true,
	lembretePrazos: true,
	backupEmail: '',
	nome: '',
	email: '',
	funcao: '',

	// Defaults para backup automático
	backupAutomaticoHabilitado: false,
	frequenciaBackupAutomatico: 'semanal', // Default pode ser 'nunca' ou 'semanal'
	ultimoBackupAutomatico: null,

	// Defaults para padrões de tarefas
	prioridadePadraoTarefa: 'media',
	lembretePadraoTarefa: 'nenhum'
};

// Função para carregar configurações do localStorage
function loadConfigFromLocalStorage(): ConfiguracoesState {
	if (typeof window !== 'undefined' && window.localStorage) {
		const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
		if (storedConfig) {
			try {
				const parsedConfig = JSON.parse(storedConfig) as Partial<ConfiguracoesState>;
				// Merge com os defaults para garantir que todas as chaves existem
				// e para lidar com novas configurações adicionadas ao defaultConfig
				return { ...defaultConfig, ...parsedConfig };
			} catch (e) {
				console.error('Erro ao carregar configurações do localStorage:', e);
				localStorage.removeItem(CONFIG_STORAGE_KEY);
			}
		}
	}
	return { ...defaultConfig }; // Retorna uma cópia dos defaults
}

const initialConfig = loadConfigFromLocalStorage();
const configuracoesStore: Writable<ConfiguracoesState> =
	writable<ConfiguracoesState>(initialConfig);

if (typeof window !== 'undefined') {
	configuracoesStore.subscribe((currentConfig) => {
		localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(currentConfig));

		if (currentConfig.idioma) {
			document.documentElement.lang = currentConfig.idioma.split('-')[0];
		}

		let temaFinal = currentConfig.tema;
		if (temaFinal === 'sistema') {
			temaFinal = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
		}
		document.documentElement.setAttribute('data-tema', temaFinal);
		// console.log('[pageStore.ts] Configurações atualizadas e persistidas:', currentConfig); // Comente ou remova para menos logs
	});

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const systemThemeChangeHandler = () => {
		let currentConfigValue: ConfiguracoesState | undefined;
		const unsubscribe = configuracoesStore.subscribe((value) => (currentConfigValue = value));
		unsubscribe();

		if (currentConfigValue && currentConfigValue.tema === 'sistema') {
			const novoTemaSistema = mediaQuery.matches ? 'escuro' : 'claro';
			document.documentElement.setAttribute('data-tema', novoTemaSistema);
			// console.log('[pageStore.ts] Tema do sistema mudou para:', novoTemaSistema,); // Comente ou remova
		}
	};
	mediaQuery.addEventListener('change', systemThemeChangeHandler);
}

export const configuracoes = {
	subscribe: configuracoesStore.subscribe,
	set: configuracoesStore.set,
	update: configuracoesStore.update,
	reset: () => configuracoesStore.set({ ...defaultConfig })
};

// Exportar defaultConfig pode ser útil para a função de importação,
// para garantir que um arquivo importado seja mesclado com os defaults mais recentes.
// Se não quiser exportar, a lógica de importação pode precisar ser ajustada
// ou depender do estado atual da store (que já é mesclado com defaults).
// Por simplicidade e robustez na importação, exportar pode ser uma boa ideia:
export const getAppDefaults = (): ConfiguracoesState => ({ ...defaultConfig });
