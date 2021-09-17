import { Profile } from 'passport';

const profile: Profile = {
  provider: 'github',
  id: '1',
  name: { familyName: 'test', givenName: 'test' },
  displayName: 'test',
  emails: [{ value: 'test@test.com', type: 'primary' }],
  photos: []
};

export default profile;
