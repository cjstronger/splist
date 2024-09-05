const crypto = require("crypto");

exports.signUp = (req, res) => {
  //1) get the un/pw
  const { username, password, passwordConfirm } = req.body;
  if(password !== passwordConfirm) return next()
  //2) salt the pw in the model
  //3) create a new user with the User model
  //4) error handle
  //5) login
};

exports.login = (req, res) => {
  //1)hash the password
  //2)compare the database password with the attempted login
  //3)generate token
  //4)attach token to cookies
  //5)get token from cookies
  //6)check if token has been altered from the transition to the database
  res.status("201").json({
    status: "success",
    data: {
      user: "User",
    },
  });
};
