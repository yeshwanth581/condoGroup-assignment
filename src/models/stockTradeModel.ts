// import { DataTypes, Model, Optional } from 'sequelize';
// import { db } from '../datasources/db';

// interface StockTradeAttributes {
//     id: number;
//     stock_name: string;
//     price: number;
//     timestamp: Date;
// }

// interface StockTradeCreationAttributes extends Optional<StockTradeAttributes, 'id'> { }

// class StockTrade extends Model<StockTradeAttributes, StockTradeCreationAttributes> implements StockTradeAttributes {
//     public id!: number;
//     public stock_name!: string;
//     public price!: number;
//     public timestamp!: Date;

//     public readonly createdAt!: Date;
//     public readonly updatedAt!: Date;
// }

// StockTrade.init(
//     {
//         id: {
//             type: DataTypes.INTEGER.UNSIGNED,
//             autoIncrement: true,
//             primaryKey: true,
//         },
//         stock_name: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         price: {
//             type: DataTypes.FLOAT,
//             allowNull: false,
//         },
//         timestamp: {
//             type: DataTypes.DATE,
//             defaultValue: DataTypes.NOW,
//             allowNull: false,
//         },
//     },
//     {
//         sequelize: db,
//         tableName: 'StockTrade',
//         indexes: [
//             {
//                 name: 'idx_stock_name',
//                 fields: ['stock_name'],
//             },
//             {
//                 name: 'idx_timestamp',
//                 fields: ['timestamp'],
//             },
//         ],
//     }
// );

// export { StockTrade };



// import { DataTypes, Sequelize } from 'sequelize';
// import { createStockListModel } from './stocksModal';

// interface StockTradeAttributes {
//     id: number;
//     stock_id: number;
//     price: number;
//     volume: number;
//     traded_at: Date;
//     created_at: Date;
// }

// interface StockTradeCreationAttributes extends Omit<StockTradeAttributes, 'id'> { }

// const createStockTradeModel = (sequelize: Sequelize) => {
//     const stockTrade = sequelize.define('StockTrade', {
//         symbol: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         price: {
//             type: DataTypes.FLOAT,
//             allowNull: false,
//         },
//         volume: {
//             type: DataTypes.FLOAT,
//             allowNull: false,
//         },
//         timestamp: {
//             type: DataTypes.DATE,
//             defaultValue: DataTypes.NOW,
//             allowNull: false,
//         },
//     }, {
//         tableName: 'StockTrades',
//         updatedAt: false,
//         indexes: [
//             {
//                 name: 'idx_symbol',
//                 fields: ['symbol'],
//             },
//             {
//                 name: 'idx_timestamp',
//                 fields: ['timestamp'],
//             },
//         ],
//     });

//     return stockTrade;
// };

// export { StockTradeAttributes, StockTradeCreationAttributes, createStockTradeModel };


import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import { createStocksModel } from './stocksModel';

interface StockTradesAttributes {
    id: number;
    stockId: number;
    price: number;
    volume: number;
    tradedAt: Date;
}

interface StockTradesCreationAttributes extends Optional<StockTradesAttributes, 'id'> { }

const createStockTradesModel = (db: Sequelize, stocksModel: typeof createStocksModel) => {
    const StockTradesTable = db.define<Model<StockTradesAttributes, StockTradesCreationAttributes>>('StockTrades', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        stockId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: stocksModel(db),
                key: 'id',
            },
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        volume: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        tradedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'StockTrades',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_stock_id',
                fields: ['stockId'],
            },
            {
                name: 'idx_traded_at',
                fields: ['tradedAt'],
            },
        ],
    });

    return StockTradesTable;
};

export { StockTradesAttributes, StockTradesCreationAttributes, createStockTradesModel };
