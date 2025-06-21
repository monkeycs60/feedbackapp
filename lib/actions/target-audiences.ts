"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

/**
 * Helper function to get the current authenticated user
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  
  return session.user;
}

// Predefined target audiences for SaaS
const DEFAULT_TARGET_AUDIENCES = [
  // Professionals
  "Développeurs",
  "Designers", 
  "Marketeurs",
  "Product Managers",
  "Data Scientists",
  "DevOps",
  "Commerciaux",
  "RH",
  "Comptables",
  "Juristes",
  "Consultants",
  "Project Managers",
  
  // Entreprises
  "Startups",
  "PME",
  "Grandes entreprises",
  "Agences",
  "E-commerce",
  "SaaS B2B",
  "Éditeurs de logiciels",
  
  // Secteurs spécifiques
  "Santé",
  "Éducation",
  "Finance",
  "Immobilier",
  "Restauration",
  "Tourisme",
  "Media",
  "Associations",
  
  // Indépendants
  "Freelances",
  "Créateurs de contenu",
  "Coaches",
  "Formateurs",
  
  // Équipes spécifiques
  "Équipes techniques",
  "Équipes produit",
  "Équipes marketing",
  "Équipes support",
  "Direction",
  
  // Par taille
  "Solopreneurs",
  "Équipes < 10",
  "Équipes 10-50",
  "Équipes 50+"
];

/**
 * Initialize default target audiences in the database
 */
export async function initializeTargetAudiences() {
  try {
    const existingCount = await prisma.targetAudience.count();
    
    // Only initialize if the table is empty
    if (existingCount === 0) {
      await prisma.targetAudience.createMany({
        data: DEFAULT_TARGET_AUDIENCES.map(name => ({
          name,
          isDefault: true
        }))
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing target audiences:", error);
    throw new Error("Erreur lors de l'initialisation des audiences");
  }
}

/**
 * Get all target audiences
 */
export async function getTargetAudiences() {
  try {
    const audiences = await prisma.targetAudience.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });
    
    return audiences;
  } catch (error) {
    console.error("Error fetching target audiences:", error);
    return [];
  }
}

const createTargetAudienceSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères").max(50)
});

/**
 * Create a new custom target audience
 */
export async function createTargetAudience(data: z.infer<typeof createTargetAudienceSchema>) {
  try {
    const user = await getCurrentUser();
    
    const validation = createTargetAudienceSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides: " + validation.error.issues.map(i => i.message).join(', '));
    }
    
    const validData = validation.data;
    
    // Check if audience already exists (case insensitive)
    const existing = await prisma.targetAudience.findFirst({
      where: { 
        name: {
          equals: validData.name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existing) {
      throw new Error("Cette audience existe déjà");
    }
    
    // Create new audience
    const audience = await prisma.targetAudience.create({
      data: {
        name: validData.name,
        isDefault: false,
        createdBy: user.id
      }
    });
    
    return audience;
  } catch (error) {
    console.error("Error creating target audience:", error);
    throw new Error("Erreur lors de la création de l'audience");
  }
}