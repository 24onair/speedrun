// 시즌 리더보드 예시 데이터 — P3에서 Supabase `records` 뷰로 대체된다.
// 현재 운영 사이트(para.clickn.co.kr/pages/rankboard)에 공개된 집계를 예시로 사용.

export type ClassKey = "EN-B" | "EN-C" | "EN-D/CCC";

export interface SampleRecord {
  rank: number;
  name: string;
  nameEn: string;
  cls: ClassKey;
  time: string;
}

export const OVERALL_TOP: SampleRecord[] = [
  { rank: 1, name: "김성덕", nameEn: "Kim Seongdeok", cls: "EN-D/CCC", time: "00:34:44" },
  { rank: 2, name: "허석주", nameEn: "Heo Seokju", cls: "EN-D/CCC", time: "00:35:42" },
  { rank: 3, name: "김제헌", nameEn: "Kim Jeheon", cls: "EN-D/CCC", time: "00:36:05" },
  { rank: 4, name: "강민석", nameEn: "Kang Minseok", cls: "EN-C", time: "00:38:36" },
  { rank: 5, name: "허효상", nameEn: "Heo Hyosang", cls: "EN-C", time: "00:42:47" },
  { rank: 6, name: "이한규", nameEn: "Lee Hangyu", cls: "EN-B", time: "00:51:27" },
];

export const CLASS_LEADERS: { cls: ClassKey; name: string; nameEn: string; time: string }[] = [
  { cls: "EN-B", name: "이한규", nameEn: "Lee Hangyu", time: "00:51:27" },
  { cls: "EN-C", name: "강민석", nameEn: "Kang Minseok", time: "00:38:36" },
  { cls: "EN-D/CCC", name: "김성덕", nameEn: "Kim Seongdeok", time: "00:34:44" },
];
