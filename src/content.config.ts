import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const newsCollection = defineCollection({
  loader: glob({ pattern: '[^_]*.{md,mdx}', base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    author: z.string(),
    news_date: z.string(), // YYYY-MM-DD format
    image: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
    audit: z.boolean().optional().default(false),
  }),
});

const eventsCollection = defineCollection({
  loader: glob({ pattern: '[^_]*.{md,mdx}', base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    status: z.enum(['upcoming', 'ongoing', 'completed']),
    event_date: z.string(),
    description: z.string(),
    link: z.string().optional(),
    poster: z.string().optional(),
    image: z.array(z.string()).optional(),
    icon: z.string().optional(),
    organizer: z.string().optional(),
    benefits: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    audit: z.boolean().optional().default(false),
  }),
});

const coursesCollection = defineCollection({
  loader: glob({ pattern: '[^_]*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    code: z.string().optional(),
    semester: z.number().optional(),
    hasPracticum: z.boolean(),
    modules: z
      .array(z.object({ title: z.string(), topics: z.string() }))
      .default([]),
    coordinatorId: z.string(),
    assistantIds: z.array(z.number()).default([]),
    order: z.number(),
  }),
});

export const collections = {
  news: newsCollection,
  events: eventsCollection,
  courses: coursesCollection,
};
