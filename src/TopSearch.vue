<script setup>
import { inject } from 'vue';

const mainKeywords = inject('mainKeywords');
const activeTab = inject('activeTab');
const selectedFilters = inject('selectedFilters');

const reset = () => {
    mainKeywords.value = '';
    activeTab.value = 'list';
    for (const key in selectedFilters) {
        selectedFilters[key].value = [];
    }
    window.location.hash = '';
};
</script>

<template>
    <div class="search-row window-body">
        <input type="text" v-model="mainKeywords" @change="activeTab = 'list'" placeholder="搜索（请优先使用条件筛选）..." />
        <button @click="reset">重置条件</button>
        <button style="color: purple;" @click="activeTab='upload'">上传存档</button>
        <a href="//news.aocrec.com">网站公告</a>
    </div>
</template>

<style scoped>
.search-row {
    display: flex;
    justify-content: center;
    align-items: center;
}

.search-row button, .search-row a {
    margin: auto 0 auto 1rem;
}

.search-row input {
    min-width: 33%;
    margin-left: 1rem;
}
</style>