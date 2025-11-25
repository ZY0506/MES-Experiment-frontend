// src/store/productionStore.js (修改后)
import { defineStore } from 'pinia'
import { finishTask } from '@/api/production'
import { ElMessage } from 'element-plus'
import { useTaskStore } from './taskStore'

export const useProductionStore = defineStore('production', () => {
  /**
   * 获取指定班次的数据（通过本地筛选）
   * @param {string} shift - 班次名称
   * @returns {Object} - 班次数据
   */
  async function fetchShiftData(shift) {
    try {
      const taskStore = useTaskStore()
      // 确保已加载所有任务
      if (taskStore.taskList.length === 0) {
        await taskStore.fetchTaskList({ page: 1, pageSize: 1000 }) // 加载足够多的任务
      }
      
      // 本地筛选该班次的任务
      const shiftTasks = taskStore.taskList.filter(task => task.shift === shift)
      
      // 计算统计数据
      const totalAmount = shiftTasks.reduce((sum, task) => {
        return sum + (task.price * task.quantity)
      }, 0)
      
      const unfinishedTasks = shiftTasks.filter(task => !task.end_time || task.end_time === '未完成').length
      
      return {
        totalAmount,
        totalTasks: shiftTasks.length,
        unfinishedTasks,
        tasks: shiftTasks
      }
    } catch (error) {
      ElMessage.error('获取班次数据失败: ' + error.message)
      return null
    }
  }

  /**
   * 结束指定任务
   * @param {Object} data - 结束任务的数据
   * @returns {Promise<boolean>} - 是否成功
   */
  async function completeTask(data) {
    try {
      const response = await finishTask(data)
      if (response.data.code === 1) {
        ElMessage.success('任务已结束')
        return true
      } else {
        ElMessage.error(response.data.msg || '结束任务失败')
        return false
      }
    } catch (error) {
      ElMessage.error('结束任务失败: ' + error.message)
      return false
    }
  }

  return {
    fetchShiftData,
    completeTask
  }
})