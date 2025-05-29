import React from "react";
import { FaPlus, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";
import InternalRoutes from "../routes/Internal.Routes";

const ClientLayout = ({ user }) => {
    return (
        <div className="container mx-auto py-6 px-4">
            <InternalRoutes userRole={user.role} />
        </div>
    );
}

export default ClientLayout;