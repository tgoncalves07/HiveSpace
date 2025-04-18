<script lang="ts">
    export let dados: {
        ideia: number;
        pendente: number;
        emProcesso: number;
        finalizado: number;
    };

    $: valores = [
        { label: 'Ideia', valor: dados.ideia, cor: '#FFC107' },
        { label: 'Pendente', valor: dados.pendente, cor: '#F44336' },
        { label: 'Em Processo', valor: dados.emProcesso, cor: '#2196F3' },
        { label: 'Finalizado', valor: dados.finalizado, cor: '#4CAF50' }
    ];

    $: total = valores.reduce((sum, item) => sum + item.valor, 0);
</script>

<div class="grafico-status">
    <h2>Distribuição por Status</h2>
    <div class="grafico-barras">
        {#each valores as item}
            <div class="barra-container">
                <div class="barra-label">{item.label}</div>
                <div class="barra-bg">
                    <div 
                        class="barra" 
                        style="
                            width: {total > 0 ? (item.valor / total * 100) : 0}%;
                            background-color: {item.cor};
                        "
                    ></div>
                </div>
                <div class="barra-valor">{item.valor}</div>
            </div>
        {/each}
    </div>
</div>

<style>
    .grafico-status h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2c3e50;
    }

    .grafico-barras {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .barra-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .barra-label {
        width: 100px;
        font-size: 0.9rem;
        color: #666;
    }

    .barra-bg {
        flex: 1;
        height: 20px;
        background-color: #f0f0f0;
        border-radius: 10px;
        overflow: hidden;
    }

    .barra {
        height: 100%;
        transition: width 0.5s ease;
    }

    .barra-valor {
        width: 40px;
        text-align: right;
        font-weight: 600;
        font-size: 0.9rem;
    }
</style>