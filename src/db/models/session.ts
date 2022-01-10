import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize';
import { v4 as uuidv4 } from 'uuid';
import Account from './Account';

class Session extends Model {
  public id!: number;
  public sessionId!: string;
  public accountId!: string;
  public validUntil!: number;
  public account: Account;
}

Session.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sessionId: {
      type: DataTypes.UUIDV4,
      field: 'session_id',
      defaultValue: () => uuidv4()
    },
    accountId: { type: DataTypes.INTEGER, field: 'account_id' },
    validUntil: { type: DataTypes.NUMBER, field: 'valid_until' }
  },
  {
    sequelize,
    modelName: 'session',
    tableName: 'session',
    schema: 'auth',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

Session.belongsTo(Account);

export default Session;
