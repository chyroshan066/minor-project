import { faWifi } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "../ui/card";

export const CreditCard = () => (
  <Card
    outerDivClassName="mb-4 xl:mb-0 xl:w-1/2 xl:flex-none"
    innerDivClassName="bg-transparent border-transparent rounded-2xl shadow-xl"
  >
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        backgroundImage: "url('/images/curved-images/curved14.jpg')",
      }}
    >
      <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-dark opacity-80" />
      <div className="relative z-10 flex-auto p-4">
        <FontAwesomeIcon icon={faWifi} className="p-2 text-surface" />
        <h5 className="pb-2 mt-6 mb-12 text-surface">
          4562&nbsp;&nbsp;&nbsp;1122&nbsp;&nbsp;&nbsp;4594&nbsp;&nbsp;&nbsp;7852
        </h5>
        <div className="flex">
          <div className="flex">
            <div className="mr-6">
              <p className="mb-0 leading-normal text-surface text-sm opacity-80">
                Card Holder
              </p>
              <h6 className="mb-0 text-surface">Jack Peterson</h6>
            </div>
            <div>
              <p className="mb-0 leading-normal text-surface text-sm opacity-80">
                Expires
              </p>
              <h6 className="mb-0 text-surface">11/22</h6>
            </div>
          </div>
          <div className="flex items-end justify-end w-1/5 ml-auto">
            <img
              className="w-3/5 mt-2"
              src="/images/logos/mastercard.png"
              alt="logo"
            />
          </div>
        </div>
      </div>
    </div>
  </Card>
);
