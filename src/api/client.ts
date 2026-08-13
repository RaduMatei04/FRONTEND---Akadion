import { ApiError } from "@/types/api"

type QueryValue = string | number | boolean | null | undefined

interface RequestOptions {
  body?: BodyInit | object | null
  headers?: HeadersInit
  params?: Record<string, QueryValue>
}

interface ApiClientResponse<T> {
  data: T
}

interface ForbiddenHandlerContext {
  error: ApiError
  requestUrl: string
}

type ForbiddenHandler = (context: ForbiddenHandlerContext) => void

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

let businessForbiddenHandler: ForbiddenHandler | null = null

function getCookie(name: string) {
  const cookiePrefix = `${encodeURIComponent(name)}=`
  const cookie = document.cookie
    .split(";")
    .map((cookiePart) => cookiePart.trim())
    .find((cookiePart) => cookiePart.startsWith(cookiePrefix))

  if (!cookie) {
    return ""
  }

  return decodeURIComponent(cookie.slice(cookiePrefix.length))
}

function buildUrl(path: string, params?: Record<string, QueryValue>) {
  const url = new URL(path, window.location.origin)

  if (!params) {
    return `${url.pathname}${url.search}`
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return
    }

    url.searchParams.set(key, String(value))
  })

  return `${url.pathname}${url.search}`
}

function isBodyInit(value: unknown): value is BodyInit {
  return value instanceof FormData
    || value instanceof URLSearchParams
    || value instanceof Blob
    || value instanceof ArrayBuffer
    || ArrayBuffer.isView(value)
    || typeof value === "string"
}

async function parseResponseBody(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return undefined
  }

  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  return text ? text : undefined
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<ApiClientResponse<T>> {
  const headers = new Headers(options.headers)
  const url = buildUrl(path, options.params)
  const isSafeMethod = SAFE_METHODS.has(method)
  const csrfToken = isSafeMethod ? "" : getCookie("XSRF-TOKEN")

  let body: BodyInit | undefined

  if (options.body !== null && options.body !== undefined) {
    if (isBodyInit(options.body)) {
      body = options.body
    } else {
      headers.set("Content-Type", "application/json")
      body = JSON.stringify(options.body)
    }
  }

  if (csrfToken) {
    headers.set("X-XSRF-TOKEN", csrfToken)
  }

  const response = await fetch(url, {
    method,
    body,
    headers,
    credentials: "include",
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    const error = new ApiError({
      message: typeof data === "string" ? data : undefined,
      response: {
        status: response.status,
        data: data && typeof data === "object" ? data as Record<string, unknown> : undefined,
      },
      requestUrl: url,
    })

    if (response.status === 403 && !url.includes("/api/auth/me")) {
      businessForbiddenHandler?.({ error, requestUrl: url })
    }

    throw error
  }

  return { data: data as T }
}

const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return request<T>("GET", path, options)
  },
  post<T>(path: string, body?: RequestOptions["body"], options?: Omit<RequestOptions, "body">) {
    return request<T>("POST", path, { ...options, body })
  },
  put<T>(path: string, body?: RequestOptions["body"], options?: Omit<RequestOptions, "body">) {
    return request<T>("PUT", path, { ...options, body })
  },
  patch<T>(path: string, body?: RequestOptions["body"], options?: Omit<RequestOptions, "body">) {
    return request<T>("PATCH", path, { ...options, body })
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>("DELETE", path, options)
  },
  setBusinessForbiddenHandler(handler: ForbiddenHandler | null) {
    businessForbiddenHandler = handler
  },
}

export default apiClient
