import request from "@/utils/request";

export interface LoginParams {
  username: string;
  password: string;
  code?: string;
  uuid?: string;
}

export interface CaptchaResult {
  uuid: string;
  img: string;
  captchaEnabled?: boolean;
}

/**
 * 获取验证码图片
 */
export const getCodeImg = () => {
  return request<CaptchaResult>("/api/captchaImage");
};

export interface LoginResult {
  token: string;
  user: {
    userId: number;
    userName: string;
    nickName: string;
    avatar: string;
  };
}

export interface UserInfoResult {
  user: {
    userId: number;
    userName: string;
    nickName: string;
    avatar: string;
  };
  roles: string[];
  permissions: string[];
}

/**
 * 账号登录
 */
export const login = (data: LoginParams) => {
  return request<LoginResult>("/api/login", {
    method: "POST",
    body: data
  });
};

/**
 * 获取当前登录用户信息
 */
export const getInfo = () => {
  return request<UserInfoResult>("/api/getInfo");
};

/**
 * 退出登录
 */
export const logout = () => {
  return request("/api/logout", {
    method: "POST"
  });
};
