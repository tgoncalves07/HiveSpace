<!-- routes/dashboard/+page.svelte (ou o nome correto da sua página) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { estatisticasTarefas } from '../lib/stores/tarefas'; // Adapte o caminho se necessário
	import { estatisticasProjetos } from '../lib/stores/projetos'; // Adapte o caminho se necessário
	import { reminders } from '../lib/stores/reminders'; // Adapte o caminho se necessário
	import { derived } from 'svelte/store'; // ESSENCIAL
	import { configuracoes } from '../lib/stores/pageStore'; // Adapte o caminho se necessário

	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import Target from 'lucide-svelte/icons/target';
	import Bell from 'lucide-svelte/icons/bell';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Circle from 'lucide-svelte/icons/circle';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	// Adicione outros ícones se necessário

	// 1. DICIONÁRIO DE TRADUÇÕES LOCAL para esta página (Dashboard)
	const dashboardTranslations = {
		pt: {
			'dashboard.saudacao.madrugada': 'Boa madrugada',
			'dashboard.saudacao.amanhecendo': 'Amanhecendo',
			'dashboard.saudacao.bomDia': 'Bom dia',
			'dashboard.saudacao.boaTarde': 'Boa tarde',
			'dashboard.saudacao.boaNoite': 'Boa noite',
			'dashboard.resumo.titulo': 'Resumo Rápido',
			'dashboard.resumo.totalTarefas': 'Total de Tarefas',
			'dashboard.resumo.totalProjetos': 'Total de Projetos',
			'dashboard.resumo.lembretesHoje': 'Lembretes para Hoje',
			'dashboard.statusTarefas.titulo': 'Status das Tarefas',
			'dashboard.statusTarefas.avisoAtrasadas': '{count} tarefa(s) atrasada(s)!',
			'dashboard.statusTarefas.pendentes': 'Pendentes',
			'dashboard.statusTarefas.emProgresso': 'Em Progresso',
			'dashboard.statusTarefas.concluidas': 'Concluídas',
			'dashboard.visaoProjetos.titulo': 'Visão Geral dos Projetos',
			'dashboard.visaoProjetos.avisoAtrasados': '{count} projeto(s) atrasado(s)!',
			'dashboard.visaoProjetos.labelFinalizados': 'Projetos Finalizados',
			'dashboard.visaoProjetos.ideias': 'Ideias',
			'dashboard.visaoProjetos.pendentes': 'Pendentes',
			'dashboard.visaoProjetos.emProcesso': 'Em Processo',
			'dashboard.calendario.titulo': 'Seu Calendário',
			'dashboard.calendario.mesAnteriorAria': 'Mês anterior',
			'dashboard.calendario.proximoMesAria': 'Próximo mês',
			'dashboard.calendario.selecionarDiaAria': 'Selecionar dia {day} de {month} de {year}',
			'dashboard.calendario.diaComLembreteAria': ', com lembrete',
			'dashboard.meses.janeiro': 'Janeiro',
			'dashboard.meses.fevereiro': 'Fevereiro',
			'dashboard.meses.marco': 'Março',
			'dashboard.meses.abril': 'Abril',
			'dashboard.meses.maio': 'Maio',
			'dashboard.meses.junho': 'Junho',
			'dashboard.meses.julho': 'Julho',
			'dashboard.meses.agosto': 'Agosto',
			'dashboard.meses.setembro': 'Setembro',
			'dashboard.meses.outubro': 'Outubro',
			'dashboard.meses.novembro': 'Novembro',
			'dashboard.meses.dezembro': 'Dezembro',
			'dashboard.diasSemana.dom': 'Dom',
			'dashboard.diasSemana.seg': 'Seg',
			'dashboard.diasSemana.ter': 'Ter',
			'dashboard.diasSemana.qua': 'Qua',
			'dashboard.diasSemana.qui': 'Qui',
			'dashboard.diasSemana.sex': 'Sex',
			'dashboard.diasSemana.sab': 'Sáb'
		},
		en: {
			'dashboard.saudacao.madrugada': 'Good early morning',
			'dashboard.saudacao.amanhecendo': 'Daybreak',
			'dashboard.saudacao.bomDia': 'Good morning',
			'dashboard.saudacao.boaTarde': 'Good afternoon',
			'dashboard.saudacao.boaNoite': 'Good evening',
			'dashboard.resumo.titulo': 'Quick Summary',
			'dashboard.resumo.totalTarefas': 'Total Tasks',
			'dashboard.resumo.totalProjetos': 'Total Projects',
			'dashboard.resumo.lembretesHoje': 'Reminders for Today',
			'dashboard.statusTarefas.titulo': 'Task Status',
			'dashboard.statusTarefas.avisoAtrasadas': '{count} overdue task(s)!',
			'dashboard.statusTarefas.pendentes': 'Pending',
			'dashboard.statusTarefas.emProgresso': 'In Progress',
			'dashboard.statusTarefas.concluidas': 'Completed',
			'dashboard.visaoProjetos.titulo': 'Projects Overview',
			'dashboard.visaoProjetos.avisoAtrasados': '{count} overdue project(s)!',
			'dashboard.visaoProjetos.labelFinalizados': 'Completed Projects',
			'dashboard.visaoProjetos.ideias': 'Ideas',
			'dashboard.visaoProjetos.pendentes': 'Pending',
			'dashboard.visaoProjetos.emProcesso': 'In Progress',
			'dashboard.calendario.titulo': 'Your Calendar',
			'dashboard.calendario.mesAnteriorAria': 'Previous month',
			'dashboard.calendario.proximoMesAria': 'Next month',
			'dashboard.calendario.selecionarDiaAria': 'Select day {day} of {month} of {year}',
			'dashboard.calendario.diaComLembreteAria': ', with reminder',
			'dashboard.meses.janeiro': 'January',
			'dashboard.meses.fevereiro': 'February',
			'dashboard.meses.marco': 'March',
			'dashboard.meses.abril': 'April',
			'dashboard.meses.maio': 'May',
			'dashboard.meses.junho': 'June',
			'dashboard.meses.julho': 'July',
			'dashboard.meses.agosto': 'August',
			'dashboard.meses.setembro': 'September',
			'dashboard.meses.outubro': 'October',
			'dashboard.meses.novembro': 'November',
			'dashboard.meses.dezembro': 'December',
			'dashboard.diasSemana.dom': 'Sun',
			'dashboard.diasSemana.seg': 'Mon',
			'dashboard.diasSemana.ter': 'Tue',
			'dashboard.diasSemana.qua': 'Wed',
			'dashboard.diasSemana.qui': 'Thu',
			'dashboard.diasSemana.sex': 'Fri',
			'dashboard.diasSemana.sab': 'Sat'
		}
		// Adicionar outros idiomas se necessário
	};

	// 2. Store derivada 't' LOCAL
	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number>): string => {
			const selectedLang = $cfg.idioma;
			let langDict =
				dashboardTranslations[selectedLang as keyof typeof dashboardTranslations] ||
				dashboardTranslations.pt;
			let text = langDict?.[key] || dashboardTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacements[k]));
				}
			}
			return text;
		};
	});
	// --- FIM DA LÓGICA DE TRADUÇÃO LOCAL ---

	let currentDate = new Date();
	let selectedDate = new Date();
	let calendarDays: any[] = []; // Mantido como any por simplicidade, idealmente teria um tipo

	let estatisticasT = {
		total: 0,
		porStatus: {} as Record<string, number>,
		porPrioridade: {} as Record<string, number>,
		atrasadas: 0
	};
	let estatisticasP = { total: 0, porStatus: {} as Record<string, number>, atrasados: 0 };
	let todosLembretes: Record<string, any[]> = {};

	$: estatisticasT = $estatisticasTarefas || estatisticasT;
	$: estatisticasP = $estatisticasProjetos || estatisticasP;

	// Reatividade para lembretes e regeneração do calendário
	let previousRemindersString = JSON.stringify(todosLembretes);
	$: {
		const currentReminders = $reminders || {}; // Assegura que $reminders não é undefined
		const currentRemindersString = JSON.stringify(currentReminders);
		if (previousRemindersString !== currentRemindersString) {
			todosLembretes = currentReminders;
			previousRemindersString = currentRemindersString;
			// Apenas regenera o calendário se estiver no lado do cliente
			if (typeof window !== 'undefined') {
				generateCalendarDays();
			}
		}
	}

	let displayProgressProjetos = 0;
	$: {
		const statsP = estatisticasP; // Usa a variável local que já é reativa
		// CORREÇÃO APLICADA AQUI: 'Finalizado' mudado para 'finalizado' (ou a chave correta que seu store usa)
		const finalizadoCount = Number(statsP?.porStatus?.['finalizado']) || 0;
		const totalProjetos = Number(statsP?.total) || 0;
		let calculatedProgress = 0;
		if (totalProjetos > 0 && Number.isFinite(finalizadoCount)) {
			// Adicionado isFinite para finalizadoCount
			calculatedProgress = (finalizadoCount / totalProjetos) * 100;
		}
		displayProgressProjetos = Number.isFinite(calculatedProgress) ? calculatedProgress : 0;
	}

	// Nomes dos meses e dias da semana agora são reativos à tradução
	$: monthNamesTranslated = [
		$t('dashboard.meses.janeiro'),
		$t('dashboard.meses.fevereiro'),
		$t('dashboard.meses.marco'),
		$t('dashboard.meses.abril'),
		$t('dashboard.meses.maio'),
		$t('dashboard.meses.junho'),
		$t('dashboard.meses.julho'),
		$t('dashboard.meses.agosto'),
		$t('dashboard.meses.setembro'),
		$t('dashboard.meses.outubro'),
		$t('dashboard.meses.novembro'),
		$t('dashboard.meses.dezembro')
	];
	$: dayNamesTranslated = [
		$t('dashboard.diasSemana.dom'),
		$t('dashboard.diasSemana.seg'),
		$t('dashboard.diasSemana.ter'),
		$t('dashboard.diasSemana.qua'),
		$t('dashboard.diasSemana.qui'),
		$t('dashboard.diasSemana.sex'),
		$t('dashboard.diasSemana.sab')
	];

	function dateHasReminder(date: Date): boolean {
		const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
		return todosLembretes[dateKey] !== undefined && todosLembretes[dateKey].length > 0;
	}

	function generateCalendarDays() {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDayOfMonth = new Date(year, month, 1);
		const startDate = new Date(firstDayOfMonth);
		startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Ajusta para o início da semana (Domingo)

		const days = [];
		const todayDateString = new Date().toDateString();
		const selectedDateString = selectedDate.toDateString();

		for (let i = 0; i < 42; i++) {
			// 6 semanas * 7 dias
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			days.push({
				dateObj: new Date(date), // Guarda o objeto Date completo
				dayOfMonth: date.getDate(),
				month: date.getMonth(),
				year: date.getFullYear(),
				isCurrentMonth: date.getMonth() === month,
				isToday: date.toDateString() === todayDateString,
				isSelected: date.toDateString() === selectedDateString,
				hasReminder: dateHasReminder(date)
			});
		}
		calendarDays = days;
	}

	function previousMonth() {
		currentDate.setMonth(currentDate.getMonth() - 1);
		currentDate = new Date(currentDate); // Força reatividade
		generateCalendarDays();
	}

	function nextMonth() {
		currentDate.setMonth(currentDate.getMonth() + 1);
		currentDate = new Date(currentDate); // Força reatividade
		generateCalendarDays();
	}

	function selectDate(day: { dateObj: Date }) {
		// Usa dateObj para criar a nova selectedDate
		selectedDate = new Date(day.dateObj);
		generateCalendarDays(); // Regenera para atualizar a classe 'isSelected'
	}

	// getGreeting traduzida
	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 5) return $t('dashboard.saudacao.madrugada');
		if (hour < 7) return $t('dashboard.saudacao.amanhecendo');
		if (hour < 12) return $t('dashboard.saudacao.bomDia');
		if (hour < 18) return $t('dashboard.saudacao.boaTarde');
		return $t('dashboard.saudacao.boaNoite');
	}

	function getGreetingIcon() {
		// Lógica do ícone permanece a mesma
		const hour = new Date().getHours();
		if (hour < 5) return Moon;
		if (hour < 7) return Sun; // Pode ajustar se quiser ícone diferente para "amanhecendo"
		if (hour < 12) return Sun;
		if (hour < 18) return Sun;
		return Moon;
	}

	function getTodayRemindersCount() {
		const todayKey = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;
		return todosLembretes[todayKey]?.length || 0;
	}

	// Labels para status de tarefas e projetos, usando tradução
	// As chaves devem corresponder às retornadas pelas suas stores de estatísticas
	// Se as stores retornam 'Pendente', 'Em Processo', 'Concluída' para tarefas,
	// e 'Ideia', 'Pendente', 'Em Processo', 'Finalizado' para projetos.
	$: taskStatusLabels = {
		pendente: $t('dashboard.statusTarefas.pendentes'),
		emProgresso: $t('dashboard.statusTarefas.emProgresso'),
		concluida: $t('dashboard.statusTarefas.concluidas')
		// Adicione 'Cancelada' se for exibido
	};

	$: projectStatusLabels = {
		ideia: $t('dashboard.visaoProjetos.ideias'),
		pendente: $t('dashboard.visaoProjetos.pendentes'),
		emProcesso: $t('dashboard.visaoProjetos.emProcesso')
		// 'finalizado' (ou a chave correta) é tratado separadamente no círculo e na contagem
	};

	onMount(() => {
		generateCalendarDays();
		// Para depuração, se as estatísticas não estiverem a carregar como esperado:
		// console.log('Estatísticas Tarefas Iniciais:', $estatisticasTarefas);
		// console.log('Estatísticas Projetos Iniciais:', $estatisticasProjetos);
	});

	// $: if ($configuracoes) { // Para depuração
	// 	console.log('[DASHBOARD] Idioma da store configuracoes:', $configuracoes.idioma);
	// 	console.log('[DASHBOARD] Saudacao Traduzida ($t):', getGreeting());
	// }
