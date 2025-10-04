/**
 * CLIENT UTILITIES
 * 
 * Purpose:
 * Helper functions for working with Client data, especially name formatting
 * 
 * Functions:
 * - getClientDisplayName: Get formatted name for display
 * - getClientSortName: Get name for sorting
 * - getClientInitials: Get initials for avatars
 */

interface ClientNameFields {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
}

/**
 * Get display name for a client
 * Returns companyName if present, otherwise "FirstName LastName"
 */
export function getClientDisplayName(client: ClientNameFields): string {
  if (client.companyName) {
    return client.companyName;
  }
  
  const firstName = client.firstName?.trim() || '';
  const lastName = client.lastName?.trim() || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  if (lastName) {
    return lastName;
  }
  
  return 'Unnamed Client';
}

/**
 * Get name for sorting (last name first for individuals, company name for companies)
 */
export function getClientSortName(client: ClientNameFields): string {
  if (client.companyName) {
    return client.companyName;
  }
  
  const firstName = client.firstName?.trim() || '';
  const lastName = client.lastName?.trim() || '';
  
  if (lastName && firstName) {
    return `${lastName}, ${firstName}`;
  }
  
  return getClientDisplayName(client);
}

/**
 * Get initials for avatar display
 */
export function getClientInitials(client: ClientNameFields): string {
  if (client.companyName) {
    // Get first letters of first two words
    const words = client.companyName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return client.companyName.substring(0, 2).toUpperCase();
  }
  
  const firstInitial = client.firstName?.[0]?.toUpperCase() || '';
  const lastInitial = client.lastName?.[0]?.toUpperCase() || '';
  
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  return firstInitial || lastInitial || '??';
}

/**
 * Check if client is a company
 */
export function isCompanyClient(client: ClientNameFields): boolean {
  return !!client.companyName;
}

/**
 * Get full name with company (if both exist)
 * e.g., "Mike Chen @ TechCorp Office"
 */
export function getClientFullName(client: ClientNameFields): string {
  const displayName = getClientDisplayName(client);
  
  if (client.companyName && (client.firstName || client.lastName)) {
    const firstName = client.firstName?.trim() || '';
    const lastName = client.lastName?.trim() || '';
    const personName = [firstName, lastName].filter(Boolean).join(' ');
    return `${personName} @ ${client.companyName}`;
  }
  
  return displayName;
}

