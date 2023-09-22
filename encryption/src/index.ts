import dotenv from "dotenv";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

(async () => {
  dotenv.config();

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });

  const { ENCKEY, SIGKEY, MONGO_CONN_URL } = process.env;
  userSchema.plugin(encrypt, {
    encryptionKey: ENCKEY,
    signingKey: SIGKEY,
    encryptedFields: ["password"],
  });
  const User = mongoose.model("User", userSchema);

  await mongoose.connect(MONGO_CONN_URL);

  const user = new User({ email: "formegusto@gmail.com", password: "4567" });
  await user.save();

  const findedUser = await User.aggregate([
    {
      $match: {
        email: "formegusto@gmail.com",
      },
    },
  ]);
  console.log(findedUser);

  await mongoose.disconnect();
})();
