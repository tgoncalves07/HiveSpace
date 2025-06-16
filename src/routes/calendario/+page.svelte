<script>
	import Calendar from '$lib/components/Calendar.svelte';
</script>

<main>
	<Calendar />
</main>

<style global>
	body {
		margin: 0;
		background: #f5f5f5;
	}

	.calendar-container {
		border: none;
		box-shadow: none;
		border-radius: 0;
		min-height: 100vh;
		padding: 2rem;
		max-width: none !important;
	}
</style>
