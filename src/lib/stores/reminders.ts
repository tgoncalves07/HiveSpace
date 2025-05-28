//stores/reminders.js
import { writable } from 'svelte/store';

// Função para carregar os lembretes do localStorage
const loadReminders = () => {
	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem('reminders');
		return saved ? JSON.parse(saved) : {};
	}
	return {};
};

// Cria a store com persistência no localStorage
export const reminders = writable(loadReminders(), (set) => {
	// Atualiza o localStorage sempre que a store for modificada
	const unsubscribe = reminders.subscribe((value) => {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('reminders', JSON.stringify(value));
		}
	});
	return unsubscribe;
});
