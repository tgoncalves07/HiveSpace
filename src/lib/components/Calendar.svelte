<!-- src/lib/components/Calendar.svelte -->
<script>
	import { onMount } from 'svelte';
	import { Calendar } from 'lucide-svelte';
	import { reminders } from '$lib/stores/reminders';

	let currentDate = new Date();
	let selectedDate = null;
	let showReminderModal = false;
	let reminderText = '';
	let reminderTime = '09:00';

	// Funções de navegação
	function previousMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
	}

	function getCalendarDays() {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days = [];
		const currentDateObj = new Date(startDate);

		for (let i = 0; i < 42; i++) {
			days.push({
				date: new Date(currentDateObj),
				isCurrentMonth: currentDateObj.getMonth() === month,
				isToday: isToday(currentDateObj),
				hasReminder: hasReminderOnDate(currentDateObj)
			});
			currentDateObj.setDate(currentDateObj.getDate() + 1);
		}

		return days;
	}

	function isToday(date) {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}

	function hasReminderOnDate(date) {
		const dateKey = formatDateKey(date);
		return $reminders[dateKey] && $reminders[dateKey].length > 0;
	}

	function formatDateKey(date) {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	function formatDisplayDate(date) {
		return date.toLocaleDateString('pt-BR', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function selectDate(date) {
		selectedDate = date;
		showReminderModal = true;
		reminderText = '';
		reminderTime = '09:00';
	}

	function addReminder() {
		if (!reminderText.trim() || !selectedDate) return;

		const dateKey = formatDateKey(selectedDate);

		// Atualiza a store
		reminders.update((r) => {
			const updated = { ...r };
			if (!updated[dateKey]) {
				updated[dateKey] = [];
			}
			updated[dateKey].push({
				id: Date.now(),
				text: reminderText.trim(),
				time: reminderTime
			});
			return updated;
		});

		closeModal();
	}

	function removeReminder(date, reminderId) {
		const dateKey = formatDateKey(date);

		// Atualiza a store
		reminders.update((r) => {
			if (!r[dateKey]) return r;
			const updated = { ...r };
			updated[dateKey] = updated[dateKey].filter((r) => r.id !== reminderId);
			if (updated[dateKey].length === 0) {
				delete updated[dateKey];
			}
			return updated;
		});
	}

	function closeModal() {
		showReminderModal = false;
		selectedDate = null;
	}

	function getRemindersByDate(date) {
		const dateKey = formatDateKey(date);
		return $reminders[dateKey] || [];
	}

	function getMonthlyReminders() {
		const month = currentDate.getMonth();
		const year = currentDate.getFullYear();
		const monthlyReminders = [];

		// Itera sobre os lembretes na store
		for (const [dateKey, remindersList] of Object.entries($reminders)) {
			const [y, m] = dateKey.split('-').map(Number);
			if (y === year && m - 1 === month) {
				const date = new Date(y, m - 1, dateKey.split('-')[2]);
				monthlyReminders.push({
					date,
					reminders: remindersList
				});
			}
		}
		return monthlyReminders;
	}

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

<div class="calendar-container">
	<!-- Header idêntico ao da página de tarefas -->
	<header class="page-header">
		<h1>
			<Calendar size={24} />
			Meu Calendário
		</h1>
	</header>

	<!-- Controles do calendário -->
	<div class="calendar-header">
		<button on:click={previousMonth} class="btn-secondary">‹</button>
		<h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
		<button on:click={nextMonth} class="btn-secondary">›</button>
	</div>

	<!-- Grade do calendário -->
	<div class="calendar-grid">
		{#each dayNames as dayName}
			<div class="day-header">{dayName}</div>
		{/each}

		{#each getCalendarDays() as day}
			<div
				class="day-cell"
				class:current-month={day.isCurrentMonth}
				class:other-month={!day.isCurrentMonth}
				class:today={day.isToday}
				class:has-reminder={day.hasReminder}
				on:click={() => day.isCurrentMonth && selectDate(day.date)}
			>
				<span class="day-number">{day.date.getDate()}</span>
				{#if day.hasReminder}
					<div class="reminder-indicator"></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Lembretes do mês -->
	<div class="monthly-reminders">
		<h3>Lembretes de {monthNames[currentDate.getMonth()]}</h3>
		{#if getMonthlyReminders().length > 0}
			{#each getMonthlyReminders() as dayReminders (dayReminders.date)}
				<div class="reminder-group">
					<h4>{formatDisplayDate(dayReminders.date)}</h4>
					{#each dayReminders.reminders as reminder (reminder.id)}
						<div class="reminder-item">
							<span class="time">{reminder.time}</span>
							<span class="text">{reminder.text}</span>
							<button
								on:click|stopPropagation={() => removeReminder(dayReminders.date, reminder.id)}
								class="btn-icon danger"
							>
								×
							</button>
						</div>
					{/each}
				</div>
			{/each}
		{:else}
			<p class="empty">Nenhum lembrete para este mês</p>
		{/if}
	</div>

	<!-- Modal de lembrete -->
	{#if showReminderModal}
		<div class="modal-overlay" on:click={closeModal}>
			<div class="modal-content" on:click|stopPropagation>
				<div class="modal-header">
					<h3>Novo Lembrete</h3>
					<button class="close-btn" on:click={closeModal}>×</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label>Data: {formatDisplayDate(selectedDate)}</label>
					</div>
					<div class="form-group">
						<label>Horário:</label>
						<input type="time" bind:value={reminderTime} class="input" />
					</div>
					<div class="form-group">
						<label>Descrição:</label>
						<input
							type="text"
							bind:value={reminderText}
							placeholder="Digite seu lembrete..."
							class="input"
						/>
					</div>
				</div>
				<div class="modal-actions">
					<button on:click={addReminder} class="btn-primary">Salvar</button>
					<button on:click={closeModal} class="btn-secondary">Cancelar</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--primary: #333;
		--secondary: #555;
		--background: #f5f5f5;
		--text: #222;
		--border-color: #ddd;
		--light-gray: #e0e0e0;
		--reminder-color: #fff3b0; /* Nova cor para fundo de lembrete */
		--reminder-border: #ffd54f; /* Cor da borda para lembrete */
		--reminder-indicator: #ff9800; /* Cor do indicador de lembrete */
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.page-header h1 {
		font-size: 28px;
		color: var(--text);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.calendar-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.5rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
	}

	.btn-secondary {
		background: var(--light-gray);
		color: var(--text);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-secondary:hover {
		background: #e0e0e0;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1px;
		background: var(--border-color);
		margin-bottom: 2rem;
	}

	.day-header {
		background: var(--background);
		padding: 1rem;
		text-align: center;
		font-weight: 500;
		color: var(--text);
		border-bottom: 2px solid var(--border-color);
	}

	.day-cell {
		background: white;
		min-height: 100px;
		padding: 0.5rem;
		position: relative;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid var(--border-color);
	}

	.day-cell:hover {
		background: var(--background);
	}

	.day-cell.other-month {
		background: var(--background);
		color: #999;
	}

	.day-cell.today {
		background: var(--light-gray);
		font-weight: 600;
		border: 2px solid var(--primary);
	}

	/* Estilo para dias com lembretes */
	.day-cell.has-reminder {
		background: linear-gradient(to bottom right, var(--reminder-color) 0%, #ffecb3 100%);
		border-right: 2px solid var(--reminder-border);
		border-bottom: 2px solid var(--reminder-border);
	}

	.day-cell.has-reminder:hover {
		background: linear-gradient(to bottom right, #ffecb3 0%, #ffe082 100%);
	}

	.day-cell.other-month.has-reminder {
		background: linear-gradient(
			to bottom right,
			rgba(255, 243, 176, 0.5) 0%,
			rgba(255, 236, 153, 0.6) 100%
		);
	}

	.day-number {
		display: block;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
	}

	.reminder-indicator {
		width: 8px;
		height: 8px;
		background: var(--reminder-indicator);
		border-radius: 50%;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		box-shadow:
			0 0 0 2px white,
			0 0 0 3px var(--reminder-indicator);
	}

	.monthly-reminders {
		border-top: 1px solid var(--border-color);
		padding-top: 2rem;
	}

	.monthly-reminders h3 {
		font-size: 1.25rem;
		margin-bottom: 1.5rem;
		color: var(--text);
	}

	.reminder-group {
		margin-bottom: 1.5rem;
	}

	.reminder-group h4 {
		font-size: 0.9rem;
		color: #666;
		margin: 0 0 0.5rem 0;
		font-weight: 500;
	}

	.reminder-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		background: var(--background);
		border-radius: 4px;
		border: 1px solid var(--border-color);
	}

	.reminder-item .time {
		font-size: 0.85rem;
		color: #666;
		min-width: 60px;
	}

	.btn-icon {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon.danger:hover {
		color: var(--primary);
	}

	.empty {
		color: #999;
		font-style: italic;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: grid;
		place-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		width: 90%;
		max-width: 400px;
		border: 1px solid var(--border-color);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text);
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--text);
	}

	.input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
	}

	.modal-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		justify-content: flex-end;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
	}

	@media (max-width: 768px) {
		.calendar-container {
			padding: 1rem;
		}

		.page-header h1 {
			font-size: 24px;
		}

		.day-cell {
			min-height: 80px;
		}

		.reminder-item {
			flex-wrap: wrap;
			gap: 0.5rem;
			padding: 0.5rem;
		}
	}
</style>
