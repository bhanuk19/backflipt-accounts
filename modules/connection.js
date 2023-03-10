import mongoose from "mongoose";


mongoose.set("strictQuery", false);

mongoose.connect("mongodb+srv://bfSuite:backflipt@cluster0.hsvl4jm.mongodb.net/Accounts", {
  useNewUrlParser: true,
});
const connection = mongoose.connection;
connection.on("connected",  () =>{
  console.log("database is connected successfully");
});
connection.on("error", console.error.bind(console, "connection error:"));
export default connection
