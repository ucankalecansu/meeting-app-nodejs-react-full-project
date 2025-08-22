import User from "./User";
import Meeting from "./Meeting";
import Log from "./Log";

User.hasMany(Meeting, { foreignKey: "userId" });
Meeting.belongsTo(User, { foreignKey: "userId" });

export { User, Meeting, Log };
