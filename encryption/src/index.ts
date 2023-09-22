import dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import encrypt from "mongoose-encryption";
import { ARIAEngine } from "./aria";

(async () => {
  dotenv.config();

  const userSchema = new mongoose.Schema(
    {
      _id: Buffer,
      email: Buffer,
      password: Buffer,
    },
    { versionKey: false }
  );
  const commentSchema = new mongoose.Schema(
    {
      _id: Buffer,
      comment: Buffer,
      userId: Buffer,
    },
    {
      versionKey: false,
    }
  );

  const { ENCKEY, SIGKEY, MONGO_CONN_URL } = process.env;
  //   userSchema.plugin(encrypt, {
  //     encryptionKey: ENCKEY,
  //     signingKey: SIGKEY,
  //     encryptedFields: ["password"],
  //   });

  //   userSchema.pre("aggregate", (data) => {
  //     console.log("aggregate 데이터", data);
  //   });
  //   userSchema.post("aggregate", (data) => {
  //     console.log("aggregate 데이터", data);
  //   });
  //   userSchema.post("find", (data) => {
  //     // data.forEach(())
  //   });
  const User = mongoose.model("User", userSchema);
  const Comment = mongoose.model("Comment", commentSchema);

  await mongoose.connect(MONGO_CONN_URL);

  const user = new User({
    _id: ARIAEngine.encrypt(new Types.ObjectId().toString(), ENCKEY),
    email: ARIAEngine.encrypt("formegusto@gmail.com", ENCKEY),
    password: ARIAEngine.encrypt("4567", ENCKEY),
  });
  await user.save();

  const comment = new Comment({
    _id: ARIAEngine.encrypt(new Types.ObjectId().toString(), ENCKEY),
    comment: ARIAEngine.encrypt("hello", ENCKEY),
    userId: user._id,
  });
  await comment.save();

  function decryptTest(data: any) {
    if (Array.isArray(data)) data.forEach(decryptTest);
    else {
      Object.keys(data).forEach((k) => {
        if (Array.isArray(data[k])) data[k].forEach(decryptTest);
        else data[k] = ARIAEngine.decrypt(data[k].toString(), ENCKEY);
      });
    }
  }

  const findedUser = await User.aggregate(
    //   [
    //     {
    //       $match: {
    //         email: Buffer.from(
    //           ARIAEngine.encrypt("formegusto@gmail.com", ENCKEY)
    //         ),
    //       },
    //     },
    //   ],
    [
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "userId",
          as: "comment",
        },
      },
    ]
  );
  //   const findedUser = await User.find({
  //     email: Buffer.from(ARIAEngine.encrypt("formegusto@gmail.com", ENCKEY)),
  //   });
  decryptTest(findedUser);
  console.log(JSON.stringify(findedUser));

  await mongoose.disconnect();
})();
