<script setup>
import { onMounted, inject, ref, watchEffect } from 'vue';
import { checkResponse } from './funcs';

const server = inject('remote');
const selectedFilters = inject('selectedFilters');
const filters = inject('filters');
const activeTab = inject('activeTab');

watchEffect(() => {
    if (activeTab.value != 'list') {
        document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(e => { e.disabled = true; })
    } else {
        document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(e => { e.disabled = false; })
    }
});

onMounted(async () => {
    const response = await fetch(server.url, {
        ...server.config,
        body: JSON.stringify({
            size: 0,
            aggs: {
                difficulties: { terms: { field: 'difficulty' } },
                mapsizes: { terms: { field: 'mapsize' } },
                speeds: { terms: { field: 'speed' } },
                versions: {
                    terms: {
                        field: 'ver',
                        size: 3
                    }
                },
                matchups: {
                    terms: {
                        field: 'matchup',
                        size: 4
                    }
                },
                gametypes: { terms: { field: 'gametype' } },
                victorytypes: { terms: { field: 'victorytype' } },
                revealmaps: { terms: { field: 'revealmap' } },
                civs: {
                    nested: { path: "players" },
                    aggs: {
                        unique_civs: {
                            terms: {
                                field: "players.civ",
                                size: 50
                            }
                        }
                    }
                }
            }
        })
    });
    const data = await checkResponse(response, 'Failed to fetch filters');
    filters.value.difficulty = data.aggregations.difficulties.buckets.map(b => b.key);
    filters.value.mapsize = data.aggregations.mapsizes.buckets.map(b => b.key);
    filters.value.speed = data.aggregations.speeds.buckets.map(b => b.key);
    filters.value.ver = data.aggregations.versions.buckets.map(b => b.key);
    filters.value.matchup = data.aggregations.matchups.buckets.map(b => b.key);
    filters.value.gametype = data.aggregations.gametypes.buckets.map(b => b.key);
    filters.value.victorytype = data.aggregations.victorytypes.buckets.map(b => b.key);
    filters.value.revealmap = data.aggregations.revealmaps.buckets.map(b => b.key);
    filters.value.civs = data.aggregations.civs.unique_civs.buckets.map(b => b.key);
    
    // Initialize the "Other Conditions" filters (no need to fetch from server)
    filters.value.filterShortDuration = [true];
    filters.value.filterAI = [true];
});
</script>

<template>
    <div class="window-body">
        <fieldset>
            <legend>筛选条件</legend>
            <div class="filter-panel">
                <div class="filter-option">
                    <h4>难度：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.difficulty" class="filter-option-item">
                            <input type="checkbox" :id="'difficulty-' + opt" v-model="selectedFilters.difficulty.value"
                                :value="opt">
                            <label :for="'difficulty-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="filter-option">
                    <h4>分组：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.matchup" class="filter-option-item">
                            <input type="checkbox" :id="'matchup-' + opt" v-model="selectedFilters.matchup.value"
                                :value="opt">
                            <label :for="'matchup-' + opt">{{ opt }}</label>
                        </div>
                        <div class="filter-option-item">
                            <input type="checkbox" id="matchup-others" v-model="selectedFilters.matchup.value"
                                value="others">
                            <label for="matchup-others">其它</label>
                        </div>
                    </div>
                </div>
                <div class="filter-option">
                    <h4>速度：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.speed" class="filter-option-item">
                            <input type="checkbox" :id="'speed-' + opt" v-model="selectedFilters.speed.value"
                                :value="opt">
                            <label :for="'speed-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="filter-option">
                    <h4>版本：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.ver" class="filter-option-item">
                            <input type="checkbox" :id="'ver-' + opt" v-model="selectedFilters.ver.value" :value="opt">
                            <label :for="'ver-' + opt">{{ opt }}</label>
                        </div>
                        <div class="filter-option-item">
                            <input type="checkbox" id="ver-others" v-model="selectedFilters.ver.value" value="others">
                            <label for="ver-others">其它</label>
                        </div>
                    </div>
                </div>
                <div class="filter-option">
                    <h4>胜利条件：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.victorytype" class="filter-option-item">
                            <input type="checkbox" :id="'victorytype-' + opt"
                                v-model="selectedFilters.victorytype.value" :value="opt">
                            <label :for="'victorytype-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="filter-option">
                    <h4>地图可见：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.revealmap" class="filter-option-item">
                            <input type="checkbox" :id="'revealmap-' + opt" v-model="selectedFilters.revealmap.value"
                                :value="opt">
                            <label :for="'revealmap-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="expanded filter-option">
                    <h4>地图尺寸：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.mapsize" class="filter-option-item">
                            <input type="checkbox" :id="'mapsize-' + opt" v-model="selectedFilters.mapsize.value"
                                :value="opt">
                            <label :for="'mapsize-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="expanded filter-option">
                    <h4>游戏类型：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.gametype" class="filter-option-item">
                            <input type="checkbox" :id="'gametype-' + opt" v-model="selectedFilters.gametype.value"
                                :value="opt">
                            <label :for="'gametype-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="expanded filter-option">
                    <h4>包含民族：</h4>
                    <div class="filter-option-items">
                        <div v-for="opt in filters.civs" class="filter-option-item">
                            <input type="checkbox" :id="'civs-' + opt" v-model="selectedFilters.civs.value"
                                :value="opt">
                            <label :for="'civs-' + opt">{{ opt }}</label>
                        </div>
                    </div>
                </div>
                <div class="expanded filter-option">
                    <h4>其它条件：</h4>
                    <div class="filter-option-items">
                        <div class="filter-option-item">
                            <input type="checkbox" id="filter-short-duration" v-model="selectedFilters.filterShortDuration.value" :value="true">
                            <label for="filter-short-duration">过滤10分钟以下存档</label>
                        </div>
                        <div class="filter-option-item">
                            <input type="checkbox" id="filter-ai" v-model="selectedFilters.filterAI.value" :value="true">
                            <label for="filter-ai">过滤打电脑存档</label>
                        </div>
                    </div>
                </div>
            </div>
        </fieldset>
    </div>
</template>

<style scoped>
.filter-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(150px, 1fr));
    gap: 5px;
}

.expanded {
    grid-column: 1 / -1;
}

.filter-option {
    display: flex;
}

.filter-option-items {
    display: flex;
    flex-wrap: wrap;
}

.filter-option-item {
    margin: auto .5em;
    min-width: 4em;
    line-height: 1.6;
}

.filter-option>h4 {
    min-width: 5em;
    margin: 0;
    font-size: inherit;
    font-weight: bold;
    min-width: 6em;
}
</style>