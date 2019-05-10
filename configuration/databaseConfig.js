import Sequelize from 'sequelize';

exports = new Sequelize(
    process.env.DATABASE_URL
        ? process.env.DATABASE_URL
        : 'mysql://root:root@localhost:3306/wypozyczalnia_bcdzmiana'
);
