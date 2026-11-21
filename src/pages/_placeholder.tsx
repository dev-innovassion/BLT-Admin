import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaceholderPage(props: { title: string; description: string; details?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{props.title}</h1>
        <p className="text-muted-foreground mt-2">{props.description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>Under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{props.details || "This module is planned and its base is created. Implementation will follow."}</p>
        </CardContent>
      </Card>
    </div>
  );
}


