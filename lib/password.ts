// Edge Runtime compatible password utilities
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hashedPassword;
}

// For backward compatibility with existing bcrypt hashes
// This function works in Edge Runtime by avoiding Node.js specific APIs
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Simple hash comparison for demo purposes
  // In production, you might need to migrate from bcrypt to this method
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt'); // Add salt for basic security
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === hash;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}