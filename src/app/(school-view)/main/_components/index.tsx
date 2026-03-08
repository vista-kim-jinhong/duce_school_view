"use client";

import { useEffect } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import type { ActionRecord, AnkenRecord } from "@/lib/api/types/kintone";
import {
  actionItemsAtom,
  ankenListAtom,
  isLoadingAtom,
  selectedAnkenIdAtom,
} from "../_store";
import AppLoading from "@/components/ui/AppLoading/AppLoading";
import MainHeader from "./MainHeader";
import AnkenTableToolbar from "./AnkenTableToolbar";
import AnkenTable from "./AnkenTable";
import AnkenTablePagination from "./AnkenTablePagination";
import MemoModal from "./modal/MemoModal";
import InquiryModal from "./modal/InquiryModal";
import ClientConfirmModal from "./modal/ClientConfirmModal";
import DetailModal from "./modal/DetailModal";
import OrderModal from "./modal/OrderModal";

interface ParentViewComponentProps {
  ankenList: AnkenRecord[];
  actionItems: ActionRecord[];
  schoolOrCompanyName: string;
}

/**
 * Client-Side-Component: Main Screen Parent Component
 * @description サーバーから受け取った案件リストと対応明細をJotaiのatomに格納し、ローディング状態を管理する。
 * @param param0 - サーバーから渡される初期データ（案件リスト、対応明細、学校/会社名）
 * @returns JSX.Element
 */
export default function ParentViewComponent({
  ankenList,
  actionItems,
  schoolOrCompanyName,
}: ParentViewComponentProps) {
  const setAnkenList = useSetAtom(ankenListAtom);
  const setActionItems = useSetAtom(actionItemsAtom);
  const setIsLoading = useSetAtom(isLoadingAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const selectedAnkenId = useAtomValue(selectedAnkenIdAtom);

  // サーバーから受け取ったデータをatomに格納
  useEffect(() => {
    setAnkenList(ankenList);
    setActionItems(actionItems);
    setIsLoading(false);
  }, [ankenList, actionItems, setAnkenList, setActionItems, setIsLoading]);

  return (
    <div className="mt-4 px-4">
      {/* ローディングオーバーレイ */}
      {isLoading && <AppLoading variant="overlay" label="読み込み中..." />}

      {/* 学校名・リンクボタン */}
      <MainHeader schoolOrCompanyName={schoolOrCompanyName} />

      {/* テーブルツールバー: フィルタ・ソートボタン・再読込 */}
      <AnkenTableToolbar />

      {/* 案件一覧テーブル */}
      <AnkenTable />

      {/* 詳細モーダル */}
      <DetailModal ankenId={selectedAnkenId} />

      {/* 完了を確認モーダル */}
      <ClientConfirmModal />

      {/* 発注確定モーダル */}
      <OrderModal />

      {/* お問い合わせモーダル */}
      <InquiryModal />

      {/* 学内用メモモーダル */}
      <MemoModal />

      {/* ページネーション */}
      <AnkenTablePagination />
    </div>
  );
}
