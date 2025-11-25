<template>
    <div class="task-management">
        <div class="page-header">
            <h1>任务详情管理</h1>
            <p>管理生产任务的详细信息、指派及状态跟踪</p>
        </div>

        <div class="operation-bar">
            <el-input v-model="searchForm.productType" placeholder="输入生产类型搜索" style="width: 300px" />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="showAddDialog = true">添加任务</el-button>
        </div>

        <!-- 任务列表表格渲染 -->
        <el-table :data="taskStore.taskList" border style="width: 100%">
            <!-- 任务编号：taskId → task_id -->
            <el-table-column prop="task_id" label="任务编号" width="120" />
            <!-- 生产类型：productType → name -->
            <el-table-column prop="name" label="生产类型" width="150" />
            <!-- 单价：保持price不变 -->
            <el-table-column prop="price" label="单价" width="100" />
            <!-- 生产数量：保持quantity不变 -->
            <el-table-column prop="quantity" label="生产数量" width="120" />
            <!-- 所属班次：保持shift不变 -->
            <el-table-column prop="shift" label="所属班次" width="120">
                <template #default="scope">
                    <span class="text-warning">{{ scope.row.shift || '未指派' }}</span>
                </template>
            </el-table-column>
            <!-- 起始时间：startTime → start_time -->
            <el-table-column prop="start_time" label="起始时间" width="180" />
            <!-- 结束时间：endTime → end_time -->
            <el-table-column prop="end_time" label="结束时间" width="180" />
            <el-table-column label="操作" width="250">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="success" size="small" @click="handleAssign(scope.row)"
                        v-if="!scope.row.shift || scope.row.shift === '未指派'">指派</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加任务对话框 -->
        <el-dialog title="添加任务" v-model="showAddDialog" width="500px">
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
                <el-form-item label="生产类型" prop="productType">
                    <el-input v-model="addForm.productType" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model.number="addForm.price" type="number" />
                </el-form-item>
                <el-form-item label="生产数量" prop="quantity">
                    <el-input v-model.number="addForm.quantity" type="number" min="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="handleAddSubmit">确定</el-button>
            </template>
        </el-dialog>

        <!-- 编辑任务对话框 -->
        <el-dialog title="编辑任务" v-model="showEditDialog" width="500px">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
                <el-form-item label="生产类型" prop="productType">
                    <el-input v-model="editForm.productType" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model.number="editForm.price" type="number" />
                </el-form-item>
                <el-form-item label="生产数量" prop="quantity">
                    <el-input v-model.number="editForm.quantity" type="number" min="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" @click="handleEditSubmit">确定</el-button>
            </template>
        </el-dialog>

        <!-- 指派任务对话框 -->
        <el-dialog title="指派任务" v-model="showAssignDialog" width="500px">
            <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="120px">
                <el-form-item label="任务编号">
                    <el-input v-model="assignForm.taskId" disabled />
                </el-form-item>
                <el-form-item label="生产类型">
                    <el-input v-model="assignForm.productType" disabled />
                </el-form-item>
                <el-form-item label="班次" prop="shift">
                    <el-select v-model="assignForm.shift" placeholder="请选择班次">
                        <el-option label="早班" value="早班" />
                        <el-option label="中班" value="中班" />
                        <el-option label="晚班" value="晚班" />
                    </el-select>
                </el-form-item>
                <el-form-item label="起始时间" prop="startTime">
                    <el-date-picker v-model="assignForm.startTime" type="datetime" placeholder="选择起始时间"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAssignDialog = false">取消</el-button>
                <el-button type="primary" @click="handleAssignSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/store/taskStore'

const taskStore = useTaskStore()

// 搜索表单数据
const searchForm = reactive({
    productType: ''
})

// 添加任务相关
const showAddDialog = ref(false)
const addForm = reactive({
    productType: '',
    price: null,
    quantity: null
})
const addFormRef = ref(null)

// 自定义验证函数
const validateNumber = (rule, value, callback) => {
    if (value === '' || value === null || value === undefined) {
        callback(new Error('请输入' + (rule.field === 'price' ? '价格' : '生产数量')))
    } else if (isNaN(Number(value))) {
        callback(new Error((rule.field === 'price' ? '价格' : '生产数量') + '必须为数字'))
    } else if (Number(value) <= 0) {
        callback(new Error((rule.field === 'price' ? '价格' : '生产数量') + '必须大于0'))
    } else {
        callback()
    }
}

const addRules = reactive({
    productType: [
        { required: true, message: '请输入生产类型', trigger: 'blur' }
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { validator: validateNumber, trigger: ['blur', 'change'] }
    ],
    quantity: [
        { required: true, message: '请输入生产数量', trigger: ['blur', 'change'] },
        { validator: validateNumber, trigger: ['blur', 'change'] }
    ]
})

