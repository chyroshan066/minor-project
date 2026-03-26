import Image from "next/image";
import { ReadMore } from "../ui/ReadMore";

export const InformationCard = () => (
  <>
    {/* Card 1 */}
    <div className="w-full px-3 mb-6 lg:mb-0 lg:w-7/12 lg:flex-none">
      <div className="relative flex flex-col min-w-0 break-words bg-surface shadow-soft-xl rounded-2xl bg-clip-border">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap -mx-3">
            <div className="max-w-full px-3 lg:w-1/2 lg:flex-none">
              <div className="flex flex-col h-full">
                <p className="pt-2 mb-1 font-semibold">Clinic Performance</p>
                <h5 className="font-bold">Arthonyx Care</h5>
                <p className="mb-12">
                  {" "}
                  Monitor patient flow, track clinic efficiency, and manage your staff schedules from a single, centralized dashboard designed for modern practices.
                </p>
                <ReadMore textColor="text-muted" />
              </div>
            </div>
            <div className="max-w-full px-3 mt-12 ml-auto text-center lg:mt-0 lg:w-5/12 lg:flex-none">
              <div className="h-full bg-gradient-brand rounded-xl">
                <div className="relative flex items-center justify-center h-full">
                  <Image
                    className="relative z-20 w-full pt-6"
                    src="/images/rocket-white.png"
                    alt="rocket"
                    width={500}
                    height={500}
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Card 2 */}
    <div className="w-full max-w-full px-3 lg:w-5/12 lg:flex-none">
      <div className="border-black/12.5 shadow-soft-xl relative flex h-full min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-surface bg-clip-border p-4">
        <div
          className="relative h-full overflow-hidden bg-cover rounded-xl"
          style={{ backgroundImage: "url('/images/random/ivancik.jpg')" }}
        >
          <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-dark opacity-80" />
          <div className="relative z-10 flex flex-col flex-auto h-full p-4">
            <h5 className="pt-2 mb-6 font-bold text-surface">
              {" "}
              Precision Diagnostics
            </h5>
            <p className="text-surface">
              {" "}
              Securely access encrypted medical records, X-ray history, and treatment plans. Every patient interaction is logged for comprehensive healthcare delivery.
            </p>
            <ReadMore textColor="text-surface" />
          </div>
        </div>
      </div>
    </div>
  </>
);
