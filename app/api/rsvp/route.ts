import { NextResponse } from 'next/server';

const HOST_EMAIL = 'taiph214@gmail.com';
const MAPS_URL   = 'https://maps.app.goo.gl/kT2QmrLRHCmfRYYq6';

/* ── Beautiful HTML email template ─────────────────────────── */
function buildEmailHtml(name: string): string {
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
      <div style="font-size:68px;margin-bottom:18px;display:block;">🎓</div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 10px;letter-spacing:-0.5px;line-height:1.2;">
        LỄ TỐT NGHIỆP 2026
      </h1>
      <p style="color:rgba(186,230,253,0.88);font-size:13.5px;margin:0;letter-spacing:1.5px;text-transform:uppercase;">
        Trường Đại học Ngoại ngữ — Tin học TP.HCM
      </p>
    </div>

    <!-- Success badge + Greeting -->
    <div style="padding:36px 40px 28px;">
      <div style="display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:50px;padding:7px 18px;margin-bottom:22px;">
        <span style="color:#15803d;font-size:13px;font-weight:700;">✅&nbsp; Xác nhận tham dự thành công</span>
      </div>

      <h2 style="color:#0f172a;font-size:24px;font-weight:800;margin:0 0 14px;line-height:1.3;">
        Chào ${name}! 👋
      </h2>
      <p style="color:#475569;font-size:15px;line-height:1.78;margin:0 0 12px;">
        Cảm ơn bạn đã xác nhận tham dự <strong style="color:#1d4ed8;">Lễ Tốt Nghiệp</strong> của mình.
        Mình rất vui và háo hức được gặp lại bạn trong ngày đặc biệt này! 🎉
      </p>
      <p style="color:#64748b;font-size:14px;margin:0;font-style:italic;">
        — Với tất cả niềm tự hào, Nguyễn Phước Tài 🎓
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
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#2563eb,#38bdf8);border-radius:12px;text-align:center;line-height:40px;font-size:20px;">📅</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#64748b;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Thời gian</div>
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
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="44" valign="top">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:12px;text-align:center;line-height:40px;font-size:20px;">📍</div>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#64748b;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Địa điểm</div>
                    <div style="color:#0f172a;font-size:16px;font-weight:800;margin-bottom:3px;">Hội trường cơ sở Hóc Môn</div>
                    <div style="color:#7c3aed;font-size:13px;font-weight:700;margin-bottom:8px;">HUFLIT</div>
                    <div style="color:#475569;font-size:13px;line-height:1.65;margin-bottom:12px;">
                      806 Lê Quang Đạo<br>Xã Hóc Môn, Thành phố Hồ Chí Minh
                    </div>
                    <a href="${MAPS_URL}"
                      style="display:inline-block;padding:7px 16px;background:#ede9fe;color:#6d28d9;font-size:12px;font-weight:700;border-radius:10px;text-decoration:none;">
                      🗺&nbsp; Mở Google Maps
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
          &ldquo;4 năm code, bug, cà phê và deadline 3AM...&rdquo;
        </p>
        <p style="color:#1e293b;font-size:15px;font-weight:800;margin:0;">
          Hôm nay mình chính thức PASS &amp; BYE UNI. Bạn là một phần của hành trình đó! 🚀
        </p>
      </div>
    </div>

    <!-- CTA button -->
    <div style="padding:0 40px 44px;text-align:center;">
      <a href="${MAPS_URL}"
        style="display:inline-block;padding:16px 42px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;font-size:15px;font-weight:900;border-radius:16px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 6px 24px rgba(37,99,235,0.36);">
        🗺️&nbsp; Xem đường đến lễ tốt nghiệp
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:14px 0 0;line-height:1.6;">
        Nhấn để mở Google Maps với chỉ đường chi tiết
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8faff;padding:26px 40px;border-top:1.5px solid #e8eeff;text-align:center;">
      <p style="color:#1d4ed8;font-size:14px;font-weight:700;margin:0 0 8px;">
        Nguyễn Phước Tài · HUFLIT K28 · 2022–2026
      </p>
      <p style="color:#94a3b8;font-size:11.5px;margin:0;line-height:1.7;">
        Email này được gửi tự động sau khi bạn xác nhận tham dự.<br>
        Nếu có thắc mắc, hãy liên hệ:
        <a href="mailto:${HOST_EMAIL}" style="color:#6366f1;text-decoration:none;">${HOST_EMAIL}</a>
      </p>
    </div>
  </div>

  <!-- Bottom caption -->
  <p style="text-align:center;color:#94a3b8;font-size:11px;margin:20px 0 0;line-height:1.6;">
    © 2026 Graduation Invitation · Nguyễn Phước Tài &amp; HUFLIT
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

    const html    = buildEmailHtml(name);
    const subject = `🎓 Xác nhận tham dự Lễ Tốt Nghiệp — Nguyễn Phước Tài`;

    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      /* ── Gửi qua Resend ─────────────────────────────────── */
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);

      const { error } = await resend.emails.send({
        from    : 'Nguyễn Phước Tài 🎓 <onboarding@resend.dev>',
        to      : [email],
        replyTo : HOST_EMAIL,
        cc      : [HOST_EMAIL],     /* chủ nhân nhận bản sao mỗi RSVP */
        subject,
        html,
      });

      if (error) {
        console.error('[RSVP] Resend error:', error);
      } else {
        console.log(`[RSVP] Email sent → ${email} (${name})`);
      }
    } else {
      /* ── Fallback: log ra console khi chưa có API key ───── */
      console.log(`[RSVP] No RESEND_API_KEY. Would send to ${email} (${name})`);
      console.log('[RSVP] Subject:', subject);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[RSVP] Error:', err);
    /* Trả về success để UI không bị broken dù email fail */
    return NextResponse.json({ success: true });
  }
}
