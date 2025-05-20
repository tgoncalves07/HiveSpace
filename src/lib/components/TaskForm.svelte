<script lang="ts">
	import { tarefas, projetos } from '../stores/tarefas';

	let novaTarefa: Omit<Tarefa, 'id' | 'dataCriacao'> = {
		descricao: '',
		projetoId: undefined,
		prioridade: 'media',
		status: 'Pendente',
		dataPrevisao: '',
		dataVencimento: ''
	};
</script>

<form class="bg-white p-4 rounded shadow">
	<h2 class="text-xl font-bold mb-3">Nova Tarefa</h2>

	<input
		type="text"
		bind:value={novaTarefa.descricao}
		placeholder="Descrição da tarefa"
		class="input mb-2"
	/>

	<select bind:value={novaTarefa.projetoId} class="input mb-2">
		<option value={undefined}>Sem projeto</option>
		{#each $projetos as projeto}
			<option value={projeto.id}>{projeto.nome}</option>
		{/each}
	</select>

	<select bind:value={novaTarefa.prioridade} class="input mb-2">
		<option value="baixa">Baixa</option>
		<option value="media">Média</option>
		<option value="alta">Alta</option>
	</select>

	<input type="date" bind:value={novaTarefa.dataVencimento} class="input mb-2" />

	<button on:click|preventDefault={() => tarefas.adicionarTarefa(novaTarefa)} class="btn-primary">
		Adicionar Tarefa
	</button>
</form>
