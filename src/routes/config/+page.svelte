<!-- src/routes/calendario/+page.svelte -->
<script lang="ts">
	import { derived } from 'svelte/store';
	import { Calendar as CalendarIcon, Trash2 as TrashIcon, X as XIcon } from 'lucide-svelte';
	import { reminders, type ReminderItem } from '../../lib/stores/reminders';
	import { configuracoes, type Idioma as AppIdioma } from '../../lib/stores/pageStore';

	// --- DICIONÁRIO DE TRADUÇÕES PARA O CALENDÁRIO ---
	// objeto que guarda todas as traduções do componente
	const calendarTranslations = {
		pt: {
			'calendar.titulo': ' O Meu Calendário',
			'calendar.meses.janeiro': 'Janeiro',
			'calendar.meses.fevereiro': 'Fevereiro',
			'calendar.meses.marco': 'Março',
			'calendar.meses.abril': 'Abril',
			'calendar.meses.maio': 'Maio',
			'calendar.meses.junho': 'Junho',
			'calendar.meses.julho': 'Julho',
			'calendar.meses.agosto': 'Agosto',
			'calendar.meses.setembro': 'Setembro',
			'calendar.meses.outubro': 'Outubro',
			'calendar.meses.novembro': 'Novembro',
			'calendar.meses.dezembro': 'Dezembro',
			'calendar.dias.dom': 'Dom',
			'calendar.dias.seg': 'Seg',
			'calendar.dias.ter': 'Ter',
			'calendar.dias.qua': 'Qua',
			'calendar.dias.qui': 'Qui',
			'calendar.dias.sex': 'Sex',
			'calendar.dias.sab': 'Sáb',
			'calendar.lembretesDe': 'Lembretes de {mes}',
			'calendar.nenhumLembrete': 'Nenhum lembrete para este mês.',
			'calendar.modal.novoLembrete': 'Novo Lembrete',
			'calendar.modal.dataSelecionada': 'Data Selecionada',
			'calendar.modal.horario': 'Horário',
			'calendar.modal.descricao': 'Descrição do Lembrete',
			'calendar.modal.placeholderDescricao': 'Ex: Reunião com equipe',
			'calendar.modal.salvar': 'Salvar Lembrete',
			'calendar.modal.cancelar': 'Cancelar',
			'calendar.modal.fechar': 'Fechar modal',
			'calendar.modal.excluirLembreteAria': 'Excluir lembrete',
			'calendar.selecionarDataAria': 'Selecionar data {data}',
			'calendar.mesAnterior': 'Mês Anterior',
			'calendar.proximoMes': 'Próximo Mês'
		},
		en: {
			'calendar.titulo': 'My Calendar',
			'calendar.meses.janeiro': 'January',
			'calendar.meses.fevereiro': 'February',
			'calendar.meses.marco': 'March',
			'calendar.meses.abril': 'April',
			'calendar.meses.maio': 'May',
			'calendar.meses.junho': 'June',
			'calendar.meses.julho': 'July',
			'calendar.meses.agosto': 'August',
			'calendar.meses.setembro': 'September',
			'calendar.meses.outubro': 'October',
			'calendar.meses.novembro': 'November',
			'calendar.meses.dezembro': 'December',
			'calendar.dias.dom': 'Sun',
			'calendar.dias.seg': 'Mon',
			'calendar.dias.ter': 'Tue',
			'calendar.dias.qua': 'Wed',
			'calendar.dias.qui': 'Thu',
			'calendar.dias.sex': 'Fri',
			'calendar.dias.sab': 'Sat',
			'calendar.lembretesDe': 'Reminders for {mes}',
			'calendar.nenhumLembrete': 'No reminders for this month.',
			'calendar.modal.novoLembrete': 'New Reminder',
			'calendar.modal.dataSelecionada': 'Selected Date',
			'calendar.modal.horario': 'Time',
			'calendar.modal.descricao': 'Reminder Description',
			'calendar.modal.placeholderDescricao': 'E.g., Team meeting',
			'calendar.modal.salvar': 'Save Reminder',
			'calendar.modal.cancelar': 'Cancel',
			'calendar.modal.fechar': 'Close modal',
			'calendar.modal.excluirLembreteAria': 'Delete reminder',
			'calendar.selecionarDataAria': 'Select date {data}',
			'calendar.mesAnterior': 'Previous Month',
			'calendar.proximoMes': 'Next Month'
		}
	};

	// cria a função de tradução 't' que reage a mudanças de idioma
	const t = derived(configuracoes, ($cfg) => {
		return (key: string, replacements?: Record<string, string | number | undefined>): string => {
			const selectedLang = $cfg.idioma;
			let langDict = calendarTranslations[selectedLang as keyof typeof calendarTranslations];

			if (!langDict) {
				langDict = calendarTranslations.pt;
			}

			let text = langDict?.[key] || calendarTranslations.pt?.[key] || key;

			if (replacements) {
				for (const k in replacements) {
					const replacementValue = replacements[k];
					if (replacementValue !== undefined) {
						text = text.replace(new RegExp(`{${k}}`, 'g'), String(replacementValue));
					}
				}
			}
			return text;
		};
	});

	// data reativa que controla o mês/ano exibido
	let currentDate = new Date();
	// data selecionada pelo usuário para adicionar um lembrete
	let selectedDate: Date | null = null;
	// controla a visibilidade do modal de lembretes
	let showReminderModal = false;
	// inputs do novo lembrete
	let reminderText = '';
	let reminderTime = '09:00';

	// nomes de meses e dias que mudam com o idioma
	$: monthNamesTranslated = [
		$t('calendar.meses.janeiro'),
		$t('calendar.meses.fevereiro'),
		$t('calendar.meses.marco'),
		$t('calendar.meses.abril'),
		$t('calendar.meses.maio'),
		$t('calendar.meses.junho'),
		$t('calendar.meses.julho'),
		$t('calendar.meses.agosto'),
		$t('calendar.meses.setembro'),
		$t('calendar.meses.outubro'),
		$t('calendar.meses.novembro'),
		$t('calendar.meses.dezembro')
	];
	$: dayNamesTranslated = [
		$t('calendar.dias.dom'),
		$t('calendar.dias.seg'),
		$t('calendar.dias.ter'),
		$t('calendar.dias.qua'),
		$t('calendar.dias.qui'),
		$t('calendar.dias.sex'),
		$t('calendar.dias.sab')
	];

	// função para ir para o mês anterior
	function previousMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
	}

	// função para ir para o próximo mês
	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
	}

	// define como é um objeto de dia no calendário
	interface CalendarDay {
		date: Date;
		isCurrentMonth: boolean;
		isToday: boolean;
		hasReminder: boolean;
	}

	// gera os dias para preencher a grelha do calendário
	function getCalendarDays(): CalendarDay[] {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDayOfMonth = new Date(year, month, 1);
		const startDate = new Date(firstDayOfMonth);
		startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
		const days: CalendarDay[] = [];
		const dateIterator = new Date(startDate);
		for (let i = 0; i < 42; i++) {
			days.push({
				date: new Date(dateIterator),
				isCurrentMonth: dateIterator.getMonth() === month,
				isToday: isToday(dateIterator),
				hasReminder: hasReminderOnDate(dateIterator)
			});
			dateIterator.setDate(dateIterator.getDate() + 1);
		}
		return days;
	}

	// verifica se uma data é hoje
	function isToday(date: Date): boolean {
		const today = new Date();
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		);
	}

	// formata a data para uma chave de texto (ex: 2024-05-21)
	function formatDateKey(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
			date.getDate()
		).padStart(2, '0')}`;
	}

	// verifica se existe um lembrete numa data
	function hasReminderOnDate(date: Date): boolean {
		const dateKey = formatDateKey(date);
		return $reminders[dateKey] && $reminders[dateKey].length > 0;
	}

	// formata a data para ser mais legível para o usuário
	function formatDisplayDate(date: Date | null): string {
		if (!date) return '';
		const currentLang: AppIdioma = $configuracoes.idioma || 'pt';
		const localeForDate = currentLang.split('-')[0];
		return date.toLocaleDateString(localeForDate, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// abre o modal para adicionar um novo lembrete
	function selectDateForReminder(date: Date) {
		selectedDate = date;
		showReminderModal = true;
		reminderText = '';
		reminderTime = '09:00';
	}

	// adiciona um novo lembrete ao store global
	function addReminder() {
		if (!reminderText.trim() || !selectedDate) return;
		const dateKey = formatDateKey(selectedDate);
		reminders.update((currentReminders) => {
			const updatedReminders = { ...currentReminders };
			if (!updatedReminders[dateKey]) updatedReminders[dateKey] = [];
			updatedReminders[dateKey].push({
				id: Date.now().toString(),
				text: reminderText.trim(),
				time: reminderTime,
				completed: false
			});
			return updatedReminders;
		});
		closeReminderModal();
	}

	// remove um lembrete do store global
	function removeReminder(date: Date, reminderId: string) {
		const dateKey = formatDateKey(date);
		reminders.update((currentReminders) => {
			if (!currentReminders[dateKey]) return currentReminders;
			const updatedReminders = { ...currentReminders };
			updatedReminders[dateKey] = updatedReminders[dateKey].filter((r) => r.id !== reminderId);
			if (updatedReminders[dateKey].length === 0) delete updatedReminders[dateKey];
			return updatedReminders;
		});
	}

	// fecha o modal e limpa os campos
	function closeReminderModal() {
		showReminderModal = false;
		selectedDate = null;
		reminderText = '';
		reminderTime = '09:00';
	}

	// define como os lembretes são agrupados por dia
	interface MonthlyReminderGroup {
		date: Date;
		reminders: ReminderItem[];
	}

	// busca os lembretes para uma data específica
	function getRemindersForDate(date: Date): ReminderItem[] {
		const dateKey = formatDateKey(date);
		return $reminders[dateKey] || [];
	}

	// busca e agrupa todos os lembretes do mês para a lista
	function getMonthlyReminders(): MonthlyReminderGroup[] {
		const month = currentDate.getMonth();
		const year = currentDate.getFullYear();
		const monthly: MonthlyReminderGroup[] = [];
		for (const [dateKey, remindersList] of Object.entries($reminders)) {
			const [y, m, d] = dateKey.split('-').map(Number);
			if (y === year && m - 1 === month) {
				monthly.push({ date: new Date(y, m - 1, d), reminders: remindersList as ReminderItem[] });
			}
		}
		return monthly.sort((a, b) => a.date.getDate() - b.date.getDate());
	}
</script>

<!-- Resto do HTML e CSS, que já estava correto -->
<!-- container principal do componente -->
<div class="calendar-component-container">
	<header class="page-header-style">
		<h1><CalendarIcon size={28} /> {$t('calendar.titulo')}</h1>
	</header>

	<!-- controlos para navegar entre os meses -->
	<div class="calendar-controls">
		<button
			on:click={previousMonth}
			class="button secondary-button month-nav-button"
			aria-label={$t('calendar.mesAnterior')}>‹</button
		>
		<h2 class="current-month-year">
			{monthNamesTranslated[currentDate.getMonth()]}
			{currentDate.getFullYear()}
		</h2>
		<button
			on:click={nextMonth}
			class="button secondary-button month-nav-button"
			aria-label={$t('calendar.proximoMes')}>›</button
		>
	</div>

	<!-- grelha do calendário -->
	<div class="calendar-grid-layout">
		<!-- cabeçalhos com os nomes dos dias da semana -->
		{#each dayNamesTranslated as dayName (dayName)}
			<div class="day-name-header">{dayName}</div>
		{/each}

		<!-- loop para criar as células de cada dia do mês -->
		{#each getCalendarDays() as day (day.date.toISOString())}
			<div
				class="day-cell-style"
				class:is-current-month={day.isCurrentMonth}
				class:is-other-month={!day.isCurrentMonth}
				class:is-today={day.isToday}
				class:has-reminder-style={day.hasReminder && day.isCurrentMonth}
				on:click={() => day.isCurrentMonth && selectDateForReminder(day.date)}
				on:keydown={(e) =>
					day.isCurrentMonth && e.key === 'Enter' && selectDateForReminder(day.date)}
				tabindex={day.isCurrentMonth ? 0 : -1}
				role="button"
				aria-label={$t('calendar.selecionarDataAria', { data: day.date.getDate() })}
			>
				<span class="day-number-display">{day.date.getDate()}</span>
				<!-- indicador visual se o dia tem um lembrete -->
				{#if day.hasReminder && day.isCurrentMonth}
					<div class="reminder-dot-indicator"></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- secção para exibir a lista de lembretes do mês -->
	<div class="reminders-section">
		<h3 class="section-title">
			{$t('calendar.lembretesDe', { mes: monthNamesTranslated[currentDate.getMonth()] })}
		</h3>
		<!-- verifica se existem lembretes para mostrar -->
		{#if getMonthlyReminders().length > 0}
			<ul class="reminders-list">
				<!-- loop para mostrar cada grupo de lembretes por dia -->
				{#each getMonthlyReminders() as dayReminders (dayReminders.date.toISOString())}
					<li class="reminder-day-group">
						<h4 class="reminder-date-header">{formatDisplayDate(dayReminders.date)}</h4>
						<ul class="reminders-for-day">
							<!-- loop para mostrar cada lembrete individual -->
							{#each dayReminders.reminders as reminder (reminder.id)}
								<li class="reminder-item-style">
									<span class="reminder-time">{reminder.time}</span>
									<span class="reminder-text">{reminder.text}</span>
									<button
										on:click|stopPropagation={() => removeReminder(dayReminders.date, reminder.id)}
										class="icon-button danger"
										aria-label={$t('calendar.modal.excluirLembreteAria')}
									>
										<TrashIcon size={16} />
									</button>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		{:else}
			<!-- mensagem se não houver lembretes -->
			<p class="empty-message">{$t('calendar.nenhumLembrete')}</p>
		{/if}
	</div>

	<!-- modal para adicionar um novo lembrete, só aparece se showReminderModal for true -->
	{#if showReminderModal}
		<div class="modal-backdrop" on:click={closeReminderModal}>
			<div class="modal-dialog" on:click|stopPropagation>
				<div class="modal-dialog-header">
					<h2 class="modal-title">{$t('calendar.modal.novoLembrete')}</h2>
					<button
						class="close-modal-button"
						on:click={closeReminderModal}
						aria-label={$t('calendar.modal.fechar')}
					>
						<XIcon size={20} />
					</button>
				</div>
				<!-- formulário para criar o lembrete -->
				<form class="modal-form" on:submit|preventDefault={addReminder}>
					<div class="form-input-group">
						<label for="reminder-date-display">{$t('calendar.modal.dataSelecionada')}</label>
						<input
							type="text"
							id="reminder-date-display"
							readonly
							value={formatDisplayDate(selectedDate)}
							class="input-field readonly-display"
						/>
					</div>
					<div class="form-input-group">
						<label for="reminder-time-input">{$t('calendar.modal.horario')}</label>
						<input
							type="time"
							id="reminder-time-input"
							bind:value={reminderTime}
							class="input-field"
						/>
					</div>
					<div class="form-input-group required-field">
						<label for="reminder-text-input">{$t('calendar.modal.descricao')}</label>
						<input
							type="text"
							id="reminder-text-input"
							bind:value={reminderText}
							placeholder={$t('calendar.modal.placeholderDescricao')}
							class="input-field"
							required
						/>
					</div>
					<div class="modal-dialog-actions">
						<button type="submit" class="button primary-button"
							>{$t('calendar.modal.salvar')}</button
						>
						<button type="button" class="button secondary-button" on:click={closeReminderModal}
							>{$t('calendar.modal.cancelar')}</button
						>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>

<style>
	/* variáveis de cor locais para este componente */
	:root {
		--local-reminder-background: #fff3b0;
		--local-reminder-border: #ffd54f;
		--local-reminder-indicator: #ff9800;
	}
	.calendar-component-container {
		background-color: var(--content-background-color);
		color: var(--app-text-color);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.page-header-style {
		display: flex;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	.page-header-style h1 {
		font-size: clamp(1.5rem, 4vw, 1.8rem);
		color: var(--app-text-color);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-weight: 600;
	}
	.calendar-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
	}
	.current-month-year {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--app-text-color);
		text-align: center;
		flex-grow: 1;
	}
	.month-nav-button {
		padding: 0.5rem 0.8rem;
		font-size: 1.2rem;
	}

	/* estilos para a grelha do calendário */
	.calendar-grid-layout {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		border-top: 1px solid var(--border-color);
		border-left: 1px solid var(--border-color);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.day-name-header {
		background-color: var(--card-background-color);
		padding: 0.75rem 0.5rem;
		text-align: center;
		font-weight: 500;
		font-size: 0.85rem;
		color: var(--text-color-muted, var(--app-text-color));
		border-right: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
	}
	.day-cell-style {
		background-color: var(--card-background-color);
		min-height: 100px;
		padding: 0.5rem;
		position: relative;
		cursor: pointer;
		transition: background-color 0.2s ease;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		border-right: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
	}

	.day-cell-style:hover,
	.day-cell-style:focus-visible {
		background-color: var(--border-color);
		outline: 2px solid var(--primary-color);
		outline-offset: -2px;
	}
	.day-cell-style.is-other-month {
		background-color: var(--content-background-color);
		color: var(--text-color-muted, var(--app-text-color));
		cursor: default;
	}
	.day-cell-style.is-other-month:hover,
	.day-cell-style.is-other-month:focus-visible {
		background-color: var(--content-background-color);
		outline: none;
	}
	.day-cell-style.is-today {
		background-color: color-mix(in srgb, var(--primary-color) 15%, var(--card-background-color));
		font-weight: 600;
		border-right: 1px solid var(--primary-color);
		border-bottom: 1px solid var(--primary-color);
	}
	.day-cell-style.is-today .day-number-display {
		color: var(--primary-color);
		font-weight: bold;
	}
	.day-cell-style.has-reminder-style {
		background-color: var(--local-reminder-background);
	}
	.day-cell-style.has-reminder-style:hover {
		background-color: color-mix(in srgb, var(--local-reminder-background) 80%, black);
	}
	.day-number-display {
		display: inline-block;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
		padding: 0.1rem 0.3rem;
		border-radius: var(--radius);
	}
	.reminder-dot-indicator {
		width: 7px;
		height: 7px;
		background-color: var(--local-reminder-indicator);
		border-radius: 50%;
		position: absolute;
		top: 6px;
		right: 6px;
	}
	/* estilos para a lista de lembretes */
	.section-title {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--app-text-color);
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	.reminders-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.reminder-date-header {
		font-size: 0.95rem;
		color: var(--text-color-muted, var(--app-text-color));
		margin: 0 0 0.5rem 0;
		font-weight: 500;
	}
	.reminders-for-day {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.reminder-item-style {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.8rem;
		background-color: var(--card-background-color);
		border-radius: var(--radius);
		border: 1px solid var(--border-color);
		border-left: 3px solid var(--local-reminder-border);
	}
	.reminder-time {
		font-size: 0.85rem;
		color: var(--text-color-muted, var(--app-text-color));
		min-width: 50px;
		font-weight: 500;
	}
	.reminder-text {
		flex-grow: 1;
		font-size: 0.9rem;
	}
	.empty-message {
		color: var(--text-color-muted, var(--app-text-color));
		font-style: italic;
		padding: 1rem;
		text-align: center;
		background-color: var(--content-background-color);
		border-radius: var(--radius);
	}
	/* estilos para o modal */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: color-mix(in srgb, var(--app-background-color) 10%, black 60%);
		display: grid;
		place-items: center;
		z-index: 1000;
		padding: 1rem;
	}
	.modal-dialog {
		background-color: var(--card-background-color);
		padding: clamp(1.25rem, 4vw, 1.75rem);
		border-radius: var(--radius);
		width: 100%;
		max-width: 450px;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-color);
	}
	.modal-dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--app-text-color);
		margin: 0;
	}
	.close-modal-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text-color-muted, var(--app-text-color));
		padding: 0 0.25rem;
		line-height: 1;
	}
	.close-modal-button:hover {
		color: var(--app-text-color);
	}
	.modal-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.form-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.form-input-group label {
		font-weight: 500;
		color: var(--app-text-color);
		display: block;
		font-size: 0.9rem;
	}
	.form-input-group.required-field label::after {
		content: '*';
		color: var(--danger-color);
		margin-left: 0.2rem;
	}
	.input-field {
		width: 100%;
		padding: 0.65rem 0.85rem;
		border: 1px solid var(--input-border-color);
		border-radius: var(--radius);
		font-size: 0.95rem;
		font-family: inherit;
		background-color: var(--input-background-color);
		color: var(--app-text-color);
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}
	.input-field:focus {
		border-color: var(--primary-color);
		outline: none;
		box-shadow: 0 0 0 3px var(--input-focus-ring-color);
	}
	.input-field.readonly-display {
		background-color: var(--content-background-color);
		color: var(--text-color-muted);
		cursor: default;
	}
	.modal-dialog-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1rem;
	}
	/* estilos gerais para botões */
	.button {
		padding: 0.65rem 1.25rem;
		border-radius: var(--radius);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 500;
		font-size: 0.9rem;
		text-decoration: none;
		border: 1px solid transparent;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			opacity 0.2s ease;
	}
	.button:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}
	.button.primary-button {
		background-color: var(--primary-color);
		color: var(--primary-color-text);
		border-color: var(--primary-color);
	}
	.button.primary-button:hover {
		background-color: var(--primary-color-hover);
		border-color: var(--primary-color-hover);
	}
	.button.secondary-button {
		background-color: var(--card-background-color);
		color: var(--app-text-color);
		border-color: var(--border-color);
	}
	.button.secondary-button:hover {
		background-color: var(--border-color);
	}
	.icon-button {
		background: none;
		border: none;
		padding: 0.3rem;
		cursor: pointer;
		color: var(--text-color-muted, var(--app-text-color));
		display: inline-flex;
		border-radius: var(--radius);
	}
	.icon-button:hover {
		color: var(--primary-color);
		background-color: var(--border-color);
	}
	.icon-button.danger:hover {
		color: var(--danger-color);
		background-color: color-mix(in srgb, var(--danger-color) 15%, transparent);
	}
	/* estilos para ecrãs mais pequenos (mobile) */
	@media (max-width: 768px) {
		.calendar-component-container {
			padding: 1rem;
			gap: 1rem;
		}
		.page-header-style h1 {
			font-size: 1.4rem;
		}
		.current-month-year {
			font-size: 1.1rem;
		}
		.day-cell-style {
			min-height: 70px;
			padding: 0.3rem;
			font-size: 0.8rem;
		}
		.day-name-header {
			padding: 0.5rem 0.25rem;
			font-size: 0.75rem;
		}
		.reminder-item-style {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.3rem;
		}
		.modal-dialog {
			max-width: calc(100% - 2rem);
		}
		.modal-dialog-actions {
			flex-direction: column-reverse;
		}
		.modal-dialog-actions .button {
			width: 100%;
		}
	}
</style>
