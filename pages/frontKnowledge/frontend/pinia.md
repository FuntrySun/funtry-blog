# pinia封装
:::info
🎇来自Continew—Admin的封装
:::
---
:::details
```typescript
import axios from 'axios'
import qs from 'query-string'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores'
import { getToken } from '@/utils/auth'
import modalErrorWrapper from '@/utils/modal-error-wrapper'
import messageErrorWrapper from '@/utils/message-error-wrapper'
import notificationErrorWrapper from '@/utils/notification-error-wrapper'
import 'nprogress/nprogress.css'
import router from '@/router'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

interface ICodeMessage {
  [propName: number]: string
}

const StatusCodeMessage: ICodeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求出错(404)',
  408: '请求超时(408)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网络错误(502)',
  503: '服务不可用(503)',
  504: '网络超时(504)'
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX ?? import.meta.env.VITE_API_BASE_URL,
  timeout: 30 * 1000
})

// 请求拦截器
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    NProgress.start() // 进度条
    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    const { success, code, msg } = data
    if (response.request.responseType === 'blob') {
      NProgress.done()
      return response
    }
    // 成功
    if (success) {
      NProgress.done()
      return response
    }

    // Token 失效
    if (code === '401' && response.config.url !== '/auth/user/info') {
      modalErrorWrapper({
        title: '提示',
        content: msg,
        maskClosable: false,
        escToClose: false,
        okText: '重新登录',
        async onOk() {
          NProgress.done()
          const userStore = useUserStore()
          userStore.logoutCallBack()
          router.replace('/login')
        }
      })
    } else {
      NProgress.done()
      // 如果错误信息长度过长，使用 Notification 进行提示
      if (msg.length <= 15) {
        messageErrorWrapper({
          content: msg || '服务器端错误',
          duration: 5 * 1000
        })
      } else {
        notificationErrorWrapper(msg || '服务器端错误')
      }
    }
    return Promise.reject(new Error(msg || '服务器端错误'))
  },
  (error) => {
    NProgress.done()
    const response = Object.assign({}, error.response)
    response
    && messageErrorWrapper({
      content: StatusCodeMessage[response.status] || '服务器暂时未响应，请刷新页面并重试。若无法解决，请联系管理员',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

const request = <T = unknown>(config: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return new Promise((resolve, reject) => {
    http
      .request<T>(config)
      .then((res: AxiosResponse) => resolve(res.data))
      .catch((err: { msg: string }) => reject(err))
  })
}

const requestNative = <T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    http
      .request<T>(config)
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: { msg: string }) => reject(err))
  })
}

const get = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'get',
    url,
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj)
    },
    ...config
  })
}

const post = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'post',
    url,
    data: params,
    ...config
  })
}

const put = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'put',
    url,
    data: params,
    ...config
  })
}

const patch = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'patch',
    url,
    data: params,
    ...config
  })
}

const del = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'delete',
    url,
    data: params,
    ...config
  })
}
const download = (url: string, params?: object, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  return requestNative({
    method: 'get',
    url,
    responseType: 'blob',
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj)
    },
    ...config
  })
}
export default { get, post, put, patch, del, request, requestNative, download }

```
:::

## 解析
### 1. 导入模块

```typescript
import axios from 'axios'
import qs from 'query-string'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores'
import { getToken } from '@/utils/auth'
import modalErrorWrapper from '@/utils/modal-error-wrapper'
import messageErrorWrapper from '@/utils/message-error-wrapper'
import notificationErrorWrapper from '@/utils/notification-error-wrapper'
import 'nprogress/nprogress.css'
import router from '@/router'
```


- `axios`：用于发送 HTTP 请求的库。
- `query-string`：用于序列化和解析查询字符串的库。
- `NProgress`：用于显示进度条的库，增加用户的交互反馈。
- `useUserStore`、`getToken`、`modalErrorWrapper`、`messageErrorWrapper` 和 `notificationErrorWrapper`：分别用于状态管理、获取用户 token 和处理错误的工具函数。
- 引入相关 CSS 文件以配置 NProgress。

### 2. NProgress 配置

```typescript
NProgress.configure({ showSpinner: false }) // NProgress Configuration
```

- 配置进度条，不显示旋转的加载图标。

### 3. 状态码信息定义

```typescript
interface ICodeMessage {
  [propName: number]: string
}

const StatusCodeMessage: ICodeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  ...
  504: '网络超时(504)'
}
```


- 定义一个接口 `ICodeMessage` 来存储状态码及其对应的描述信息，以便在发生错误时提供用户相关信息。

### 4. Axios 实例创建

```typescript
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX ?? import.meta.env.VITE_API_BASE_URL,
  timeout: 30 * 1000
})
```


- 创建一个 `axios` 实例，并设置基本 URL 和请求超时时间。

### 5. 请求拦截器

```typescript
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    NProgress.start() // 进度条
    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```


- 在请求发送前，启动进度条，并检查用户是否有 token，若有则在请求头中添加认证信息。

### 6. 响应拦截器

```typescript
http.interceptors.response.use(
  (response: AxiosResponse) => {
    ...
  },
  (error) => {
    ...
  }
)
```

- 在接收到响应时，进行处理：成功则结束进度条；若失败则根据 `code` 显示相关错误消息，且若为401（未授权）且请求路径不为 `/auth/user/info`，则提示用户重新登录。

### 7. 请求方法封装

```typescript
const request = <T = unknown>(config: AxiosRequestConfig): Promise<ApiRes<T>> => { ... }
const requestNative = <T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse> => { ... }
```

- 封装了一些请求方法，如 `get`、`post`、`put`、`patch`、`delete`、`download` 等，简化了调用时的配置，增加了代码可读性。