const API_ENDPOINT = "http://localhost:8000"

export async function getArticles(filter) {
  const response = await fetch(`${API_ENDPOINT}/api/v1/article`);
  return await response.json();
}

export async function getFeeds(filter) {
    const response = await fetch(`${API_ENDPOINT}/api/v1/feed`);
    return await response.json();
}