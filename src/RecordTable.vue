<script setup>
import { watchEffect, inject, ref, watch } from 'vue';
import { checkResponse, formatDuration, playerColors } from './funcs';

const server = inject('remote');
const props = defineProps(['query']);
const currentPage = ref(1);
const pageSize = ref(20);
const records = ref([]);
const totalHits = ref(0);
const queryName = inject('queryName');
const activeTab = inject('activeTab');
const queryGuid = inject('queryGuid');
const status = inject('status');

const maxPage = () => Math.ceil(totalHits.value / pageSize.value);

watch(props, () => {
    currentPage.value = 1;
});

watchEffect(() => {
    update(currentPage.value, pageSize.value);
});

async function update(currentPage, pageSize) {
    if (Object.keys(props.query).length === 0) {
        records.value = [];
        totalHits.value = 0;
        status.value = '🟢 已加载 0 / 0 条记录';
        return;
    }

    let sort = [
        { "_score": "desc" },
        { "duration": "desc" },
        { "lastmod": "desc" }
    ];
    if (props.query.match_all) {
        sort = [
            { "_score": "desc" },
            { "lastmod": "desc" },
            { "duration": "desc" }
        ];
    }
    try {
        status.value = '🟡 正在查询记录...';
        const response = await fetch(server.url, {
            ...server.config,
            body: JSON.stringify({
                from: (currentPage - 1) * pageSize,
                size: pageSize,
                query: props.query,
                sort,
                collapse: { field: "guid" }
            })
        });
        const data = await checkResponse(response, 'Failed to fetch records');
        records.value = data.hits.hits.map(hit => hit._source);
        totalHits.value = data.hits.total.value;
        status.value = `🟢 已加载 ${records.value.length} / ${totalHits.value} 条记录`;
    } catch (error) {
        status.value = '🔴 查询记录失败';
        console.error('Failed to fetch records:', error);
    }
}

const formatPlayer = (player) => {
    if (player.playertype < 1 || !player.name || !player.civ) return '';
    const name = player.name;
    const colorid = player.colorid;
    const color = playerColors[colorid] || '#000000';
    const teamid = player.teamid > 1 ? player.teamid : '-';
    const civ = player.civ;
    const title = `${name}\n` + `封建时代: ${formatDuration(player.feudaltime) ?? '/'}\n` +
        `城堡时代: ${formatDuration(player.castletime) ?? '/'}\n` +
        `帝王时代: ${formatDuration(player.imperialtime) ?? '/'}\n` +
        `投降时间: ${formatDuration(player.resigned) ?? '/'}`;
    return `[${teamid} ${civ}] <a href="#" class="player-link" style="color: ${color}" title="${title}">${name}</a>`;

}

const searchPlayer = (e) => {
    if (e.target.tagName !== 'A') return;
    queryName.value = e.target.innerText;
    activeTab.value = 'player';
}

const loadGame = (e) => {
    queryGuid.value = e.target.getAttribute('guid');
    activeTab.value = 'game';
    window.location.hash = queryGuid.value;
}
</script>

<template>
    <div class="sunken-panel">
        <table style="width: 100%;">
            <thead>
                <tr>
                    <th>版本</th>
                    <th>地图大小</th>
                    <th>分组</th>
                    <th>速度</th>
                    <th>时长</th>
                    <th v-for="n in 8">玩家 {{ n }}</th>
                    <th>查看</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="r in records" :title="r.instructions" :key="r.guid">
                    <td>{{ r.ver }}</td>
                    <td>{{ r.mapsize }}</td>
                    <td>{{ r.matchup }}</td>
                    <td>{{ r.speed }}</td>
                    <td>{{ formatDuration(r.duration) }}</td>
                    <td v-for="n in 8" v-html="formatPlayer(r.players[n])" @click="searchPlayer"></td>
                    <td style="text-align: center;"><a :href="`/#${r.guid}`" @click.prevent="loadGame" v-bind:guid="r.guid">👁</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="pagination">
        <button :disabled="currentPage === 1" @click="currentPage = 1">回到首页</button>
        <button :disabled="currentPage === 1" @click="currentPage > 1 ? currentPage-- : currentPage">上一页</button>
        <select v-model="pageSize" @change="currentPage = 1">
            <option value="20">20 条/页</option>
            <option value="50">50 条/页</option>
            <option value="100">100 条/页</option>
        </select>
        <span>第 {{ currentPage }} / {{ maxPage() }} 页</span>
        <button :disabled="currentPage === maxPage()"
            @click="currentPage < maxPage() ? currentPage++ : currentPage">下一页</button>
    </div>
</template>

<style scoped>
.pagination {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: end;
    margin-top: 1em;
    flex-wrap: wrap;
}

tbody tr:hover {
    background-color: navy;
    color: #fff;
}

td {
    padding: .2em;
    border: 1px solid #ccc;
}
</style>