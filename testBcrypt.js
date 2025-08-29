import bcrypt from "bcrypt";

const hash = "$2b$10$c9QAiit5kwEsKPA7A3SBj.Lv3iU7jdtHpiqmt97EvwkAY5UzlcR1S";
const password = "ww123456";

bcrypt.compare(password, hash).then((match) => {
  console.log("Password match:", match);
});