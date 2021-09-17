'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'role',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        account_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'account',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        auth_role: {
          type: Sequelize.STRING(50)
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          defaultValue: 'false'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      { schema: 'auth' }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role');
  }
};
