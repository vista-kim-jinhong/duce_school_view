"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { EnvelopeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { EnrichedAnkenRecord } from "@/lib/api/types/kintone";
import { ANKEN_COLUMN, ANKEN_COLUMN_HEADER } from "./anken-column-def";

export function useAnkenColumns(): ColumnDef<EnrichedAnkenRecord, string>[] {
  return [
    // 詳細ボタン
    {
      id: ANKEN_COLUMN.DETAIL,
      header: ANKEN_COLUMN_HEADER.DETAIL,
      cell: ({ row }) => (
        <button
          onClick={() => {
            // TODO: 詳細モーダルを開く
            console.log("詳細:", row.original.$id.value);
          }}
          className="rounded px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
        >
          詳細
        </button>
      ),
    },

    // P番
    {
      id: ANKEN_COLUMN.PROJECT_NUMBER,
      header: ANKEN_COLUMN_HEADER.PROJECT_NUMBER,
      accessorFn: (row) => row.プロジェクト番号.value,
      cell: ({ getValue }) => (
        <span className="text-right block">{getValue<string>()}</span>
      ),
    },

    // 受付番号
    {
      id: ANKEN_COLUMN.RECEPTION_NUMBER,
      header: ANKEN_COLUMN_HEADER.RECEPTION_NUMBER,
      accessorFn: (row) => row.受付番号.value,
      cell: ({ getValue }) => (
        <span className="text-right block whitespace-nowrap">
          {getValue<string>()}
        </span>
      ),
    },

    // 対象の建物名
    {
      id: ANKEN_COLUMN.BUILDING_NAME,
      header: ANKEN_COLUMN_HEADER.BUILDING_NAME,
      accessorFn: (row) => row.問合せ建物名.value,
    },

    // 工事案件名
    {
      id: ANKEN_COLUMN.CONSTRUCTION_NAME,
      header: ANKEN_COLUMN_HEADER.CONSTRUCTION_NAME,
      accessorFn: (row) => row.工事案件名.value,
    },

    // DUCE担当者
    {
      id: ANKEN_COLUMN.DUCE_MANAGER,
      header: ANKEN_COLUMN_HEADER.DUCE_MANAGER,
      accessorFn: (row) => row.DUCE担当者.value,
    },

    // ステータス
    {
      id: ANKEN_COLUMN.STATUS,
      header: ANKEN_COLUMN_HEADER.STATUS,
      accessorFn: (row) => row.ステータス.value,
      cell: ({ getValue }) => (
        <span className="block text-center">{getValue<string>()}</span>
      ),
    },

    // 見積 (発注待ちボタン or 受注日)
    {
      id: ANKEN_COLUMN.ESTIMATE,
      header: ANKEN_COLUMN_HEADER.ESTIMATE,
      cell: ({ row }) => {
        const anken = row.original;
        const isOrderWaiting =
          anken.受注日.value === null &&
          anken.学校公開_DUCE見積書.value === "する" &&
          anken.ステータス.value === "【発注待】";

        if (isOrderWaiting) {
          return (
            <button
              onClick={() => {
                // TODO: 発注モーダルを開く
                console.log("発注:", anken.$id.value);
              }}
              className="rounded px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white transition-colors whitespace-nowrap"
            >
              発注待ち
            </button>
          );
        }

        if (anken.受注日.value) {
          return (
            <span className="block text-center text-sm">
              {anken.受注日.value}
            </span>
          );
        }

        return null;
      },
    },

    // 完了確認 (完了を確認ボタン or クライアント確認日)
    {
      id: ANKEN_COLUMN.COMPLETION_CHECK,
      header: ANKEN_COLUMN_HEADER.COMPLETION_CHECK,
      cell: ({ row }) => {
        const anken = row.original;

        if (anken.クライアント確認日.value) {
          return (
            <span className="block text-center text-sm">
              {anken.クライアント確認日.value}
            </span>
          );
        }

        if (anken.isAllAccepted) {
          return (
            <button
              onClick={() => {
                // TODO: 完了確認処理を呼び出す
                console.log(
                  "完了確認:",
                  anken.対応明細.map((a) => a.$id.value),
                );
              }}
              className="rounded px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white transition-colors whitespace-nowrap"
            >
              完了を確認
            </button>
          );
        }

        return null;
      },
    },

    // 検収日
    {
      id: ANKEN_COLUMN.INSPECTION_DATE,
      header: ANKEN_COLUMN_HEADER.INSPECTION_DATE,
      accessorFn: (row) => row.検収日.value ?? "",
      cell: ({ getValue }) => (
        <span className="block text-center text-sm">{getValue<string>()}</span>
      ),
    },

    // お問合せ
    {
      id: ANKEN_COLUMN.INQUIRY,
      header: ANKEN_COLUMN_HEADER.INQUIRY,
      cell: ({ row }) => (
        <button
          onClick={() => {
            // TODO: お問合せモーダルを開く
            console.log("お問合せ:", row.original.$id.value);
          }}
          className="flex items-center justify-center w-full text-blue-500 hover:text-blue-700 transition-colors"
        >
          <EnvelopeIcon className="h-5 w-5" />
        </button>
      ),
    },

    // お客様メモ
    {
      id: ANKEN_COLUMN.MEMO,
      header: ANKEN_COLUMN_HEADER.MEMO,
      cell: ({ row }) => {
        const hasMemo = !!row.original.学内用メモ.value;
        return (
          <button
            onClick={() => {
              // TODO: メモモーダルを開く
              console.log("メモ:", row.original.$id.value);
            }}
            className="flex items-center justify-center w-full text-orange-400 hover:text-orange-600 transition-colors"
          >
            <PencilSquareIcon
              className={["h-5 w-5", hasMemo ? "fill-orange-200" : ""]
                .filter(Boolean)
                .join(" ")}
            />
          </button>
        );
      },
    },
  ];
}
