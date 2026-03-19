import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    math: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    toc: z.boolean().optional(),
    disableShare: z.boolean().optional(),
    slug: z.string().optional(),
    lastmod: z.coerce.date().optional(),
  }),
});

export const collections = { posts };
