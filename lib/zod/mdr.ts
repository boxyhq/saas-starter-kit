import { z } from 'zod';

export const createMdrProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  clientName: z.string().max(200).optional(),
  projectNumber: z.string().max(100).optional(),
  discipline: z.string().max(100).optional(),
});

export const updateMdrProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  clientName: z.string().max(200).optional(),
  projectNumber: z.string().max(100).optional(),
  discipline: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'FINAL']).optional(),
  finalizeOption: z.enum(['KEEP', 'ARCHIVE']).optional(),
});

export const createMdrSectionSchema = z.object({
  title: z.string().min(1).max(300),
  parentSectionId: z.string().uuid().optional().nullable(),
  docNumberFormat: z.string().max(100).optional(),
  requiredDocCount: z.number().int().min(0).optional(),
});

export const updateMdrSectionSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  docNumberFormat: z.string().max(100).optional(),
  requiredDocCount: z.number().int().min(0).optional(),
});

export const reorderSectionsSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
});

export const createMdrDocumentSchema = z.object({
  s3Key: z.string().min(1),
  sha256Hash: z.string().optional(),
  title: z.string().min(1).max(500),
  docNumber: z.string().min(1).max(100),
  discipline: z.string().max(100).optional(),
  revision: z.string().max(20).optional(),
  status: z
    .enum(['DRAFT', 'FOR_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'VOID'])
    .optional(),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  originalName: z.string().min(1),
  docDate: z.string().datetime().optional().nullable(),
  changeNote: z.string().max(1000).optional(),
});

export const updateMdrDocumentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  docNumber: z.string().min(1).max(100).optional(),
  discipline: z.string().max(100).optional(),
  revision: z.string().max(20).optional(),
  status: z
    .enum(['DRAFT', 'FOR_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'VOID'])
    .optional(),
  docDate: z.string().datetime().optional().nullable(),
});

export const uploadUrlSchema = z.object({
  sha256Hash: z.string().optional(),
  mimeType: z.string().min(1),
  filename: z.string().min(1),
  sectionId: z.string().uuid().optional(),
});

export const createMdrInboxSchema = z.object({
  emailAddress: z.string().email(),
  mdrProjectId: z.string().uuid().optional().nullable(),
});

export const routeAttachmentSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().min(1).max(500),
  docNumber: z.string().min(1).max(100),
  discipline: z.string().max(100).optional(),
  revision: z.string().max(20).optional(),
});

export const createMdrInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
});

export const updateMdrMemberSchema = z.object({
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
});

export const createTransmittalSchema = z.object({
  transmittalNumber: z.string().min(1).max(50),
  purpose: z
    .enum(['IFC', 'IFA', 'IFI', 'FOR_REVIEW', 'FOR_APPROVAL', 'FOR_INFORMATION'])
    .optional(),
  toName: z.string().max(200).optional(),
  toEmail: z.string().email().optional(),
  fromName: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export const updateTransmittalSchema = z.object({
  purpose: z
    .enum(['IFC', 'IFA', 'IFI', 'FOR_REVIEW', 'FOR_APPROVAL', 'FOR_INFORMATION'])
    .optional(),
  toName: z.string().max(200).optional(),
  toEmail: z.string().email().optional(),
  fromName: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export const addTransmittalDocumentSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1),
});

export const createShareLinkSchema = z.object({
  compilationId: z.string().uuid(),
  expiresInHours: z.number().int().min(1).max(8760),
  password: z.string().max(100).optional(),
  maxDownloads: z.number().int().min(1).optional(),
});

export const bulkDocumentActionSchema = z.object({
  action: z.enum(['move', 'status', 'delete']),
  documentIds: z.array(z.string().uuid()).min(1),
  targetSectionId: z.string().uuid().optional(),
  status: z
    .enum(['DRAFT', 'FOR_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'VOID'])
    .optional(),
});

export const assignSectionSchema = z.object({
  sourceMdrProjectId: z.string().uuid(),
  sourceSectionId: z.string().uuid().optional(),
});

export const updateBrandingSchema = z.object({
  logoPlacements: z.array(z.enum(['cover', 'header', 'footer'])).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
});
