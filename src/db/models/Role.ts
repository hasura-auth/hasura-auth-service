import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize';

class Role extends Model {
  public id!: number;
  public authRole!: string;
  public isDefault!: boolean;
  public accountId: number;

  // public setAccount: HasOneSetAssociationMixin<Account, number>;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    authRole: { type: DataTypes.STRING, field: 'auth_role' },
    isDefault: { type: DataTypes.BOOLEAN, field: 'is_default' },
    accountId: {
      type: DataTypes.INTEGER,
      field: 'account_id',
      references: { model: 'auth.account' }
    }
  },
  {
    sequelize,
    modelName: 'role',
    tableName: 'role',
    schema: 'auth',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Role;
