import {
  faArrowDown,
  faArrowUp,
  faCalendarAlt,
  faExclamation,
  faReceipt,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionType } from "@/types";
import React from "react";
import { Card, CardHeader } from "../ui/card";
import { TRANSACTION_GROUPS } from "@/lib/constants";
import { EmptyState } from "../ui/EmptyState";

const transactionConfigs: Record<
  TransactionType,
  {
    icon: IconDefinition;
    colorClass: string;
    gradientClass: string;
  }
> = {
  income: {
    icon: faArrowUp,
    colorClass: "border-success text-success",
    gradientClass: "bg-gradient-soft-green600-lime400",
  },
  expense: {
    icon: faArrowDown,
    colorClass: "border-danger text-danger",
    gradientClass: "bg-gradient-soft-red600-rose400",
  },
  pending: {
    icon: faExclamation,
    colorClass: "border-main text-main",
    gradientClass: "text-main",
  },
};

export const TransactionCard = () => {
  const hasTransactions = TRANSACTION_GROUPS.some(
    (group) => group.data.length > 0
  ); // ".some()" checks if at least one element in the array passes a specific test.

  return (
    <Card
      outerDivClassName="mt-6 md:w-5/12 md:flex-none"
      innerDivClassName="h-full mb-6 shadow-soft-xl bg-surface flex flex-col"
    >
      <CardHeader className="px-4">
        <div className="flex flex-wrap -mx-3">
          <div className="max-w-full px-3 md:w-1/2 md:flex-none">
            <h6 className="mb-0">Your Transactions</h6>
          </div>
          <div className="flex items-center justify-end max-w-full px-3 md:w-1/2 md:flex-none">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            <small>23 - 30 March 2020</small>
          </div>
        </div>
      </CardHeader>
      <div className="flex-auto p-4 pt-6 flex items-center justify-center min-h-[300px]">
        {!hasTransactions ? (
          <EmptyState
            message="No transactions yet"
            description="Your billing history will appear here once you make a transaction."
            icon={faReceipt}
          />
        ) : (
          <div className="w-full">
            {TRANSACTION_GROUPS.map((group) => (
              <React.Fragment key={group.title}>
                <h6 className="mb-4 font-bold leading-tight uppercase text-xs text-muted first:mt-0 mt-4">
                  {group.title}
                </h6>
                <ul className="flex flex-col pl-0 mb-0 rounded-lg">
                  {group.data.map((transaction) => {
                    const config = transactionConfigs[transaction.type];

                    return (
                      <li
                        key={transaction.id}
                        className="relative flex justify-between px-4 py-2 pl-0 mb-2 bg-surface border-0 first:rounded-t-inherit last:rounded-b-inherit not-first:border-t-0 text-inherit rounded-xl"
                      >
                        <div className="flex items-center">
                          <button
                            className={`leading-pro ease-soft-in text-xs bg-150 w-6.35 h-6.35 p-1.2 rounded-3.5xl tracking-tight-soft bg-x-25 mr-4 mb-0 flex cursor-pointer items-center justify-center border border-solid ${config.colorClass} bg-transparent text-center align-middle font-bold uppercase transition-all hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2`}
                          >
                            <FontAwesomeIcon
                              icon={config.icon}
                              className="text-3xs"
                            />
                          </button>
                          <div className="flex flex-col">
                            <h6 className="mb-1 leading-normal text-sm text-main">
                              {transaction.name}
                            </h6>
                            <span className="leading-tight text-xs">
                              {transaction.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          {transaction.type === "pending" ? (
                            <p className="flex items-center m-0 font-semibold leading-normal text-sm text-main">
                              Pending
                            </p>
                          ) : (
                            <p
                              className={`relative z-10 items-center inline-block m-0 font-semibold leading-normal text-transparent ${config.gradientClass} text-sm bg-clip-text`}
                            >
                              {transaction.amount}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
