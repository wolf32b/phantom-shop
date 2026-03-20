import nodemailer from "nodemailer";

const SITE_NAME = "Phantoms Shop";
const SITE_TAGLINE = "Trusted by The Phantom Thieves";
const SITE_URL = "https://phantoms.site";
const YEAR = new Date().getFullYear();

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

function fromAddress() {
  const addr = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@phantoms.site";
  return `${SITE_NAME} <${addr}>`;
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[EMAIL] SMTP not configured. Would have sent to ${to}: ${subject}`);
    return;
  }
  try {
    const info = await transporter.sendMail({ from: fromAddress(), to, subject, html });
    console.log(`[EMAIL] Sent → ${to} | "${subject}" | ${info.messageId}`);
  } catch (err) {
    console.error(`[EMAIL] Failed → ${to}:`, err);
  }
}

/* ─────────────────────────────────────────────
   BASE LAYOUT
───────────────────────────────────────────── */
function baseLayout(content: string, accentColor = "#FF0019"): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="dark"/>
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#080808;font-family:'Segoe UI',Arial,sans-serif;-webkit-text-size-adjust:100%;direction:rtl;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#080808;min-width:100%;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">

        <!-- Card -->
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0"
               style="max-width:580px;width:100%;background-color:#0f0f0f;border:1px solid #2a2a2a;border-radius:2px;overflow:hidden;">

          <!-- ── TOP STRIPE ── -->
          <tr>
            <td style="background-color:${accentColor};height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── HEADER ── -->
          <tr>
            <td style="background-color:#0f0f0f;padding:28px 36px 20px;border-bottom:1px solid #1e1e1e;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo text -->
                    <span style="font-size:26px;font-weight:900;letter-spacing:1px;font-style:italic;color:#ffffff;text-transform:uppercase;">
                      PHANTOMS<span style="color:${accentColor};">SHOP</span>
                    </span>
                    <br/>
                    <span style="font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;">
                      ${SITE_TAGLINE}
                    </span>
                  </td>
                  <!-- Decorative bar -->
                  <td align="left" style="padding-right:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${accentColor};width:4px;height:44px;border-radius:2px;">&nbsp;</td>
                        <td style="background:#2a2a2a;width:4px;height:36px;border-radius:2px;margin-right:4px;">&nbsp;</td>
                        <td style="background:#1a1a1a;width:4px;height:28px;border-radius:2px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="padding:36px 36px 28px;">
              ${content}
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td style="padding:0 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${accentColor};height:1px;width:40px;font-size:0;">&nbsp;</td>
                  <td style="background-color:#1e1e1e;height:1px;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding:20px 36px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:1px;font-style:italic;">
                      PHANTOMS<span style="color:${accentColor};">SHOP</span>
                    </p>
                    <p style="margin:0;font-size:11px;color:#444;letter-spacing:0.5px;">
                      &copy; ${YEAR} ${SITE_NAME} &mdash; جميع الحقوق محفوظة
                    </p>
                  </td>
                  <td align="left">
                    <p style="margin:0;font-size:10px;color:#333;text-align:left;letter-spacing:0.3px;line-height:1.6;">
                      هذا الإيميل أُرسل تلقائياً<br/>
                      يُرجى عدم الرد عليه
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BOTTOM STRIPE ── -->
          <tr>
            <td style="background-color:#FF0019;height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ─────────────────────────────────────────────
   BADGE HELPER
───────────────────────────────────────────── */
function badge(text: string, bg: string, color: string) {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:2px;">${text}</span>`;
}

