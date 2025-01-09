<script setup>
import { inject, onMounted, ref } from 'vue';
import { checkResponse } from './funcs';

const status = inject('status');
const server = inject('remote');
const stats = ref({
    totalGames: 0,
    totalPlayers: 0,
    recentUploads: 0
});

onMounted(async () => {
    try {
        status.value = '🟡 正在获取统计数据...';
        // 获取当前日期和当前月份的开始和结束时间（UTC+8 时区）
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
        startOfMonth.setUTCHours(startOfMonth.getUTCHours() + 8);
        endOfMonth.setUTCHours(endOfMonth.getUTCHours() + 8);

        const response = await fetch(server.url, {
            ...server.config,
            body: JSON.stringify({
                size: 0,
                aggs: {
                    total_games: { cardinality: { field: 'guid' } },
                    total_players: {
                        nested: { path: 'players' },
                        aggs: {
                            unique_players: { cardinality: { field: 'players.name.keyword' } }
                        }
                    },
                    recent_uploads: {
                        filter: {
                            range: {
                                created_at: {
                                    gte: startOfMonth.toISOString(),
                                    lte: endOfMonth.toISOString()
                                }
                            }
                        }
                    }
                }
            })
        });
        const data = await checkResponse(response, 'Failed to fetch stats');
        stats.value.totalGames = data.aggregations.total_games.value;
        stats.value.totalPlayers = data.aggregations.total_players.unique_players.value;
        stats.value.recentUploads = data.aggregations.recent_uploads.doc_count;
        status.value = '🟢 统计数据加载完成';
    } catch (error) {
        status.value = '🔴 获取统计数据失败';
        console.error('Failed to fetch stats:', error);
    }
});
</script>

<template>
    <div class="status-bar">
        <p class="status-bar-field">游戏总数： {{ stats.totalGames }}</p>
        <p class="status-bar-field">玩家总数： {{ stats.totalPlayers }}</p>
        <p class="status-bar-field">本月上传： {{ stats.recentUploads }}</p>
        <p class="status-bar-field" style="text-align: center;">{{ status }}</p>
    </div>
</template>