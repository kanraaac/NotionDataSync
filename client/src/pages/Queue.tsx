import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QueueItem, statusValues, statusOrder } from "@shared/schema";
import { updateStatus, updatePriority, updateProgress, updateWaiting } from "@/lib/notion";

export default function Queue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery<QueueItem[]>({
    queryKey: ["/api/queue"],
    refetchInterval: 5000
  });

  const sortedItems = [...items].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority ? 1 : -1;
    if (a.progress !== b.progress) return b.progress ? 1 : -1;
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime();
  });

  const handleStatusChange = async (pageId: string, status: string) => {
    try {
      await updateStatus(pageId, status as any);
      await queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handlePriorityToggle = async (pageId: string, current: boolean) => {
    try {
      await updatePriority(pageId, !current);
      await queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive"
      });
    }
  };

  const handleProgressToggle = async (pageId: string, current: boolean) => {
    try {
      await updateProgress(pageId, !current);
      await queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const handleWaitingClick = async (pageId: string) => {
    try {
      await updateWaiting(pageId);
      await queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update waiting status",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="fixed bottom-24 right-4 w-[600px] overflow-hidden">
      <div className="max-h-[400px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">체어</TableHead>
              <TableHead className="w-[150px] text-center">상태</TableHead>
              <TableHead className="w-[80px] text-center">우선</TableHead>
              <TableHead className="w-[80px] text-center">진행</TableHead>
              <TableHead className="w-[150px]">대기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.pageId}>
                <TableCell className="text-center">{item.chair}</TableCell>
                <TableCell>
                  <Select
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.pageId, value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{item.status}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusValues.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={item.priority}
                    onCheckedChange={() => handlePriorityToggle(item.pageId, item.priority)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={item.progress}
                    onCheckedChange={() => handleProgressToggle(item.pageId, item.progress)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={() => handleWaitingClick(item.pageId)}
                  >
                    {item.waiting}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
