import { faPencilAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardHeader } from "../ui/card";
import { Button } from "../ui/Button";
import { PAYMENT_METHODS } from "@/lib/constants";
import * as Tooltip from "@radix-ui/react-tooltip";

export const PaymentMethodCard = () => (
  <Card
    outerDivClassName="mb-4 lg:mb-0 lg:w-full lg:flex-none"
    innerDivClassName="mt-6 bg-surface border-transparent shadow-soft-xl"
    isWidthFull={false}
  >
    <CardHeader className="border-b-solid border-b-transparent" paddingSize={4}>
      <div className="flex flex-wrap -mx-3">
        <div className="flex items-center flex-none w-1/2 max-w-full px-3">
          <h6 className="mb-0">Payment Method</h6>
        </div>
        <div className="flex-none w-1/2 max-w-full px-3 text-right">
          <Button
            variant="gradient"
            backgroundColor="bg-gradient-dark"
            icon={faPlus}
            btnText="Add New Card"
            focusRingColor="focus-visible:ring-disabled/50"
          />
        </div>
      </div>
    </CardHeader>
    <div className="flex-auto p-4">
      <div className="flex flex-wrap -mx-3">
        <Tooltip.Provider
          delayDuration={100} // It determines how long the mouse must rest on an element before the tooltip reveals itself. Radix usually defaults this to 700ms.
          skipDelayDuration={500} // It controls how much time can pass between leaving one tooltip and entering another before the delayDuration is applied again.
        >
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className={`max-w-full px-3 ${method.className} md:w-1/2 md:flex-none`}
            >
              <div className="relative flex flex-row items-center flex-auto min-w-0 p-6 break-words bg-transparent border border-solid shadow-none rounded-xl border-slate-100 bg-clip-border">
                <img
                  className="mb-0 mr-4 w-1/10"
                  src={method.logo}
                  alt={method.alt}
                />
                <h6 className="mb-0">{method.cardNumber}</h6>
                <Tooltip.Root>
                  <Tooltip.Trigger
                    type="button"
                    aria-label={`Edit card ending in ${method.cardNumber}`}
                    className="ml-auto flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-disabled/50 rounded-full transition-all"
                  >
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      className="cursor-pointer text-main"
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      sideOffset={5}
                      side="top"
                      className="z-50 px-2 py-1 text-surface bg-black rounded-lg text-sm"
                    >
                      Edit Card
                      <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>
          ))}
        </Tooltip.Provider>
      </div>
    </div>
  </Card>
);
