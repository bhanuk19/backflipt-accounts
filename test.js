import bcrypt from "bcrypt";
const saltRounds = 10;
bcrypt.genSalt(saltRounds, function (err, salt) {
  bcrypt.hash("test-pwd", salt, function (err, hash) {
    // Store hash in your password DB.
    console.log(hash);
  });
});
