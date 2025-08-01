import {Button} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";

const Status = () => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Queue status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Allow add to queue</span>
            <span className="font-semibold">Yes</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Allow worker to take task</span>
            <span className="font-semibold">Yes</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Current Queue Length</span>
            <span className="font-semibold">42</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Average Wait Time</span>
            <span className="font-semibold">50 s</span>
          </div>
          <Button variant="outline" className="mt-4">Refresh Status</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Status;