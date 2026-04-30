import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? user;

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    throw new Error("SMTP environment variables are not configured correctly");
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
    from,
  };
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your login OTP code",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="background:#f5f7fb;padding:28px 12px;font-family:Inter,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="padding:22px 24px;background:linear-gradient(120deg,#1d4ed8 0%,#0891b2 100%);color:#ffffff;">
            <h2 style="margin:0;font-size:22px;line-height:1.2;">Your login OTP code</h2>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.92;">Use this to complete your sign in</p>
          </div>

          <div style="padding:22px 24px;">
            <p style="margin:0 0 12px;font-size:14px;color:#334155;">
              Enter this one-time password on the verification screen:
            </p>
            <div style="display:inline-block;padding:10px 14px;border:1px dashed #94a3b8;border-radius:10px;background:#f8fafc;">
              <span style="font-size:24px;font-weight:700;letter-spacing:4px;color:#0f172a;">${otp}</span>
            </div>
            <p style="margin:14px 0 0;font-size:13px;color:#64748b;">
              This code expires in 5 minutes. Do not share it with anyone.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, password: string): Promise<void> {
  const config = getSmtpConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const loginUrl = `${appUrl.replace(/\/$/, "")}/admin/login`;
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Welcome to ASVF Admin",
    text: `Welcome to ASVF Admin.

Your account has been created successfully.
Email: ${email}
Password: ${password}
Login URL: ${loginUrl}

Please login and change your password after first sign in.`,
    html: `
      <div style="background:#f5f7fb;padding:28px 12px;font-family:Inter,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="padding:22px 24px;background:linear-gradient(120deg,#1d4ed8 0%,#0891b2 100%);color:#ffffff;">
            <h2 style="margin:0;font-size:22px;line-height:1.2;">Welcome to ASVF Admin</h2>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.92;">Your account is ready to use</p>
          </div>

          <div style="padding:22px 24px;">
            <p style="margin:0 0 14px;font-size:14px;color:#334155;">
              Your account has been created successfully. Use the credentials below to sign in.
            </p>

            <div style="border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:14px 16px;">
              <p style="margin:0 0 8px;font-size:14px;color:#334155;">
                <strong style="color:#0f172a;">Email:</strong> ${email}
              </p>
              <p style="margin:0;font-size:14px;color:#334155;">
                <strong style="color:#0f172a;">Password:</strong> ${password}
              </p>
            </div>

            <div style="margin-top:18px;">
              <a href="${loginUrl}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:linear-gradient(120deg,#1d4ed8 0%,#0891b2 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                Login to Admin
              </a>
            </div>

            <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
              For security, please change your password after first login.
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
              If the button does not work, copy this URL: ${loginUrl}
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendContactEmail(input: {
  to: string;
  firstName: string;
  lastName?: string;
  organization: string;
  email: string;
  phone: string;
  message?: string;
}): Promise<void> {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  const fullName = [input.firstName, input.lastName ?? ""].join(" ").trim();
  const safeMessage = input.message?.trim() || "No message provided.";

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    replyTo: input.email,
    subject: `New Contact Form Submission - ${fullName || input.firstName}`,
    text: `New contact form submission

Name: ${fullName || input.firstName}
Organization: ${input.organization}
Email: ${input.email}
Phone: ${input.phone}
Message: ${safeMessage}
`,
    html: `
      <div style="margin:0;padding:28px 12px;background:#f1f5f9;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:680px;margin:0 auto;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;background:#ffffff;">
          <div style="padding:20px 24px;background:linear-gradient(120deg,#0f172a 0%,#1e3a8a 50%,#0ea5a4 100%);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">Website Inquiry</p>
            <h2 style="margin:6px 0 0;font-size:22px;line-height:1.25;font-weight:700;">New Contact Form Submission</h2>
            <p style="margin:8px 0 0;font-size:14px;opacity:.92;">A new lead has been submitted from your website contact page.</p>
          </div>

          <div style="padding:22px 24px;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;width:140px;font-size:13px;font-weight:600;color:#475569;">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${fullName || input.firstName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;width:140px;font-size:13px;font-weight:600;color:#475569;">Organization</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${input.organization}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;width:140px;font-size:13px;font-weight:600;color:#475569;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">
                  <a href="mailto:${input.email}" style="color:#0f172a;text-decoration:none;">${input.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;width:140px;font-size:13px;font-weight:600;color:#475569;">Phone</td>
                <td style="padding:10px 0;font-size:14px;color:#0f172a;">${input.phone}</td>
              </tr>
            </table>

            <div style="margin-top:18px;border:1px solid #dbeafe;border-radius:12px;background:#f8fafc;padding:14px 16px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e3a8a;letter-spacing:.02em;">Message</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;white-space:pre-wrap;">${safeMessage}</p>
            </div>

            <p style="margin:18px 0 0;font-size:12px;color:#64748b;">
              Tip: You can reply directly to this email to respond to the sender.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}
