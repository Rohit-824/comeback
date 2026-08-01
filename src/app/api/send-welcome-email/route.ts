import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { 
      type, // 'welcome' | 'approval' | 'rejection' | 'comment_report_thankyou'
      email, 
      fullName, 
      role, 
      college, 
      occupation,
      subjectCode, 
      rejectionReason,
      commentText
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
          <p style="font-size: 14px; color: #475569;">Dear ${fullName || 'Member'}, thank you for reporting inappropriate content. Our moderation team is reviewing the flagged item.</p>
          ${commentText ? `<p style="font-style: italic; color: #6b21a8;">"${commentText}"</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">comeBACK Safety Team</p>
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