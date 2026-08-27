import { API_BASE_URL } from "../config";
import {
  clearWechatSession,
  ensureWechatSession,
  getSessionToken,
} from "./session";

export class ApiError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  header?: Record<string, string>;
};

function wxRequest<T>(path: string, options: RequestOptions, token?: string | null) {
  return new Promise<T>((resolve, reject) => {
    wx.request<T & { error?: string }>({
      url: `${API_BASE_URL}${path}`,
      method: options.method ?? "GET",
      data: options.data as WechatMiniprogram.RequestOption["data"],
      header: {
        accept: "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      timeout: 15_000,
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        reject(new ApiError(response.data?.error || `请求失败（${response.statusCode}）`, response.statusCode));
      },
      fail: (error) => reject(new ApiError(error.errMsg || "网络连接失败", 0)),
    });
  });
}

export function publicRequest<T>(path: string) {
  return wxRequest<T>(path, { method: "GET" });
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  let token = getSessionToken();
  if (!token) token = (await ensureWechatSession())?.token ?? null;
  if (!token) throw new ApiError("微信同步尚未连接", 401);
  try {
    return await wxRequest<T>(path, options, token);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401 && !retried) {
      clearWechatSession();
      const refreshed = await ensureWechatSession(true);
      if (refreshed) return apiRequest<T>(path, options, true);
    }
    throw error;
  }
}

export function uploadRecording(lessonId: string, tempFilePath: string, contentType = "audio/mp4") {
  return new Promise<{ recording: { id: string; lessonId: string; createdAt: string; byteSize: number } }>((resolve, reject) => {
    const token = getSessionToken();
    if (!token) {
      reject(new ApiError("登录后才能跨设备保存录音", 401));
      return;
    }
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      success: ({ data }) => {
        wx.request<{ recording?: { id: string; lessonId: string; createdAt: string; byteSize: number }; error?: string }>({
          url: `${API_BASE_URL}/api/recordings?lessonId=${encodeURIComponent(lessonId)}`,
          method: "POST",
          data,
          header: {
            authorization: `Bearer ${token}`,
            "content-type": contentType,
          },
          timeout: 30_000,
          success: (response) => response.statusCode === 201 && response.data.recording
            ? resolve({ recording: response.data.recording })
            : reject(new ApiError(response.data.error || "录音上传失败", response.statusCode)),
          fail: (error) => reject(new ApiError(error.errMsg || "录音上传失败", 0)),
        });
      },
      fail: (error) => reject(new ApiError(error.errMsg || "无法读取录音", 0)),
    });
  });
}

export function downloadRecording(recordingId: string) {
  return new Promise<string>((resolve, reject) => {
    const token = getSessionToken();
    if (!token) {
      reject(new ApiError("登录后才能回听云端录音", 401));
      return;
    }
    wx.downloadFile({
      url: `${API_BASE_URL}/api/recordings?id=${encodeURIComponent(recordingId)}`,
      header: { authorization: `Bearer ${token}` },
      timeout: 30_000,
      success: (response) => response.statusCode === 200
        ? resolve(response.tempFilePath)
        : reject(new ApiError(`录音下载失败（${response.statusCode}）`, response.statusCode)),
      fail: (error) => reject(new ApiError(error.errMsg || "录音下载失败", 0)),
    });
  });
}
