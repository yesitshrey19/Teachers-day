import { describe, it, expect } from 'vitest';
import { ADMIN_RESULTS_REALTIME_TABLES } from '@/lib/utils';

describe('Admin results realtime coverage', () => {
  it('includes the tables that feed the admin results calculation', () => {
    expect(ADMIN_RESULTS_REALTIME_TABLES).toEqual(
      expect.arrayContaining(['votes', 'duo_votes', 'other_mappings', 'poll_config'])
    );
  });
});
