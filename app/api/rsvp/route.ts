import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAPS_URL = 'https://maps.app.goo.gl/kT2QmrLRHCmfRYYq6';

/* ── Email HTML template ────────────────────────────────────── */
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
      <div style="font-size:68px;margin-bottom:18px;">🎓</div>
      <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 10px;letter-spacing:-0.5px;line-height:1.3;">
        LỄ TỐT NGHIỆP 2026
      </h1>
      <p style="color:rgba(186,230,253,0.88);font-size:13px;margin:0;letter-spacing:1.5px;text-transform:uppercase;">
        Trường Đại học Ngoại ngữ — Tin học TP.HCM
      </p>
    </div>

    <!-- Success badge + Greeting -->
    <div style="padding:36px 40px 20px;">
      <div style="display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:50px;padding:7px 18px;margin-bottom:22px;">
        <span style="color:#15803d;font-size:13px;font-weight:700;">✅ Xác nhận thành công</span>
      </div>

      <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 14px;line-height:1.3;">
        Chào ${name}! 👋
      </h2>
      <p style="color:#475569;font-size:15px;line-height:1.78;margin:0 0 10px;">
        Cảm ơn bạn đã xác nhận tham dự <strong style="color:#1d4ed8;">Lễ Tốt Nghiệp</strong> của mình.
        Mình rất vui và háo hức được gặp lại bạn trong ngày đặc biệt này! 🎉
      </p>
      <p style="color:#64748b;font-size:14px;margin:0;font-style:italic;">
        — Với tất cả niềm tự hào, Nguyễn Phước Tài 🎓
      </p>
    </div>

    <!-- Event details card -->
    <div style="padding:20px 40px 32px;">
      <div style="background:#f8faff;border-radius:18px;border:1.5px solid #dde6ff;overflow:hidden;">

        <!-- Time row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e8eeff;">
          <tr>
            <td style="padding:20px 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#2563eb,#38bdf8);border-radius:12px;text-align:center;line-height:40px;font-size:20px;">📅</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Thời gian</div>
                    <div style="color:#0f172a;font-size:17px;font-weight:800;margin-bottom:6px;">Thứ Hai, 06/04/2026</div>
                    <div style="display:inline-block;background:#e0f2fe;border-radius:8px;padding:4px 14px;">
                      <span style="color:#0369a1;font-size:13px;font-weight:700;">⏰ 15:00 chiều</span>
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
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:12px;text-align:center;line-height:40px;font-size:20px;">📍</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Địa điểm</div>
                    <div style="color:#0f172a;font-size:16px;font-weight:800;margin-bottom:3px;">Hội trường cơ sở Hóc Môn</div>
                    <div style="color:#7c3aed;font-size:13px;font-weight:700;margin-bottom:8px;">HUFLIT</div>
                    <div style="color:#475569;font-size:13px;line-height:1.7;margin-bottom:12px;">
                      806 Lê Quang Đạo<br>
                      Xã Hóc Môn, Thành phố Hồ Chí Minh
                    </div>
                    <a href="${MAPS_URL}"
                      style="display:inline-block;padding:7px 16px;background:#ede9fe;color:#6d28d9;font-size:12px;font-weight:700;border-radius:10px;text-decoration:none;">
                      🗺️ Mở Google Maps
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Fun IT quote -->
    <div style="padding:0 40px 32px;">
      <div style="background:linear-gradient(135deg,#f0f9ff,#f5f3ff);border-radius:16px;padding:20px 24px;">
        <p style="color:#4338ca;font-size:14px;font-weight:600;margin:0 0 10px;font-style:italic;">
          &ldquo;4 năm code, bug, cà phê và deadline 3AM...&rdquo;
        </p>
        <p style="color:#1e293b;font-size:15px;font-weight:800;margin:0;">
          Hôm nay mình chính thức PASS &amp; BYE UNI. Bạn là một phần của hành trình đó! 
        </p>
      </div>
    </div>

    <!-- CTA button -->
    <div style="padding:0 40px 44px;text-align:center;">
      <a href="${MAPS_URL}"
        style="display:inline-block;padding:16px 42px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;font-size:15px;font-weight:900;border-radius:16px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 6px 24px rgba(37,99,235,0.36);">
        🗺️ Xem đường đến lễ tốt nghiệp
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:14px 0 0;line-height:1.6;">
        Nhấn để mở Google Maps với chỉ đường chi tiết
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8faff;padding:26px 40px;border-top:1.5px solid #e8eeff;text-align:center;">
      <p style="color:#1d4ed8;font-size:14px;font-weight:700;margin:0 0 8px;">
        Nguyễn Phước Tài &middot; HUFLIT K28 &middot; 2022&ndash;2026
      </p>
      <p style="color:#94a3b8;font-size:11.5px;margin:0;line-height:1.7;">
        Email này được gửi tự động sau khi bạn xác nhận tham dự.<br>
        Nếu có thắc mắc, hãy liên hệ:
        <a href="mailto:${hostEmail}" style="color:#6366f1;text-decoration:none;">${hostEmail}</a>
      </p>
    </div>
  </div>

  <!-- Bottom caption -->
  <p style="text-align:center;color:#94a3b8;font-size:11px;margin:20px 0 0;line-height:1.6;">
    &copy; 2026 Graduation Invitation &middot; Nguyễn Phước Tài &amp; HUFLIT
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
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      /* Email xác nhận gửi đến khách */
      await transporter.sendMail({
        from: `"Nguyen Phuoc Tai - Le Tot Nghiep 2026" <${gmailUser}>`,
        to: email,
        subject: '[Xac nhan] Tham du Le Tot Nghiep - Nguyen Phuoc Tai 2026',
        html: buildEmailHtml(name, gmailUser),
      });

      console.log(`[RSVP] Confirmation email sent -> ${email} (${name})`);

      /* Thông báo cho host */
      await transporter.sendMail({
        from: `"RSVP Bot" <${gmailUser}>`,
        to: gmailUser,
        subject: `[RSVP] ${name} vua xac nhan tham du!`,
        html: `<p><b>${name}</b> (<a href="mailto:${email}">${email}</a>) vừa xác nhận tham dự Lễ Tốt Nghiệp của bạn! 🎉</p>`,
      });

      console.log(`[RSVP] Host notification sent -> ${gmailUser}`);
    } else {
      console.warn('[RSVP] Gmail chưa được cấu hình. Set GMAIL_USER và GMAIL_APP_PASSWORD trong Vercel.');
      console.log(`[RSVP] Would send to: ${email} (${name})`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[RSVP] Error sending email:', err);
    return NextResponse.json({ success: true });
  }
}
