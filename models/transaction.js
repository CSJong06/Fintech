//imports
import sequelize from '../config/dbConnection.js'
import { DataTypes } from 'sequelize';
import User from '../models/user.js'

  // creates the transaction object model 
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('amount');
        return value === null ? 0.00 : parseFloat(value);
      }
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdraw'), 
      allowNull: false, 
    },
    description: {
      type: DataTypes.STRING
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    tableName: 'transaction',
    timestamps: true,
    createdAt: 'timestamp',
    updatedAt: 'updated_at'
  });

export default Transaction 


