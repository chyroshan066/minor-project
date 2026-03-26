import Image from "next/image";
import { Card, CardHeader } from "../ui/card";
import { CHATS } from "@/lib/constants";
import { IconButton } from "../ui/Button";

export const RecentChatsCard = () => (
  <Card
    outerDivClassName="lg-max:mt-6 xl:w-4/12"
    innerDivClassName="h-full bg-surface shadow-soft-xl"
  >
    <CardHeader paddingSize={4}>
      <h6 className="mb-0">Conversations</h6>
    </CardHeader>
    <div className="flex-auto p-4">
      <ul className="flex flex-col pl-0 mb-0 rounded-lg">
        {CHATS.map((chat) => (
          <li
            key={chat.id}
            className="relative flex items-center px-0 py-2 not-last:mb-2 bg-surface border-0 first:rounded-t-lg not-first:border-t-0 last:rounded-b-lg text-inherit"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 mr-4 text-surface transition-all duration-200 text-base ease-soft-in-out rounded-xl">
              <Image
                src={chat.img}
                width={48}
                height={48}
                alt="kal"
                className="w-full shadow-soft-2xl rounded-xl object-cover"
              />
            </div>
            <div className="flex flex-col items-start justify-center">
              <h6 className="mb-0 leading-normal text-sm">{chat.name}</h6>
              <p className="mb-0 leading-tight text-xs">{chat.message}</p>
            </div>
            <IconButton
              className="pl-0 pr-4 ml-auto hover:active:scale-102 hover:shadow-none active:scale-100"
              leading="pro"
              backgroundColor="transparent"
              focusRingColor="focus-visible:ring-primary-ring/50"
              textColor="text-primary hover:text-fuchsia-800"
              label="Reply"
            />
          </li>
        ))}
      </ul>
    </div>
  </Card>
);
