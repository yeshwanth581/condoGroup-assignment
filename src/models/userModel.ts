import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface UserAttributes {
    id: number;
    username: string;
    password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }
const createUserModel = (db: Sequelize) => {
    const UsersModal = db.define<Model<UserAttributes, UserCreationAttributes>>('Users',

        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'Users',
        })
    return UsersModal;
}

export { UserAttributes, UserCreationAttributes, createUserModel };
