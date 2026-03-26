import React from "react";
import { Setting } from "@/types";
import { ACCOUNT_SETTINGS, APPLICATION_SETTINGS } from "@/lib/constants";
import { Card, CardHeader } from "../ui/card";
import { Checkbox } from "../ui/form/Checkbox";

interface MergedSetting {
  category: string;
  settings: Setting[];
}

const MERGED_SETTINGS: MergedSetting[] = [
  {
    category: "Account",
    settings: ACCOUNT_SETTINGS,
  },
  {
    category: "Application",
    settings: APPLICATION_SETTINGS,
  },
];

export const SettingsToggleCard = () => (
  <Card
    outerDivClassName="xl:w-4/12"
    innerDivClassName="h-full bg-surface shadow-soft-xl"
  >
    <CardHeader paddingSize={4}>
      <h6 className="mb-0">Platform Settings</h6>
    </CardHeader>
    <div className="flex-auto p-4">
      {MERGED_SETTINGS.map((group) => (
        <React.Fragment key={group.category}>
          <h6 className="not-first:mt-6 font-bold leading-tight uppercase text-xs text-muted">
            {group.category}
          </h6>
          <ul className="flex flex-col pl-0 mb-0 rounded-lg">
            {group.settings.map((setting) => (
              <li
                key={setting.id}
                className="relative block px-0 py-2 bg-surface border-0 last:pb-0 first:rounded-t-lg last:rounded-b-lg text-inherit"
              >
                <div className="min-h-6 mb-0.5 block pl-0">
                  <Checkbox
                    id={setting.id}
                    defaultChecked={setting.defaultChecked}
                  />
                  <label
                    htmlFor={setting.id}
                    className="w-4/5 mb-0 ml-4 overflow-hidden font-normal cursor-pointer select-none text-sm text-ellipsis whitespace-nowrap text-muted transition-colors duration-250 peer-focus-visible:text-secondary"
                  >
                    {setting.label}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </div>
  </Card>
);
