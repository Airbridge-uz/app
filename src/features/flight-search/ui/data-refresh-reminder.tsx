import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { AlertCircleIcon } from "lucide-react"

export function DataRefreshReminder() {
  return (
    <Alert variant="default">
      <AlertCircleIcon />
      <AlertTitle>Flight offers might have been expired!</AlertTitle>
      <AlertDescription>
        <p>Please, keep in mind: </p>
        <ul className="list-inside list-disc text-sm">
          <li>We refresh data every 5 minutes</li>
          <li>
            Click on the refresh button or refresh the page to get fresh data
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
