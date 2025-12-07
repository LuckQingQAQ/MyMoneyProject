<template>
    <el-dialog v-model="dialogVisible" title="上传文件" width="500px" :show-close="true" @close="handleClose">
        <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            action="http://localhost:3001/api/upload"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeUpload"
            :limit="1"
            accept=".csv,.xlsx"
            :auto-upload="false"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
                <div class="el-upload__tip">
                    支持 CSV 和 XLSX 格式文件，文件大小不超过 5MB
                </div>
            </template>
        </el-upload>
        <div style="display: flex; justify-content: center; margin-top: 20px; gap: 10px;">
            <el-button type="primary" @click="submitUpload">确认上传</el-button>
            <el-button @click="handleClose">关闭</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
    showUploadModule: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:showUploadModule', 'upload-success']);

const uploadRef = ref();
const dialogVisible = computed({
    get() {
        return props.showUploadModule;
    },
    set(value) {
        emit('update:showUploadModule', value);
    }
});

// 文件上传前的校验
const beforeUpload = (file) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx');
    
    if (!isCSV && !isXLSX) {
        ElMessage.error('只能上传 CSV 或 XLSX 格式的文件！');
        return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        ElMessage.error('文件大小不能超过 5MB！');
        return false;
    }
    
    return true;
};

// 上传成功处理
const handleSuccess = (response) => {
    if (response.success) {
        ElMessage.success(response.message);
        emit('upload-success');
        handleClose();
    } else {
        ElMessage.error(response.message || '上传失败');
    }
};

// 上传失败处理
const handleError = (error) => {
    const errorMsg = error.response?.data?.message || '文件上传失败';
    ElMessage.error(errorMsg);
    console.error('Upload error:', error);
};

// 确认上传
const submitUpload = () => {
    if (!uploadRef.value) {
        ElMessage.warning('请先选择文件！');
        return;
    }
    uploadRef.value.submit();
};

// 关闭对话框
const handleClose = () => {
    if (uploadRef.value) {
        uploadRef.value.clearFiles();
    }
    emit('update:showUploadModule', false);
};
</script>

<style lang="scss" scoped>
:deep(.el-upload-dragger) {
    width: 100%;
}

:deep(.el-upload__tip) {
    text-align: center;
    color: #909399;
    margin-top: 10px;
}
</style>