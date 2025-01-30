<script setup>
import { inject } from 'vue';

const orderBy = inject('orderBy');
</script>

<template>
    <div class="window-body">
        <fieldset>
            <legend>结果排序</legend>
            <div class="order-options">
                <div class="order-option">
                    <input type="radio" id="order-by-date-asc" v-model="orderBy" value="playtime-asc">
                    <label for="order-by-date-asc">老游戏优先</label>
                </div>
                <div class="order-option">
                    <input type="radio" id="order-by-date-desc" v-model="orderBy" value="playtime-desc">
                    <label for="order-by-date-desc">新游戏优先</label>
                </div>
                <div class="order-option">
                    <input type="radio" id="order-by-upload-desc" v-model="orderBy" value="upload-desc" checked>
                    <label for="order-by-upload-desc">新上传优先</label>
                </div>
                <div class="order-option">
                    <input type="radio" id="order-by-upload-asc" v-model="orderBy" value="upload-asc">
                    <label for="order-by-upload-asc">早上传优先</label>
                </div>
                <div class="order-option">
                    <input type="radio" id="order-by-duration-desc" v-model="orderBy" value="duration-desc">
                    <label for="order-by-duration-desc">时长优先</label>
                </div>
                <div class="order-option">
                    <input type="radio" id="order-by-duration-asc" v-model="orderBy" value="duration-asc">
                    <label for="order-by-duration-asc">时长逆序</label>
                </div>
            </div>
        </fieldset>
    </div>
</template>

<style scoped>
.order-options {
    display: flex;
    flex-direction: wrap;
    gap: 1rem;
}
</style>