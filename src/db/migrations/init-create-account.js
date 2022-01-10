'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'account',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        uuid: {
          type: Sequelize.UUID,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(100)
        },
        avatar_url: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false
        },
        password: {
          type: Sequelize.STRING(200)
        },
        oauth_provider: {
          type: Sequelize.STRING(50),
          allowNull: false
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
  down: async (queryInterface) => {
    await queryInterface.dropTable('account');
  }
};
