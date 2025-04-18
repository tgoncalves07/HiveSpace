<script lang="ts">
    export let titulo: string;
    export let valor: number;
    export let percentual: number = -1;
    export let icone: string;
    export let cor: string;
</script>

<div class="stat-card" style="--card-color: {cor}">
    <div class="stat-icon">{icone}</div>
    <div class="stat-content">
        <h3>{titulo}</h3>
        <div class="stat-value">{valor}</div>
        {#if percentual >= 0}
            <div class="stat-percentual">{percentual}%</div>
        {/if}
    </div>
</div>

<style>
    .stat-card {
        background-color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        border-top: 4px solid var(--card-color);
    }

    .stat-icon {
        font-size: 2rem;
        opacity: 0.8;
    }

    .stat-content {
        flex: 1;
    }

    .stat-content h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        color: #666;
        font-weight: 500;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
    }

    .stat-percentual {
        font-size: 0.9rem;
        color: var(--card-color);
        font-weight: 600;
    }
</style>