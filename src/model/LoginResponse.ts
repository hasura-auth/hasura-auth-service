import { URL } from 'url';

export default interface LogonResponse {
  accessToken: string;
  redirectUri: URL;
}
