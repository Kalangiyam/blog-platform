import axios from 'axios'

import { environment } from '../config/environment.js'

export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
})