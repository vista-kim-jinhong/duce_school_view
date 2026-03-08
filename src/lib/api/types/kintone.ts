/**
 * =================================================
 * Kintone 共通型定義
 * =================================================
 */

// -------------------------------------------------
// Kintone フィールド基本型
// -------------------------------------------------

/** 単一テキスト・数値・日付などの基本フィールド */
export interface KintoneField<T = string> {
  value: T;
}

/** レコード番号など ($id, $revision) */
export interface KintoneSystemField {
  value: string;
}

// -------------------------------------------------
// Kintone ファイルフィールド型
// -------------------------------------------------

/** ファイル単体の情報 */
export interface KintoneFile {
  /** ファイルキー (API取得・キャッシュのキーとして使用) */
  fileKey: string;
  /** ファイル名 */
  name: string;
  /** MIMEタイプ (例: image/jpeg, application/pdf) */
  contentType: string;
  /** ファイルサイズ (バイト) */
  size: string;
}

/** 添付ファイルフィールド (複数ファイル対応) */
export interface KintoneFileField {
  value: KintoneFile[];
}

// -------------------------------------------------
// 建物ユーザー関連レコード (KINTONE_BLD_USER_REL_APP_ID)
// -------------------------------------------------
export interface BldgRecord {
  /** レコード番号 */
  $id: KintoneSystemField;
  /** 建物名ルックアップ */
  建物名ルックアップ: KintoneField;
  /** 建物レコード番号 */
  建物レコード番号: KintoneField;
  /** 建物コード */
  建物コード: KintoneField;
}

/**
 * 対応レコードType
 */
export interface ActionRecord {
  /** レコード番号 */
  $id: KintoneSystemField;
  /** 受付番号 */
  受付番号: KintoneField;
  /** P番 */
  P番: KintoneField;
  /** 件名・依頼内容 */
  "件名・依頼内容": KintoneField;
  /** 対象の建物 */
  対象の建物: KintoneField;
  /** 建物コード */
  建物コード: KintoneField;
  /** 現在の進行状況 */
  現在の進行状況: KintoneField;
  /** 学校公開 */
  学校公開: KintoneField;
  /** 学校確認日 */
  学校確認日: KintoneField<string | null>;
  /** 検収日 */
  検収日: KintoneField<string | null>;
  /** 工事案件 (案件レコード番号への参照) */
  工事案件: KintoneField;
  /** 仕入先企業名 */
  仕入先企業名: KintoneField;
  /** 学校からの依頼内容 */
  学校からの依頼内容: KintoneField;
  /** 一次対応分野 */
  一次対応分野: KintoneField;
  /** 依頼分野 */
  依頼分野: KintoneField;
  /** 仕入内容詳細 */
  仕入内容詳細: KintoneField;
  /** 原価番号 */
  原価番号: KintoneField;
  /** 工事完了日 */
  工事完了日: KintoneField<string | null>;
  /** 中間報告 */
  中間報告: KintoneField;
  /** 完了報告 */
  完了報告: KintoneField;
  /** 作業前写真・動画 (添付ファイル) */
  "作業前写真・動画": KintoneFileField;
  /** 作業完了後写真・動画 (添付ファイル) */
  "作業完了後写真・動画": KintoneFileField;
  /** 作業報告書 (添付ファイル) */
  作業報告書: KintoneFileField;
}

/**
 * 案件レコードType
 */
