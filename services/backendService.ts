import axios, { AxiosResponse } from 'axios';

const ADMIN_KEY = process.env.BRIEFS_ADMIN_KEY || process.env.BREIFS_ADMIN_KEY;

export type BlogResponse = {
  blog: {
    slug: string;
  };
};

export type UploadResponse = {
  url: string;
};

const getAdminHeaders = () => {
  if (!ADMIN_KEY) {
    throw new Error('BRIEFS_ADMIN_KEY is not configured.');
  }

  return {
    'x-admin-key': ADMIN_KEY,
  };
};

export const postToBackend = async <TResponse>(
  url: string,
  body: unknown
): Promise<AxiosResponse<TResponse>> => {
  return axios.post<TResponse>(url, body, {
    headers: getAdminHeaders(),
  });
};
