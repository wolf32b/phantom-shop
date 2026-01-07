export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  // For development, just log the code - in production, integrate with Resend/SendGrid
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: "Phantom Thieves <noreply@phantom-thieves.local>",
        to: email,
        subject: "Verify Your Phantom Thieves Account",
        html: `
          <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 20px;">
            <h1 style="color: #FF0019; text-transform: uppercase;">VERIFICATION CODE</h1>
            <p style="font-size: 18px;">Enter this code to complete your account setup:</p>
            <div style="background: #FF0019; color: #000; padding: 20px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px;">
              ${code}
            </div>
            <p style="color: #999; font-size: 12px;">This code expires in 15 minutes.</p>
            <p style="color: #999; font-size: 12px;">Take your time. - Phantom Thieves</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      console.log(`[DEV] Verification code for ${email}: ${code}`);
    }
  } else {
    // Development mode - just log the code
    console.log(`[DEV MODE] Verification code for ${email}: ${code}`);
  }
}
