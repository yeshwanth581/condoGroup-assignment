import { Model, ModelCtor } from "sequelize"
import {
    StockTradesAttributes,
    StockTradesCreationAttributes,
    StocksAttributes,
    StocksCreationAttributes,
    UserAttributes,
    UserCreationAttributes
} from "../models"

export interface Models {
    stocksTable: ModelCtor<Model<StocksAttributes, StocksCreationAttributes>>,
    stockTradesTable: ModelCtor<Model<StockTradesAttributes, StockTradesCreationAttributes>>
    usersTable: ModelCtor<Model<UserAttributes, UserCreationAttributes>>,
}