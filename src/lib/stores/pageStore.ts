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
	backupEmail: string;
	nome: string;
	email: string;
	funcao: string;
	backupAutomaticoHabilitado: boolean;
	frequenciaBackupAutomatico: FrequenciaBackup;
	ultimoBackupAutomatico: string | null;
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
	frequenciaBackupAutomatico: 'semanal',
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
				// Mescla os valores armazenados com os defaults
				// Isso garante que novos campos adicionados não sejam perdidos
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
	});

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const systemThemeChangeHandler = () => {
		let currentConfigValue: ConfiguracoesState | undefined;
		const unsubscribe = configuracoesStore.subscribe((value) => (currentConfigValue = value));
		unsubscribe();

		if (currentConfigValue && currentConfigValue.tema === 'sistema') {
			const novoTemaSistema = mediaQuery.matches ? 'escuro' : 'claro';
			document.documentElement.setAttribute('data-tema', novoTemaSistema);
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

export const getAppDefaults = (): ConfiguracoesState => ({ ...defaultConfig });
