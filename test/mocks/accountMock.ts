import Account from '../../src/db/models/Account';
import Role from '../../src/db/models/Role';

const accountMock = new Account({
  id: 1,
  uuid: 'b572f034-4a5b-4c71-921c-5317ef3a9aa0',
  email: 'test@test.com',
  password: '$2b$10$Wjszzob5mlNSKCnTlOJ4budwx3CTg1408OEOHMn5cXTkYnsbxS6pe'
});
const role = new Role({ accountId: 1, authRole: 'test', isDefault: true });

accountMock.roles = [role];

export { accountMock, role };
