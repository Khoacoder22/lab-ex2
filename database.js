const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('lab5ex2', 'root', 'khoa', {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    logging: false, 
});

// Test connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to MySQL successfully.');
    } catch (error) {
        console.error('Fail to connect to the database:', error);
    }
})();

const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
});

const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
});

const ShoppingCart = sequelize.define('ShoppingCart', {
    quantity: DataTypes.INTEGER, 
});

// xác định quan hệ của database 
User.hasMany(ShoppingCart);
Product.hasMany(ShoppingCart);
ShoppingCart.belongsTo(User);
ShoppingCart.belongsTo(Product);

(async () => {
    try {
        await sequelize.sync({ force: true }); 
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();

module.exports = { sequelize, User, Product, ShoppingCart };
