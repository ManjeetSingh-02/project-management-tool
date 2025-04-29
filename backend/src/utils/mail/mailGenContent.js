export const verificationMailContentGenerator = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Mega Project! We're very excited to have you on board.",
      action: {
        instructions: 'To verify your account, please click here:',
        button: {
          color: '#22BC66',
          text: 'Verify your account',
          link: verificationUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
