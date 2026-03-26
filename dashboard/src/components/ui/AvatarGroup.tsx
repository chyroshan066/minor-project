import { Participant } from "@/types";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";
import Link from "next/link";

export const AvatarGroup = ({
  participants,
}: {
  participants: Participant[];
}) => (
  <Tooltip.Provider
    delayDuration={100} // It determines how long the mouse must rest on an element before the tooltip reveals itself. Radix usually defaults this to 700ms.
    skipDelayDuration={500} // It controls how much time can pass between leaving one tooltip and entering another before the delayDuration is applied again.
  >
    <div className="mt-2">
      {participants.map((participant: Participant) => (
        <Tooltip.Root key={participant.id}>
          <Tooltip.Trigger asChild>
            <Link
              href="#"
              className="relative z-20 inline-flex items-center justify-center w-6 h-6 not-first:-ml-4 text-surface transition-all duration-200 border-2 border-white border-solid ease-soft-in-out text-xs rounded-full hover:z-30 outline-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:scale-110"
              data-target="tooltip_trigger"
              data-placement="bottom"
            >
              <Image
                src={participant.img}
                width={24}
                height={24}
                alt="Image placeholder"
                className="w-full rounded-full object-cover"
              />
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="z-50 px-2 py-1 text-surface bg-black rounded-lg text-sm shadow-soft-lg animate-fade-in-up"
              sideOffset={5}
              side="bottom"
            >
              {participant.name}
              <Tooltip.Arrow className="fill-black" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}
    </div>
  </Tooltip.Provider>
);