/* ─────────────────────────────────────────────
   VERIFICATION EMAIL
───────────────────────────────────────────── */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const html = baseLayout(`
    ${badge("تحقق من الهوية", "#FF0019", "#fff")}

    <h1 style="margin:18px 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
      أكّد بريدك الإلكتروني
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.7;">
      أهلاً بك في <strong style="color:#fff;">${SITE_NAME}</strong>! أدخل الكود أدناه لإتمام إنشاء حسابك.
    </p>

    <!-- Code block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 28px;">
      <tr>
        <td style="background-color:#FF0019;padding:2px;border-radius:4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#1a0000;border-radius:3px;padding:24px;text-align:center;">
                <span style="font-size:46px;font-weight:900;color:#FF0019;letter-spacing:14px;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Info row -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#161616;border:1px solid #222;border-radius:3px;margin:0 0 24px;">
      <tr>
        <td style="padding:14px 18px;border-left:3px solid #FF0019;">
          <p style="margin:0;font-size:13px;color:#777;line-height:1.6;">
            ⏱ &nbsp;صالح لمدة <strong style="color:#ccc;">15 دقيقة</strong><br/>
            🔒 &nbsp;لا تشاركه مع أي شخص
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#444;">
      إذا لم تطلب هذا الكود، تجاهل هذا الإيميل بأمان.
    </p>
  `);

  await sendMail(email, `🔐 كود التحقق: ${code} — ${SITE_NAME}`, html);
}

/* ─────────────────────────────────────────────
   ORDER APPROVED EMAIL
───────────────────────────────────────────── */
export async function sendOrderApprovedEmail(
  email: string,
  username: string,
  amount: number,
  adminNote?: string | null
): Promise<void> {
  const html = baseLayout(`
    ${badge("طلب مقبول", "#003d1f", "#00cc66")}

    <h1 style="margin:18px 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
      تمّت الموافقة على طلبك! 🎉
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.7;">
      مرحباً <strong style="color:#fff;">${username}</strong>،
      يسعدنا إخبارك بأن طلبك قد تمّت مراجعته والموافقة عليه.
    </p>

    <!-- Amount card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;">
      <tr>
        <td style="background:#00cc66;padding:2px;border-radius:4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#001a0d;border-radius:3px;padding:24px 28px;">
                <p style="margin:0 0 4px;font-size:11px;color:#00cc66;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                  الكمية المحوّلة
                </p>
                <p style="margin:0;font-size:44px;font-weight:900;color:#00cc66;line-height:1.1;letter-spacing:-1px;">
                  ${amount.toLocaleString()}
                  <span style="font-size:22px;color:#009944;">R$</span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${adminNote ? `
    <!-- Admin note -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;background:#141414;border:1px solid #222;border-right:3px solid #FF0019;border-radius:2px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:10px;color:#FF0019;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
            ملاحظة الإدارة
          </p>
          <p style="margin:0;font-size:14px;color:#bbb;line-height:1.6;">${adminNote}</p>
        </td>
      </tr>
    </table>` : ""}

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#FF0019;border-radius:2px;">
          <a href="${SITE_URL}/orders"
             style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:1px;text-transform:uppercase;font-style:italic;">
            عرض طلباتي &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#444;line-height:1.7;">
      شكراً لثقتك بـ <strong style="color:#666;">${SITE_NAME}</strong> — استمتع بروبوكسك! 🎮
    </p>
  `, "#00cc66");

  await sendMail(email, `✅ تمّت الموافقة على طلبك — ${SITE_NAME}`, html);
}

