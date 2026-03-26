import { faGem } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const HelpCard = () => {
  return (
    <div className="sticky bottom-0 z-20 bg-surface-ground">
      <div className="mx-4 pb-4">
        <div
          className={`after:opacity-65 after:${"bg-gradient-soft-slate600-slate300"} relative flex min-w-0 flex-col items-center break-words rounded-2xl border-0 border-solid border-blue-900 bg-surface bg-clip-border shadow-none after:absolute after:top-0 after:bottom-0 after:left-0 after:z-10 after:block after:h-full after:w-full after:rounded-2xl after:content-['']`}
          sidenav-card="true"
        >
          <div className="mb-7.5 absolute h-full w-full rounded-2xl bg-cover bg-center" />
          <div className="relative z-20 flex-auto w-full p-4 text-left text-surface">
            <div className="flex items-center justify-center w-8 h-8 mb-4 text-center bg-surface bg-center rounded-lg shadow-soft-2xl">
              <FontAwesomeIcon
                icon={faGem}
                className="text-xl leading-none text-slate-600"
              />
            </div>
            <div className="transition-all duration-200 ease-nav-brand">
              <h6 className="mb-0 text-surface">Need help?</h6>
              <p className="mt-0 mb-4 text-xs font-semibold leading-tight">
                Please check our docs
              </p>
              <a
                href="#"
                target="_blank"
                className="inline-block w-full px-8 py-2 mb-0 text-xs font-bold text-center text-black uppercase transition-all ease-in bg-surface border-0 border-surface rounded-lg shadow-soft-md bg-150 leading-pro hover:shadow-soft-2xl hover:scale-102"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
