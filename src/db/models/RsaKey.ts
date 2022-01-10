import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize';

class RsaKey extends Model {
  public id!: number;
  public keyId!: string;
  public purpose!: string;
  public public!: string;
  public private!: string;
  public priority!: number;
}

RsaKey.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    keyId: { type: DataTypes.STRING, field: 'key_id' },
    purpose: DataTypes.TEXT,
    public: DataTypes.TEXT,
    private: DataTypes.TEXT,
    priority: DataTypes.INTEGER
  },
  {
    sequelize,
    modelName: 'rsa-key',
    tableName: 'rsa_key',
    schema: 'auth',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default RsaKey;
