import { prisma } from "@/lib/prisma/client";

// Cache for system settings to reduce database queries
let settingsCache: Record<string, string> = {};
let cacheExpiry = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get a system setting value
 * @param key The setting key
 * @param defaultValue Default value if setting not found
 * @returns The setting value
 */
export async function getSystemSetting(key: string, defaultValue: string = "false"): Promise<string> {
  const now = Date.now();
  
  // If cache is expired, refresh it
  if (now > cacheExpiry) {
    try {
      const settings = await prisma.adminSetting.findMany();
      settingsCache = {};
      
      // Populate cache with settings
      settings.forEach(setting => {
        settingsCache[setting.key] = setting.value;
      });
      
      // Set cache expiry
      cacheExpiry = now + CACHE_TTL;
    } catch (error) {
      console.error("Error fetching system settings:", error);
      return defaultValue;
    }
  }
  
  // Return from cache or default
  return settingsCache[key] || defaultValue;
}

/**
 * Check if PRO content should be shown to all users
 * @returns Boolean indicating if PRO content should be shown to all
 */
export async function shouldShowProToAll(): Promise<boolean> {
  const value = await getSystemSetting("showProToAll", "false");
  return value === "true";
}

/**
 * Update a system setting
 * @param key The setting key
 * @param value The setting value
 * @param description Optional description of the setting
 * @returns Boolean indicating if the update was successful
 */
export async function updateSystemSetting(
  key: string, 
  value: string, 
  description?: string
): Promise<boolean> {
  try {
    await prisma.adminSetting.upsert({
      where: { key },
      update: { 
        value,
        description: description ? description : undefined,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        description,
      }
    });
    
    // Update cache
    settingsCache[key] = value;
    
    return true;
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error);
    return false;
  }
}
