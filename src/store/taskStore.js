// src/store/taskStore.js
import { defineStore } from 'pinia'
import { getTaskList, addTask, updateTask, deleteTask, assignTask} from '@/api/task'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

export const useTaskStore = defineStore('task', () => {
  const taskList = ref([])
  const total = ref(0)
  const pages = ref(0)
  const loading = ref(false)

  /**
   * 获取任务列表（支持分页和搜索）
   * @param {Object} params - 查询参数，包含page、pageSize和搜索条件
   * @returns {Promise<boolean>} - 是否成功
   */
  async function fetchTaskList(params = { page: 1, pageSize: 10 }) {
    loading.value = true
    try {
      const response = await getTaskList(params)
      if (response.data.code === 1) {
        taskList.value = response.data.data.list
        total.value = response.data.data.total
        pages.value = response.data.data.pages
        return true
      } else {
        ElMessage.error(response.data.msg || '获取任务列表失败')
        return false
      }
    } catch (error) {
      ElMessage.error('获取任务列表失败: ' + error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加新任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<boolean>} - 是否成功
   */
  async function addNewTask(taskData) {
    loading.value = true
    try {
      const response = await addTask(taskData)
      if (response.data.code === 1) {
        ElMessage.success('任务添加成功')
        return true
      } else {
        ElMessage.error(response.data.msg || '添加任务失败')
        return false
      }
    } catch (error) {
      ElMessage.error('添加任务失败: ' + error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新任务
   * @param {Object} data - 任务数据，包含task_id
   * @returns {Promise<boolean>} - 是否成功
   */
  async function editTask(data) {
    loading.value = true
    try {
      const response = await updateTask(data)
      if (response.data.code === 1) {
        ElMessage.success('任务更新成功')
        return true
      } else {
        ElMessage.error(response.data.msg || '更新任务失败')
        return false
      }
    } catch (error) {
      ElMessage.error('更新任务失败: ' + error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<boolean>} - 是否成功
   */
  async function removeTask(taskId) {
    loading.value = true
    try {
      const response = await deleteTask(taskId)
      if (response.data.code === 1) {
        ElMessage.success('任务删除成功')
        return true
      } else {
        ElMessage.error(response.data.msg || '删除任务失败')
        return false
      }
    } catch (error) {
      ElMessage.error('删除任务失败: ' + error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 指派任务
   * @param {Object} data - 指派信息，包含task_id, shift, start_time
   * @returns {Promise<boolean>} - 是否成功
   */
  async function assignTaskToShift(data) {
    loading.value = true
    try {
      const response = await assignTask(data)
      if (response.data.code === 1) {
        ElMessage.success('任务指派成功')
        return true
      } else {
        ElMessage.error(response.data.msg || '指派任务失败')
        return false
      }
    } catch (error) {
      ElMessage.error('指派任务失败: ' + error.message)
      return false
    } finally {
      loading.value = false
    }
  }

  
/**
 * 搜索任务（使用现有getTaskList接口）
 * @param {Object} params - 搜索参数
 * @returns {Promise<boolean>} - 是否成功
 */
async function searchTaskList(params) {
  loading.value = true
  try {
    // 改为使用 getTaskList 接口，因为它已支持接收参数
    const response = await getTaskList(params)
    if (response.data.code === 1) {
      taskList.value = response.data.data.list
      total.value = response.data.data.total
      pages.value = response.data.data.pages
      return true
    } else {
      ElMessage.error(response.data.msg || '搜索任务失败')
      return false
    }
  } catch (error) {
    ElMessage.error('搜索任务失败: ' + error.message)
    return false
  } finally {
    loading.value = false
  }
}
  /**
 * 筛选任务列表（本地筛选）
 * @param {Object} filters - 筛选条件
 * @returns {Array} - 筛选后的任务列表
 */
function filterTasks(filters = {}) {
    return taskList.value.filter(task => {
        // 生产类型筛选（使用name字段匹配）
        if (filters.productType && !task.name.includes(filters.productType)) {
            return false
        }
        // 班次筛选
        if (filters.shift && task.shift !== filters.shift) {
            return false
        }
        return true
    })
}

return {
  taskList,
  total,
  pages,
  loading,
  fetchTaskList,
  addNewTask,
  editTask,
  removeTask,
  assignTaskToShift,
  filterTasks  // 新增筛选方法
}
})