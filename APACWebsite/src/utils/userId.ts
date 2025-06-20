// Utility for userId generation and management

/**
 * Generates a random userId if one doesn't exist in localStorage
 * @returns The userId from localStorage or a newly generated one
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    // Handle server-side rendering case
    return '';
  }
  
  // Check if userId already exists in localStorage
  let userId = localStorage.getItem('decathlon_user_id');
  
  if (!userId) {
    // Generate a new userId if one doesn't exist
    userId = generateUserId();
    
    // Store in localStorage for future sessions
    localStorage.setItem('decathlon_user_id', userId);
  }
  
  return userId;
}

/**
 * Generates a random userId
 * @returns A random string that can be used as userId
 */
function generateUserId(): string {
  // Generate a random string with timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 10);
  return `user_${timestamp}_${random}`;
}
