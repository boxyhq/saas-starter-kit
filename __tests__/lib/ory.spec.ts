import type { Identity } from '@ory/client-fetch';

import { getIdentityTraits } from '@/lib/ory';

describe('Ory identity helpers', () => {
  it('maps email and optional name traits', () => {
    expect(
      getIdentityTraits({
        id: 'ory-1',
        traits: { email: 'user@example.com', name: 'User' },
      } as Identity)
    ).toEqual({ email: 'user@example.com', name: 'User' });
  });

  it('returns an empty email when the identity has no traits', () => {
    expect(getIdentityTraits({ id: 'ory-2' } as Identity)).toEqual({
      email: '',
      name: undefined,
    });
  });
});
