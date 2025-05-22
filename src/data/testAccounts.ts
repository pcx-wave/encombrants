export const testAccounts = {
  client: {
    email: 'test.client@example.com',
    password: 'testclient123',
    name: 'Test Client',
    role: 'client' as const
  },
  collector: {
    email: 'test.collector@example.com',
    password: 'testcollector123',
    name: 'Test Collector',
    role: 'collector' as const
  },
  deposit: {
    email: 'test.deposit@example.com',
    password: 'testdeposit123',
    name: 'Test Deposit',
    role: 'deposit' as const
  }
};