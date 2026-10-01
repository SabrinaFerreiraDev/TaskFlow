async function authLogin(req, res) {
  const user = req.user;

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5h",
    }
  );

  return res.status(200).json({
    message: "Login realizado com sucesso",
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}