"use client";
import { useState } from "react";
import {CardTemplate} from "../../src/_component/card-template";
import {Button} from "../../src/_component/button";

export default function RegistrationForm() {
    //เว็บลงทะเบียน outing, กรอกชื่อ, เลือกสถานที่(แถวเขาใหญ่), ผู้ติดตาม, กรอกข้อมูล, line phone number,  มีรถ?
    const [regForm, setRegForm] = useState({
        name: "",
        location: "",
        follower: 0,
        line: "",
        phoneNumber: "",
        hasCar: false,
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegForm({ ...regForm, [e.target.name]: e.target.value });
    };
    return (
        <div className="flex flex-col items-center justify-center h-screen">
        <CardTemplate 
        title="Registration Form"
        description="Register for the Khao Yai trip and let us know your travel preferences." 
        className="w-full max-w-md h-full max-h-full p-4 my-4 text-black">
            <form>
                <div className="flex flex-col gap-2 mb-1">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" className="w-full p-2 border border-gray-300 rounded-md" value={regForm.name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2 mb-1">
                    <label htmlFor="location">Location</label>
                    <select id="location" name="location" className="w-full p-2 border border-gray-300 rounded-md" value={regForm.location} onChange={handleChange}>
                        <option value="1">Khao Yai National Park</option>
                        <option value="2">Toscana Valley</option>
                        <option value="3">PB Valley Khao Yai Winery</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2 mb-1">
                    <label htmlFor="follower">Follower</label>
                    <input
                        type="number"
                        id="follower"
                        name="follower"
                        value={regForm.follower}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
          
                </div>
                <div className="flex flex-col gap-2 mb-1">
                    <label htmlFor="data">Line<span className="text-red-500">*</span></label>
                    <input type="text" id="line" name="line" className="w-full p-2 border border-gray-300 rounded-md" value={regForm.line} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2 mb-1">
                    <label htmlFor="phoneNumber">Phone Number<span className="text-red-500">*</span></label>
                    <input type="text" id="phoneNumber" name="phoneNumber" className="w-full p-2 border border-gray-300 rounded-md" value={regForm.phoneNumber} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2 mb-1">
                    <label htmlFor="hasCar">Has Car</label>
                    <input type="checkbox" id="hasCar" name="hasCar" checked={regForm.hasCar} onChange={handleChange} />
                </div>
                
                <div className="flex justify-end justify-down mt-4 gap-2">
                    <Button variant="secondary" size="md" className="p-2 bg-gray-500 text-white rounded-md">Cancel</Button>
                    <Button variant="primary" size="md" className="p-2 bg-blue-500 text-white rounded-md">Submit</Button>
                </div>
            </form>
        </CardTemplate>
        </div>
    )
}