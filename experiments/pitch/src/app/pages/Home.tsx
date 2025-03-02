import { db } from "@/db";
// import type { User } from "@prisma/client";\
// import type { User } from "@prisma/client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

export async function Home() {
  const users = await db.user.findMany();

  return (
    <div className="container mx-auto p-12">
      <Card>
        <CardHeader>
          <CardTitle>Hello World</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="my-4">
            {users.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))}
          </ul>
          <CardFooter>
            <Button>Click me</Button>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
