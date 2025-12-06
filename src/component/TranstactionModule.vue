<template>
    <el-dialog v-model="dialogVisible" title="添加交易记录" width="500px">
        <el-divider></el-divider>
        <el-form :model="formData" style="margin: 20px;">
            <el-form-item label="交易时间 :" required>
                <el-date-picker v-model="formData.trade_time" type="datetime" placeholder="选择日期时间"
                    style="width: 100%;"></el-date-picker>
            </el-form-item>
            <el-form-item label="收支类型 :" required>
                <el-select v-model="formData.direction">
                    <el-option label="收入" value="收入"></el-option>
                    <el-option label="支出" value="支出"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="交易类型 :" required>
                <el-select v-model="formData.trade_type">
                    <el-option v-for="value in (formData.direction == '支出' ? expenseOptions : incomeOptions)" :key="value"
                        :label="value" :value="value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="交易对方 :" required>
                <el-input v-model="formData.counterparty" placeholder="输入交易对方"></el-input>
            </el-form-item>
            <el-form-item label="商品说明 :" required>
                <el-input v-model="formData.description" placeholder="输入商品说明"></el-input>
            </el-form-item>

            <el-form-item label="交易金额 :" required>
                <el-input v-model="formData.amount" placeholder="输入金额" type="number"></el-input>
            </el-form-item>
            <el-alert v-show="alter.isShow" :title="alter.title" :type="alter.type" show-icon></el-alert>
            <el-form-item required>
                <div style="display: flex; justify-content: space-evenly; margin-top: 30px; width: 100%;">
                    <el-button type="primary" @click="$emit('submitForm', props.formData)">提交</el-button>
                    <el-button @click="$emit('cancelForm')">取消</el-button>
                </div>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
const emit = defineEmits(['submitForm', 'cancelForm'])

const expenseOptions = [
    '餐饮美食',
    '日常购物',
    '交通出行',
    '娱乐休闲',
    '医疗健康',
    '其他'
]

const incomeOptions = [
    '工资薪金',
    '兼职收入',
    '投资回报',
    '礼金收入',
    '其他'
]

const props = defineProps({
    showTransactionModule: Boolean,
    formData: Object,
    alter: Object
})
const dialogVisible = computed({
    get() {
        return props.showTransactionModule
    },
    set(value) {
        emit('update:showTransactionModule', value)
    }
})
</script>

<style lang="scss" scoped></style>