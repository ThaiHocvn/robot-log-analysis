import axiosClient from './axiosInterceptor'
import { API_GET_LOGS, API_GET_ORGANIZATIONS, API_GET_SESSION_LOGS } from './constants/api'

export interface Organization {
  organizationId: string
  organizationName: string
}

export interface Metadata {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T> {
  metadata: Metadata
  result: T
}

const logApi = {
  getLogs(payload: any) {
    return axiosClient
      .post<ApiResponse<any[]>>(API_GET_LOGS, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((response) => response.data)
  },
  getOrganizations(startDate: string, endDate: string) {
    return axiosClient
      .get<any[]>(`${API_GET_ORGANIZATIONS}?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((response) => response.data)
  },
  getSessionLogs(payload: any) {
    return axiosClient
      .post<ApiResponse<any[]>>(API_GET_SESSION_LOGS, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((response) => response.data)
  }
}

export default logApi
