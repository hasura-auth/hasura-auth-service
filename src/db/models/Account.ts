import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize';
import Role from './Role';
import { v4 as uuid } from 'uuid';
import OAuthProviders from '../../model/OAuthProvider';
class Account extends Model {
  public id!: number;
  public uuid!: string;
  public name!: string | null;
  public avatarUrl!: string | null;
  public email!: string;
  public password: string;
  public oauthProvider!: OAuthProviders;
  public roles: Role[];
}

Account.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUIDV4, field: 'uuid', defaultValue: uuid() },
    name: { type: DataTypes.STRING },
    avatarUrl: { type: DataTypes.STRING, field: 'avatar_url' },
    email: { type: DataTypes.STRING, unique: true },
    oauthProvider: { type: DataTypes.STRING, field: 'oauth_provider' },
    password: DataTypes.STRING
  },
  {
    defaultScope: { include: [{ model: Role }] },
    sequelize,
    modelName: 'account',
    tableName: 'account',
    schema: 'auth',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

Account.hasMany(Role, { foreignKey: 'account_id' });

export default Account;
