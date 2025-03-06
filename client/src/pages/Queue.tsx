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
import { QueueItem } from "@shared/schema";

export default function Queue() {
  const { data: items = [], isLoading } = useQuery<QueueItem[]>({
    queryKey: ["/api/queue"],
    refetchInterval: 5000  // 5초마다 새로고침
  });

  const sortedItems = [...items].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority ? 1 : -1;
    if (a.progress !== b.progress) return b.progress ? 1 : -1;
    return new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime();
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="fixed top-0 left-0 w-[640px] h-[480px] rounded-none">
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center sticky top-0">체어</TableHead>
              <TableHead className="w-[150px] text-center sticky top-0">상태</TableHead>
              <TableHead className="w-[80px] text-center sticky top-0">우선</TableHead>
              <TableHead className="w-[80px] text-center sticky top-0">진행</TableHead>
              <TableHead className="w-[150px] sticky top-0">대기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.pageId}>
                <TableCell className="text-center">{item.chair}</TableCell>
                <TableCell className="text-center">{item.status}</TableCell>
                <TableCell className="text-center">{item.priority ? 'O' : 'X'}</TableCell>
                <TableCell className="text-center">{item.progress ? 'O' : 'X'}</TableCell>
                <TableCell>{item.waiting}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}