import React from "react";
import InternalRoutes from "../routes/Internal.Routes";

const AdminLayout = ({ user }) => {
    return (
        <div >
            <main >
                {/* Content will be rendered here based on the route */}
                <InternalRoutes userRole={user.role} />
            </main>
        </div>
    );
}

export default AdminLayout;