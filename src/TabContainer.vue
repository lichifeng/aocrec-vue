<script setup>
import { inject } from 'vue';
import ListTab from './ListTab.vue';
import PlayerTab from './PlayerTab.vue';
import GameTab from './GameTab.vue';
import UploadTab from './UploadTab.vue';

const activeTab = inject('activeTab');
</script>

<template>
    <div class="window-body" v-show="activeTab === 'list'">
        <ListTab />
    </div>
    <div class="window-body" v-show="activeTab === 'player'">
        <PlayerTab />
    </div>
    <div class="window-body" v-show="activeTab === 'game'">
        <GameTab />
    </div>
    <div class="window-body" v-show="activeTab === 'upload'">
        <UploadTab />
    </div>
</template>