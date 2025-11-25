<template>
    <div class="production-management">
        <div class="page-header">
            <h1>班次管理</h1>
            <p>查看和管理不同班次的生产任务及金额统计</p>
        </div>

        <div class="dashboard-container">
            <!-- 班次选择区域 -->
            <div class="shift-selector">
                <p>选择班次:</p>
                <el-radio-group v-model="selectedShift" @change="handleShiftChange">
                    <el-radio-button label="早班" />
                    <el-radio-button label="中班" />
                    <el-radio-button label="晚班" />
                </el-radio-group>
            </div>

            <!-- 班次信息卡片 -->
            <div class="shift-info-card">
                <div class="info-item">
                    <p class="info-label">当前班次总金额</p>
                    <p class="total-amount">{{ formatCurrency(shiftInfo.totalAmount) }} 元</p>
                </div>
                <div class="info-stats">
                    <p>任务数: {{ shiftInfo.totalTasks }}</p>
                    <p>未完成: {{ shiftInfo.unfinishedTasks }}</p>
                </div>
            </div>
        </div>

        <!-- 任务列表 -->
        <div class="task-list-container">
            <h2>{{ selectedShift }}任务列表</h2>
            <el-table :data="taskList" border style="width: 100%; margin-top: 10px">
                <!-- 任务编号：taskId → task_id -->
                <el-table-column prop="task_id" label="任务编号" width="100" />
                <!-- 生产类型：productType → name -->
                <el-table-column prop="name" label="生产类型" width="120" />
                <!-- 单价：保持price不变 -->
                <el-table-column prop="price" label="单价" width="120">
                    <template #default="scope">
                        {{ formatCurrency(scope.row.price) }} 元
                    </template>
                </el-table-column>
                <!-- 生产数量：保持quantity不变 -->
                <el-table-column prop="quantity" label="生产数量" width="120" />
                <!-- 起始时间：startTime → start_time -->
                <el-table-column prop="start_time" label="起始时间" width="140" />
                <!-- 结束时间：endTime → end_time -->
                <el-table-column prop="end_time" label="结束时间" width="140">
                    <template #default="scope">
                        <span :class="{
                            'text-processing': scope.row.end_time === '未完成', // 未完成状态
                            'text-completed': scope.row.end_time && scope.row.end_time !== '未完成'
                        }">
                            {{ scope.row.end_time || '未完成' }} <!-- 显示后端返回的"未完成" -->
                        </span>
                    </template>
                </el-table-column>

                <!-- 修改结束按钮显示条件 -->
                <el-table-column label="操作" width="100">
                    <template #default="scope">
                        <!-- 只有未完成的任务显示结束按钮 -->
                        <el-button v-if="scope.row.end_time === '未完成'" type="primary" size="small"
                            @click="handleFinishTask(scope.row)">
                            结束
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="task-count">
                <el-badge :value="shiftInfo.totalTasks" class="task-count-badge">
                    任务总数
                </el-badge>
            </div>
        </div>

        <!-- 结束任务对话框 -->
        <el-dialog title="结束生产任务" v-model="showFinishDialog" width="400px">
            <el-form :model="finishForm" :rules="finishRules" ref="finishFormRef" label-width="100px">
                <el-form-item label="任务编号">
                    <el-input v-model="finishForm.taskId" disabled />
                </el-form-item>
                <el-form-item label="生产类型">
                    <el-input v-model="finishForm.productType" disabled />
                </el-form-item>
                <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker v-model="finishForm.endTime" type="datetime" placeholder="选择结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showFinishDialog = false">取消</el-button>
                <el-button type="primary" @click="handleFinishSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import productionApi from '@/api/production'
import { useProductionStore } from '@/store/productionStore'

// 生产状态管理Store
const productionStore = useProductionStore()

// 选中的班次
const selectedShift = ref('早班')

// 班次信息
const shiftInfo = reactive({
    totalAmount: 0,      // 总金额
    totalTasks: 0,       // 总任务数
    unfinishedTasks: 0   // 未完成任务数
})

