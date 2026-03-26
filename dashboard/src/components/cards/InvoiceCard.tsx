import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader } from "../ui/card";
import { Button, IconButton } from "../ui/Button";
import { INVOCIES } from "@/lib/constants";

export const InvoiceCard = () => (
  <Card
    outerDivClassName="lg:w-1/3 lg:flex-none"
    innerDivClassName="h-full bg-surface border-transparent shadow-soft-xl"
  >
    <CardHeader className="border-b-solid border-b-transparent" paddingSize={4}>
      <div className="flex flex-wrap -mx-3">
        <div className="flex items-center flex-none w-1/2 max-w-full px-3">
          <h6 className="mb-0">Invoices</h6>
        </div>
        <div className="flex-none w-1/2 max-w-full px-3 text-right">
          <Button
            className="bg-150 active:opacity-85 bg-x-25"
            btnText="View All"
          />
        </div>
      </div>
    </CardHeader>
    <div className="flex-auto p-4 pb-0">
      <ul className="flex flex-col pl-0 mb-0 rounded-lg">
        {INVOCIES.map((invoice) => (
          <li
            key={invoice.id}
            className="relative flex justify-between px-4 py-2 pl-0 mb-2 last:mb-0 first:rounded-t-inherit last:rounded-b-inherit bg-surface border-0 text-inherit rounded-xl"
          >
            <div className="flex flex-col">
              <h6 className="mb-1 font-semibold leading-normal text-sm text-main">
                {invoice.date}
              </h6>
              <span className="leading-tight text-xs">{invoice.id}</span>
            </div>
            <div className="flex items-center leading-normal text-sm">
              {invoice.amount}
              <IconButton
                paddingSize={0}
                className="ml-6 tracking-tight-soft bg-150 bg-x-25"
                textSize="sm"
                icon={faFilePdf}
                label="PDF"
                iconClass="text-lg"
                focusRingColor="focus-visible:ring-red-400/50"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  </Card>
);
