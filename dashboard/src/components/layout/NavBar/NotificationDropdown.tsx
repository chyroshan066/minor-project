import { useDisclosure } from "@/hooks/useDisclosure";
import { NOTIFICATIONS } from "@/lib/constants";
import { IsProfile, Notification } from "@/types";
import { faBell, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

export const NotificationDropdown = ({ isProfile }: IsProfile) => {
  const {
    isOpen: isDropdownOpen,
    toggle: toggleDropdown,
    contentRef: dropdownRef,
    triggerRef,
  } = useDisclosure();

  return (
    <li className="relative flex items-center pr-2">
      <p className="hidden transform-dropdown-show" />
      <button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        onClick={toggleDropdown}
        className={`block p-0 text-sm transition-all ease-nav-brand rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2 ${
          isProfile
            ? "text-surface focus-visible:ring-offset-secondary"
            : "text-muted bg-transparent border-0 cursor-pointer focus-visible:ring-offset-surface"
        }`}
        data-dropdown-trigger
        aria-expanded={isDropdownOpen}
        type="button"
      >
        <FontAwesomeIcon icon={faBell} className="cursor-pointer" />
      </button>

      <ul
        ref={dropdownRef as React.RefObject<HTMLUListElement>}
        data-dropdown-menu
        className={`text-sm transform-dropdown before:font-awesome before:leading-default before:duration-350 before:ease-soft lg:shadow-soft-3xl duration-250 min-w-44 before:sm:right-7.5 before:text-5.5 absolute right-0 top-0 z-50 origin-top list-none rounded-lg border-0 border-solid border-transparent bg-surface bg-clip-padding px-2 py-4 text-left text-muted transition-all before:absolute before:right-2 before:left-auto before:top-0 before:z-50 before:inline-block before:font-normal before:text-surface before:antialiased before:transition-all before:content-['\f0d8'] sm:-mr-6 lg:absolute lg:right-0 lg:left-auto lg:mt-2 lg:block lg:cursor-pointer ${
          isDropdownOpen
            ? "opacity-100 transform-dropdown-show"
            : "opacity-0 pointer-events-none before:-top-5 transform-dropdown"
        }`}
      >
        {NOTIFICATIONS.map((notif: Notification) => (
          <li key={notif.id} className="relative mb-2 last:mb-0">
            <Link
              className={`ease-soft py-1.2 clear-both block w-full whitespace-nowrap rounded-lg ${
                notif.type === "image" && "bg-transparent"
              } px-4 duration-300 ${
                !isProfile && "hover:bg-border hover:text-main"
              } transition-all focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30`}
              href={notif.href}
            >
              <div className="flex py-1">
                {notif.type !== "icon" ? (
                  <div className="my-auto">
                    <Image
                      src={notif.asset}
                      width={36}
                      height={36}
                      alt="Notification 1"
                      className={`inline-flex items-center justify-center mr-4 text-sm text-surface h-9 w-9 max-w-none rounded-xl ${
                        notif.type === "logo" && "bg-gradient-dark"
                      }`}
                    />
                  </div>
                ) : (
                  <div
                    className={`inline-flex items-center justify-center my-auto mr-4 text-sm text-surface transition-all duration-200 bg-gradient-soft-slate600-slate300 h-9 w-9 rounded-xl ${
                      isProfile ? "ease-soft-in-out" : "ease-nav-brand"
                    }`}
                  >
                    <FontAwesomeIcon icon={notif.asset} />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <h6 className="mb-1 text-sm font-normal leading-normal">
                    <span className="font-semibold">{notif.title}</span>{" "}
                    {notif.message}
                  </h6>
                  <p className="mb-0 text-xs leading-tight text-disabled">
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    {notif.time}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
};
