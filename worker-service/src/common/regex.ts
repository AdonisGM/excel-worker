// Author: AdonisGM - Nguyen Manh Tung

/**
 * Check if the url is a valid url
 *
 * @param {string} topDomainFe - The top domain of the frontend check
 * @param {string} url - The url to check
 *
 * @returns {boolean} - The result of the check
 *
 * @example
 * subDomainCheck('marigate.org', 'https://example.marigate.org') // returns true
 * subDomainCheck('marigate.org', 'https://example.com') // returns false
 */
const subDomainCheck = (topDomainFe: string, url: string): boolean => {
  const regex = new RegExp(`^(http|https)://[a-zA-Z0-9.]{3,20}${topDomainFe}$`);
  return regex.test(url);
};

export { subDomainCheck };
