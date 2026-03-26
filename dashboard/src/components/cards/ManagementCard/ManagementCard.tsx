"use client";

import { memo } from "react";
import { ProjectsTable } from "./ProjectsTable";
import { OrdersTimeline } from "./OrdersTimeline";
import { useAuthStore } from "@/store/authStore";
import { BillingStatusTable } from "./BillingStatusTable";
import { ReceptionistTable } from "@/components/features/tables/ReceptionistTable";

export const ManagementCard = memo(() => {
  const { user } = useAuthStore(); // Get the logged-in user
  // 1. Handle Loading state if user data isn't ready
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-soft-xl p-10 text-center border border-dashed border-slate-200">
        <div className="mb-4 p-4 bg-cyan-50 rounded-full text-cyan-500">
           {/* You can put a Lock or User icon here */}
           <span className="text-4xl">🔐</span>
        </div>
        <h4 className="text-slate-700 font-bold mb-2">Staff Portal Restricted</h4>
        <p className="text-slate-400 max-w-xs mx-auto text-sm">
          Please log in to your account to view the staff directory and management tools.
        </p>
        <button 
          onClick={() => window.location.href = '/auth/login'}
          className="mt-6 bg-gradient-to-tl from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-tight hover:scale-105 transition-transform"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // 2. Switch logic based on role
  switch (user.role) {
    case "admin":
      return <ReceptionistTable />;

    case "dentist":
      // return <DentistTable />;
      return <BillingStatusTable />;

    case "receptionist":
      // return <ReceptionistTable />;
      return <BillingStatusTable />;

    default:
      return (
        <div className="p-10">
          You do not have permission to view this page.
        </div>
      );
  }
  return (
    <>
      <ProjectsTable />
      <OrdersTimeline />
    </>
  );
});

ManagementCard.displayName = "ManagementCard";

// "use client";

// import { useAuthStore } from "@/store/authStore";
// // import { AdminStaffTable } from "./AdminStaffTable";
// // import { DentistTable } from "./DentistTable";
// // import { ReceptionistTable } from "./ReceptionistTable";

// export const AuthorsTable = () => {
//   const { user } = useAuthStore(); // Get the logged-in user

//   // 1. Handle Loading state if user data isn't ready
//   if (!user) {
//     return <div className="p-10 text-center">Loading permissions...</div>;
//   }

//   // 2. Switch logic based on role
//   switch (user.role) {
//     case "admin":
//       return <AdminStaffTable />;

//     case "dentist":
//       // return <DentistTable />;
//       return <DentistTable />;

//     case "receptionist":
//       // return <ReceptionistTable />;
//       return <ReceptionistTable />;

//     default:
//       return <div className="p-10">You do not have permission to view this page.</div>;
//   }
// };
