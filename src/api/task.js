// src/api/task.js (修改后)
import apiClient from '../permission'

/**
 * 获取任务列表
 * @param {Object} params - 查询参数，包含page和pageSize
 * @returns {Promise} - 任务列表数据
 */
export function getTaskList(params) {
  return apiClient.get('/api/task/list', { params })
}

/**
 * 添加新任务
 * @param {Object} data - 任务数据
 * @returns {Promise} - 操作结果
 */
export function addTask(data) {
  // POST请求通过请求体传递JSON
  return apiClient.post('/api/task/create', data)
}

/**
 * 更新任务信息
 * @param {Object} data - 更新的任务数据，包含task_id
 * @returns {Promise} - 操作结果
 */
export function updateTask(data) {
  // PUT请求通过请求体传递JSON
  return apiClient.put('/api/task/update', data)
}

/**
 * 删除任务
 * @param {string|number} id - 任务ID
 * @returns {Promise} - 操作结果
 */
export function deleteTask(id) {
  return apiClient.delete('/api/task/delete', {
    params: { id } // 通过URL参数传递，等价于 /api/task/delete?id=xxx
  })
}

/**
 * 指派任务
 * @param {Object} data - 指派信息
 * @param {number} data.task_id - 任务编号（必填，number类型）
 * @param {string} data.shift - 班次（必填）
 * @param {string} data.start_time - 起始时间（必填）
 * @returns {Promise} - 操作结果
 */
export function assignTask(data) {
  // POST请求通过请求体传递JSON
  return apiClient.post('/api/task/assign', data)
}

export default {
  getTaskList,
  addTask,
  updateTask,
  deleteTask,
  assignTask
}