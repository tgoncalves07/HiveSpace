<script>
	import { onMount } from 'svelte';
	import { tarefas, estatisticasTarefas } from '../lib/stores/tarefas';
	import { projetos, estatisticasProjetos } from '../lib/stores/projetos';
	import { reminders } from '../lib/stores/reminders';

	// Importações dos ícones Lucide
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import Target from 'lucide-svelte/icons/target';
	import Bell from 'lucide-svelte/icons/bell';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Circle from 'lucide-svelte/icons/circle';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { Sunset } from 'lucide-svelte';

	// Estado do calendário
	let currentDate = new Date();
	let selectedDate = new Date();
	let calendarDays = [];

	// Dados das stores
	let estatisticasT = { total: 0, porStatus: {}, porPrioridade: {}, atrasadas: 0 };
	let estatisticasP = { total: 0, porStatus: {}, atrasados: 0 };
	let todosLembretes = {};

	// Subscrever às stores
	$: estatisticasTarefas.subscribe((stats) => (estatisticasT = stats));
	$: estatisticasProjetos.subscribe((stats) => (estatisticasP = stats));
	$: reminders.subscribe((r) => (todosLembretes = r));

	// Função para gerar os dias do calendário
	function generateCalendarDays() {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days = [];
		for (let i = 0; i < 42; i++) {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);

			days.push({
				date: date.getDate(),
				month: date.getMonth(),
				year: date.getFullYear(),
				isCurrentMonth: date.getMonth() === month,
				isToday: date.toDateString() === new Date().toDateString(),
				isSelected: date.toDateString() === selectedDate.toDateString()
			});
		}

		calendarDays = days;
	}

	function previousMonth() {
		currentDate.setMonth(currentDate.getMonth() - 1);
		currentDate = new Date(currentDate);
		generateCalendarDays();
	}

	function nextMonth() {
		currentDate.setMonth(currentDate.getMonth() + 1);
		currentDate = new Date(currentDate);
		generateCalendarDays();
	}

	function selectDate(day) {
		if (day.isCurrentMonth) {
			selectedDate = new Date(day.year, day.month, day.date);
			generateCalendarDays();
		}
	}

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 7) return 'Boa noite';
		if (hour < 12) return 'Bom dia';
		if (hour < 18) return 'Boa tarde';
		return 'Boa noite';
	}

	function getGreetingIcon() {
		const hour = new Date().getHours();
		if (hour < 7) return Moon;
		if (hour < 12) return Sun;
		if (hour < 18) return Sun;
		return Moon;
	}

	// Contar lembretes pendentes de hoje
	function getTodayReminders() {
		const today = new Date().toDateString();
		return Object.keys(todosLembretes).filter((date) => new Date(date).toDateString() === today)
			.length;
	}

	onMount(() => {
		generateCalendarDays();
	});

	const monthNames = [
		'Janeiro',
		'Fevereiro',
		'Março',
		'Abril',
		'Maio',
		'Junho',
		'Julho',
		'Agosto',
		'Setembro',
		'Outubro',
		'Novembro',
		'Dezembro'
	];

	const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
</script>

