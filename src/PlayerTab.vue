<script setup>
import { inject, ref, watchEffect } from 'vue';
import RecordTable from './RecordTable.vue';

const queryBuilt = ref({});
const queryName = inject('queryName');
const server = inject('remote');
const playerStats = ref({
    queryName: null,
    totalGames: null,
    gamesWithResult: null,
    wonGames: null,
    winRate: null,
    commonTeammates: []
});
const relatedNames = ref([]);
const playerNameRef = ref('');
const status = inject('status');

const putbackName = () => {
    if (playerNameRef.value.length > 0) {
        queryName.value = playerNameRef.value;
    }
};

watchEffect(() => {
    if (!playerStats.value?.totalGames && queryName.value.length > 0) searchPlayer();
});

const searchPlayer = async () => {
    queryName.value = queryName.value.trim();
    if (!queryName.value.length) return;
    playerNameRef.value = queryName.value;
    relatedNames.value = [];
    playerStats.value = {
        queryName: null,
        totalGames: null,
        gamesWithResult: null,
        wonGames: null,
        winRate: null,
        commonTeammates: []
    };

    queryBuilt.value = {
        nested: {
            path: 'players',
            query: {
                term: {
                    'players.name.keyword': {
                        value: queryName.value,
                        case_insensitive: true
                    }
                }
            }
        }
    };

    try {
        status.value = `🟡 正在查询 ${queryName.value} 的统计数据`;
        fetch(server.url, {
            ...server.config,
            body: JSON.stringify({
                size: 0,
                query: {
                    nested: {
                        path: "players",
                        query: {
                            term: {
                                "players.name.keyword": queryName.value
                            }
                        }
                    }
                },
                collapse: { field: "guid" },
                aggs: {
                    total_games: { cardinality: { field: "guid" } },
                    games_with_result: {
                        filter: { term: { haswinner: true } }
                    },
                    player_stats: {
                        nested: { path: "players" },
                        aggs: {
                            matching_player: {
                                filter: {
                                    term: { "players.name.keyword": queryName.value }
                                },
                                aggs: {
                                    won_games: {
                                        filter: { term: { "players.winner": true } }
                                    }
                                }
                            }
                        }
                    },
                    teammates: {
                        nested: { path: "players" },
                        aggs: {
                            filtered_games: {
                                filter: {
                                    bool: {
                                        must_not: {
                                            term: { "players.name.keyword": queryName.value }
                                        },
                                        must: {
                                            match: { "players.playertype": 2 }
                                        }
                                    }
                                },
                                aggs: {
                                    by_name: {
                                        terms: {
                                            field: "players.name.keyword",
                                            size: 50
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        }).then(async data => {
            const statsData = await data.json();
            const totalGames = statsData.aggregations.total_games.value;
            const gamesWithResult = statsData.aggregations.games_with_result.doc_count;
            const wonGames = statsData.aggregations.player_stats.matching_player.won_games.doc_count;
            const winRate = gamesWithResult ? (wonGames / gamesWithResult * 100).toFixed(2) : 0;
            const commonTeammates = statsData.aggregations.teammates.filtered_games.by_name.buckets.map(b => ({
                name: b.key,
                count: b.doc_count
            }));
            playerStats.value = {
                queryName: queryName.value,
                totalGames,
                gamesWithResult,
                wonGames,
                winRate,
                commonTeammates
            };
            status.value = `🟢 ${queryName.value} 的统计数据已加载`;
        }).catch(error => {
            status.value = `🔴 查询 ${queryName.value} 的统计数据失败`;
            console.error('Failed to fetch player data:', error);
        });

        fetch(server.url, {
            ...server.config,
            body: JSON.stringify({
                size: 0,
                aggs: {
                    unique_players: {
                        nested: { path: "players" },
                        aggs: {
                            filtered: {
                                filter: {
                                    bool: {
                                        must_not: {
                                            term: { "players.name.keyword": queryName.value }
                                        },
                                        must: {
                                            match: { "players.name": queryName.value }
                                        }
                                    }

                                },
                                aggs: {
                                    by_name: {
                                        terms: {
                                            field: "players.name.keyword",
                                            size: 30
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        }).then(async data => {
            const relatedData = await data.json();
            if (relatedData?.aggregations?.unique_players?.filtered?.by_name?.buckets) {
                relatedNames.value = relatedData.aggregations.unique_players.filtered.by_name.buckets.map(b => b.key);
                status.value = `🟢 ${queryName.value} 的相似 ID 已加载`;
            } else {
                status.value = `🔴 未找到名为 ${queryName.value} ID`;
            }
        }).catch(error => {
            status.value = `🔴 查询 ${queryName.value} 的相似 ID 失败`;
            console.error('Failed to fetch related names:', error);
        });
    } catch (error) {
        status.value = `🔴 查询 ${queryName.value} 数据失败`;
        console.error('Failed to fetch player data:', error);
    }
}
</script>

<template>
    <div class="player-search-bar">
        <input type="text" v-model.trim="queryName" placeholder="输入玩家ID搜索档案" />
        <button @click="searchPlayer">查询玩家</button>
        <div v-if="playerNameRef != queryName" class="hint blink">✨ 关键词与当前结果不同，请点击按钮刷新数据</div>
    </div>
    <div v-if="playerStats.totalGames"
        style="display: grid; grid-template-columns: repeat(5, minmax(100px, 1fr)); gap: 5px;margin-bottom: .5rem;">
        <div><strong>当前 ID：</strong><a href="#" @click.prevent="putbackName">{{ playerNameRef }}</a></div>
        <div><strong>游戏总数：</strong>{{ playerStats.totalGames }}</div>
        <div><strong>已知结果：</strong>{{ playerStats.gamesWithResult }}</div>
        <div><strong>获胜数量：</strong>{{ playerStats.wonGames }}</div>
        <div><strong>估算胜率：</strong>{{ playerStats.winRate }}%</div>
    </div>
    <div v-if="playerStats.totalGames" style="margin-bottom: .5rem;display: flex;flex-wrap: wrap;gap: .2em 1em;">
        <strong>共同游戏：</strong>
        <a href="#" v-for="(teammate, index) in playerStats.commonTeammates" :key="index" class="teammate"
            @click.prevent="queryName = teammate.name">
            {{ teammate.name }} ({{ teammate.count }}次)
        </a>
    </div>
    <div v-if="relatedNames.length" style="margin-bottom: 1rem;display: flex;flex-wrap: wrap;gap: .2em 1em;">
        <strong>相似 ID：</strong>
        <a href="#" v-for="(name, index) in relatedNames" :key="index"
            @click.prevent="queryName = name; if (playerStats.totalGames === 0) searchPlayer();">{{ name }}</a>
    </div>
    <RecordTable :query="queryBuilt" />
</template>

<style scoped>
.player-search-bar {
    display: flex;
    justify-content: start;
    margin: 1rem auto;
    gap: 1rem;
    align-items: center;
}

input {
    min-width: 30%;
}

.hint {
    color: purple;
    font-weight: bold;
    font-size: 120%;
}

.blink {
    animation: blinker 2s linear infinite;
}

@keyframes blinker {
    50% {
        opacity: 0;
    }
}
</style>