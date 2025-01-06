<script setup>
import { ref, watch, useTemplateRef, inject } from 'vue';
import { formatDuration, playerColors, formatDate } from './funcs';

const server = inject('remote');
const g = ref({});
const gameid = inject('queryGuid');
const hint = useTemplateRef('hint');
const status = inject('status');
const queryName = inject('queryName');
const activeTab = inject('activeTab');

const searchPlayer = (e) => {
    if (e.target.tagName !== 'A') return;
    queryName.value = e.target.innerText;
    activeTab.value = 'player';
};

watch(gameid, async () => {
    if (!gameid.value || gameid.value.length != 32) {
        hint.value.innerText = '🟠 游戏ID的长度为32位';
        return;
    } else {
        hint.value.innerText = '';
    }
    status.value = '🟡 正在检索游戏信息...';
    const response = await fetch(server.url, {
        ...server.config,
        body: JSON.stringify({
            size: 1,
            query: {
                term: { guid: gameid.value }
            },
            collapse: { field: "guid" }
        })
    });
    const data = await response.json();
    const detail = data.hits.hits[0]?._source;
    if (detail) {
        g.value = detail;
        status.value = '🟢 游戏信息加载完成';
    } else {
        hint.value.innerText = '🟠 未找到符合条件的游戏';
        status.value = '🔴 未找到符合条件的游戏';
    }
});
</script>

<template>
    <div class="game-query-bar">
        <label for="gameid-input">输入要查询的游戏ID：</label>
        <input type="text" id="gameid-input" v-model="gameid" placeholder="输入游戏ID搜索档案" maxlength=32 />
        <span ref="hint"></span>
    </div>
    <div class="game-details1" v-if="g.guid">
        <div class="map">
            <img :src="`https://placehold.co/300x200/png?text=${g.map_name || 'Loading...'}`" width="300" height="200"
                :alt="g.map_name || '地图缩略图'">
        </div>
        <fieldset>
            <legend>玩家信息</legend>
            <div class="sunken-panel" style="height: 100%;">
                <table style="width: 100%; height: 100%;">
                    <thead>
                        <tr>
                            <th>位置</th>
                            <th>编号</th>
                            <th>玩家 ID</th>
                            <th>分组</th>
                            <th>民族</th>
                            <th>封建时代</th>
                            <th>城堡时代</th>
                            <th>帝王时代</th>
                            <th>投降时间</th>
                            <th>起始坐标</th>
                            <th>起始资源</th>
                            <th>起始人口</th>
                            <th>获胜</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="n in 8" :key="'player' + n">
                            <template v-if="g.players[n].playertype > 1">
                                <td>{{ g.players[n].slot }}</td>
                                <td>{{ g.players[n].index }}</td>
                                <td><a href="#" @click.prevent="searchPlayer"
                                        :style="{ color: playerColors[g.players[n].colorid] }">{{ g.players[n].name
                                        }}</a></td>
                                <td>{{ g.players[n].teamid > 1 ? g.players[n].teamid : '-' }}</td>
                                <td>{{ g.players[n].civ }}</td>
                                <td>{{ formatDuration(g.players[n].feudaltime) }}</td>
                                <td>{{ formatDuration(g.players[n].castletime) }}</td>
                                <td>{{ formatDuration(g.players[n].imperialtime) }}</td>
                                <td>{{ formatDuration(g.players[n].resigned) }}</td>
                                <td>[{{ g.players[n].initx }}, {{ g.players[n].inity }}]</td>
                                <td>{{ g.players[n].initfood }} / {{ g.players[n].initgold }} / {{
                                    g.players[n].initwood
                                }}
                                    / {{ g.players[n].initstone }}</td>
                                <td>{{ g.players[n].initpop }}({{ g.players[n].initmilitary }})</td>
                                <td>{{ g.players[n].winner ? '🗹' : '─' }}</td>
                            </template>
                            <template v-else>
                                <td>{{ g.players[n].slot }}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </fieldset>
    </div>
    <div class="game-details2" v-if="g.guid">
        <fieldset>
            <legend>游戏说明</legend>
            <div v-html="g.instructions.replace(/\r?\n/g, '<br>')"></div>
        </fieldset>
        <fieldset>
            <legend>基本信息</legend>
            <div class="basic">
                <strong>版本：</strong><span>{{ g.ver }}</span>
                <strong>分组：</strong><span>{{ g.matchup }}</span>
                <strong>难度：</strong><span>{{ g.difficulty }}</span>
                <strong>地图名称：</strong><span>{{ g.mapname }}</span>
                <strong>地图大小：</strong><span>{{ g.mapsize }}</span>
                <strong>速度：</strong><span>{{ g.speed }}</span>
                <strong>时长：</strong><span>{{ formatDuration(g.duration) }}</span>
                <strong>游戏时间：</strong><span>{{ formatDate(g.lastmod) }}</span>
                <strong>游戏类型：</strong><span>{{ g.gametype }}</span>
                <strong>立即建造：</strong><span>{{ g.instantbuild }}</span>
                <strong>锁定组队：</strong><span>{{ g.lockteams }}</span>
                <strong>锁定外交：</strong><span>{{ g.lockdiplomacy }}</span>
                <strong>包含 AI：</strong><span>{{ g.include_ai }}</span>
                <strong>去除阴影：</strong><span>{{ g.nofog }}</span>
                <strong>地图可见：</strong><span>{{ g.revealmap }}</span>
                <strong>人口上限：</strong><span>{{ g.poplimit }}</span>
                <strong>获胜方式：</strong><span>{{ g.victorytype }}</span>
                <strong>允许作弊：</strong><span>{{ g.enablecheats }}</span>
            </div>
        </fieldset>
        <fieldset>
            <legend>对话记录</legend>
            <textarea style="width: 100%; height: 100%; overflow: auto;">{{ g.chat.reduce((acc, cur) => acc +
                `[${formatDuration(cur.time) ?? '-'}] ${cur.content}\n`, '') }}</textarea>
        </fieldset>
    </div>
</template>

<style scoped>
.game-query-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
}

#gameid-input {
    min-width: 30%;
}

.game-details1 {
    display: grid;
    gap: 10px;
    grid-template-columns: 2fr 4fr;
    margin-bottom: 20px;
}

.game-details2 {
    display: grid;
    gap: 10px;
    grid-template-columns: 2fr 3fr 3fr;
}

.map {
    display: flex;
    justify-content: center;
}

.map {
    align-items: center;
}

tbody td {
    padding: .2em;
    border: 1px solid #ccc;
}

.basic {
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(auto-fill, 7em 120px);
}

.basic strong {
    text-align: right;
}
</style>