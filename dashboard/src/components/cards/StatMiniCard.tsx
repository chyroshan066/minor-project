import { PAYMENT_STATS } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "../ui/card";
import { Separator } from "../ui/Separator";

export const StatMiniCard = () => (
  <>
    <div className="w-full max-w-full px-3 xl:w-1/2 xl:flex-none">
      <div className="flex flex-wrap -mx-3">
        {PAYMENT_STATS.map((method) => (
          <Card
            key={method.id}
            outerDivClassName={`${method.className} md:w-1/2 md:flex-none`}
            innerDivClassName="bg-surface border-transparent shadow-soft-xl"
          >
            <div className="p-4 mx-6 mb-0 text-center bg-surface border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-brand shadow-soft-2xl rounded-xl">
                <FontAwesomeIcon
                  icon={method.icon}
                  className="text-surface text-xl"
                />
              </div>
            </div>
            <div className="flex-auto p-4 pt-0 text-center">
              <h6 className="mb-0 text-center">{method.title}</h6>
              <span className="leading-tight text-xs">
                {method.description}
              </span>
              <Separator className="my-4" />
              <h5 className="mb-0">{method.amount}</h5>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </>
);
