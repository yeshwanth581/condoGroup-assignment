import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

interface StocksAttributes {
    id: number;
    symbol: string;
    name: string;
    exchangeName: string;
}

interface StocksCreationAttributes extends Optional<StocksAttributes, 'id'> { }

const createStocksModel = (db: Sequelize) => {
    const stocksTable = db.define<Model<StocksAttributes, StocksCreationAttributes>>('Stocks', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        exchangeName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
    }, {
        tableName: 'Stocks',
        indexes: [
            {
                name: 'idx_stock_symbol',
                fields: ['symbol'],
            },
        ],
    });

    return stocksTable;
};

export { StocksAttributes, StocksCreationAttributes, createStocksModel };