/* ─────────────────────────────────────────────
   ORDER REJECTED EMAIL
───────────────────────────────────────────── */
export async function sendOrderRejectedEmail(
  email: string,
  username: string,
  amount: number,
  adminNote?: string | null
): Promise<void> {
  const html = baseLayout(`
    ${badge("طلب مرفوض", "#2a0000", "#FF0019")}

    <h1 style="margin:18px 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
      تعذّر تنفيذ طلبك
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.7;">
      مرحباً <strong style="color:#fff;">${username}</strong>،
      نأسف لإخبارك بأنه تعذّر تنفيذ طلبك لـ <strong style="color:#fff;">${amount.toLocaleString()} R$</strong>.
    </p>

    <!-- Refund notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;background:#0e0000;border:1px solid #3a0000;border-radius:3px;">
      <tr>
        <td style="padding:18px 22px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#FF0019;">
            ✔ &nbsp;تم استرداد رصيدك تلقائياً
          </p>
          <p style="margin:0;font-size:13px;color:#777;line-height:1.6;">
            تم إعادة <strong style="color:#ccc;">${amount.toLocaleString()} R$</strong> إلى رصيد الـ Phantom Code الخاص بك وهو جاهز للاستخدام مجدداً.
          </p>
        </td>
      </tr>
    </table>

    ${adminNote ? `
    <!-- Rejection reason -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;background:#141414;border:1px solid #222;border-right:3px solid #FF0019;border-radius:2px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:10px;color:#FF0019;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
            سبب الرفض
          </p>
          <p style="margin:0;font-size:14px;color:#bbb;line-height:1.6;">${adminNote}</p>
        </td>
      </tr>
    </table>` : ""}

    <!-- Help tip -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;background:#161616;border:1px solid #222;border-radius:3px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#666;line-height:1.7;">
            💡 &nbsp;تأكد أن الـ Gamepass <strong style="color:#aaa;">عام (Public)</strong> وأن السعر مطابق تماماً للحاسبة، ثم أعد تقديم الطلب.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#FF0019;border-radius:2px;">
          <a href="${SITE_URL}/shop"
             style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:1px;text-transform:uppercase;font-style:italic;">
            تقديم طلب جديد &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#444;line-height:1.7;">
      إذا كان لديك استفسار، تواصل مع الإدارة عبر الموقع.
    </p>
  `);

  await sendMail(email, `❌ تعذّر تنفيذ طلبك — ${SITE_NAME}`, html);
}

/* ─────────────────────────────────────────────
   CODE PURCHASE CONFIRMATION EMAIL
───────────────────────────────────────────── */
export async function sendCodePurchaseEmail(
  email: string,
  buyerName: string | null,
  code: string,
  amount: number,
  price: number,
  paymentInfo: {
    bankName: string;
    iban: string;
    accountName: string;
    stcPay?: string | null;
  }
): Promise<void> {
  const name = buyerName || "عزيزي العميل";
  const html = baseLayout(`
    <span style="display:inline-block;background:#1a1000;color:#f5a623;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;">في انتظار الدفع</span>
    <h1 style="margin:18px 0 8px;font-size:26px;font-weight:900;color:#ffffff;">تم استلام طلبك! 📋</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.7;">
      مرحباً <strong style="color:#fff;">${name}</strong>،<br/>
      تم إنشاء طلبك بنجاح. أكمل الدفع بالتفاصيل أدناه وسيُفعَّل الكود بعد التحقق.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;background:#111;border:1px solid #2a2a2a;border-radius:3px;">
      <tr><td style="padding:18px 22px;border-bottom:1px solid #1e1e1e;">
        <p style="margin:0 0 3px;font-size:11px;color:#555;letter-spacing:1.5px;text-transform:uppercase;">كمية الروبوكس</p>
        <p style="margin:0;font-size:28px;font-weight:900;color:#FF0019;">${amount.toLocaleString()} R$</p>
      </td></tr>
      <tr><td style="padding:18px 22px;border-bottom:1px solid #1e1e1e;">
        <p style="margin:0 0 3px;font-size:11px;color:#555;letter-spacing:1.5px;text-transform:uppercase;">المبلغ المطلوب</p>
        <p style="margin:0;font-size:28px;font-weight:900;color:#fff;">${price} ريال</p>
      </td></tr>
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 3px;font-size:11px;color:#555;letter-spacing:1.5px;text-transform:uppercase;">كود الطلب</p>
        <p style="margin:0;font-size:17px;font-weight:700;color:#FF0019;font-family:'Courier New',monospace;letter-spacing:2px;">${code}</p>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr><td style="background:#FF0019;padding:2px;border-radius:4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:#0d0000;border-radius:3px;padding:20px 24px;">
            <p style="margin:0 0 16px;font-size:12px;color:#FF0019;letter-spacing:2px;text-transform:uppercase;font-weight:700;">تفاصيل التحويل البنكي</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:6px 0;border-bottom:1px solid #2a0000;">
                <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">البنك</p>
                <p style="margin:2px 0 0;font-size:14px;color:#fff;font-weight:600;">${paymentInfo.bankName}</p>
              </td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #2a0000;">
                <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">رقم الآيبان</p>
                <p style="margin:2px 0 0;font-size:14px;color:#fff;font-family:'Courier New',monospace;direction:ltr;text-align:right;">${paymentInfo.iban}</p>
              </td></tr>
              <tr><td style="padding:6px 0${paymentInfo.stcPay ? ";border-bottom:1px solid #2a0000" : ""};">
                <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">اسم صاحب الحساب</p>
                <p style="margin:2px 0 0;font-size:14px;color:#fff;font-weight:600;">${paymentInfo.accountName}</p>
              </td></tr>
              ${paymentInfo.stcPay ? `<tr><td style="padding:6px 0;">
                <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">STC Pay</p>
                <p style="margin:2px 0 0;font-size:14px;color:#fff;font-weight:600;">${paymentInfo.stcPay}</p>
              </td></tr>` : ""}
            </table>
          </td></tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#444;line-height:1.7;">
      بعد استلام التحويل، ستصلك رسالة بتفعيل الكود مباشرة.
    </p>
  `, "#f5a623");
  await sendMail(email, `📋 تأكيد طلبك — ${amount.toLocaleString()} R$ — ${SITE_NAME}`, html);
}