// 任务列表数据
const taskList = ref([])

// 结束任务对话框相关
const showFinishDialog = ref(false)
const currentTask = ref(null)
// 修改结束任务表单定义
const finishForm = reactive({
    task_id: '', // 改为task_id
    productType: '',
    endTime: ''
})
const finishFormRef = ref(null)
const finishRules = reactive({
    endTime: [
        { required: true, message: '请选择结束时间', trigger: 'change' }
    ]
})

// 页面加载时获取默认班次数据
onMounted(() => {
    fetchShiftData(selectedShift.value)
})

// 格式化金额显示
const formatCurrency = (value) => {
    if (!value || isNaN(Number(value))) return '0'
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取班次数据（现在使用本地筛选）
const fetchShiftData = async (shift) => {
    try {
        // 调用Store获取班次数据（已改为本地筛选）
        const data = await productionStore.fetchShiftData(shift)
        if (data) {
            shiftInfo.totalAmount = data.totalAmount
            shiftInfo.totalTasks = data.totalTasks
            shiftInfo.unfinishedTasks = data.unfinishedTasks
            taskList.value = data.tasks
            ElMessage.success(`已加载${shift}数据`)
        }
    } catch (error) {
        ElMessage.error('获取班次数据失败: ' + error.message)
    }
}

// 切换班次
const handleShiftChange = (shift) => {
    selectedShift.value = shift
    fetchShiftData(shift)
}



// 修改处理结束任务逻辑
const handleFinishTask = (row) => {
    currentTask.value = row;
    finishForm.task_id = row.task_id; // taskId → task_id
    finishForm.productType = row.name; // productType → name
    finishForm.endTime = '';
    showFinishDialog.value = true;
};

// 修改提交结束任务逻辑
const handleFinishSubmit = async () => {
    if (!finishFormRef.value) return
    const valid = await finishFormRef.value.validate()
    if (!valid) return

    try {
        // 传递task_id（number类型）
        const success = await productionStore.completeTask({
            task_id: Number(finishForm.task_id), // 转换为number
            endTime: finishForm.endTime
        })

        if (success) {
            // 更新本地数据
            const taskIndex = taskList.value.findIndex(t => t.task_id === finishForm.task_id); // taskId → task_id
            if (taskIndex !== -1) {
                taskList.value[taskIndex].end_time = finishForm.endTime; // endTime → end_time
                shiftInfo.unfinishedTasks--;
            }

            showFinishDialog.value = false
            ElMessage.success('任务已成功结束')
        }
    } catch (error) {
        ElMessage.error('结束任务失败: ' + error.message)
    }
}
</script>

<style scoped>
.production-management {
    padding: 20px;
    background-color: #fff;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 20px;
}

.page-header h1 {
    font-size: 20px;
    margin-bottom: 8px;
    color: #333;
}

.page-header p {
    color: #666;
    font-size: 14px;
}

.dashboard-container {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    align-items: flex-start;
}

.shift-selector {
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    min-width: 200px;
}

.shift-selector p {
    margin-bottom: 15px;
    color: #666;
    font-weight: 500;
}

.shift-info-card {
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    flex: 1;
    min-width: 300px;
}

.info-item {
    margin-bottom: 15px;
}

.info-label {
    color: #666;
    margin-bottom: 8px;
    font-size: 14px;
}

.total-amount {
    font-size: 28px;
    font-weight: bold;
    color: #27ae60;
    margin: 0;
}

.info-stats {
    display: flex;
    gap: 20px;
    color: #666;
}

.task-list-container {
    margin-top: 20px;
}

.task-list-container h2 {
    font-size: 16px;
    color: #333;
    margin-bottom: 10px;
}

.task-count {
    margin-top: 10px;
    text-align: right;
}

.task-count-badge {
    margin-left: 5px;
}

.text-processing {
    color: #e6a23c;
}

.text-completed {
    color: #27ae60;
}
</style>