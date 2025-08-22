import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface LogAttributes {
  id: number;
  meetingId: number;
  deletedAt: Date;
  reason: string;
}

interface LogCreationAttributes extends Optional<LogAttributes, "id"> {}

class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  public id!: number;
  public meetingId!: number;
  public deletedAt!: Date;
  public reason!: string;
}

Log.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    meetingId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    deletedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reason: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "Log", tableName: "logs" }
);

export default Log;
