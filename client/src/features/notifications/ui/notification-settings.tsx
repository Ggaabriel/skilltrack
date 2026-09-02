import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

import {
  getPushSubscription,
  serializePushSubscription,
  subscribeToPush,
} from "../model/push";
import { notificationApi } from "../api/notification.api";

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getPushSubscription().then((subscription) => {
      setEnabled(!!subscription);
    });
  }, []);

 const handleEnable = async () => {
  try {
    setIsLoading(true);

    console.log("1. subscribeToPush");
    const subscription = await subscribeToPush();
    console.log("2. subscription", subscription);

    const dto = serializePushSubscription(subscription);
    console.log("3. dto", dto);

    await notificationApi.subscribe(dto);
    console.log("4. backend success");

    setEnabled(true);
  } catch (error) {
    console.error("ENABLE ERROR:", error);
  } finally {
    console.log("5. finally");
    setIsLoading(false);
  }
};

  const handleDisable = async () => {
    try {
      setIsLoading(true);

      const subscription = await getPushSubscription();

      if (!subscription) {
        setEnabled(false);
        return;
      }

      await subscription.unsubscribe();

      await notificationApi.unsubscribe(subscription.endpoint);

      setEnabled(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Уведомления
        </CardTitle>

        <CardDescription>
          Получайте напоминания о предстоящих событиях SkillTrack.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {enabled ? (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Bell className="size-4 text-primary" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">Уведомления включены</p>

              <p className="text-xs text-muted-foreground">
                Вы будете получать напоминания о событиях.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Выключить
            </Button>
          </div>
        ) : (
          <Button onClick={handleEnable} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Bell />}
            Включить уведомления
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
