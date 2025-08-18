import axios from 'axios'

const axiosClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Add custom headers or modify config before request is sent
    config.headers['X-Request-ID'] = Math.random().toString(36).slice(2)

    return config
  },
  (error) => {
    // Handle request errors
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          console.error('Unauthorized, redirecting to login...')
          // Optionally redirect to login page
          // window.location.href = '/login';
          break
        case 403:
          console.error('Forbidden access')
          break
        case 404:
          console.error('Resource not found')
          break
        default:
          console.error('Server error:', error.response.status)
      }
    } else if (error.request) {
      // No response received
      console.error('No response received:', error.request)
    } else {
      // Error setting up the request
      console.error('Error setting up request:', error.message)
    }

    return Promise.reject(error)
  }
)

export default axiosClient
