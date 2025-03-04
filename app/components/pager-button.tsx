import { sendNotification } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export const PagerButton = () => {
  return <Button onClick={sendNotification}>Page Me!</Button>;
};
