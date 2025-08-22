import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface MeetingAttributes {
  id: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  document?: string;
  status: string; // aktif / iptal
  participants: string;
}

interface MeetingCreationAttributes extends Optional<MeetingAttributes, "id" | "description" | "document"> {}

class Meeting extends Model<MeetingAttributes, MeetingCreationAttributes> implements MeetingAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public startDate!: Date;
  public endDate!: Date;
  public document?: string;
  public status!: string;
  public participants!: string;
}

Meeting.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    document: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    participants: { type: DataTypes.TEXT, allowNull: true }, // 👈 email listesi string

  },
  { sequelize, modelName: "Meeting", tableName: "meetings" }
);

export default Meeting;
