// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";

// import ManageRegistrationForm from "../_component/registration-form";
// import { getRegistration } from "@/src/_lib/api/registrationService";
// import Loading from "./loading";

// export default function RegistrationManagePage() {
//   const params = useParams();

//   const registrationId = params.id as string;

//   const registration = useQuery({
//     queryKey: ["registration", registrationId],
//     queryFn: () => getRegistration(registrationId),
//   });

//   if (registration.isPending) {
//     return <Loading/>;
//   }

//   if (registration.isError) {
//     return <div>Failed to load registration.</div>;
//   }

//   if (!registration.data) {
//     return <div>Registration not found.</div>;
//   }

//   return (
//     <main className="relative min-h-screen bg-surface px-3 py-5 sm:px-4 sm:py-8 md:py-12">
//         <div className="mx-auto w-full max-w-4xl">
//             <ManageRegistrationForm
//             registrationData={registration.data}
//             />
//         </div>
//     </main>
    
//   );
// }
