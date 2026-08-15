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
    open_date: z.string().optional(),
    deadline: z.string().optional(),
    description: z.string(),
    link: z.string().optional(),
    poster: z.string().optional(),
    image: z.array(z.string()).optional(),
    icon: z.string().optional(),
    organizer: z.string().optional(),
    benefits: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    show_register: z.boolean().optional().default(true),
    audit: z.boolean().optional().default(false),
    success_message: z.string().optional(),
    form_sections: z.array(z.any()).optional(),
    form_fields: z.array(z.any()).optional(),
  }),
});

const formsCollection = defineCollection({
  loader: glob({ pattern: '[^_]*.{json,md,mdx}', base: "./src/content/forms" }),
  schema: z.object({
    title: z.string(),
    category: z.string().optional().default('Form'),
    formType: z.enum(['event', 'generic']).optional().default('generic'),
    status: z.enum(['open', 'upcoming', 'closed']).optional().default('open'),
    open_date: z.string().optional(),
    deadline: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional().default('fa-solid fa-file-pen'),
    success_message: z.string().optional(),
    form_sections: z.array(z.any()).optional(),
    form_fields: z.array(z.any()).optional(),
    formSections: z.array(z.any()).optional(),
    formFields: z.array(z.any()).optional(),
    audit: z.boolean().optional().default(false),
  }),
});

export const collections = {
  news: newsCollection,
  events: eventsCollection,
  forms: formsCollection,
};
