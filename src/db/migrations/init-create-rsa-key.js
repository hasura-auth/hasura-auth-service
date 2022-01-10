'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'rsa_key',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        key_id: {
          type: Sequelize.STRING(10),
          allowNull: false
        },
        purpose: {
          type: Sequelize.STRING(10),
          allowNull: false
        },
        public: {
          type: Sequelize.STRING(4000),
          allowNull: false
        },
        private: {
          type: Sequelize.STRING(4000),
          allowNull: false
        },
        priority: {
          type: Sequelize.INTEGER,
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rsa_key');
  }
};
