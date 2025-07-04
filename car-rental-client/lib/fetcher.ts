export async function fetcher(url: string, opts: RequestInit = {}) {
  if (typeof window === 'undefined') {
    throw new Error('fetcher called on the server');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const fullUrl = baseUrl + url;

  const token = localStorage.getItem('token');

  const isFormData = opts.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...opts.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(fullUrl, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res;
}
