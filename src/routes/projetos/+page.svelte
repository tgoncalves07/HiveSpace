<script lang="ts">
    import { projetos } from '$lib/stores/projetos';
    
    const colunas = ['Ideia', 'Pendente', 'Em Processo', 'Finalizado'] as const;
    type Status = typeof colunas[number];
    
    interface Projeto {
        id: number;
        nome: string;
        descricao: string;
        status: Status;
    }

    let draggedId: number | null = null;
    let editingId: number | null = null;

    function handleDragStart(event: DragEvent, projeto: Projeto) {
        draggedId = projeto.id;
    }

    function handleDrop(event: DragEvent, status: Status) {
        event.preventDefault();
        projetos.update((items) => {
            const projeto = items.find((p) => p.id === draggedId);
            if (projeto) {
                projeto.status = status;
            }
            return [...items];
        });
        draggedId = null;
    }

    function addProject() {
        projetos.update((items) => {
            const newProject: Projeto = {
                id: items.length + 1,
                nome: `Projeto ${items.length + 1}`,
                descricao: 'Nova descrição',
                status: 'Ideia'
            };
            return [...items, newProject];
        });
    }

    function toggleEdit(projeto: Projeto) {
        editingId = editingId === projeto.id ? null : projeto.id;
    }

    function updateProjectField(projetoId: number, field: keyof Projeto, value: string) {
        projetos.update((items) => {
            const projeto = items.find((p) => p.id === projetoId);
            if (projeto) {
                (projeto[field] as any) = value;
            }
            return [...items];
        });
    }
</script>

<div class="container">
    <div class="header">
        <h1>Projetos</h1>
        <button class="add-button" on:click={addProject}>+ Novo Projeto</button>
    </div>

    <div class="kanban">
        {#each colunas as status}
            <div 
                class="coluna" 
                on:dragover|preventDefault 
                on:drop={(event) => handleDrop(event, status)}
                role="region"
                aria-label={`Coluna ${status}`}
            >
                <h2>{status}</h2>

                {#each $projetos.filter((p) => p.status === status) as projeto (projeto.id)}
                    <div
                        class="project-card"
                        draggable="true"
                        on:dragstart={(event) => handleDragStart(event, projeto)}
                        role="button"
                        aria-label={`Arrastar projeto ${projeto.nome}`}
                    >
                        {#if editingId === projeto.id}
                            <input
                                type="text"
                                bind:value={projeto.nome}
                                on:input={(e) => updateProjectField(projeto.id, 'nome', e.target.value)}
                                class="edit-input"
                            />
                            <textarea
                                bind:value={projeto.descricao}
                                on:input={(e) => updateProjectField(projeto.id, 'descricao', e.target.value)}
                                class="edit-textarea"
                            ></textarea>
                            <button on:click={() => toggleEdit(projeto)} class="add-button">Salvar</button>
                        {:else}
                            <h3>{projeto.nome}</h3>
                            <p>{projeto.descricao}</p>
                            <div class="status status-{projeto.status.toLowerCase().replace(' ', '-')}">
                                {projeto.status}
                            </div>
                            <button on:click={() => toggleEdit(projeto)} class="edit-button">Editar</button>
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        background-color: #ffffff;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .kanban {
        display: flex;
        gap: 20px;
        margin-top: 20px;
    }

    .coluna {
        background-color: #f0f0f0;
        flex: 1;
        padding: 10px;
        border-radius: 8px;
        min-height: 300px;
    }

    .coluna h2 {
        text-align: center;
    }

    .project-card {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: grab;
    }

    .status-ideia {
        background-color: #ffeb3b;
        color: #333;
    }

    .status-pendente {
        background-color: #f44336;
        color: #fff;
    }

    .status-em-processo {
        background-color: #2196f3;
        color: #fff;
    }

    .status-finalizado {
        background-color: #4caf50;
        color: #fff;
    }

    .status {
        display: inline-block;
        margin-top: 5px;
        padding: 5px 10px;
        border-radius: 4px;
    }

    .add-button {
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 5px;
    }

    .edit-button {
        background-color: #ffc107;
        color: #000;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }

    .edit-input {
        width: 100%;
        padding: 8px;
        margin-bottom: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .edit-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        min-height: 60px;
        margin-bottom: 5px;
    }
</style>