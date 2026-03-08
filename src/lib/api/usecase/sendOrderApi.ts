import nodemailer from "nodemailer";

/**
 * 発注メール送信 API
 * @description 発注確定時に発注者・CC宛てに発注完了メールを送信する
 *
 * nodemailer トランスポーターを生成
 * ─────────────────────────────────────────────
 * 現在: SendGrid SMTP
 * SendGridが有料化・廃止になった場合は以下を変更すること
 * MAIL_HOSTを別プロバイダのSMTPに差し替えるか、
 * Resend / AWS SES等のSDKへの移行を検討すること
 * ─────────────────────────────────────────────
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
}

/**
 * 発注完了メール本文を生成
 */
function buildOrderMailBody(param: {
  uketsukeNo: string;
  clientName: string;
  name: string;
  mail: string;
  remarks: string;
}): string {
  return `
─────────────────────────────
このメッセージは、システムより自動送信されています。
─────────────────────────────

発注を承りました。ありがとうございます。

─────────────────────────────
・受付番号　　　： ${param.uketsukeNo}
・クライアント名： ${param.clientName}
・ご発注者　　　： ${param.name}
・メールアドレス： ${param.mail}
・備考　　　　　：
${param.remarks || "なし"}
─────────────────────────────

メールが届かない場合はお手数ですがお問合せよりDUCEにご連絡ください。
`.trim();
}

// -------------------------------------------------
// 공개 API
// -------------------------------------------------

export interface SendOrderParams {
  /** 受付番号 */
  uketsukeNo: string;
  /** クライアント名 (学校/会社名) */
  clientName: string;
  /** ご発注者名 */
  name: string;
  /** ご担当者メールアドレス */
  mail: string;
  /** CC1 */
  cc1: string;
  /** CC2 */
  cc2: string;
  /** 備考 */
  remarks: string;
}

/**
 * 発注完了メールを送信する
 */
export async function sendOrderApi(params: SendOrderParams): Promise<void> {
  const notifyTo = process.env.MAIL_NOTIFY_TO;
  const fromAddress = process.env.MAIL_FROM_ADDRESS;
  const fromName = process.env.MAIL_FROM_NAME;

  if (!notifyTo)
    throw new Error("[sendOrderApi] MAIL_NOTIFY_TO が設定されていません");

  const subject = `【発注】${params.uketsukeNo} ${params.clientName}`;
  const body = buildOrderMailBody(params);

  // CC: 担当者メール + cc1 + cc2 をまとめる
  const ccList = [params.mail, params.cc1, params.cc2].filter(Boolean);

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: notifyTo,
    cc: ccList.length > 0 ? ccList.join(",") : undefined,
    subject,
    text: body,
  });
}