</script>

<div class="dashboard-page-container">
	<header class="dashboard-header">
		<div class="greeting-wrapper">
			<div class="greeting-icon-container">
				<svelte:component this={getGreetingIcon()} size={36} />
			</div>
			<div>
				<h1 class="greeting-title">{getGreeting()}!</h1>
				<p class="current-date-display">
					{new Date().toLocaleDateString($configuracoes.idioma.split('-')[0] || 'pt', {
						// Usa idioma da config
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
			</div>
		</div>
	</header>

	<div class="dashboard-grid">
		<section class="quick-summary-section dashboard-card">
			<h2 class="section-title">{$t('dashboard.resumo.titulo')}</h2>
			<div class="summary-cards-container">
				<div class="summary-card-item">
					<div class="card-icon-wrapper"><ClipboardList size={28} /></div>
					<div class="card-content-details">
						<span class="card-main-number">{estatisticasT.total}</span>
						<span class="card-label-text">{$t('dashboard.resumo.totalTarefas')}</span>
					</div>
				</div>
				<div class="summary-card-item">
					<div class="card-icon-wrapper"><Target size={28} /></div>
					<div class="card-content-details">
						<span class="card-main-number">{estatisticasP.total}</span>
						<span class="card-label-text">{$t('dashboard.resumo.totalProjetos')}</span>
					</div>
				</div>
				<div class="summary-card-item">
					<div class="card-icon-wrapper"><Bell size={28} /></div>
					<div class="card-content-details">
						<span class="card-main-number">{getTodayRemindersCount()}</span>
						<span class="card-label-text">{$t('dashboard.resumo.lembretesHoje')}</span>
					</div>
				</div>
			</div>
		</section>

		<section class="status-display-section dashboard-card">
			<div class="section-header-wrapper">
				<h2 class="section-title">{$t('dashboard.statusTarefas.titulo')}</h2>
				{#if estatisticasT.atrasadas > 0}
					<div class="warning-alert">
						<AlertTriangle size={18} />
						<span
							>{$t('dashboard.statusTarefas.avisoAtrasadas', {
								count: estatisticasT.atrasadas
							})}</span
						>
					</div>
				{/if}
			</div>
			<div class="status-items-grid">
				{#each ['pendente', 'emProgresso', 'concluida'] as statusKey (statusKey)}
					{@const count = estatisticasT.porStatus[statusKey] || 0}
					<div class="status-item-detail">
						<div class="status-info-block">
							<span class="status-number-text">{count}</span>
							<span class="status-label-text">{taskStatusLabels[statusKey]}</span>
						</div>
						<div class="status-progress-bar">
							<div
								class="status-progress-fill fill-{statusKey}"
								style="width: {estatisticasT.total > 0
									? Math.max(0, Math.min(100, (count / estatisticasT.total) * 100))
									: 0}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="status-display-section dashboard-card">
			<div class="section-header-wrapper">
				<h2 class="section-title">{$t('dashboard.visaoProjetos.titulo')}</h2>
				{#if estatisticasP.atrasados > 0}
					<div class="warning-alert">
						<AlertTriangle size={18} />
						<span
							>{$t('dashboard.visaoProjetos.avisoAtrasados', {
								count: estatisticasP.atrasados
							})}</span
						>
					</div>
				{/if}
			</div>
			<div class="project-overview-container">
				<div class="project-stats-circle-area">
					<div class="stat-progress-circle">
						<div
							class="circle-visual-progress"
							style="--progress-percent: {displayProgressProjetos};"
						>
							<span class="circle-inner-text">{Math.round(displayProgressProjetos)}%</span>
						</div>
						<span class="circle-descriptor-label"
							>{$t('dashboard.visaoProjetos.labelFinalizados')}</span
						>
					</div>
				</div>
				<div class="project-status-breakdown">
					{#each [{ key: 'ideia', colorClass: 'dot-ideia' }, { key: 'pendente', colorClass: 'dot-pendente' }, { key: 'emProcesso', colorClass: 'dot-emProcesso' }] as item (item.key)}
						<div class="breakdown-list-item">
							<span class="breakdown-status-dot {item.colorClass}"><Circle size={12} /></span>
							<span class="breakdown-label">
								{estatisticasP.porStatus[item.key] || 0}
								{projectStatusLabels[item.key]}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="calendar-widget-section dashboard-card">
			<h2 class="section-title">{$t('dashboard.calendario.titulo')}</h2>
			<div class="calendar-interactive-area">
				<div class="calendar-navigation-header">
					<button
						class="calendar-nav-button"
						on:click={previousMonth}
						aria-label={$t('dashboard.calendario.mesAnteriorAria')}
						><ChevronLeft size={22} /></button
					>
					<span class="calendar-month-year-display"
						>{monthNamesTranslated[currentDate.getMonth()]} {currentDate.getFullYear()}</span
					>
					<button
						class="calendar-nav-button"
						on:click={nextMonth}
						aria-label={$t('dashboard.calendario.proximoMesAria')}
						><ChevronRight size={22} /></button
					>
				</div>
				<div class="calendar-days-grid">
					{#each dayNamesTranslated as dayName (dayName)}
						<div class="calendar-day-header-cell">{dayName}</div>
					{/each}
					{#each calendarDays as dayItem, i (dayItem.year + '-' + dayItem.month + '-' + dayItem.dayOfMonth + '-' + i)}
						{@const ariaLabelDatePart = $t('dashboard.calendario.selecionarDiaAria', {
							day: dayItem.dayOfMonth,
							month: monthNamesTranslated[dayItem.month],
							year: dayItem.year
						})}
						{@const ariaLabelReminderPart = dayItem.hasReminder
							? $t('dashboard.calendario.diaComLembreteAria')
							: ''}
						<button
							class="calendar-day-cell"
							class:other-month-day={!dayItem.isCurrentMonth}
							class:today-highlight={dayItem.isToday}
							class:selected-day={dayItem.isSelected}
							class:has-reminder-indicator={dayItem.hasReminder}
							on:click={() => selectDate(dayItem)}
							disabled={!dayItem.isCurrentMonth}
							aria-label={ariaLabelDatePart + ariaLabelReminderPart}
						>
							<span>{dayItem.dayOfMonth}</span>
						</button>
					{/each}
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	/* Cole aqui os seus estilos CSS originais para a página de dashboard */
	.dashboard-page-container {
		min-height: 100vh;
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		padding: clamp(1.5rem, 4vw, 2.5rem);
		line-height: 1.6;
	}
	.dashboard-header {
		margin-bottom: clamp(2rem, 5vw, 3rem);
	}
	.greeting-wrapper {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.greeting-icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 60px;
		border-radius: 18px;
		background: linear-gradient(
			145deg,
			var(--primary-color) 0%,
			color-mix(in srgb, var(--primary-color) 70%, var(--secondary-color) 30%) 100%
		);
		color: var(--primary-color-text);
		flex-shrink: 0;
		box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--primary-color) 30%, transparent);
	}
	.greeting-title {
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		font-weight: 700;
		margin: 0 0 0.15rem 0;
		letter-spacing: -0.025em;
		color: var(--app-text-color);
	}
	.current-date-display {
		color: var(--text-color-muted);
		font-size: clamp(0.9rem, 2vw, 1.05rem);
		margin: 0;
		font-weight: 500;
	}
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: clamp(1.5rem, 3vw, 2rem);
		max-width: 1600px;
		margin: 0 auto;
	}
	.dashboard-card {
		background-color: var(--card-background-color);
		padding: clamp(1.25rem, 3vw, 1.75rem);
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		transition:
			transform 0.2s ease-out,
			box-shadow 0.2s ease-out;
	}
	.dashboard-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--shadow) 50%, transparent);
	}
	.section-title {
		font-size: clamp(1.1rem, 2.5vw, 1.3rem);
		font-weight: 600;
		color: var(--app-text-color);
		margin: 0 0 1.25rem 0;
		position: relative;
		padding-bottom: 0.6rem;
		border-bottom: 1px solid var(--border-color);
	}
	.section-title::after {
		display: none;
	}
	.summary-cards-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: clamp(1rem, 2.5vw, 1.5rem);
	}
	.summary-card-item {
		background-color: var(--card-background-color);
		border: 1px solid transparent;
		box-shadow: none;
		border-radius: 10px;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		transition: background-color 0.2s ease;
		height: auto;
		min-height: 90px;
	}
	.summary-card-item:hover {
		background-color: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color));
		transform: none;
		box-shadow: none;
	}
	.card-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary-color);
		background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
		border-radius: 8px;
		padding: 0.6rem;
		flex-shrink: 0;
	}
	.card-icon-wrapper :global(svg) {
		color: inherit;
	}
	.card-content-details {
		display: flex;
		flex-direction: column;
	}
	.card-main-number {
		font-size: clamp(1.8rem, 3.5vw, 2rem);
		font-weight: 700;
		line-height: 1.1;
		color: var(--app-text-color);
		margin-bottom: 0.1rem;
	}
	.card-label-text {
		color: var(--text-color-muted);
		font-size: clamp(0.8rem, 1.8vw, 0.9rem);
		font-weight: 500;
	}
	.section-header-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.status-items-grid {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.status-item-detail {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 1rem 1.5rem;
	}
	.status-progress-bar {
		grid-column: 1 / -1;
		order: 2;
		height: 8px;
		background-color: var(--border-color);
		overflow: hidden;
		border-radius: 4px;
	}
	@media (min-width: 500px) {
		.status-item-detail {
			grid-template-columns: minmax(100px, auto) 1fr;
		}
		.status-progress-bar {
			grid-column: 2 / 3;
			order: 0;
		}
		.status-info-block {
			grid-column: 1 / 2;
		}
	}
	.status-progress-fill {
		height: 100%;
		background-color: var(--text-color-muted);
		transition: width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
		border-radius: 4px;
	}
	/* Ajuste para corresponder às chaves usadas em taskStatusLabels e estatisticasT.porStatus */
	.status-progress-fill.fill-pendente {
		/* Era fill-pendente */
		background-color: var(--warning-color); /* Exemplo, ajuste conforme necessário */
	}
	.status-progress-fill.fill-emProgresso {
		/* Era fill-emProgresso */
		background-color: var(--primary-color);
	}
	.status-progress-fill.fill-concluida {
		/* Era fill-concluida */
		background-color: var(--success-color);
	}
	.status-info-block {
		display: flex;
		flex-direction: column;
	}
	.status-number-text {
		font-size: clamp(1.3rem, 3vw, 1.5rem);
		font-weight: 700;
		line-height: 1;
		color: var(--app-text-color);
	}
	.status-label-text {
		color: var(--text-color-muted);
		font-size: clamp(0.8rem, 1.8vw, 0.85rem);
		font-weight: 500;
		margin-top: 0.2rem;
	}
	.warning-alert {
		background-color: var(--warning-background-color);
		color: var(--warning-text-color);
		padding: 0.6rem 1rem;
		font-size: clamp(0.8rem, 1.8vw, 0.9rem);
		font-weight: 500;
		border: 1px solid var(--warning-color);
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		border-radius: 8px;
	}
	.warning-alert span {
		line-height: 1.3;
	}
	.project-overview-container {
		display: flex;
		align-items: center;
		gap: clamp(1.5rem, 4vw, 2.5rem);
		flex-wrap: wrap;
	}
	.project-stats-circle-area {
		display: flex;
		gap: 0.75rem;
		margin: 0 auto;
	}
	.stat-progress-circle {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	.circle-visual-progress {
		box-sizing: border-box;
		width: 98px;
		height: 98px;
		border-radius: 1000px;
		background: conic-gradient(
			var(--success-color) 0deg,
			var(--success-color) calc(var(--progress-percent) * 3.6deg),
			var(--border-color) calc(var(--progress-percent) * 3.6deg)
		);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: background 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
	}
	.circle-visual-progress::after {
		box-sizing: border-box;
		content: '';
		width: 72px;
		height: 72px;
		border-radius: 1000px;
		background-color: var(--card-background-color);
		position: absolute;
	}
	.circle-inner-text {
		font-size: clamp(1.1rem, 2.5vw, 1.25rem);
		font-weight: 700;
		z-index: 1;
		color: var(--app-text-color);
	}
	.circle-descriptor-label {
		color: var(--text-color-muted);
		font-size: clamp(0.8rem, 1.8vw, 0.85rem);
		font-weight: 500;
		margin-top: 0.25rem;
	}
	.project-status-breakdown {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.breakdown-list-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.breakdown-label {
		font-size: clamp(0.85rem, 2vw, 0.95rem);
		color: var(--app-text-color);
		font-weight: 500;
	}
	.breakdown-status-dot {
		display: flex;
	}
	.breakdown-status-dot.dot-ideia {
		color: var(--secondary-color);
	}
	.breakdown-status-dot.dot-pendente {
		color: var(--primary-color);
	}
	.breakdown-status-dot.dot-emProcesso {
		/* Corrigido: era dot-emProcesso */
		color: var(--success-color); /* Ajuste se a cor para "Em Processo" de projetos for diferente */
	}
	.calendar-navigation-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}
	.calendar-nav-button {
		background-color: transparent;
		border: 1px solid var(--border-color);
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
		color: var(--text-color-muted);
	}
	.calendar-nav-button:hover {
		background-color: var(--border-color);
		border-color: var(--text-color-muted);
		color: var(--app-text-color);
	}
	.calendar-nav-button:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
		border-color: var(--primary-color);
	}
	.calendar-month-year-display {
		font-weight: 600;
		font-size: clamp(1.05rem, 2.2vw, 1.2rem);
		color: var(--app-text-color);
	}
	.calendar-days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 6px;
	}
	.calendar-day-header-cell {
		text-align: center;
		font-size: clamp(0.75rem, 1.5vw, 0.8rem);
		font-weight: 600;
		color: var(--text-color-muted);
		padding-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.calendar-day-cell {
		aspect-ratio: 1;
		border: 2px solid transparent;
		background-color: transparent;
		font-size: clamp(0.85rem, 1.8vw, 0.95rem);
		font-weight: 500;
		color: var(--app-text-color);
		cursor: pointer;
		border-radius: 8px;
		transition: all 0.15s ease-out;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		line-height: 1;
	}
	.calendar-day-cell span {
		z-index: 1;
	}
	.calendar-day-cell:disabled {
		color: var(--text-color-muted);
		cursor: default;
		opacity: 0.5;
	}
	.calendar-day-cell:not(:disabled):hover {
		background-color: var(--border-color);
		border-color: var(--text-color-muted);
	}
	.calendar-day-cell:focus-visible {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 50%, transparent);
	}
	.calendar-day-cell.other-month-day span {
		opacity: 0.4;
	}
	.calendar-day-cell.today-highlight {
		color: var(--primary-color-text) !important;
		font-weight: 700;
		background-color: var(--primary-color) !important;
		border-color: var(--primary-color) !important;
	}
	.calendar-day-cell.today-highlight:hover {
		background-color: color-mix(in srgb, var(--primary-color) 85%, black) !important;
	}
	.calendar-day-cell.selected-day {
		background-color: var(--success-color) !important;
		color: var(--primary-color-text) !important;
		font-weight: 700;
		border-color: var(--success-color) !important;
	}
	.calendar-day-cell.selected-day:hover {
		background-color: color-mix(in srgb, var(--success-color) 85%, black) !important;
	}
	.calendar-day-cell.has-reminder-indicator::after {
		content: '';
		position: absolute;
		bottom: 4px;
		left: 50%;
		transform: translateX(-50%);
		width: 5px;
		height: 5px;
		background-color: var(--warning-color);
		border-radius: 50%;
		z-index: 0;
	}
	.calendar-day-cell.today-highlight.has-reminder-indicator::after,
	.calendar-day-cell.selected-day.has-reminder-indicator::after {
		background-color: var(--primary-color-text);
	}
	@media (max-width: 768px) {
		.dashboard-page-container {
			padding: 1.5rem;
		}
		.greeting-wrapper {
			gap: 1rem;
		}
		.greeting-icon-container {
			width: 56px;
			height: 56px;
			border-radius: 16px;
		}
		.greeting-title {
			font-size: 1.9rem;
		}
		.dashboard-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		.project-overview-container {
			flex-direction: column;
			text-align: center;
			gap: 1.5rem;
		}
		.section-header-wrapper {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.9rem;
		}
		.warning-alert {
			align-self: stretch;
			justify-content: center;
		}
		.summary-cards-container {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 480px) {
		.dashboard-page-container {
			padding: 1rem;
		}
		.greeting-title {
			font-size: 1.7rem;
		}
		.current-date-display {
			font-size: 0.9rem;
		}
		.card-main-number {
			font-size: 1.7rem;
		}
		.status-number-text {
			font-size: 1.3rem;
		}
		.calendar-day-cell {
			font-size: 0.85rem;
			border-radius: 6px;
		}
		.calendar-day-header-cell {
			font-size: 0.7rem;
			padding-bottom: 0.5rem;
		}
		.calendar-nav-button {
			width: 36px;
			height: 36px;
			border-radius: 6px;
		}
		.section-title {
			font-size: 1.1rem;
			margin-bottom: 1rem;
			padding-bottom: 0.5rem;
		}
		.dashboard-card {
			padding: 1rem;
		}
		.summary-card-item {
			padding: 1rem;
			min-height: 80px;
		}
		.warning-alert {
			padding: 0.5rem 0.8rem;
			gap: 0.4rem;
		}
		.breakdown-list-item {
			gap: 0.5rem;
		}
		.breakdown-label {
			font-size: 0.8rem;
		}
		.stat-progress-circle {
			/* Corrigido para .stat-progress-circle para corresponder ao HTML */
			width: 100px; /* Ajustado como no seu CSS original */
			height: 100px; /* Ajustado como no seu CSS original */
		}
		.circle-visual-progress::after {
			/* Corrigido para .circle-visual-progress::after */
			width: calc(100% - 26px); /* Ajustado para corresponder ao seu CSS (72px de 98px) */
			height: calc(100% - 26px); /* Ajustado para corresponder ao seu CSS */
		}
		.circle-inner-text {
			font-size: 1rem;
		}
	}
</style>
