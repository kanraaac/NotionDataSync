import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueueItem, statusOrder } from "@shared/schema";

export default function Queue() {
  const { data: items = [], isLoading } = useQuery<QueueItem[]>({
    queryKey: ["/api/queue"],
    refetchInterval: 5000  // 5초마다 새로고침
  });

  const sortedItems = [...items].sort((a, b) => {
    // 1순위: 우선(priority) 정렬
    if (a.priority !== b.priority) return b.priority ? 1 : -1;

    // 2순위: 진행(progress) 정렬
    if (a.progress !== b.progress) return b.progress ? 1 : -1;

    // 3순위: 상태(status) 정렬
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }

    // 4순위: 대기 시간 정렬 (숫자만 추출하여 비교)
    const waitingA = parseInt(a.waiting.replace(/\D/g, '') || '0');
    const waitingB = parseInt(b.waiting.replace(/\D/g, '') || '0');
    if (waitingA !== waitingB) return waitingB - waitingA;

    // 마지막으로 수정 시간 기준 정렬
    return new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime();
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="fixed top-0 left-0 w-[320px] h-[240px] rounded-none">
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-[45px] text-center p-1 sticky top-0">체어</TableHead>
              <TableHead className="w-[70px] text-center p-1 sticky top-0">상태</TableHead>
              <TableHead className="w-[35px] text-center p-1 sticky top-0">우선</TableHead>
              <TableHead className="w-[35px] text-center p-1 sticky top-0">진행</TableHead>
              <TableHead className="w-[70px] p-1 sticky top-0">대기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.pageId} className="text-xs">
                <TableCell className="text-center p-1">{item.chair}</TableCell>
                <TableCell className="text-center p-1">{item.status}</TableCell>
                <TableCell className="text-center p-1">{item.priority ? 'O' : 'X'}</TableCell>
                <TableCell className="text-center p-1">{item.progress ? 'O' : 'X'}</TableCell>
                <TableCell className="p-1">{item.waiting}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}