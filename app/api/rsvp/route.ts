import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin' }, { status: 400 });
    }

    /* Chuẩn hóa số điện thoại Việt Nam → +84... */
    let intlPhone = phone.replace(/\s/g, '');
    if (intlPhone.startsWith('0')) {
      intlPhone = '+84' + intlPhone.slice(1);
    } else if (!intlPhone.startsWith('+')) {
      intlPhone = '+84' + intlPhone;
    }

    const msg =
      `🎓 XÁC NHẬN THAM DỰ\n\n` +
      `Chào ${name}!\n\n` +
      `Bạn đã xác nhận tham dự Lễ Tốt Nghiệp của Nguyễn Phước Tài 🎉\n\n` +
      `📅 Thứ Hai, 06/04/2026\n` +
      `⏰ 15:00 chiều\n` +
      `📍 Hội trường cơ sở Hóc Môn, HUFLIT\n` +
      `   806 Lê Quang Đạo, Xã Hóc Môn, TP. Hồ Chí Minh\n\n` +
      `Rất vui được gặp bạn! 💙\n` +
      `— Nguyễn Phước Tài`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      /* Twilio SMS — chỉ chạy khi có credentials trong .env.local */
      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body: msg, to: intlPhone, from: fromNumber });
      console.log(`[RSVP] SMS sent → ${intlPhone} (${name})`);
    } else {
      /* Fallback: log ra console — UI vẫn hiện success bình thường */
      console.log(`[RSVP] No Twilio credentials. Would send to ${intlPhone}:`);
      console.log(msg);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[RSVP] Error:', err);
    /* Trả về success để UI không bị broken dù SMS fail */
    return NextResponse.json({ success: true });
  }
}
