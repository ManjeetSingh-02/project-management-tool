// function to generate the content of the verification email
export const verificationMailContentGenerator = (username, verificationToken) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Project Management Tool! We're very excited to have you on board.",
      action: {
        instructions: "To verify your account, please click here:",
        button: {
          color: "#1a73e8",
          text: "Verify your account",
          link: `${process.env.ORIGIN_URL}/api/v1/users/verify-account/${verificationToken}`,
        },
      },
    },
  };
};

// function to generate the content of the forgot pasword email
export const forgotPasswordMailContentGenerator = (username, resetPasswordToken) => {
  return {
    body: {
      name: username,
      intro: "You have requested to reset your password.",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#0F9D58",
          text: "Reset your password",
          link: `${process.env.ORIGIN_URL}/api/v1/users/reset-password/${resetPasswordToken}`,
        },
      },
    },
  };
};
