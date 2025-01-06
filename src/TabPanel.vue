<script setup>
import TabContainer from './TabContainer.vue';
import { inject } from 'vue';

const activeTab = inject('activeTab');
</script>

<template>
    <div class="window-body">
        <menu role="tablist">
            <li role="tab" :aria-selected="activeTab === 'list'">
                <a href="#" @click.prevent="activeTab = 'list'">搜索结果</a>
            </li>
            <li role="tab" :aria-selected="activeTab === 'player'">
                <a href="#" @click.prevent="activeTab = 'player'">玩家档案</a>
            </li>
            <li role="tab" :aria-selected="activeTab === 'game'">
                <a href="#" @click.prevent="activeTab = 'game'">游戏信息</a>
            </li>
            <li role="tab" :aria-selected="activeTab === 'upload'">
                <a href="#" class="purple" @click.prevent="activeTab = 'upload'">上传存档</a>
            </li>
        </menu>
        <div class="window" role="tabpanel">
            <TabContainer />
        </div>
    </div>
</template>

<style scoped>
.purple {
    color: purple;
    font-weight: bold;
}
</style>