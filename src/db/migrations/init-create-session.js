'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'session',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        session_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        account_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'account',
            key: 'id'
          }
        },
        valid_until: {
          allowNull: false,
          type: Sequelize.BIGINT
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
    await queryInterface.dropTable('rsa_key');
  }
};
