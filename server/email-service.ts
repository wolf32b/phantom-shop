export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  console.log(`[AUTH] Attempting to send verification email to: ${email}`);
  
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      console.log(`[AUTH] Using Resend API Key: ${process.env.RESEND_API_KEY.substring(0, 5)}...`);
      
      const response = await resend.emails.send({
        from: "Phantom Thieves <onboarding@resend.dev>",
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
      console.log("[AUTH] Resend API Response:", JSON.stringify(response));
    } catch (error) {
      console.error("[AUTH] Failed to send verification email via Resend:", error);
      console.log(`[AUTH] FALLBACK: Verification code for ${email}: ${code}`);
    }
  } else {
    console.log(`[AUTH] [DEV MODE] No API Key found. Verification code for ${email}: ${code}`);
  }
}
