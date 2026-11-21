import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage contact form submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>
            Review and respond to contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contact submissions management page is under development. Backend APIs are being implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}





