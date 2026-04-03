import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAPS_URL = 'https://maps.app.goo.gl/kT2QmrLRHCmfRYYq6';

/* ── Beautiful HTML email template ─────────────────────────── */
function buildEmailHtml(name: string, hostEmail: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Xác nhận tham dự Lễ Tốt Nghiệp 2026</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Main card -->
  <div style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 48px rgba(37,99,235,0.14),0 2px 8px rgba(0,0,0,0.06);">

    <!-- Hero header -->
    <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 44%,#7c3aed 100%);padding:52px 40px;text-align:center;">
      <div style="font-size:68px;margin-bottom:18px;display:block;">&#127891;</div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 10px;letter-spacing:-0.5px;line-height:1.2;">
        L&#7�; T&#7�;T NGHI&#7878;P 2026
      </h1>
      <p style="color:rgba(186,230,253,0.88);font-size:13.5px;margin:0;letter-spacing:1.5px;text-transform:uppercase;">
        Tr&#432;&#7901;ng &#272;&#7841;i h&#7885;c Ngo&#7841;i ng&#7919; &#8212; Tin h&#7885;c TP.HCM
      </p>
    </div>

    <!-- Success badge + Greeting -->
    <div style="padding:36px 40px 28px;">
      <div style="display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:50px;padding:7px 18px;margin-bottom:22px;">
        <span style="color:#15803d;font-size:13px;font-weight:700;">&#10003;&#65039; X&#225;c nh&#7853;n th&#224;nh c&#244;ng</span>
      </div>

      <h2 style="color:#0f172a;font-size:24px;font-weight:800;margin:0 0 14px;line-height:1.3;">
        Ch&#224;o ${name}! &#128075;
      </h2>
      <p style="color:#475569;font-size:15px;line-height:1.78;margin:0 0 12px;">
        C&#7843;m &#417;n b&#7841;n &#273;&#227; x&#225;c nh&#7853;n tham d&#7921; <strong style="color:#1d4ed8;">L&#7�; T&#7D;t Nghi&#7878;p</strong> c&#7911;a m&#236;nh.
        M&#236;nh r&#7845;t vui v&#224; h&#225;o h&#7913;c &#273;&#432;&#7907;c g&#7863;p l&#7841;i b&#7841;n trong ng&#224;y &#273;&#7863;c bi&#7879;t n&#224;y! &#127881;
      </p>
      <p style="color:#64748b;font-size:14px;margin:0;font-style:italic;">
        &#8212; V&#7899;i t&#7845;t c&#7843; ni&#7873;m t&#7921; h&#224;o, Nguy&#7877;n Ph&#432;&#7899;c T&#224;i &#127891;
      </p>
    </div>

    <!-- Event details card -->
    <div style="padding:0 40px 32px;">
      <div style="background:#f8faff;border-radius:18px;border:1.5px solid #dde6ff;overflow:hidden;">

        <!-- Time row -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="border-bottom:1px solid #e8eeff;">
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#2563eb,#38bdf8);border-radius:12px;text-align:center;line-height:40px;font-size:20px;">&#128197;</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#64748b;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Th&#7901;i gian</div>
                    <div style="color:#0f172a;font-size:17px;font-weight:800;margin-bottom:6px;">Th&#7913; Hai, 06/04/2026</div>
                    <div style="display:inline-block;background:#e0f2fe;border-radius:8px;padding:4px 14px;">
                      <span style="color:#0369a1;font-size:13px;font-weight:700;">&#9200; 15:00 chi&#7873;u</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Location row -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:12px;text-align:center;line-height:40px;font-size:20px;">&#128205;</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#64748b;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">&#272;&#7883;a &#273;i&#7875;m</div>
                    <div style="color:#0f172a;font-size:16px;font-weight:800;margin-bottom:3px;">H&#7897;i tr&#432;&#7901;ng c&#417; s&#7903; H&#243;c M&#244;n</div>
                    <div style="color:#7c3aed;font-size:13px;font-weight:700;margin-bottom:8px;">HUFLIT</div>
                    <div style="color:#475569;font-size:13px;line-height:1.65;margin-bottom:12px;">
                      806 L&#234; Quang &#272;&#7841;o<br>X&#227; H&#243;c M&#244;n, Th&#224;nh ph&#7889; H&#7891; Ch&#237; Minh
                    </div>
                    <a href="${MAPS_URL}"
                      style="display:inline-block;padding:7px 16px;background:#ede9fe;color:#6d28d9;font-size:12px;font-weight:700;border-radius:10px;text-decoration:none;">
                      &#128506; M&#7903; Google Maps
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Fun quote section -->
    <div style="padding:0 40px 32px;">
      <div style="background:linear-gradient(135deg,#f0f9ff,#f5f3ff);border-radius:16px;border-left:4px solid #6366f1;padding:20px 24px;">
        <p style="color:#4338ca;font-size:13.5px;font-weight:600;margin:0 0 10px;font-style:italic;">
          &ldquo;4 n&#259;m code, bug, c&#224; ph&#234; v&#224; deadline 3AM...&rdquo;
        </p>
        <p style="color:#1e293b;font-size:15px;font-weight:800;margin:0;">
          H&#244;m nay m&#236;nh ch&#237;nh th&#7913;c PASS &amp; BYE UNI. B&#7841;n l&#224; m&#7897;t ph&#7847;n c&#7911;a h&#224;nh tr&#236;nh &#273;&#243;! &#128640;
        </p>
      </div>
    </div>

    <!-- CTA button -->
    <div style="padding:0 40px 44px;text-align:center;">
      <a href="${MAPS_URL}"
        style="display:inline-block;padding:16px 42px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;font-size:15px;font-weight:900;border-radius:16px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 6px 24px rgba(37,99,235,0.36);">
        &#128506;&#65039; Xem &#273;&#432;&#7901;ng &#273;&#7871;n l&#7877; t&#7889;t nghi&#7879;p
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:14px 0 0;line-height:1.6;">
        Nh&#7845;n &#273;&#7875; m&#7903; Google Maps v&#7899;i ch&#7881; &#273;&#432;&#7901;ng chi ti&#7871;t
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8faff;padding:26px 40px;border-top:1.5px solid #e8eeff;text-align:center;">
      <p style="color:#1d4ed8;font-size:14px;font-weight:700;margin:0 0 8px;">
        Nguy&#7877;n Ph&#432;&#7899;c T&#224;i &middot; HUFLIT K28 &middot; 2022&ndash;2026
      </p>
      <p style="color:#94a3b8;font-size:11.5px;margin:0;line-height:1.7;">
        Email n&#224;y &#273;&#432;&#7907;c g&#7917;i t&#7921; &#273;&#7897;ng sau khi b&#7841;n x&#225;c nh&#7853;n tham d&#7921;.<br>
        N&#7871;u c&#243; th&#7855;c m&#7855;c, h&#227;y li&#234;n h&#7879;:
        <a href="mailto:${hostEmail}" style="color:#6366f1;text-decoration:none;">${hostEmail}</a>
      </p>
    </div>
  </div>

  <!-- Bottom caption -->
  <p style="text-align:center;color:#94a3b8;font-size:11px;margin:20px 0 0;line-height:1.6;">
    &copy; 2026 Graduation Invitation &middot; Nguy&#7877;n Ph&#432;&#7899;c T&#224;i &amp; HUFLIT
  </p>

</div>
</body>
</html>`;
}

/* ── API route ──────────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin' }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      /* ── Gửi qua Gmail SMTP ─────────────────────────────── */
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      /* Email xác nhận gửi cho khách */
      await transporter.sendMail({
        from   : `"Nguyen Phuoc Tai - Le Tot Nghiep 2026" <${gmailUser}>`,
        to     : email,
        subject: '[Xac nhan] Tham du Le Tot Nghiep - Nguyen Phuoc Tai 2026',
        html   : buildEmailHtml(name, gmailUser),
      });

      console.log(`[RSVP] Confirmation email sent -> ${email} (${name})`);

      /* Thông báo cho chủ nhân */
      await transporter.sendMail({
        from   : `"RSVP Bot" <${gmailUser}>`,
        to     : gmailUser,
        subject: `[RSVP] ${name} vua xac nhan tham du!`,
        html   : `<p><b>${name}</b> (<a href="mailto:${email}">${email}</a>) vua xac nhan tham du Le Tot Nghiep. 🎉</p>`,
      });

      console.log(`[RSVP] Host notification sent -> ${gmailUser}`);
    } else {
      /* ── Fallback: log ra console khi chưa cấu hình ─────── */
      console.warn('[RSVP] Gmail chưa được cấu hình.');
      console.warn('  Set GMAIL_USER và GMAIL_APP_PASSWORD trong Vercel Environment Variables.');
      console.log(`[RSVP] Would send to: ${email} (${name})`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[RSVP] Error sending email:', err);
    /* Luôn trả success để UI không bị broken */
    return NextResponse.json({ success: true });
  }
}