export interface AnkenRecord {
  /** レコード番号 */
  $id: KintoneSystemField;
  /** プロジェクト番号 */
  プロジェクト番号: KintoneField;
  /** 受付番号 */
  受付番号: KintoneField;
  /** 工事案件名 */
  工事案件名: KintoneField;
  /** 問合せ建物名 */
  問合せ建物名: KintoneField;
  /** 建物コード */
  建物コード: KintoneField;
  /** DUCE担当者 */
  DUCE担当者: KintoneField;
  /** ステータス */
  ステータス: KintoneField;
  /** 受注日 */
  受注日: KintoneField<string | null>;
  /** クライアント確認日 */
  クライアント確認日: KintoneField<string | null>;
  /** 検収日 */
  検収日: KintoneField<string | null>;
  /** 依頼日 */
  依頼日: KintoneField;
  /** 依頼担当者 */
  依頼担当者: KintoneField;
  /** 依頼内容 */
  依頼内容: KintoneField;
  /** 発注日 */
  発注日: KintoneField<string | null>;
  /** 学校公開_DUCE見積書 */
  学校公開_DUCE見積書: KintoneField;
  /** 学校Viewへの表示 */
  学校Viewへの表示: KintoneField;
  /** 見積折半 */
  見積折半: KintoneField;
  /** 公開先１ログインID */
  公開先１ログインID: KintoneField;
  /** 公開先２ログインID */
  公開先２ログインID: KintoneField;
  /** 公開先３ログインID */
  公開先３ログインID: KintoneField;
  /** 学校Viewの表示１ */
  学校Viewの表示１: KintoneField;
  /** 学校Viewの表示２ */
  学校Viewの表示２: KintoneField;
  /** 学校Viewの表示３ */
  学校Viewの表示３: KintoneField;
  /** ユーザー_緊急度 */
  ユーザー_緊急度: KintoneField;
  /** 学内用メモ */
  学内用メモ: KintoneField;
  /** 個別学内用メモ (テーブル) */
  個別学内用メモ: KintoneField<SchoolNoteTableRow[]>;
  /** 発注者名 */
  発注者名: KintoneField;
  /** 発注者メールアドレス */
  発注者メールアドレス: KintoneField;
  /** 発注時メール送信CC1 */
  発注時メール送信CC1: KintoneField;
  /** 発注時メール送信CC2 */
  発注時メール送信CC2: KintoneField;
  /** 備考学校記入 */
  備考学校記入: KintoneField;
  /** 完了報告 */
  完了報告: KintoneField;
  /** DUCEからのメッセージ */
  DUCEからのメッセージ: KintoneField;
  /** ご請求に関するメッセージ */
  ご請求に関するメッセージ: KintoneField;
  /** 依頼時添付写真 (現場写真) */
  現場写真: KintoneFileField;
  /** DUCE見積書 (見積折半しない場合) */
  DUCE見積書: KintoneFileField;
  /** 変更後DUCE見積書 (見積折半しない場合) */
  変更DUCE見積書: KintoneFileField;
  /** DUCE見積１ (見積折半する・公開先１用) */
  DUCE見積１: KintoneFileField;
  /** DUCE見積２ (見積折半する・公開先２用) */
  DUCE見積２: KintoneFileField;
  /** DUCE見積３ (見積折半する・公開先３用) */
  DUCE見積３: KintoneFileField;
  /** 変更DUCE見積１ (見積折半する・公開先１用) */
  変更DUCE見積１: KintoneFileField;
  /** 変更DUCE見積２ (見積折半する・公開先２用) */
  変更DUCE見積２: KintoneFileField;
  /** 変更DUCE見積３ (見積折半する・公開先３用) */
  変更DUCE見積３: KintoneFileField;
}

/**
 * 学校別メモテーブルの行データ
 */
export interface SchoolNoteTableRow {
  value: {
    /** ログイン別メモ本文 */
    ログイン別メモ: KintoneField;
    /** ログイン別メモ更新日時 */
    ログイン別メモ更新日時: KintoneField;
    /** メモ識別用ログインID */
    メモ識別用ログインID: KintoneField;
  };
}

// -------------------------------------------------
// Kintone API レスポンス共通型
// -------------------------------------------------

/** 複数レコード取得レスポンス */
export interface KintoneRecordsResponse<T> {
  records: T[];
  totalCount: string | null;
}

/** 単一レコード取得レスポンス */
export interface KintoneRecordResponse<T> {
  record: T;
}

/**
 * 案件レコードに紐づく対応明細を含めた拡張型
 * Jotai の atom で管理する際に、UI 表示に必要な情報をまとめて保持するための型
 */
export interface EnrichedAnkenRecord extends AnkenRecord {
  /** 紐づく対応明細一覧 */
  対応明細: ActionRecord[];
  /** 対応件数 */
  対応件数: number;
  /** 全対応が検収済みかどうか */
  isAllAccepted: boolean;
  /** 残対応数 (対応件数 - 検収済み - キャンセル) */
  残対応数: number;
}
