import Image from "next/image";
import RegistrationForm from "./_component/registration-form";
export default function Home() {
  return (
    <div className="bg-gray-100 p-4">
      <RegistrationForm />
    </div>
  );
}
