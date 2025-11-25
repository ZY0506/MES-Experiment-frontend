// src/api/production.js (修改后)
import apiClient from '../permission'

/**
 * 结束指定任务
 * @param {Object} data - 结束任务的数据
 * @param {number} data.task_id - 任务编号（必填，number类型）
 * @param {string} data.endTime - 结束时间（YYYY-MM-DD HH:mm:ss）
 * @returns {Promise} - 操作结果的Promise
 */
export function finishTask(data) {
  // 直接传递完整data对象作为JSON请求体（保持参数键名与后端一致）
  return apiClient.post('/api/task/finish', {
    task_id: data.task_id, // 保持与后端约定的参数名
    end_time: data.endTime
  })
}

export default {
  finishTask
}