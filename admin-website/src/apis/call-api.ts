import type {BasicApi} from "@/apis/http-type.ts";
import type {UseNavigateResult} from "@tanstack/react-router";

export const callApi = async <Req, Res>({api, params, body, query, router}: {
  api: BasicApi,
  params?: string[],
  body: Req,
  query?: string[],
  router?: UseNavigateResult<string>
}): Promise<Res> => {
  const endpoint = import.meta.env.VITE_APP_URL as string;

  let url = endpoint + api.url;

  // Append parameters to the URL if provided
  if (params && params.length > 0) {
    params.forEach((param, index) => {
      console.log(`Replacing {${index}} with ${param} in URL: ${url}`);
      url = url.replace(`{${index}}`, param);
    })
  }

  // Append query parameters to the URL if provided
  if (query && query.length > 0) {
    const queryString = query.map((q, index) => `q${index}=${encodeURIComponent(q)}`).join('&');
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  const response = await fetch(url, {
    method: api.method,
    headers: {
      'Content-Type': api.contentType || 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401) {
      if (router) {
        await router({
          to: '/login',
          replace: true,
        })
      }
    }

    console.error(response.statusText);
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return await response.json() as Res;
};