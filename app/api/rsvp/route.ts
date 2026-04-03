import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAPS_URL = 'https://maps.app.goo.gl/kT2QmrLRHCmfRYYq6';

/* ── Email HTML template (mobile-first, compact, no-clip) ───── */
function buildEmailHtml(name: string, hostEmail: string): string {
  return `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Xac nhan tham du Le Tot Nghiep 2026</title>
  <style>
    body{margin:0;padding:0;background:#eef2ff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table{border-collapse:collapse;}
    img{border:0;display:block;}
    .wrapper{max-width:560px;margin:0 auto;padding:20px 12px;}
    .card{background:#fff;border-radius:20px;overflow:hidden;}
    .hero{background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#7c3aed 100%);padding:36px 24px;text-align:center;}
    .hero h1{color:#fff;font-size:22px;font-weight:900;margin:8px 0 6px;letter-spacing:-0.3px;line-height:1.2;}
    .hero p{color:rgba(186,230,253,0.85);font-size:11px;margin:0;letter-spacing:1.2px;text-transform:uppercase;}
    .badge{display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:40px;padding:5px 14px;font-size:12px;font-weight:700;color:#15803d;}
    .body{padding:24px 20px 20px;}
    .greeting{font-size:20px;font-weight:800;color:#0f172a;margin:14px 0 8px;line-height:1.25;}
    .sub{font-size:14px;color:#475569;line-height:1.7;margin:0 0 6px;}
    .sig{font-size:13px;color:#64748b;font-style:italic;margin:0;}
    .details{margin:20px 20px;background:#f8faff;border-radius:14px;border:1.5px solid #dde6ff;overflow:hidden;}
    .detail-row{padding:14px 18px;}
    .detail-row+.detail-row{border-top:1px solid #e8eeff;}
    .detail-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.4px;color:#94a3b8;margin-bottom:4px;}
    .detail-val{font-size:15px;font-weight:800;color:#0f172a;margin:0 0 2px;}
    .detail-sub{font-size:12px;color:#64748b;margin:0;}
    .pill{display:inline-block;background:#e0f2fe;border-radius:8px;padding:3px 12px;font-size:12px;font-weight:700;color:#0369a1;margin-top:6px;}
    .pill-purple{background:#ede9fe;color:#6d28d9;}
    .quote{margin:0 20px 20px;background:#f0f9ff;border-left:3px solid #6366f1;border-radius:0 10px 10px 0;padding:14px 16px;}
    .quote p{margin:0;font-size:13px;color:#4338ca;font-style:italic;line-height:1.6;}
    .cta-wrap{padding:0 20px 24px;text-align:center;}
    .cta{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;font-size:14px;font-weight:900;border-radius:14px;text-decoration:none;letter-spacing:0.3px;}
    .cta-hint{font-size:11px;color:#94a3b8;margin:10px 0 0;}
    .footer{background:#f8faff;padding:18px 20px;border-top:1px solid #e8eeff;text-align:center;}
    .footer p{margin:0;font-size:11.5px;color:#94a3b8;line-height:1.7;}
    .footer a{color:#6366f1;text-decoration:none;}
    .footer strong{color:#1d4ed8;}
    @media screen and (max-width:480px){
      .wrapper{padding:12px 8px;}
      .hero{padding:28px 16px;}
      .hero h1{font-size:20px;}
      .body{padding:20px 16px 16px;}
      .greeting{font-size:18px;}
      .details{margin:16px;}
      .quote{margin:0 16px 16px;}
      .cta-wrap{padding:0 16px 20px;}
      .cta{padding:13px 24px;font-size:13px;}
    }
  </style>
</head>
<body>
<div class="wrapper">
<div class="card">

  <!-- Hero -->
  <div class="hero">
    <div style="font-size:52px;line-height:1;">🎓</div>
    <h1>LỄ TỐT NGHIỆP 2026</h1>
    <p>Trường ĐH Ngoại ngữ — Tin học TP.HCM</p>
  </div>

  <!-- Body -->
  <div class="body">
    <div><span class="badge">✅ Xác nhận thành công</span></div>
    <p class="greeting">Chào ${name}! 👋</p>
    <p class="sub">Cảm ơn bạn đã xác nhận tham dự <strong style="color:#1d4ed8;">Lễ Tốt Nghiệp</strong> của mình. Rất vui và háo hức được gặp lại bạn! 🎉</p>
    <p class="sig">— Với tất cả niềm tự hào, Nguyễn Phước Tài 🎓</p>
  </div>

  <!-- Event details -->
  <div class="details">
    <div class="detail-row">
      <div class="detail-label">📅 Thời gian</div>
      <div class="detail-val">Thứ Hai, 06/04/2026</div>
      <div><span class="pill">⏰ 15:00 chiều</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📍 Địa điểm</div>
      <div class="detail-val">Hội trường cơ sở Hóc Môn</div>
      <div class="detail-sub" style="color:#7c3aed;font-weight:700;margin-bottom:4px;">HUFLIT</div>
      <div class="detail-sub">806 Lê Quang Đạo, Xã Hóc Môn, TP. Hồ Chí Minh</div>
      <div style="margin-top:8px;">
        <a href="${MAPS_URL}" class="pill pill-purple" style="text-decoration:none;">🗺️ Mở Google Maps</a>
      </div>
    </div>
  </div>

  <!-- IT quote -->
  <div class="quote">
    <p>&ldquo;4 năm code, bug, cà phê và deadline 3AM... Hôm nay mình chính thức <strong>PASS &amp; BYE UNI</strong>. Bạn là một phần của hành trình đó! 🚀&rdquo;</p>
  </div>

  <!-- CTA -->
  <div class="cta-wrap">
    <a href="${MAPS_URL}" class="cta">🗺️ Xem đường đến lễ tốt nghiệp</a>
    <p class="cta-hint">Nhấn để mở Google Maps với chỉ đường chi tiết</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Nguyễn Phước Tài</strong> &middot; HUFLIT K28 &middot; 2022&ndash;2026</p>
    <p style="margin-top:4px;">Thắc mắc? Liên hệ: <a href="mailto:${hostEmail}">${hostEmail}</a></p>
  </div>

</div>
<p style="text-align:center;font-size:11px;color:#94a3b8;margin:14px 0 0;">&copy; 2026 Le Tot Nghiep &middot; Nguyen Phuoc Tai</p>
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
