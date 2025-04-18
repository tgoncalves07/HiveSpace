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
                id: Date.now(), // Usando timestamp para IDs únicos
                nome: 'Novo Projeto',
                descricao: 'Descreva seu projeto aqui...',
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

    function deleteProject(id: number) {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            projetos.update(items => items.filter(projeto => projeto.id !== id));
        }
    }
</script>

<div class="container">
    <div class="header">
        <h1>Meus Projetos</h1>
        <button class="add-button" on:click={addProject}>
            <span class="icon">+</span> Novo Projeto
        </button>
    </div>

    <div class="kanban">
        {#each colunas as status}
            <div 
                class="coluna" 
                on:dragover|preventDefault 
                on:drop={(event) => handleDrop(event, status)}
            >
                <h2 class="coluna-title">{status}</h2>
                <div class="coluna-count">
                    {$projetos.filter(p => p.status === status).length} projetos
                </div>

                {#each $projetos.filter((p) => p.status === status) as projeto (projeto.id)}
                    <div
                        class="project-card"
                        draggable="true"
                        on:dragstart={(event) => handleDragStart(event, projeto)}
                    >
                        {#if editingId === projeto.id}
                            <input
                                type="text"
                                bind:value={projeto.nome}
                                on:input={(e) => updateProjectField(projeto.id, 'nome', e.target.value)}
                                class="edit-input"
                                placeholder="Nome do projeto"
                            />
                            <textarea
                                bind:value={projeto.descricao}
                                on:input={(e) => updateProjectField(projeto.id, 'descricao', e.target.value)}
                                class="edit-textarea"
                                placeholder="Descrição do projeto"
                            ></textarea>
                            <div class="card-actions">
                                <button on:click={() => toggleEdit(projeto)} class="save-button">Salvar</button>
                                <button on:click={() => deleteProject(projeto.id)} class="delete-button">Excluir</button>
                            </div>
                        {:else}
                            <h3>{projeto.nome}</h3>
                            <p>{projeto.descricao}</p>
                            <div class="status status-{projeto.status.toLowerCase().replace(' ', '-')}">
                                {projeto.status}
                            </div>
                            <div class="card-actions">
                                <button on:click={() => toggleEdit(projeto)} class="edit-button">Editar</button>
                                <button on:click={() => deleteProject(projeto.id)} class="delete-button">🗑️</button>
                            </div>
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
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .kanban {
        display: flex;
        gap: 20px;
        margin-top: 20px;
    }

    .coluna {
        background-color: #ffffff;
        flex: 1;
        padding: 15px;
        border-radius: 10px;
        min-height: 400px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-top: 4px solid;
    }

    .coluna:nth-child(1) {
        border-top-color: #FFC107; /* Ideia - Amarelo */
    }

    .coluna:nth-child(2) {
        border-top-color: #F44336; /* Pendente - Vermelho */
    }

    .coluna:nth-child(3) {
        border-top-color: #2196F3; /* Em Processo - Azul */
    }

    .coluna:nth-child(4) {
        border-top-color: #4CAF50; /* Finalizado - Verde */
    }

    .coluna-title {
        text-align: center;
        color: #2c3e50;
        margin: 0 0 10px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .coluna-count {
        text-align: center;
        font-size: 12px;
        color: #7f8c8d;
        margin-bottom: 15px;
    }

    .project-card {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        cursor: grab;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .project-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .status {
        display: inline-block;
        margin: 10px 0;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .status-ideia {
        background-color: #fff8e1;
        color: #ff8f00;
        border: 1px solid #ffecb3;
    }

    .status-pendente {
        background-color: #ffebee;
        color: #d32f2f;
        border: 1px solid #ffcdd2;
    }

    .status-em-processo {
        background-color: #e3f2fd;
        color: #1976d2;
        border: 1px solid #bbdefb;
    }

    .status-finalizado {
        background-color: #e8f5e9;
        color: #388e3c;
        border: 1px solid #c8e6c9;
    }

    .card-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .add-button {
        background-color: #3f51b5;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s;
    }

    .add-button:hover {
        background-color: #303f9f;
    }

    .edit-button {
        background-color: #ffc107;
        color: #000;
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .edit-button:hover {
        background-color: #ffb300;
    }

    .save-button {
        background-color: #4caf50;
        color: #fff;
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .save-button:hover {
        background-color: #388e3c;
    }

    .delete-button {
        background-color: #f44336;
        color: #fff;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .delete-button:hover {
        background-color: #d32f2f;
    }

    .icon {
        font-size: 16px;
    }

    .edit-input {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
    }

    .edit-textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        min-height: 80px;
        margin-bottom: 10px;
        font-size: 14px;
        resize: vertical;
    }
</style>