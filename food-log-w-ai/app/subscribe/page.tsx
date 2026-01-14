import { availablePlans } from "@/lib/plans";

export default function Subscribe() {
  return (
    <div className="min-h-screen bg-[#aacfdd]/20 py-20 px-4 sm:px-6 lg:px-8">
      {" "}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        {" "}
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#37375e]">
          {" "}
          Simple, transparent <span className="text-[#fe875d]"> Pricing </span>
        </h2>{" "}
        <p className="text-xl text-[#356288]">
          Get Started on our weekly plan or upgrade to monthly or yearly when
          you're ready
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        {availablePlans.map((plan, key) => (
          <div
            key={key}
            className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 ${
              plan.isPopular
                ? "border-4 border-[#fe875d] ring-4 ring-[#fe875d]/20 scale-105 z-10"
                : "border border-gray-100"
            }
                `}
          >
            <div>
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fe875d] text-white px-4 py-1 rounded-full text-sm font-bold trackign wide shadow-md">
                  {" "}
                  MOST POPULAR
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#37375e] mb-2">
                  {" "}
                  {plan.name}{" "}
                </h3>
                <div className="flex justify-center items-baseline text-[#37375e]">
                  <span className="text-5xl font-extrabold">
                    {" "}
                    ₱{plan.amount}{" "}
                  </span>
                  <span className="text-lg ml-2 text-[#356288]"> /{plan.interval}</span>
                </div>
                <p className="mt-4 text-[#356288]">{plan.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, key) => (
                  <li key={key} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#aacfdd]/50 flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 fill-[#fe875d]"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18.047,4,22,8.325,9.3,20,2,12.68,6.136,8.533,9.474,11.88Z" />
                      </svg>
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
                  plan.isPopular
                    ? "bg-[#fe875d] text-white hover:bg-[#fe875d]/90 shadow-[#fe875d]/30"
                    : " bg-[#37375e] text-white hover:bg-[#37375e]/90 shadow-[#37375e]/30"
                }`}
              >
                {" "}
                Subscribe {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