<main class="dashboard">
	<!-- Header com saudação -->
	<header class="header">
		<div class="greeting">
			<div class="greeting-icon">
				<svelte:component this={getGreetingIcon()} size={32} />
			</div>
			<div>
				<h1>{getGreeting()}</h1>
				<p class="date">
					{new Date().toLocaleDateString('pt-PT', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
			</div>
		</div>
	</header>

	<!-- Grid principal -->
	<div class="grid">
		<!-- Resumo rápido com ícones Lucide -->
		<section class="quick-summary">
			<h2>Resumo</h2>
			<div class="summary-cards">
				<div class="summary-card">
					<div class="card-icon">
						<ClipboardList size={32} />
					</div>
					<div class="card-content">
						<span class="card-number">{estatisticasT.total}</span>
						<span class="card-label">Tarefas</span>
					</div>
				</div>
				<div class="summary-card">
					<div class="card-icon">
						<Target size={32} />
					</div>
					<div class="card-content">
						<span class="card-number">{estatisticasP.total}</span>
						<span class="card-label">Projetos</span>
					</div>
				</div>
				<div class="summary-card">
					<div class="card-icon">
						<Bell size={32} />
					</div>
					<div class="card-content">
						<span class="card-number">{getTodayReminders()}</span>
						<span class="card-label">Lembretes</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Status das Tarefas -->
		<section class="status-section">
			<div class="section-header">
				<h2>Tarefas</h2>
				{#if estatisticasT.atrasadas > 0}
					<div class="alert">
						<AlertTriangle size={16} />
						{estatisticasT.atrasadas} tarefa{estatisticasT.atrasadas > 1 ? 's' : ''} atrasada{estatisticasT.atrasadas >
						1
							? 's'
							: ''}
					</div>
				{/if}
			</div>
			<div class="status-grid">
				<div class="status-item">
					<div class="status-info">
						<span class="status-number">{estatisticasT.porStatus.pendente || 0}</span>
						<span class="status-label">Pendentes</span>
					</div>
					<div class="status-bar">
						<div
							class="status-fill"
							style="width: {estatisticasT.total > 0
								? (estatisticasT.porStatus.pendente / estatisticasT.total) * 100
								: 0}%"
						></div>
					</div>
				</div>
				<div class="status-item">
					<div class="status-info">
						<span class="status-number">{estatisticasT.porStatus.emProgresso || 0}</span>
						<span class="status-label">Em Progresso</span>
					</div>
					<div class="status-bar">
						<div
							class="status-fill active"
							style="width: {estatisticasT.total > 0
								? (estatisticasT.porStatus.emProgresso / estatisticasT.total) * 100
								: 0}%"
						></div>
					</div>
				</div>
				<div class="status-item">
					<div class="status-info">
						<span class="status-number">{estatisticasT.porStatus.concluida || 0}</span>
						<span class="status-label">Concluídas</span>
					</div>
					<div class="status-bar">
						<div
							class="status-fill completed"
							style="width: {estatisticasT.total > 0
								? (estatisticasT.porStatus.concluida / estatisticasT.total) * 100
								: 0}%"
						></div>
					</div>
				</div>
			</div>
		</section>

		<!-- Status dos Projetos -->
		<section class="status-section">
			<div class="section-header">
				<h2>Projetos</h2>
				{#if estatisticasP.atrasados > 0}
					<div class="alert">
						<AlertTriangle size={16} />
						{estatisticasP.atrasados} projeto{estatisticasP.atrasados > 1 ? 's' : ''} atrasado{estatisticasP.atrasados >
						1
							? 's'
							: ''}
					</div>
				{/if}
			</div>
			<div class="project-overview">
				<div class="project-stats">
					<div class="stat-circle">
						<div
							class="circle-progress"
							style="--progress: {estatisticasP.total > 0
								? (estatisticasP.porStatus.finalizado / estatisticasP.total) * 100
								: 0}%"
						>
							<span class="circle-text"
								>{estatisticasP.total > 0
									? Math.round((estatisticasP.porStatus.finalizado / estatisticasP.total) * 100)
									: 0}%</span
							>
						</div>
						<span class="circle-label">Finalizados</span>
					</div>
				</div>
				<div class="project-breakdown">
					<div class="breakdown-item">
						<span class="breakdown-dot idea"><Circle size={10} /></span>
						<span>{estatisticasP.porStatus.ideia || 0} Ideias</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-dot pending"><Circle size={10} /></span>
						<span>{estatisticasP.porStatus.pendente || 0} Pendentes</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-dot active"><Circle size={10} /></span>
						<span>{estatisticasP.porStatus.emProcesso || 0} Em Processo</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Calendário -->
		<section class="calendar-section">
			<h2>Calendário</h2>
			<div class="calendar">
				<div class="calendar-header">
					<button class="nav-btn" on:click={previousMonth}>
						<ChevronLeft size={20} />
					</button>
					<span class="month-year"
						>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span
					>
					<button class="nav-btn" on:click={nextMonth}>
						<ChevronRight size={20} />
					</button>
				</div>
				<div class="calendar-grid">
					{#each dayNames as day}
						<div class="day-header">{day}</div>
					{/each}
					{#each calendarDays as day}
						<button
							class="calendar-day"
							class:other-month={!day.isCurrentMonth}
							class:today={day.isToday}
							class:selected={day.isSelected}
							on:click={() => selectDate(day)}
						>
							{day.date}
						</button>
					{/each}
				</div>
			</div>
		</section>
	</div>
</main>

<style>
	:root {
		--primary: #333;
		--secondary: #555;
		--background: #f5f7fa;
		--text: #222;
		--success: #28a745;
		--warning: #ffc107;
		--danger: #dc3545;
		--light-gray: #eef2f6;
		--medium-gray: #94a3b8;
		--shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		--border-color: #e2e8f0;
		--card-bg: #ffffff;
		--blue: #3b82f6;
		--green: #10b981;
		--orange: #f59e0b;
		--purple: #8b5cf6;
	}

	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.dashboard {
		min-height: 100vh;
		background: var(--background);
		padding: 2rem;
		font-family:
			'Segoe UI',
			system-ui,
			-apple-system,
			sans-serif;
		color: var(--text);
		line-height: 1.5;
	}

	.header {
		margin-bottom: 2.5rem;
	}

	.greeting {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.greeting-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--text) 0%, #2563eb 100%);
		color: white;
	}

	.greeting h1 {
		font-size: 2.25rem;
		font-weight: 700;
		margin: 0 0 0.25rem 0;
		letter-spacing: -0.02em;
		color: #1e293b;
	}

	.date {
		color: var(--medium-gray);
		font-size: 1.05rem;
		margin: 0;
		font-weight: 500;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.75rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Quick Summary - Cards Retangulares */
	.quick-summary {
		grid-column: 1 / -1;
	}

	.quick-summary h2 {
		font-size: 1.35rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 1.5rem 0;
		position: relative;
		padding-bottom: 0.75rem;
	}

	.quick-summary h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 50px;
		height: 3px;
		background: var(--text);
		border-radius: 2px;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.75rem;
	}

	.summary-card {
		background: var(--card-bg);
		display: flex;
		align-items: center;
		padding: 1.75rem;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		height: 120px;
		border-radius: 8px;
	}

	.summary-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1.5rem;
	}

	.card-icon :global(svg) {
		color: var(--text);
		width: 36px;
		height: 36px;
	}

	.summary-card:nth-child(2) .card-icon :global(svg) {
		color: var(--text);
	}

	.summary-card:nth-child(3) .card-icon :global(svg) {
		color: var(--text);
	}

	.card-content {
		display: flex;
		flex-direction: column;
	}

	.card-number {
		font-size: 2.3rem;
		font-weight: 800;
		line-height: 1;
		color: #1e293b;
		margin-bottom: 0.25rem;
	}

	.card-label {
		color: var(--text);
		font-size: 1rem;
		font-weight: 500;
	}

	/* Status Sections */
	.status-section {
		background: var(--card-bg);
		padding: 1.75rem;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		border-radius: 8px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.75rem;
	}

	.status-section h2 {
		font-size: 1.35rem;
		font-weight: 700;
		margin: 0;
		color: #1e293b;
		position: relative;
		padding-bottom: 0.75rem;
	}

	.status-section h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 50px;
		height: 3px;
		background: var(--text);
		border-radius: 2px;
	}

	.status-grid {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.status-bar {
		flex: 1;
		height: 12px;
		background: var(--light-gray);
		overflow: hidden;
		border-radius: 6px;
	}

	.status-fill {
		height: 100%;
		background: var(--medium-gray);
		transition: width 0.5s ease;
		border-radius: 6px;
	}

	.status-fill.active {
		background: var(--blue);
	}

	.status-fill.completed {
		background: var(--green);
	}

	.status-info {
		display: flex;
		flex-direction: column;
		min-width: 100px;
	}

	.status-number {
		font-size: 1.7rem;
		font-weight: 800;
		line-height: 1;
		color: #1e293b;
	}

	.status-label {
		color: var(--medium-gray);
		font-size: 0.95rem;
		font-weight: 500;
		margin-top: 0.35rem;
	}

	.alert {
		background: #fffbeb;
		color: #000000;
		padding: 0.75rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 500;
		border: 1px solid #fde68a;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: 6px;
		margin-top: 1rem;
	}

	/* Project Overview */
	.project-overview {
		display: flex;
		align-items: center;
		gap: 1.75rem;
	}

	.stat-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
	}

	.circle-progress {
		width: 110px;
		height: 110px;
		border-radius: 50%;
		background: conic-gradient(
			var(--green) 0deg,
			var(--green) calc(var(--progress) * 3.6deg),
			var(--light-gray) calc(var(--progress) * 3.6deg)
		);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.circle-progress::before {
		content: '';
		width: 90px;
		height: 90px;
		border-radius: 50%;
		background: var(--card-bg);
		position: absolute;
	}

	.circle-text {
		font-size: 1.4rem;
		font-weight: 800;
		z-index: 1;
		color: #1e293b;
	}

	.circle-label {
		color: var(--medium-gray);
		font-size: 0.95rem;
		font-weight: 500;
	}

	.project-breakdown {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.breakdown-item {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		font-size: 1rem;
		color: var(--text);
		font-weight: 500;
	}

	.breakdown-dot.idea {
		color: var(--purple);
	}

	.breakdown-dot.pending {
		color: var(--blue);
	}

	.breakdown-dot.active {
		color: var(--green);
	}

	/* Calendar */
	.calendar-section {
		background: var(--card-bg);
		padding: 1.75rem;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
		border-radius: 8px;
	}

	.calendar-section h2 {
		font-size: 1.35rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: #1e293b;
		position: relative;
		padding-bottom: 0.75rem;
	}

	.calendar-section h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 50px;
		height: 3px;
		background: var(--text);
		border-radius: 2px;
	}

	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.nav-btn {
		background: var(--light-gray);
		border: 1px solid var(--border-color);
		width: 38px;
		height: 38px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s ease;
		color: var(--text);
	}

	.nav-btn:hover {
		background: #e2e8f0;
	}

	.month-year {
		font-weight: 700;
		font-size: 1.15rem;
		color: #1e293b;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 6px;
	}

	.day-header {
		text-align: center;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--medium-gray);
		padding: 0.85rem 0;
		text-transform: uppercase;
	}

	.calendar-day {
		aspect-ratio: 1;
		border: none;
		background: none;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text);
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		position: relative;
	}

	.calendar-day:hover {
		background: var(--light-gray);
	}

	.calendar-day.other-month {
		color: #cbd5e1;
	}

	.calendar-day.today {
		color: white;
		font-weight: 700;
		background: var(--blue);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
	}

	.calendar-day.selected {
		background: var(--green);
		color: white;
		box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard {
			padding: 1.5rem;
		}

		.greeting {
			gap: 1rem;
		}

		.greeting-icon {
			width: 54px;
			height: 54px;
		}

		.greeting h1 {
			font-size: 1.9rem;
		}

		.grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.project-overview {
			flex-direction: column;
			text-align: center;
			gap: 1.75rem;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.9rem;
		}

		.alert {
			align-self: flex-start;
		}
	}
</style>