/* ─────────────────────────────────────────────
   CODE ACTIVATED EMAIL
───────────────────────────────────────────── */
export async function sendCodeActivatedEmail(
  email: string,
  buyerName: string | null,
  code: string,
  amount: number
): Promise<void> {
  const name = buyerName || "عزيزي العميل";
  const html = baseLayout(`
    <span style="display:inline-block;background:#003d1f;color:#00cc66;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;">كود مفعّل</span>
    <h1 style="margin:18px 0 8px;font-size:26px;font-weight:900;color:#ffffff;">كودك جاهز للاستخدام! 🎉</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.7;">
      مرحباً <strong style="color:#fff;">${name}</strong>،<br/>
      تم التحقق من دفعتك وتفعيل كود الـ Phantom Code الخاص بك.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr><td style="background:#00cc66;padding:2px;border-radius:4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:#001a0d;border-radius:3px;padding:24px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:#00cc66;letter-spacing:2px;text-transform:uppercase;font-weight:700;">الكود الخاص بك</p>
            <p style="margin:0;font-size:30px;font-weight:900;color:#00cc66;font-family:'Courier New',monospace;letter-spacing:4px;">${code}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#009944;">رصيد: ${amount.toLocaleString()} R$</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:0 0 24px;background:#111;border:1px solid #1e1e1e;border-radius:3px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 14px;font-size:12px;color:#FF0019;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">كيف تستخدم الكود؟</p>
        <p style="margin:4px 0;font-size:13px;color:#aaa;">١. ادخل على الموقع وسجّل دخولك</p>
        <p style="margin:4px 0;font-size:13px;color:#aaa;">٢. أنشئ Gamepass على روبلوكس بالسعر المحدد</p>
        <p style="margin:4px 0;font-size:13px;color:#aaa;">٣. اذهب للمتجر وأدخل الكود مع رابط الـ Gamepass</p>
        <p style="margin:4px 0;font-size:13px;color:#aaa;">٤. انتظر موافقة الإدارة وستصلك الروبوكس!</p>
      </td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr><td style="background:#FF0019;border-radius:2px;">
        <a href="${SITE_URL}/shop"
           style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:1px;text-transform:uppercase;font-style:italic;">
          اذهب للمتجر الآن &rarr;
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#444;line-height:1.7;">
      لا تشارك هذا الكود مع أحد.
    </p>
  `, "#00cc66");
  await sendMail(email, `🎉 كودك مفعّل — ${code} — ${SITE_NAME}`, html);
}
