// ResendやSendGridのAPIを使ってメール送信
export async function sendResetMail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  // ここでResendやSendGridのAPIを呼び出す
  // 例: await resend.emails.send({ to: email, subject: "パスワード再設定", html: `<a href=\"${resetUrl}\">パスワード再設定</a>` });
  console.log(`Send reset mail to ${email}: ${resetUrl}`);
}
