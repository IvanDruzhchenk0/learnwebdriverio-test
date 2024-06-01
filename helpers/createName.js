export function createName() {
    const random = Math.random().toString(36).substring(2,7);
    return random;
  }

export function createEmail(domain) {
    const random = Math.random().toString(36).substring(7);
    return random + '@' + domain;
  }
  