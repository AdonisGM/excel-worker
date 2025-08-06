import { Button } from '@/components/ui/button';
import { callApi } from '@/apis/call-api';
import { useMutation } from '@tanstack/react-query';
import { apiPauseAdd, apiPauseQueue, type PauseQueueRes, type PauseAddReq } from '@/apis/dictionary/api-pause-queue';
import { useEffect, useState } from 'react';

interface QueueControllerProps {
  queueName: string;
}

const QueueController = ({ queueName }: QueueControllerProps) => {
  const [isPausedAdd, setIsPausedAdd] = useState(false);
  const [isPausedQueue, setIsPausedQueue] = useState(false);

  const pauseAddMutation = useMutation<PauseQueueRes, unknown, boolean>({
    mutationFn: async (isPaused: boolean) => {
      return await callApi<PauseAddReq, PauseQueueRes>({
        api: apiPauseAdd,
        params: [queueName],
        body: { isPaused },
      });
    },
  });

  const pauseQueueMutation = useMutation<PauseQueueRes, unknown, boolean>({
    mutationFn: async (isPaused: boolean) => {
      return await callApi<
        { isPaused: boolean },
        PauseQueueRes
      >({
        api: apiPauseQueue,
        params: [queueName],
        body: { isPaused },
      });
    },
  });

  useEffect(() => {
    // Optionally: fetch trạng thái hiện tại của queue nếu có API
    // setIsPausedAdd(...)
    // setIsPausedQueue(...)
  }, [queueName]);

  const handleTogglePauseAdd = () => {
    const next = !isPausedAdd;
    pauseAddMutation.mutate(next, {
      onSuccess: () => setIsPausedAdd(next),
    });
  };

  const handleTogglePauseQueue = () => {
    const next = !isPausedQueue;
    pauseQueueMutation.mutate(next, {
      onSuccess: () => setIsPausedQueue(next),
    });
  };

  return (
    <div>
      <p className={'text-gray-600 text-xs text-center mb-3 font-bold'}>Queue controller</p>
      <div className={'flex items-center gap-2'}>
        <Button
          size={'xs'}
          onClick={handleTogglePauseAdd}
          disabled={pauseAddMutation.isPending}
          variant={isPausedAdd ? 'destructive' : 'default'}
        >
          {isPausedAdd ? 'Resume Add' : 'Pause Add'}
        </Button>
        <Button
          size={'xs'}
          onClick={handleTogglePauseQueue}
          disabled={pauseQueueMutation.isPending}
          variant={isPausedQueue ? 'destructive' : 'default'}
        >
          {isPausedQueue ? 'Resume Queue' : 'Pause Queue'}
        </Button>
      </div>
    </div>
  );
};

export default QueueController;
