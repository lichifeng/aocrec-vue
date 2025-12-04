<script setup>
import SearchBar from './TopSearch.vue';
import FilterPanel from './FilterPanel.vue';
import TabPanel from './TabPanel.vue';
import StatusBar from './StatusBar.vue';
import OrderOption from './OrderOption.vue';
import { provide, ref, reactive, toRefs } from 'vue';

const activeTab = ref('list');
provide('activeTab', activeTab);
provide('mainKeywords', ref(''));
provide('queryName', ref(''));
provide('queryGuid', ref(''));
provide('status', ref('-'));
provide('filters', ref({}));
provide('orderBy', ref(''));

provide('remote', {
    url: 'https://es.aocrec.com/mgxhub/_search',
    config: {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa('aocrec:aocrec')
        },
        credentials: 'include'
    }
});

const selectedFilters = reactive({
    difficulty: [],
    mapsize: [],
    matchup: [],
    speed: [],
    ver: [],
    gametype: [],
    victorytype: [],
    revealmap: [],
    civs: [],
    filterShortDuration: [true],
    filterAI: [true]
});
provide('selectedFilters', toRefs(selectedFilters));
</script>

<template>
    <div class="window">
        <div class="title-bar">
            <div class="title-bar-text">🛕 <a href="/" style="color: inherit;text-decoration: none;">帝国时代档案库</a></div>
        </div>
        <SearchBar />
        <FilterPanel />
        <OrderOption />
        <TabPanel />
        <StatusBar />
    </div>
    <div class="friend-links">
        <a href="https://www.aoezone.net/">AoEZone</a>
        <a href="https://aok.heavengames.com/">AGE OF KINGS HEAVEN</a>
        <a href="https://www.hawkaoe.net/bbs/">翔鹰帝国网</a>
        <a href="http://hdbbs.fxt365.com/forum-94-1.html">_XJL_征服者联盟</a>
        <a href="http://hd.fxt365.com/">互动对战平台</a>
        <a href="http://hdbbs.fxt365.com/forum-64-1.html">互动平台征服者版块</a>
    </div>
    <div class="copyright">2017-2026 帝国时代档案库</div>
</template>

<style scoped>
.window {
    width: 100%;
}

.copyright {
    text-align: center;
    margin: 1rem auto;
    color: #808080
}

.friend-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1rem auto;
    align-items: baseline;
}

.friend-links a {
    color: inherit;
}
</style>

<style>
body {
    width: 100%;
    margin: 0 auto;
    background: #c0c0c0;
}
</style>
