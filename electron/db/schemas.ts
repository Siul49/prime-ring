import { z } from 'zod'

// Phase 1 IPC payload schemas. Validate at the boundary so a buggy renderer
// can't crash the DB or silently corrupt state. Same shape as repo row types
// (see repos/eventRepo.ts etc) but enforced at runtime.

const isoString = z
    .string()
    .min(1)
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid ISO datetime' })

const isoDateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

export const EventRowSchema = z.object({
    id: z.string().min(1),
    title: z.string(),
    description: z.string().nullable(),
    startDate: isoString,
    endDate: isoString,
    allDay: z.boolean(),
    categoryId: z.string().nullable(),
    tags: z.array(z.string()),
    color: z.string().nullable(),
    priority: z.enum(['low', 'medium', 'high']),
    recurrenceRrule: z.string().nullable(),
    recurrenceExceptions: z.array(z.string()).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    googleEventId: z.string().nullable(),
    etag: z.string().nullable(),
    syncState: z.enum(['local', 'synced', 'dirty', 'deleted']),
    lastSyncedAt: isoString.nullable(),
    createdAt: isoString,
    updatedAt: isoString,
})

export const EventPatchSchema = EventRowSchema.partial().extend({
    id: z.string().min(1),
})

export const DiaryRowSchema = z.object({
    id: z.string().min(1),
    date: isoDateOnly,
    title: z.string(),
    content: z.string(),
    mood: z.enum(['happy', 'neutral', 'sad', 'excited', 'angry']),
    templateType: z.enum(['morning', 'weekly_retro', 'free']).nullable(),
    createdAt: isoString,
    updatedAt: isoString,
})

export const CategoryRowSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    color: z.string().min(1),
    icon: z.string().nullable(),
    order: z.number().int().min(0),
})

export const IdSchema = z.string().min(1)

export type EventRowInput = z.infer<typeof EventRowSchema>
export type EventPatchInput = z.infer<typeof EventPatchSchema>
export type DiaryRowInput = z.infer<typeof DiaryRowSchema>
export type CategoryRowInput = z.infer<typeof CategoryRowSchema>