// 编辑任务相关
const showEditDialog = ref(false)
const currentEditId = ref('')
const editForm = reactive({
    productType: '',
    price: null,
    quantity: null
})
const editFormRef = ref(null)
const editRules = reactive({
    productType: [
        { required: true, message: '请输入生产类型', trigger: 'blur' }
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { validator: validateNumber, trigger: ['blur', 'change'] }
    ],
    quantity: [
        { required: true, message: '请输入生产数量', trigger: ['blur', 'change'] },
        { validator: validateNumber, trigger: ['blur', 'change'] }
    ]
})

// 指派任务相关
const showAssignDialog = ref(false)
const currentAssignId = ref('')
const assignForm = reactive({
    taskId: '',
    productType: '',
    shift: '',
    startTime: ''
})
const assignFormRef = ref(null)
const assignRules = reactive({
    shift: [
        { required: true, message: '请选择班次', trigger: 'change' }
    ],
    startTime: [
        { required: true, message: '请选择起始时间', trigger: 'change' }
    ]
})

// 页面加载时初始化任务列表
onMounted(() => {
    fetchTaskList()
})

// 从Store获取任务列表
const fetchTaskList = async () => {
    await taskStore.fetchTaskList()
}

// 搜索任务
const handleSearch = () => {
    const filtered = taskStore.filterTasks({
        productType: searchForm.productType
    })
    // 直接更新表格数据
    taskStore.taskList = filtered
}

// 重置搜索条件
const resetSearch = async () => {
    searchForm.productType = ''
    // 重新获取完整列表
    await fetchTaskList()
}

// 添加任务提交
const handleAddSubmit = async () => {
    if (!addFormRef.value) return
    const valid = await addFormRef.value.validate()
    if (!valid) return

    try {
        const taskData = {
            name: addForm.productType,
            price: Number(addForm.price),
            quantity: Number(addForm.quantity)
        }

        const success = await taskStore.addNewTask(taskData)
        if (success) {
            showAddDialog.value = false
            // 重置表单
            Object.keys(addForm).forEach(key => {
                addForm[key] = null
            })
            fetchTaskList()
            ElMessage.success('任务添加成功')
        }
    } catch (error) {
        ElMessage.error('添加任务失败: ' + (error.message || '未知错误'))
    }
}

// 编辑任务提交逻辑
const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    const valid = await editFormRef.value.validate()
    if (!valid) return

    try {
        const success = await taskStore.editTask({
            task_id: Number(currentEditId.value),
            name: editForm.productType,
            price: Number(editForm.price),
            quantity: Number(editForm.quantity)
        })
        if (success) {
            showEditDialog.value = false
            fetchTaskList()
            ElMessage.success('任务编辑成功')
        }
    } catch (error) {
        ElMessage.error('编辑任务失败: ' + (error.message || '未知错误'))
    }
}

// 编辑任务数据回显
const handleEdit = (row) => {
    currentEditId.value = row.task_id;
    editForm.productType = row.name;
    editForm.price = Number(row.price);
    editForm.quantity = Number(row.quantity);
    showEditDialog.value = true;
};

// 指派任务数据回显
const handleAssign = (row) => {
    currentAssignId.value = row.task_id;
    assignForm.taskId = row.task_id;
    assignForm.productType = row.name;
    assignForm.shift = '';
    assignForm.startTime = '';
    showAssignDialog.value = true;
};

// 删除任务
const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确定要删除任务【${row.task_id} - ${row.name}】吗？`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            const success = await taskStore.removeTask(row.task_id);
            if (success) {
                fetchTaskList();
                ElMessage.success('任务删除成功');
            }
        } catch (error) {
            ElMessage.error('删除任务失败: ' + (error.message || '未知错误'));
        }
    });
};

// 指派任务提交
const handleAssignSubmit = async () => {
    if (!assignFormRef.value) return
    const valid = await assignFormRef.value.validate()
    if (!valid) return

    try {
        const success = await taskStore.assignTaskToShift({
            task_id: Number(currentAssignId.value),
            shift: assignForm.shift,
            start_time: assignForm.startTime
        })
        if (success) {
            showAssignDialog.value = false
            fetchTaskList()
            ElMessage.success('任务指派成功')
        }
    } catch (error) {
        ElMessage.error('指派任务失败: ' + (error.message || '未知错误'))
    }
}
</script>

<style scoped>
.task-management {
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

.operation-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
}

.text-warning {
    color: #e6a23c;
}

/* 表格加载状态样式 */
:deep(.el-loading-mask) {
    background-color: rgba(255, 255, 255, 0.8);
}
</style>