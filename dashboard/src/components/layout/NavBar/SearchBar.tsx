import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const SearchBar = () => (
  <div className="flex items-center md:ml-auto md:pr-4">
    <div className="relative flex flex-wrap items-stretch w-full transition-all rounded-lg ease-soft">
      <span className="text-sm ease-soft leading-5.6 absolute z-50 -ml-px flex h-full items-center whitespace-nowrap rounded-lg rounded-tr-none rounded-br-none border border-r-0 border-transparent bg-transparent py-2 px-2.5 text-center font-normal text-muted transition-all">
        <FontAwesomeIcon icon={faSearch} />
      </span>
      <input
        type="text"
        className="pl-8.75 text-sm focus:shadow-soft-primary-outline ease-soft w-1/100 leading-5.6 relative -ml-px block min-w-0 flex-auto rounded-lg border border-solid border-gray-300 bg-surface bg-clip-padding py-2 pr-3 text-gray-700 transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none focus:transition-shadow"
        placeholder="Type here..."
      />
    </div>
  </div>
);
