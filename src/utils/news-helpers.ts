import type { CollectionEntry } from 'astro:content';

/**
 * Calculates estimated reading time for a text content.
 * Average reading speed: ~200 words per minute.
 */
export function calculateReadingTime(text: string | undefined | null): string {
  if (!text) return '1 mnt baca';

  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);

  return `${minutes < 1 ? 1 : minutes} mnt baca`;
}

/**
 * Recommends related news articles based on matching category or shared tags.
 */
export function getRelatedNews(
  currentId: string,
  newsList: CollectionEntry<'news'>[],
  limit: number = 3
): CollectionEntry<'news'>[] {
  const currentItem = newsList.find(n => n.id === currentId);
  if (!currentItem) {
    return newsList.filter(n => n.id !== currentId).slice(0, limit);
  }

  const currentCategory = currentItem.data.category;
  const currentTags = currentItem.data.tags || [];

  const scoredList = newsList
    .filter(n => n.id !== currentId)
    .map(item => {
      let score = 0;
      if (item.data.category === currentCategory) {
        score += 5;
      }
      const itemTags = item.data.tags || [];
      const sharedTags = itemTags.filter((t: string) => currentTags.includes(t));
      score += sharedTags.length * 2;

      return { item, score };
    });

  scoredList.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const timeA = new Date(a.item.data.news_date).getTime();
    const timeB = new Date(b.item.data.news_date).getTime();
    return timeB - timeA;
  });

  return scoredList.map(s => s.item).slice(0, limit);
}
