import nodemailer from "nodemailer";
import { kintoneGet } from "@/lib/api/kintoneClient";
import type {
  ActionRecord,
  KintoneRecordResponse,
} from "@/lib/api/types/kintone";
import type { InquiryType } from "@/app/(school-view)/main/_store/inquiryModal";

/**
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
 * メール本文を生成
 * @description PHP版 inquiry.blade.php のテキスト内容を移植
 */
function buildMailBody(param: {
  date: string;
  clientName: string;
  projectNo: string;
  caseNo: string;
  targetBuilding: string;
  primaryCategory: string;
  primaryRequest: string;
  actionUrl: string;
  vendorName: string;
  secondaryCategory: string;
  subject: string;
  detail: string;
  costNo: string;
  status: string;
  checkDate: string;
  confirmDate: string;
  name: string;
  message: string;
}): string {
  return `
─────────────────────────────
このメッセージは、システムより自動送信されています。
─────────────────────────────


下記の対応についてクライアントからお問い合わせがありました
─────────────────────────────
・お問合せ日時  ： ${param.date}
・ｸﾗｲｱﾝﾄ名　　　： ${param.clientName}

・ﾌﾟﾛｼﾞｪｸﾄ番号　： ${param.projectNo}
・受付番号  　　： ${param.caseNo}
・対象の建物　　： ${param.targetBuilding}
・一次依頼分野　： ${param.primaryCategory}
・学校依頼内容　：
${param.primaryRequest}


・対応URL  　 　： ${param.actionUrl}
・発先注企業　　： ${param.vendorName}
・依頼分野　　　： ${param.secondaryCategory}
・依頼内容  　　： ${param.subject}
・依頼詳細  　　： ${param.detail}
・原価番号  　　： ${param.costNo}
・進行状況  　　： ${param.status}
・検収日    　　： ${param.checkDate}
・学校確認日　　： ${param.confirmDate}

・記入者　　　　： ${param.name}
・お問い合わせ内容：
${param.message}
`.trim();
}

// -------------------------------------------------
// 公開 API
// -------------------------------------------------

export interface SendInquiryParams {
  /** 対応明細レコードID */
  actionId: string;
  /** 問い合わせタイプ */
  type: InquiryType;
  /** 記入者名 */
  name: string;
  /** お問い合わせ内容 */
  message: string;
  /** 学校 / 会社名 */
  schoolOrCompanyName: string;
}

/**
 * お問い合わせ・未完了連絡 メール送信 API
 * @description 対応明細レコードを取得し、nodemailerでメールを送信する
 * 1. 対応明細レコードを取得
 * 2. メール本文を組み立て
 * 3. nodemailer で送信
 */
export async function sendInquiryApi(params: SendInquiryParams): Promise<void> {
  const appId = process.env.KINTONE_TAIOU_APP_ID;
  const apiToken = process.env.KINTONE_TAIOU_APP_TOKEN;
  const notifyTo = process.env.MAIL_NOTIFY_TO;
  const notifyCc = process.env.MAIL_NOTIFY_CC;
  const fromAddress = process.env.MAIL_FROM_ADDRESS;
  const fromName = process.env.MAIL_FROM_NAME;
  const kintoneSubdomain = process.env.KINTONE_BASE_URL;

  if (!appId)
    throw new Error(
      "[sendInquiryApi] KINTONE_TAIOU_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[sendInquiryApi] KINTONE_TAIOU_APP_TOKEN が設定されていません",
    );
  if (!notifyTo)
    throw new Error("[sendInquiryApi] MAIL_NOTIFY_TO が設定されていません");

  // 1. 対応明細レコードを取得
  const { record } = await kintoneGet<KintoneRecordResponse<ActionRecord>>(
    "/k/v1/record.json",
    apiToken,
    { app: appId, id: params.actionId },
  );

  // 2. メールタイトル組み立て
  const title =
    params.type === "claim"
      ? `【未完了連絡】${record.受付番号.value}:${record.対象の建物.value}`
      : `【お問合せ】${record.受付番号.value}:${record.対象の建物.value}`;

  // 3. 現在日時
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // 4. 対応URL組み立て
  const actionUrl = `${kintoneSubdomain}/k/${appId}/show#record=${params.actionId}`;

  // 5. メール本文
  const body = buildMailBody({
    date,
    clientName: params.schoolOrCompanyName,
    projectNo: record.P番.value,
    caseNo: record.受付番号.value,
    targetBuilding: record.対象の建物.value,
    primaryCategory: record.一次対応分野.value,
    primaryRequest: record.学校からの依頼内容.value,
    actionUrl,
    vendorName: record.仕入先企業名.value,
    secondaryCategory: record.依頼分野.value,
    subject: record["件名・依頼内容"].value,
    detail: record.仕入内容詳細.value,
    costNo: record.原価番号.value,
    status: record.現在の進行状況.value,
    checkDate: record.検収日.value ?? "",
    confirmDate: record.学校確認日.value ?? "",
    name: params.name,
    message: params.message,
  });

  // 6. 送信
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: notifyTo,
    cc: notifyCc || undefined,
    subject: title,
    text: body,
  });
}
