import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const {
      type, // 'welcome' | 'approval' | 'rejection' | 'comment_report_thankyou' | 'donation_receipt_donor' | 'donation_received_student'
      email,
      fullName,
      role,
      college,
      occupation,
      subjectCode,
      rejectionReason,
      commentText,
      txId,
      razorpayId,
      amount,
      donorName,
      donorEmail,
      studentName,
      studentCollege,
      studentUpi,
      date,
      time,
      note,
    } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Recipient email address is required.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'collegeeasy.official@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let mailSubject = '';
    let mailHtml = '';

    // CASE 1: WELCOME EMAIL ON SIGNUP
    if (type === 'welcome') {
      mailSubject = `Welcome to comeBACK, ${fullName || 'Member'}!`;
      mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">Welcome to comeBACK, ${fullName || 'Member'}! 🎉</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Your account registration as a <strong>${role === 'donor' ? 'Donor / Supporter' : 'Student'}</strong> has been confirmed.
          </p>
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #cbd5e1;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Role:</strong> ${role === 'donor' ? 'Donor / Supporter' : 'Student'}</p>
            ${role === 'student' ? `<p style="margin: 4px 0; font-size: 14px;"><strong>College:</strong> ${college || 'DTU'}</p>` : ''}
            ${role === 'donor' && occupation ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Occupation:</strong> ${occupation}</p>` : ''}
          </div>
          <p style="font-size: 14px; color: #475569;">
            ${role === 'donor'
              ? 'You can now browse student fee appeals and support fellow students directly with 0% platform fee.'
              : 'You can now publish re-appear fee appeals and participate in campus discussions.'}
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">comeBACK Foundation • collegeeasy.official@gmail.com</p>
        </div>
      `;
    }
    // CASE 2: APPEAL APPROVED & LIVE EMAIL
    else if (type === 'approval') {
      mailSubject = `Your Fee Appeal for ${subjectCode || 'Exam'} is LIVE!`;
      mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10b981; margin-bottom: 8px;">Fee Appeal Approved ✅</h2>
          <p style="font-size: 14px; color: #475569;">Hi ${fullName}, your fee appeal for subject <strong>${subjectCode}</strong> has been verified by Admin and is now live on the platform feed.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">comeBACK Moderation Team</p>
        </div>
      `;
    }
    // CASE 3: APPEAL REJECTED EMAIL
    else if (type === 'rejection') {
      mailSubject = `Update regarding your Fee Appeal verification`;
      mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #dc2626; margin-bottom: 8px;">Verification Status Notice ❌</h2>
          <p style="font-size: 14px; color: #475569;">Dear ${fullName}, your fee appeal could not be verified due to:</p>
          <div style="background-color: #fef2f2; border-radius: 12px; padding: 16px; margin: 15px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; font-size: 14px; color: #7f1d1d;">${rejectionReason || 'Uploaded documents were unreadable or mismatched.'}</p>
          </div>
          <p style="font-size: 14px; color: #475569;">Please log in to your profile dashboard to re-upload clear proof copies.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">comeBACK Moderation Team</p>
        </div>
      `;
    }
    // CASE 4: COMMENT REPORT THANK YOU EMAIL
    else if (type === 'comment_report_thankyou') {
      mailSubject = `Thank you for keeping comeBACK safe 🛡️`;
      mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #7c3aed; margin-bottom: 8px;">Report Received 🛡️</h2>
          <p style="font-size: 14px; color: #475569;">Dear ${fullName || 'Member'}, thank you for reporting this content. Our team will consider your report and review it carefully — we appreciate you helping keep the comeBACK community safe.</p>
          ${commentText ? `<p style="font-style: italic; color: #6b21a8; background-color: #faf5ff; padding: 12px; border-radius: 10px; border-left: 4px solid #7c3aed;">"${commentText}"</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">comeBACK Safety Team</p>
        </div>
      `;
    }
    // CASE 5: OFFICIAL RECEIPT SLIP EMAIL TO DONOR (MATCHING YOUR RECEIPT LAYOUT)
    else if (type === 'donation_receipt_donor') {
      mailSubject = `Official Payment Slip — ₹${amount} Contribution Confirmed (${txId})`;
      mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #f8fafc; color: #1e293b;">
          <div style="background-color: #ffffff; padding: 32px; border-radius: 24px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            
            <!-- HEADER -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
                    come<span style="color: #2563eb;">Back</span>
                  </h1>
                  <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #64748b;">Direct Peer-to-Peer Student Support Network</p>
                  <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8; font-family: monospace;">collegeeasy.official@gmail.com • 0% Platform Commission</p>
                </td>
                <td align="right" style="vertical-align: top;">
                  <span style="background-color: #d1fae5; color: #065f46; font-weight: 900; font-size: 10px; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase;">
                    DIRECT PAYMENT SLIP
                  </span>
                  <p style="margin: 6px 0 0 0; font-size: 11px; font-family: monospace; color: #475569;">
                    Receipt ID: <strong>${txId}</strong>
                  </p>
                </td>
              </tr>
            </table>

            <!-- METRICS BAR -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
              <tr>
                <td>
                  <span style="display: block; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase;">DATE</span>
                  <strong style="color: #0f172a; font-size: 13px;">${date}</strong>
                </td>
                <td>
                  <span style="display: block; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase;">TIME</span>
                  <strong style="color: #0f172a; font-size: 13px;">${time}</strong>
                </td>
                <td>
                  <span style="display: block; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase;">GATEWAY REF</span>
                  <strong style="color: #334155; font-family: monospace; font-size: 11px;">${razorpayId}</strong>
                </td>
                <td>
                  <span style="display: block; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase;">PAYOUT FEE</span>
                  <strong style="color: #059669; font-size: 13px;">₹0.00 (0% Fee)</strong>
                </td>
              </tr>
            </table>

            <!-- DETAILS BOXES -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              <tr>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; vertical-align: top;">
                  <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">DONOR DETAILS</h4>
                  <p style="margin: 4px 0; font-size: 12px;"><strong style="color: #334155;">Name:</strong> <span style="font-family: monospace;">${donorName}</span></p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong style="color: #334155;">Email:</strong> ${donorEmail}</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; vertical-align: top;">
                  <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">DIRECT BENEFICIARY</h4>
                  <p style="margin: 4px 0; font-size: 12px;"><strong style="color: #334155;">Student:</strong> ${studentName}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong style="color: #334155;">College:</strong> ${studentCollege}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong style="color: #334155;">UPI/VPA:</strong> <span style="font-family: monospace;">${studentUpi}</span></p>
                </td>
              </tr>
            </table>

            <!-- TABLE -->
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; margin-bottom: 20px; border-collapse: collapse;">
              <tr style="border-bottom: 2px solid #0f172a; text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b;">
                <th align="left" style="padding-bottom: 8px;">DESCRIPTION</th>
                <th align="right" style="padding-bottom: 8px;">AMOUNT (INR)</th>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #0f172a;">Direct Exam Re-Appear Fee Contribution (${subjectCode || 'Exam Fee'})</td>
                <td align="right" style="padding: 12px 0; font-weight: bold; color: #0f172a;">₹${amount}.00</td>
              </tr>
              <tr style="border-bottom: 2px solid #0f172a;">
                <td style="padding: 10px 0; color: #64748b; font-style: italic;">comeBACK Platform Fee</td>
                <td align="right" style="padding: 10px 0; color: #059669; font-weight: bold;">₹0.00</td>
              </tr>
            </table>

            <!-- TOTAL -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr>
                <td style="font-size: 15px; font-weight: 900; color: #0f172a;">Total Direct Transfer to Student</td>
                <td align="right" style="font-size: 24px; font-weight: 900; color: #2563eb;">₹${amount}.00</td>
              </tr>
            </table>

            <!-- FOOTER SIGNATURE -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
              <tr>
                <td>
                  <div style="width: 36px; height: 36px; border: 2px dashed #059669; border-radius: 50%; text-align: center; line-height: 36px; font-size: 8px; font-weight: 900; color: #059669;">
                    100% P2P
                  </div>
                </td>
                <td align="right">
                  <p style="margin: 0; font-size: 13px; font-weight: 900; color: #0f172a;">Rohit Dalal</p>
                  <p style="margin: 2px 0 0 0; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase;">PLATFORM MANAGER • COMEBACK</p>
                </td>
              </tr>
            </table>

          </div>
        </div>
      `;
    }
    // CASE 6: NOTIFICATION EMAIL TO STUDENT BENEFICIARY
    else if (type === 'donation_received_student') {
      mailSubject = `🎉 ₹${amount} Direct Support Received from ${donorName}!`;
      mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; color: #1e293b;">
          <div style="background-color: #ffffff; padding: 32px; border-radius: 24px; border: 1px solid #cbd5e1;">
            <h2 style="color: #059669; margin-top: 0;">Direct Support Received! ✅</h2>
            <p style="font-size: 14px; color: #334155;">Hi <strong>${studentName}</strong>,</p>
            <p style="font-size: 14px; color: #334155;"><strong>${donorName}</strong> has just sent a direct support transfer of <strong>₹${amount}</strong> toward your fee appeal.</p>
            ${note ? `<div style="background-color: #f1f5f9; padding: 14px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #2563eb;"><p style="margin: 0; font-style: italic; color: #475569;">"${note}"</p></div>` : ''}
            <p style="font-size: 12px; color: #64748b;">The funds have been settled directly via Razorpay route with 0% platform commission.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">comeBACK Foundation • collegeeasy.official@gmail.com</p>
          </div>
        </div>
      `;
    }

    await transporter.sendMail({
      from: '"comeBACK Foundation" <collegeeasy.official@gmail.com>',
      to: email,
      subject: mailSubject,
      html: mailHtml,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Email Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}