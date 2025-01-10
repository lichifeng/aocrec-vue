<script setup>
import { ref } from 'vue';
import { formatDate } from './funcs';

const serverUrl = 'https://upload.aocrec.com/upload';
const allowedExtensions = ref(['.mgx', '.mgz', '.mgx2', '.mgl']);
const maxFileSize = 30 * 1024 * 1024;
const maxSimultaneous = 3;
let fileList = ref([]);
const currentUploads = ref(0);

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function checkFile(file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.value.includes(ext)) {
        return `不支持的文件类型: ${ext}`;
    }
    if (file.size > maxFileSize) {
        return `文件过大: ${formatSize(file.size)} > ${formatSize(maxFileSize)}`;
    }
    return null;
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        const existingFile = fileList.value.find(f =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        );

        if (!existingFile) {
            const error = checkFile(file);

            file.progress = error ? -1 : 0;
            file.status = error ? error : '等待上传...';
            file.error = error;

            fileList.value.push(file);
        }
    });
    event.target.value = '';
    processQueue();
}

function processQueue() {
    if (currentUploads.value >= maxSimultaneous) return;
    fileList.value.forEach((file, index) => {
        if (currentUploads.value < maxSimultaneous && file.progress === 0) {
            uploadFile(file, index);
        }
    });
}

function updateResult(file, result) {
    if (file) {
        if (result.guid) {
            file.status = `<a href="/#${result.guid}" target="_blank">查看</a>`;
        } else {
            file.progress = -1;
            file.status = `${result.error || '上传失败'}`;
        }
    }
}

function uploadFile(file, index) {
    currentUploads.value++;
    const formData = new FormData();
    formData.append('recfile', file);
    formData.append('lastmod', file.lastModified);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
        file.status = '上传中...';
        if (e.lengthComputable) {
            file.progress = (e.loaded / e.total) * 100;
        }
        fileList.value = [...fileList.value];
    }

    xhr.onload = () => {
        currentUploads.value--;
        try {
            const response = JSON.parse(xhr.responseText);
            updateResult(file, response);
        } catch (e) {
            updateResult(file, { error: '解析响应失败' });
        }
        processQueue();
    };

    xhr.onerror = () => {
        currentUploads.value--;
        updateResult(file, { error: '网络错误' });
        processQueue();
    };

    xhr.open('POST', serverUrl, true);
    xhr.send(formData);
}

function clearCompleted() {
    fileList.value = fileList.value.filter(file => file.progress !== 100 && file.progress !== -1);
}
</script>

<template>
    <div class="upload-buttons">
        <button onclick="document.getElementById('fileInput').click()" class="upload-button">选取文件</button>
        <button @click="clearCompleted">清空已完成</button>
        <input type="file" id="fileInput" multiple @change="handleFileSelect" :accept="allowedExtensions.join(', ')" />
        <span>队列中: {{ currentUploads }}</span>
    </div>
    <div class="sunken-panel">
        <table style="width: 100%;">
            <thead>
                <tr>
                    <th>文件名</th>
                    <th>文件大小</th>
                    <th>最后修改日期</th>
                    <th>上传进度</th>
                    <th>上传结果</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="file in fileList" :key="file.name" :style="{ backgroundColor: file.progress === 100 ? 'lightgreen' : 'inherit' }">
                    <td>{{ file.name }}</td>
                    <td>{{ formatSize(file.size) }}</td>
                    <td>{{ formatDate(file.lastModified) }}</td>
                    <td class="progress-cell">
                        <span v-if="file.error || file.progress < 0" class="error">错误</span>
                        <span v-else :style="{ color: file.progress == 100 ? 'green' : 'inherit' }">{{ file.progress.toFixed(1) }}%</span>
                    </td>
                    <td v-html="file.status" :title="file.progress"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.upload-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: .5rem;
    align-items: center;
}

#fileInput {
    display: none;
}

tbody td {
    padding: .2em;
    border: 1px solid #ccc;
}

.error {
    color: red;
}
</style>