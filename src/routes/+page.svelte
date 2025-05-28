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

	// Obter saudação baseada na hora
	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Bom dia';
		if (hour < 18) return 'Boa tarde';
		return 'Boa noite';
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
			<h1>{getGreeting()}</h1>
			<p class="date">
				{new Date().toLocaleDateString('pt-BR', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		</div>
	</header>

	<!-- Grid principal -->
	<div class="grid">
		<!-- Resumo rápido com ícones Lucide -->
		<section class="quick-summary">
			<h2>Resumo</h2>
			<div class="summary-cards">
				<div class="summary-card">
					<div class="card-icon"><ClipboardList size={24} /></div>
					<div class="card-content">
						<span class="card-number">{estatisticasT.total}</span>
						<span class="card-label">Tarefas</span>
					</div>
				</div>
				<div class="summary-card">
					<div class="card-icon"><Target size={24} /></div>
					<div class="card-content">
						<span class="card-number">{estatisticasP.total}</span>
						<span class="card-label">Projetos</span>
					</div>
				</div>
				<div class="summary-card">
					<div class="card-icon"><Bell size={24} /></div>
					<div class="card-content">
						<span class="card-number">{getTodayReminders()}</span>
						<span class="card-label">Lembretes Hoje</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Status das Tarefas -->
		<section class="status-section">
			<h2>Tarefas</h2>
			<div class="status-grid">
				<div class="status-item">
					<div class="status-bar">
						<div
							class="status-fill"
							style="width: {estatisticasT.total > 0
								? (estatisticasT.porStatus.pendente / estatisticasT.total) * 100
								: 0}%"
						></div>
					</div>
					<div class="status-info">
						<span class="status-number">{estatisticasT.porStatus.pendente || 0}</span>
						<span class="status-label">Pendentes</span>
					</div>
				</div>
				<div class="status-item">
					<div class="status-bar">
						<div
							class="status-fill active"
							style="width: {estatisticasT.total > 0
								? (estatisticasT.porStatus.emProgresso / estatisticasT.total) * 100
								: 0}%"
						></div>
					</div>
					<div class="status-info">
						<span class="status-number">{estatisticasT.porStatus.emProgresso || 0}</span>
						<span class="status-label">Em Progresso</span>
					</div>
				</div>
				<div class="status-item">
					<div class="status-bar">
						<div
							class="status-fill completed"
							style="width: {estatisticasT.total > 0
								? (estatisticasT.porStatus.concluida / estatisticasT.total) * 100
								: 0}%"
						></div>
					</div>
					<div class="status-info">
						<span class="status-number">{estatisticasT.porStatus.concluida || 0}</span>
						<span class="status-label">Concluídas</span>
					</div>
				</div>
			</div>
			{#if estatisticasT.atrasadas > 0}
				<div class="alert">
					<AlertTriangle size={16} />
					{estatisticasT.atrasadas} tarefa{estatisticasT.atrasadas > 1 ? 's' : ''} atrasada{estatisticasT.atrasadas >
					1
						? 's'
						: ''}
				</div>
			{/if}
		</section>

		<!-- Status dos Projetos -->
		<section class="status-section">
			<h2>Projetos</h2>
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
						<span class="breakdown-dot idea"><Circle size={8} /></span>
						<span>{estatisticasP.porStatus.ideia || 0} Ideias</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-dot pending"><Circle size={8} /></span>
						<span>{estatisticasP.porStatus.pendente || 0} Pendentes</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-dot active"><Circle size={8} /></span>
						<span>{estatisticasP.porStatus.emProcesso || 0} Em Processo</span>
					</div>
				</div>
			</div>
			{#if estatisticasP.atrasados > 0}
				<div class="alert">
					<AlertTriangle size={16} />
					{estatisticasP.atrasados} projeto{estatisticasP.atrasados > 1 ? 's' : ''} atrasado{estatisticasP.atrasados >
					1
						? 's'
						: ''}
				</div>
			{/if}
		</section>

		<!-- Calendário -->
		<section class="calendar-section">
			<h2>Calendário</h2>
			<div class="calendar">
				<div class="calendar-header">
					<button class="nav-btn" on:click={previousMonth}>‹</button>
					<span class="month-year"
						>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span
					>
					<button class="nav-btn" on:click={nextMonth}>›</button>
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
	.dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
	}

	.header {
		margin-bottom: 3rem;
	}

	.greeting h1 {
		font-size: 2.5rem;
		font-weight: 300;
		color: #212529;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.02em;
	}

	.date {
		color: #6c757d;
		font-size: 1.1rem;
		margin: 0;
		text-transform: capitalize;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Quick Summary */
	.quick-summary {
		grid-column: 1 / -1;
	}

	.quick-summary h2 {
		font-size: 1.25rem;
		font-weight: 500;
		color: #343a40;
		margin: 0 0 1.5rem 0;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.summary-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		border: 1px solid #e9ecef;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.summary-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-content {
		display: flex;
		flex-direction: column;
	}

	.card-number {
		font-size: 2rem;
		font-weight: 600;
		color: #212529;
		line-height: 1;
	}

	.card-label {
		color: #6c757d;
		font-size: 0.9rem;
		margin-top: 0.25rem;
	}

	/* Status Sections */
	.status-section {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		border: 1px solid #e9ecef;
	}

	.status-section h2 {
		font-size: 1.25rem;
		font-weight: 500;
		color: #343a40;
		margin: 0 0 1.5rem 0;
	}

	.status-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.status-bar {
		flex: 1;
		height: 8px;
		background: #f1f3f4;
		border-radius: 4px;
		overflow: hidden;
	}

	.status-fill {
		height: 100%;
		background: #6c757d;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.status-fill.active {
		background: #007bff;
	}

	.status-fill.completed {
		background: #28a745;
	}

	.status-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		min-width: 80px;
	}

	.status-number {
		font-size: 1.5rem;
		font-weight: 600;
		color: #212529;
		line-height: 1;
	}

	.status-label {
		color: #6c757d;
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}

	/* Project Overview */
	.project-overview {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.stat-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.circle-progress {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: conic-gradient(
			#28a745 0deg,
			#28a745 calc(var(--progress) * 3.6deg),
			#f1f3f4 calc(var(--progress) * 3.6deg)
		);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.circle-progress::before {
		content: '';
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: white;
		position: absolute;
	}

	.circle-text {
		font-size: 1rem;
		font-weight: 600;
		color: #212529;
		z-index: 1;
	}

	.circle-label {
		color: #6c757d;
		font-size: 0.8rem;
		text-align: center;
	}

	.project-breakdown {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.breakdown-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9rem;
		color: #495057;
	}

	.breakdown-dot {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Calendar */
	.calendar-section {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		border: 1px solid #e9ecef;
	}

	.calendar-section h2 {
		font-size: 1.25rem;
		font-weight: 500;
		color: #343a40;
		margin: 0 0 1.5rem 0;
	}

	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.nav-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6c757d;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.nav-btn:hover {
		background: #f8f9fa;
		color: #212529;
	}

	.month-year {
		font-weight: 500;
		color: #212529;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
	}

	.day-header {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 500;
		color: #6c757d;
		padding: 0.5rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.calendar-day {
		aspect-ratio: 1;
		border: none;
		background: none;
		font-size: 0.85rem;
		color: #495057;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.calendar-day:hover {
		background: #f8f9fa;
	}

	.calendar-day.other-month {
		color: #adb5bd;
	}

	.calendar-day.today {
		background: #212529;
		color: white;
		font-weight: 500;
	}

	.calendar-day.selected {
		background: #007bff;
		color: white;
	}

	.calendar-day.today.selected {
		background: #212529;
	}

	/* Alert */
	.alert {
		background: #fff3cd;
		color: #856404;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.85rem;
		margin-top: 1rem;
		border: 1px solid #ffeaa7;
		display: flex;
		align-items: center;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		.greeting h1 {
			font-size: 2rem;
		}

		.grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.summary-cards {
			grid-template-columns: 1fr;
		}

		.project-overview {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
