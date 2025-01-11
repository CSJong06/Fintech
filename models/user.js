import dbconn from "../config/dbConnection.js";
import { DataTypes } from "sequelize";
import Transaction from "../models/transaction.js";

// creates the user object model 

const User = dbconn.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash'
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      get() {
        const value = this.getDataValue('balance');
        return value === null ? 0.00 : parseFloat(value);
      }
    }
  }, {
    tableName: 'user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });


export default User;